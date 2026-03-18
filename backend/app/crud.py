from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException
from . import models, schema
from datetime import datetime


# ---------- Vendors ----------
def create_vendor(db: Session, vendor: schema.VendorCreate):
    db_vendor = models.Vendor(**vendor.model_dump())
    db.add(db_vendor)
    db.commit()
    db.refresh(db_vendor)
    return db_vendor


def get_vendors(db: Session):
    return db.query(models.Vendor).all()


# ---------- Products ----------
def create_product(db: Session, product: schema.ProductCreate):
    existing = db.query(models.Product).filter(models.Product.sku == product.sku).first()
    if existing:
        raise HTTPException(status_code=400, detail="SKU already exists")

    db_product = models.Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


def get_products(db: Session):
    return db.query(models.Product).all()


# ---------- Purchase Orders ----------
def generate_reference_no():
    return f"PO-{datetime.now().strftime('%Y%m%d%H%M%S')}"


def create_purchase_order(db: Session, po_data: schema.PurchaseOrderCreate):
    vendor = db.query(models.Vendor).filter(models.Vendor.id == po_data.vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    if not po_data.items:
        raise HTTPException(status_code=400, detail="At least one item is required")

    subtotal = 0
    po_items = []

    for item in po_data.items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product with ID {item.product_id} not found")

        line_total = product.unit_price * item.quantity
        subtotal += line_total

        po_item = models.PurchaseOrderItem(
            product_id=product.id,
            quantity=item.quantity,
            unit_price=product.unit_price,
            line_total=line_total
        )
        po_items.append(po_item)

    tax_amount = subtotal * 0.05
    total_amount = subtotal + tax_amount

    db_po = models.PurchaseOrder(
        reference_no=generate_reference_no(),
        vendor_id=po_data.vendor_id,
        subtotal=subtotal,
        tax_amount=tax_amount,
        total_amount=total_amount,
        status="Pending"
    )

    db.add(db_po)
    db.commit()
    db.refresh(db_po)

    for item in po_items:
        item.purchase_order_id = db_po.id
        db.add(item)

    db.commit()
    db.refresh(db_po)

    return db.query(models.PurchaseOrder).options(
        joinedload(models.PurchaseOrder.items)
    ).filter(models.PurchaseOrder.id == db_po.id).first()


def get_purchase_orders(db: Session):
    return db.query(models.PurchaseOrder).options(
        joinedload(models.PurchaseOrder.items)
    ).all()


def get_purchase_order_by_id(db: Session, po_id: int):
    po = db.query(models.PurchaseOrder).options(
        joinedload(models.PurchaseOrder.items)
    ).filter(models.PurchaseOrder.id == po_id).first()

    if not po:
        raise HTTPException(status_code=404, detail="Purchase order not found")

    return po


def update_purchase_order_status(db: Session, po_id: int, status: str):
    po = db.query(models.PurchaseOrder).filter(models.PurchaseOrder.id == po_id).first()
    if not po:
        raise HTTPException(status_code=404, detail="Purchase order not found")

    po.status = status
    db.commit()
    db.refresh(po)
    return po
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base


class Vendor(Base):
    __tablename__ = "vendors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    contact = Column(String, nullable=False)
    rating = Column(Float, nullable=False)

    purchase_orders = relationship("PurchaseOrder", back_populates="vendor")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    sku = Column(String, unique=True, nullable=False, index=True)
    category = Column(String, nullable=True)
    unit_price = Column(Float, nullable=False)
    stock_level = Column(Integer, nullable=False, default=0)

    po_items = relationship("PurchaseOrderItem", back_populates="product")


class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id = Column(Integer, primary_key=True, index=True)
    reference_no = Column(String, unique=True, nullable=False, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=False)
    subtotal = Column(Float, nullable=False, default=0)
    tax_amount = Column(Float, nullable=False, default=0)
    total_amount = Column(Float, nullable=False, default=0)
    status = Column(String, nullable=False, default="Pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    vendor = relationship("Vendor", back_populates="purchase_orders")
    items = relationship("PurchaseOrderItem", back_populates="purchase_order", cascade="all, delete")


class PurchaseOrderItem(Base):
    __tablename__ = "purchase_order_items"

    id = Column(Integer, primary_key=True, index=True)
    purchase_order_id = Column(Integer, ForeignKey("purchase_orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    line_total = Column(Float, nullable=False)

    purchase_order = relationship("PurchaseOrder", back_populates="items")
    product = relationship("Product", back_populates="po_items")
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from .. import schema, crud
from ..auth import get_current_user

router = APIRouter(prefix="/purchase-orders", tags=["Purchase Orders"])


@router.post("/", response_model=schema.PurchaseOrderResponse)
def create_purchase_order(
    po: schema.PurchaseOrderCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return crud.create_purchase_order(db, po)


@router.get("/", response_model=list[schema.PurchaseOrderResponse])
def get_purchase_orders(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return crud.get_purchase_orders(db)


@router.get("/{po_id}", response_model=schema.PurchaseOrderResponse)
def get_purchase_order_by_id(
    po_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return crud.get_purchase_order_by_id(db, po_id)


@router.patch("/{po_id}/status")
def update_purchase_order_status(
    po_id: int,
    payload: schema.PurchaseOrderStatusUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return crud.update_purchase_order_status(db, po_id, payload.status)
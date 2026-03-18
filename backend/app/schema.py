from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


# ---------------- VENDOR ----------------
class VendorBase(BaseModel):
    name: str
    contact: str
    rating: float = Field(..., ge=0, le=5)


class VendorCreate(VendorBase):
    pass


class VendorResponse(VendorBase):
    id: int

    class Config:
        from_attributes = True


# ---------------- PRODUCT ----------------
class ProductBase(BaseModel):
    name: str
    sku: str
    category: Optional[str] = None
    unit_price: float = Field(..., ge=0)
    stock_level: int = Field(..., ge=0)


class ProductCreate(ProductBase):
    pass


class ProductResponse(ProductBase):
    id: int

    class Config:
        from_attributes = True


# ---------------- PO ITEMS ----------------
class PurchaseOrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)


class PurchaseOrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float
    line_total: float

    class Config:
        from_attributes = True


# ---------------- PURCHASE ORDER ----------------
class PurchaseOrderCreate(BaseModel):
    vendor_id: int
    items: List[PurchaseOrderItemCreate]


class PurchaseOrderResponse(BaseModel):
    id: int
    reference_no: str
    vendor_id: int
    subtotal: float
    tax_amount: float
    total_amount: float
    status: str
    created_at: datetime
    items: List[PurchaseOrderItemResponse]

    class Config:
        from_attributes = True


class PurchaseOrderStatusUpdate(BaseModel):
    status: str
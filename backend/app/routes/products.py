from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from .. import schema, crud
from ..auth import get_current_user

router = APIRouter(prefix="/products", tags=["Products"])


@router.post("/", response_model=schema.ProductResponse)
def create_product(
    product: schema.ProductCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return crud.create_product(db, product)


@router.get("/", response_model=list[schema.ProductResponse])
def get_products(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return crud.get_products(db)
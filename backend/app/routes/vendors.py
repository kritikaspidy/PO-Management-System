from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from .. import schema, crud
from ..auth import get_current_user

router = APIRouter(prefix="/vendors", tags=["Vendors"])


@router.post("/", response_model=schema.VendorResponse)
def create_vendor(
    vendor: schema.VendorCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return crud.create_vendor(db, vendor)


@router.get("/", response_model=list[schema.VendorResponse])
def get_vendors(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return crud.get_vendors(db)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine
from .routes import vendors, products, po
from .auth import router as auth_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="PO Management System API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(vendors.router)
app.include_router(products.router)
app.include_router(po.router)


@app.get("/")
def root():
    return {"message": "PO Management System API is running"}
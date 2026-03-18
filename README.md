# Purchase Order Management System (ERP / MRP Module)

A simple ERP-style Purchase Order Management system built using **FastAPI (Python)** for the backend and **HTML, CSS, and JavaScript** for the frontend.

This project demonstrates core ERP concepts such as vendor management, product management, purchase order creation, and order status tracking.

---

## Features

### Authentication
- Google OAuth login
- JWT token-based authentication
- Secure API access

### Dashboard
- View all purchase orders
- Track PO status
- View order totals and metadata
- Change order status from dashboard

### Vendor Management
- Add new vendors
- View vendor list
- Vendor rating support

### Product Management
- Add new products
- Manage SKU, category, price, and stock
- View product inventory

### Purchase Order Creation
- Select vendor
- Add multiple products
- Automatic subtotal, tax, and total calculation
- Submit purchase orders

### Order Tracking
- Change PO status (Pending / Approved / Rejected / Completed)

---

## Tech Stack

### Backend
- **FastAPI**
- **Python**
- **SQLAlchemy**
- **PostgreSQL / SQLite**
- **JWT Authentication**

### Frontend
- **HTML**
- **CSS**
- **JavaScript**
- **Bootstrap**

---

## How to Run the Project

### 1. Clone the repository
```text
git clone 
cd 
```

### 2. Setup backend

Create virtual environment:
```text
python -m venv venv
source venv/bin/activate
```
Install dependencies:
```text
pip install fastapi uvicorn sqlalchemy python-jose passlib
```
Run server:
```text
uvicorn main:app --reload
```


---

### 3. Run frontend

Open the frontend folder and run with **Live Server** or any static server.
```text
http://localhost:5500/login.html
```

---

## API Endpoints

### Authentication
```text
POST /auth/google
```

### Vendors
```text
GET /vendors
POST /vendors
```

### Products
```text
GET /products
POST /products
```

### Purchase Orders
```text
GET /purchase-orders
POST /purchase-orders
PATCH /purchase-orders/{id}/status
```
----


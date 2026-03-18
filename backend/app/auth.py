from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from google.oauth2 import id_token
from google.auth.transport import requests
from pydantic import BaseModel
from jose import jwt, JWTError
from datetime import datetime, timedelta

router = APIRouter(prefix="/auth", tags=["Auth"])

GOOGLE_CLIENT_ID = "963573440971-50sctmmrjvjpp7efcbpjv7l2v5prq3rb.apps.googleusercontent.com"
SECRET_KEY = "your_super_secret_jwt_key"
ALGORITHM = "HS256"

security = HTTPBearer()


class TokenRequest(BaseModel):
    token: str


def create_jwt(user_email: str):
    payload = {
        "sub": user_email,
        "exp": datetime.utcnow() + timedelta(hours=24)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def verify_jwt_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")

        if not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )

        return {"email": email}

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    return verify_jwt_token(token)


@router.post("/google")
def google_login(data: TokenRequest):
    try:
        idinfo = id_token.verify_oauth2_token(
            data.token,
            requests.Request(),
            GOOGLE_CLIENT_ID
        )

        email = idinfo["email"]
        access_token = create_jwt(email)

        return {
            "access_token": access_token,
            "email": email
        }

    except Exception:
        raise HTTPException(status_code=401, detail="Invalid Google token")


@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    return current_user
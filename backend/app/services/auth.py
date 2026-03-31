from datetime import datetime, timedelta
from jose import jwt
from app.config import settings

def create_magic_token(email: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.magic_link_expire_minutes)
    to_encode = {"sub": email, "exp": expire, "type": "magic"}
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)

def verify_magic_token(token: str) -> str:
    payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    if payload.get("type") != "magic":
        raise ValueError("Invalid token type")
    return payload.get("sub")

def create_access_token(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode = {"sub": str(user_id), "exp": expire, "type": "access"}
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)

import logging
from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel
from typing import Optional
from db import get_db
import jwt, os
from datetime import datetime

logger = logging.getLogger(__name__)
config_router = APIRouter(prefix="/api")
JWT_SECRET = os.environ.get("JWT_SECRET")
if not JWT_SECRET:
    raise RuntimeError("JWT_SECRET environment variable is required and has no default. Set it before starting the server.")

def verify_admin(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    try:
        jwt.decode(authorization.split(" ")[1], JWT_SECRET, algorithms=["HS256"])
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

class AppConfigUpdate(BaseModel):
    latest_version: Optional[str] = None
    min_version: Optional[str] = None
    force_update: Optional[bool] = None
    update_url: Optional[str] = None
    message: Optional[str] = None


@config_router.get("/app-config")
async def get_app_config():
    try:
        db = get_db()
        res = db.table("app_config").select("*").eq("key", "latest").maybe_single().execute()
        if res.data:
            return res.data.get("value", {})
    except Exception as e:
        logger.error(f"app-config fetch error: {e}")
    return {
        "latest_version": "2.0.0",
        "min_version": "1.0.0",
        "force_update": False,
        "update_url": "",
        "message": "You're on the latest version."
    }


@config_router.put("/app-config", dependencies=[Depends(verify_admin)])
async def update_app_config(config: AppConfigUpdate):
    try:
        db = get_db()
        existing = db.table("app_config").select("*").eq("key", "latest").maybe_single().execute()
        current = existing.data.get("value", {}) if existing.data else {}
        update_data = {**current}
        if config.latest_version is not None:
            update_data["latest_version"] = config.latest_version
        if config.min_version is not None:
            update_data["min_version"] = config.min_version
        if config.force_update is not None:
            update_data["force_update"] = config.force_update
        if config.update_url is not None:
            update_data["update_url"] = config.update_url
        if config.message is not None:
            update_data["message"] = config.message
        update_data["updated_at"] = datetime.utcnow().isoformat()
        db.table("app_config").upsert({"key": "latest", "value": update_data}).execute()
        return update_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

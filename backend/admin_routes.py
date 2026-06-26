import os
import json
import logging
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Header
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
import jwt
import google.generativeai as genai

from db import get_db

logger = logging.getLogger(__name__)
admin_router = APIRouter(prefix="/api/admin")

ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD")
if not ADMIN_PASSWORD:
    raise RuntimeError("ADMIN_PASSWORD environment variable is required and has no default. Set it before starting the server.")
JWT_SECRET = os.environ.get("JWT_SECRET")
if not JWT_SECRET:
    raise RuntimeError("JWT_SECRET environment variable is required and has no default. Set it before starting the server.")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

# ── Auth ──────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    password: str

def create_token():
    return jwt.encode(
        {"role": "admin", "exp": datetime.utcnow() + timedelta(days=7)},
        JWT_SECRET, algorithm="HS256"
    )

def verify_admin(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    try:
        jwt.decode(authorization.split(" ")[1], JWT_SECRET, algorithms=["HS256"])
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

@admin_router.post("/login")
async def admin_login(req: LoginRequest):
    if req.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Wrong password")
    return {"token": create_token(), "message": "Login successful"}

# ── Pydantic Models ───────────────────────────────────────────────────────────

class FinanceRecord(BaseModel):
    type: str
    description: str
    amount: float
    currency: str = "INR"
    party_name: str
    due_date: Optional[str] = None
    status: str = "pending"
    reminder_date: Optional[str] = None
    notes: Optional[str] = None

class PartnerRecord(BaseModel):
    name: str
    category: str
    revenue_model: str
    revenue_share_ratio: Optional[str] = None
    contact_number: Optional[str] = None
    email: Optional[str] = None
    notes: Optional[str] = None
    status: str = "active"

class SalesRecord(BaseModel):
    customer_name: str
    customer_phone: Optional[str] = None
    customer_email: Optional[str] = None
    customer_dob: Optional[str] = None
    trip_purpose: Optional[str] = None
    product_service: str
    cost: float
    supplier_cost: float = 0
    margin: float = 0
    source: str = ""
    lead_status: str = "lead_received"
    followup_date: Optional[str] = None
    booking_date: Optional[str] = None
    notes: Optional[str] = None
    donation_pct: int = 0
    donation_amount: float = 0
    donation_status: str = "pending"

class TaskRecord(BaseModel):
    title: str
    description: Optional[str] = None
    category: str = "general"
    priority: str = "medium"
    status: str = "todo"
    due_date: Optional[str] = None
    notes: Optional[str] = None

class GoalRecord(BaseModel):
    title: str
    description: Optional[str] = None
    category: str = "growth"
    target_date: Optional[str] = None
    status: str = "active"
    progress: int = 0
    notes: Optional[str] = None

class AskRequest(BaseModel):
    question: str

class ContentRequest(BaseModel):
    content_type: str
    topic: Optional[str] = None

# ── Dashboard ─────────────────────────────────────────────────────────────────

@admin_router.get("/dashboard", dependencies=[Depends(verify_admin)])
async def get_dashboard():
    try:
        db = get_db()
        sales = db.table("admin_sales").select("cost,margin,lead_status,created_at").execute().data or []
        partners = db.table("admin_partners").select("id,status").execute().data or []
        tasks = db.table("admin_tasks").select("id,status,priority").execute().data or []
        total_revenue = sum(r.get("cost", 0) for r in sales if r.get("lead_status") == "booked")
        total_margin = sum(r.get("margin", 0) for r in sales if r.get("lead_status") == "booked")
        return {
            "sales": {
                "total_leads": len(sales),
                "booked": sum(1 for r in sales if r.get("lead_status") == "booked"),
                "total_revenue": total_revenue,
                "total_margin": total_margin,
            },
            "partners": {
                "total": len(partners),
                "active": sum(1 for p in partners if p.get("status") == "active"),
            },
            "tasks": {
                "total": len(tasks),
                "todo": sum(1 for t in tasks if t.get("status") == "todo"),
                "in_progress": sum(1 for t in tasks if t.get("status") == "in_progress"),
                "done": sum(1 for t in tasks if t.get("status") == "done"),
            },
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── Finance ───────────────────────────────────────────────────────────────────

@admin_router.get("/finance", dependencies=[Depends(verify_admin)])
async def list_finance():
    db = get_db()
    res = db.table("admin_finance_records").select("*").order("created_at", desc=True).execute()
    return res.data or []

@admin_router.post("/finance", dependencies=[Depends(verify_admin)])
async def create_finance(rec: FinanceRecord):
    db = get_db()
    res = db.table("admin_finance_records").insert(rec.dict()).execute()
    return res.data[0] if res.data else {}

@admin_router.patch("/finance/{id}", dependencies=[Depends(verify_admin)])
async def update_finance(id: str, rec: dict):
    db = get_db()
    res = db.table("admin_finance_records").update(rec).eq("id", id).execute()
    return res.data[0] if res.data else {}

@admin_router.delete("/finance/{id}", dependencies=[Depends(verify_admin)])
async def delete_finance(id: str):
    db = get_db()
    db.table("admin_finance_records").delete().eq("id", id).execute()
    return {"deleted": True}

# ── Partners ──────────────────────────────────────────────────────────────────

@admin_router.get("/partners", dependencies=[Depends(verify_admin)])
async def list_partners():
    db = get_db()
    res = db.table("admin_partners").select("*").order("created_at", desc=True).execute()
    return res.data or []

@admin_router.post("/partners", dependencies=[Depends(verify_admin)])
async def create_partner(rec: PartnerRecord):
    db = get_db()
    res = db.table("admin_partners").insert(rec.dict()).execute()
    return res.data[0] if res.data else {}

@admin_router.patch("/partners/{id}", dependencies=[Depends(verify_admin)])
async def update_partner(id: str, rec: dict):
    db = get_db()
    res = db.table("admin_partners").update(rec).eq("id", id).execute()
    return res.data[0] if res.data else {}

@admin_router.delete("/partners/{id}", dependencies=[Depends(verify_admin)])
async def delete_partner(id: str):
    db = get_db()
    db.table("admin_partners").delete().eq("id", id).execute()
    return {"deleted": True}

# ── Sales ─────────────────────────────────────────────────────────────────────

@admin_router.get("/sales", dependencies=[Depends(verify_admin)])
async def list_sales():
    db = get_db()
    res = db.table("admin_sales").select("*").order("created_at", desc=True).execute()
    return res.data or []

@admin_router.post("/sales", dependencies=[Depends(verify_admin)])
async def create_sale(rec: SalesRecord):
    db = get_db()
    data = rec.dict()
    res = db.table("admin_sales").insert(data).execute()
    return res.data[0] if res.data else {}

@admin_router.patch("/sales/{id}", dependencies=[Depends(verify_admin)])
async def update_sale(id: str, rec: dict):
    db = get_db()
    res = db.table("admin_sales").update(rec).eq("id", id).execute()
    return res.data[0] if res.data else {}

@admin_router.delete("/sales/{id}", dependencies=[Depends(verify_admin)])
async def delete_sale(id: str):
    db = get_db()
    db.table("admin_sales").delete().eq("id", id).execute()
    return {"deleted": True}

# ── Tasks ─────────────────────────────────────────────────────────────────────

@admin_router.get("/tasks", dependencies=[Depends(verify_admin)])
async def list_tasks():
    db = get_db()
    res = db.table("admin_tasks").select("*").order("created_at", desc=True).execute()
    return res.data or []

@admin_router.post("/tasks", dependencies=[Depends(verify_admin)])
async def create_task(rec: TaskRecord):
    db = get_db()
    res = db.table("admin_tasks").insert(rec.dict()).execute()
    return res.data[0] if res.data else {}

@admin_router.patch("/tasks/{id}", dependencies=[Depends(verify_admin)])
async def update_task(id: str, rec: dict):
    db = get_db()
    res = db.table("admin_tasks").update(rec).eq("id", id).execute()
    return res.data[0] if res.data else {}

@admin_router.delete("/tasks/{id}", dependencies=[Depends(verify_admin)])
async def delete_task(id: str):
    db = get_db()
    db.table("admin_tasks").delete().eq("id", id).execute()
    return {"deleted": True}

# ── Goals ─────────────────────────────────────────────────────────────────────

@admin_router.get("/goals", dependencies=[Depends(verify_admin)])
async def list_goals():
    db = get_db()
    res = db.table("admin_goals").select("*").order("created_at", desc=True).execute()
    return res.data or []

@admin_router.post("/goals", dependencies=[Depends(verify_admin)])
async def create_goal(rec: GoalRecord):
    db = get_db()
    res = db.table("admin_goals").insert(rec.dict()).execute()
    return res.data[0] if res.data else {}

@admin_router.patch("/goals/{id}", dependencies=[Depends(verify_admin)])
async def update_goal(id: str, rec: dict):
    db = get_db()
    res = db.table("admin_goals").update(rec).eq("id", id).execute()
    return res.data[0] if res.data else {}

# ── AI Insights (Gemini) ──────────────────────────────────────────────────────

_insights_cache: dict = {}

@admin_router.get("/insights", dependencies=[Depends(verify_admin)])
async def get_ai_insights(refresh: bool = False):
    ck = "insights"
    if not refresh and ck in _insights_cache:
        age = (datetime.utcnow() - _insights_cache[ck]["ts"]).total_seconds()
        if age < 86400:
            return {**_insights_cache[ck]["data"], "cached": True, "cache_age_hours": round(age / 3600, 1)}

    if not GEMINI_API_KEY:
        return {"insights": {"summary": "Gemini API key not configured."}, "cached": False}

    try:
        db = get_db()
        sales = db.table("admin_sales").select("cost,lead_status,product_service,source").execute().data or []
        booked = [s for s in sales if s.get("lead_status") == "booked"]
        total_rev = sum(s.get("cost", 0) for s in booked)
        data_summary = f"Total leads: {len(sales)}, Booked: {len(booked)}, Revenue: INR {total_rev:.0f}"

        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel(model_name="gemini-1.5-flash")
        prompt = f"""You are a travel business analyst for GoBabyTravel.
Data: {data_summary}
Return JSON: {{"summary": "2-3 sentence business summary", "growth_score": 1-100, "immediate_actions": ["action1", "action2", "action3"], "insights": [{{"title": "", "detail": "", "priority": "high/medium/low", "action": ""}}]}}
Max 5 insights. Return only valid JSON."""
        response = model.generate_content(prompt)
        text = response.text.strip()
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
        ins = json.loads(text)
        result = {"insights": ins, "data_summary": data_summary}
        _insights_cache[ck] = {"data": result, "ts": datetime.utcnow()}
        return {**result, "cached": False}
    except Exception as e:
        return {"insights": {"summary": f"AI unavailable: {str(e)}"}, "cached": False}

# ── Content Generation (Gemini) ───────────────────────────────────────────────

@admin_router.post("/content/generate", dependencies=[Depends(verify_admin)])
async def generate_content(req: ContentRequest):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=503, detail="Gemini API key not configured")
    prompts = {
        "blog": f"Write a 400-word SEO travel blog for GoBabyTravel about: {req.topic or 'travel tips'}.",
        "instagram": f"Write 2 Instagram captions for GoBabyTravel about: {req.topic or 'travel'}. Include hook, body, CTA, and 8 hashtags.",
        "twitter": f"Write 3 tweets for GoBabyTravel about: {req.topic or 'travel'}. Under 280 chars each.",
        "linkedin": f"Write a 120-word LinkedIn post for GoBabyTravel about: {req.topic or 'travel'}.",
        "strategy": f"Give 5 concrete growth actions for GoBabyTravel. Context: {req.topic or 'travel app MVP'}.",
    }
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel(model_name="gemini-1.5-flash")
        response = model.generate_content(prompts.get(req.content_type, prompts["blog"]))
        return {"content_type": req.content_type, "content": response.text, "topic": req.topic}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@admin_router.post("/ask", dependencies=[Depends(verify_admin)])
async def ask_ai(req: AskRequest):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=503, detail="Gemini API key not configured")
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            system_instruction="You are a travel business analyst for GoBabyTravel. Be concise and actionable."
        )
        response = model.generate_content(req.question)
        return {"question": req.question, "answer": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

import os
import json
import time
import logging
import warnings
warnings.filterwarnings("ignore", category=FutureWarning)

import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted, NotFound
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List

logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

ai_router = APIRouter(prefix="/api/ai")

# Model preference order — fall back if quota exceeded
MODELS = ["gemini-2.0-flash-lite", "gemini-2.0-flash", "gemini-flash-lite-latest"]

SYSTEM_PROMPT = """You are GoBaby AI, the personal travel concierge for GoBabyTravel — a platform whose mission is to "Bridge Cultures Globally."

You behave like a trusted, knowledgeable travel consultant — not a pushy salesperson. You care about helping travelers make confident decisions.

Your values:
- Care before conversion
- Trust before transaction  
- Cultural respect
- Safety first
- Long-term relationship over short-term profit

You help with:
- Travel planning and itinerary building
- Destination intelligence (best seasons, budgets, visa info, culture tips)
- Flight, hotel, visa, and transport guidance
- Travel health advice

When users are ready to book or need specific services, you suggest they use GoBabyTravel's partner services:
- Flights & Hotels: bookings.gobabytravel.com
- Visa Services: gobabytravel.visa2fly.com  
- Transport: transport.gobabytravel.com
- Doctor Consultation: gobabytravel.com/doctor-consultation

Keep responses warm, concise, and actionable. Use a conversational tone. Format with short paragraphs or bullet points where helpful. Never give responses longer than 400 words unless building a full itinerary."""

BRIEF_PROMPT_TEMPLATE = """Generate a structured travel brief for: {destination}

Return a JSON object with exactly this structure:
{{
  "destination": "{destination}",
  "tagline": "one evocative sentence",
  "best_seasons": ["month range 1", "month range 2"],
  "budget_range": {{"budget": "USD/day estimate", "mid": "USD/day estimate", "luxury": "USD/day estimate"}},
  "visa_overview": "2-3 sentence visa summary for most travelers",
  "top_experiences": ["experience 1", "experience 2", "experience 3", "experience 4", "experience 5"],
  "cultural_tips": ["tip 1", "tip 2", "tip 3"],
  "travel_tip": "one essential insider tip",
  "safety_rating": "Safe / Exercise Caution / High Caution"
}}

Return only valid JSON, no markdown."""

ITINERARY_PROMPT_TEMPLATE = """Create a detailed {days}-day travel itinerary for {destination}.
{context}

Return a JSON object with exactly this structure:
{{
  "title": "{days} Days in {destination}",
  "destination": "{destination}",
  "duration_days": {days},
  "days": [
    {{
      "day": 1,
      "theme": "Arrival & First Impressions",
      "morning": "activity description",
      "afternoon": "activity description", 
      "evening": "activity description",
      "tip": "one practical tip for this day"
    }}
  ],
  "packing_essentials": ["item 1", "item 2", "item 3"],
  "estimated_budget": "daily budget range"
}}

Return only valid JSON, no markdown."""


class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []
    user_profile: Optional[dict] = None

class BriefRequest(BaseModel):
    destination: str

class ItineraryRequest(BaseModel):
    destination: str
    days: int
    context: Optional[str] = None


def call_with_fallback(prompt: str, system: str = None, history: list = None):
    """Try each model in order, falling back on quota errors."""
    last_err = None
    for model_name in MODELS:
        try:
            if history is not None:
                # Chat mode
                model = genai.GenerativeModel(
                    model_name=model_name,
                    system_instruction=system or SYSTEM_PROMPT,
                )
                session = model.start_chat(history=history)
                resp = session.send_message(prompt)
            else:
                # Single-turn generation
                model = genai.GenerativeModel(model_name=model_name)
                resp = model.generate_content(prompt)
            return resp.text, None
        except ResourceExhausted as e:
            logger.warning(f"Quota exceeded for {model_name}, trying next model. Error: {e}")
            last_err = e
            time.sleep(1)
        except NotFound as e:
            logger.warning(f"Model {model_name} not found, trying next. Error: {e}")
            last_err = e
        except Exception as e:
            logger.error(f"Unexpected error with {model_name}: {e}")
            last_err = e
            break
    return None, last_err


@ai_router.post("/chat")
async def chat(req: ChatRequest):
    if not GEMINI_API_KEY:
        return {"reply": "AI service is not configured. Please add your GEMINI_API_KEY.", "error": True}
    try:
        history = []
        for msg in (req.history or []):
            history.append({
                "role": "user" if msg.role == "user" else "model",
                "parts": [msg.content]
            })
        text, err = call_with_fallback(req.message, system=SYSTEM_PROMPT, history=history)
        if text:
            return {"reply": text, "error": False}
        if isinstance(err, ResourceExhausted):
            return {"reply": "The AI is currently at capacity. Please try again in a minute.", "error": True, "quota": True}
        return {"reply": "I'm having a moment — please try again shortly.", "error": True}
    except Exception as e:
        logger.error(f"Chat error: {e}")
        return {"reply": "I'm having a moment — please try again shortly.", "error": True}


@ai_router.post("/brief")
async def destination_brief(req: BriefRequest):
    if not GEMINI_API_KEY:
        return {"error": "AI service not configured"}
    try:
        prompt = BRIEF_PROMPT_TEMPLATE.format(destination=req.destination)
        text, err = call_with_fallback(prompt)
        if not text:
            return {"error": str(err)}
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
        brief = json.loads(text)
        return {"brief": brief, "error": False}
    except Exception as e:
        logger.error(f"Brief error: {e}")
        return {"error": str(e)}


@ai_router.post("/itinerary")
async def generate_itinerary(req: ItineraryRequest):
    if not GEMINI_API_KEY:
        return {"error": "AI service not configured"}
    days = max(1, min(req.days, 14))
    try:
        context_str = f"Additional context: {req.context}" if req.context else ""
        prompt = ITINERARY_PROMPT_TEMPLATE.format(
            days=days,
            destination=req.destination,
            context=context_str,
        )
        text, err = call_with_fallback(prompt)
        if not text:
            return {"error": str(err)}
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
        itinerary = json.loads(text)
        return {"itinerary": itinerary, "error": False}
    except Exception as e:
        logger.error(f"Itinerary error: {e}")
        return {"error": str(e)}

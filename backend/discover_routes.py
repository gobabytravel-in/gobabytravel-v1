import os
import json
import logging
from datetime import date
from fastapi import APIRouter
import google.generativeai as genai

logger = logging.getLogger(__name__)
discover_router = APIRouter(prefix="/api/discover")

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

# Model preference order — fall back if quota exceeded / model unavailable
DISCOVER_MODELS = ["gemini-2.0-flash-lite", "gemini-2.0-flash", "gemini-flash-lite-latest"]

DISCOVER_PROMPT = """Generate today's travel discovery content. Today is {today}.

Return a JSON object with exactly this structure:
{{
  "destination": "City, Country",
  "tagline": "One evocative sentence about this destination",
  "cultural_insight": "One fascinating cultural fact or practice from this destination (2-3 sentences)",
  "hidden_gem": "A lesser-known place or experience in this destination that most tourists miss (2-3 sentences)",
  "travel_fact": "One surprising or delightful travel fact about anywhere in the world (1-2 sentences)",
  "best_for": ["type of traveler 1", "type of traveler 2"],
  "quick_stats": {{"language": "local language", "currency": "local currency", "timezone": "UTC offset"}}
}}

Choose a different, interesting destination each time. Avoid the most obvious tourist clichés.
Return only valid JSON, no markdown."""


@discover_router.get("/today")
async def get_today_discovery():
    today = date.today().isoformat()
    try:
        from db import get_db
        db = get_db()
        cached = db.table("daily_discovery").select("*").eq("date", today).maybe_single().execute()
        if cached.data:
            return {"discovery": cached.data, "cached": True}
    except Exception as e:
        logger.warning(f"Discovery DB fetch failed: {e}")

    if not GEMINI_API_KEY:
        return {"discovery": _fallback_discovery(today), "cached": False}

    try:
        genai.configure(api_key=GEMINI_API_KEY)
        text = None
        last_err = None
        for model_name in DISCOVER_MODELS:
            try:
                model = genai.GenerativeModel(model_name=model_name)
                response = model.generate_content(DISCOVER_PROMPT.format(today=today))
                text = response.text.strip()
                break
            except Exception as e:
                logger.warning(f"Discover model {model_name} failed, trying next: {e}")
                last_err = e
        if not text:
            raise last_err or RuntimeError("All discover models failed")

        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
        data = json.loads(text)
        data["date"] = today

        try:
            from db import get_db
            db = get_db()
            db.table("daily_discovery").upsert(data).execute()
        except Exception as e:
            logger.warning(f"Failed to cache discovery: {e}")

        return {"discovery": data, "cached": False}
    except Exception as e:
        logger.error(f"Discovery generation error: {e}")
        return {"discovery": _fallback_discovery(today), "cached": False}


def _fallback_discovery(today: str) -> dict:
    return {
        "date": today,
        "destination": "Kyoto, Japan",
        "tagline": "Where ancient temples breathe alongside bamboo forests",
        "cultural_insight": "In Kyoto, the geisha tradition lives on in the Gion district. Known as geiko locally, these highly skilled artists train for years in traditional dance, music, and tea ceremony — and spotting one on an evening walk through stone-paved lanes is considered good fortune.",
        "hidden_gem": "The Fushimi Inari trail beyond the first hour is almost entirely tourist-free. Most visitors turn back after the famous lower gates — but those who hike the full two hours to the summit are rewarded with misty forest shrines and panoramic views of the city below.",
        "travel_fact": "Japan has more Michelin-starred restaurants than any other country in the world — nearly double that of France.",
        "best_for": ["culture seekers", "photographers", "foodies"],
        "quick_stats": {"language": "Japanese", "currency": "Japanese Yen (JPY)", "timezone": "UTC+9"},
    }

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from dotenv import load_dotenv
from pathlib import Path
import logging

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Static frontend build (Expo web export) lives in ../frontend/dist
DIST_DIR = (ROOT_DIR.parent / "frontend" / "dist").resolve()

app = FastAPI(title="GoBabyTravel API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

from ai_routes import ai_router
from admin_routes import admin_router
from discover_routes import discover_router
from config_routes import config_router

app.include_router(ai_router)
app.include_router(admin_router)
app.include_router(discover_router)
app.include_router(config_router)


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "GoBabyTravel API v3"}


# ── Static frontend serving (single-port architecture) ────────────────────────
# Mount the Expo build's asset directories, then serve index.html for every
# other (non-/api) path so the client-side router can handle it (SPA fallback).
if (DIST_DIR / "_expo").is_dir():
    app.mount("/_expo", StaticFiles(directory=str(DIST_DIR / "_expo")), name="expo-static")
if (DIST_DIR / "assets").is_dir():
    app.mount("/assets", StaticFiles(directory=str(DIST_DIR / "assets")), name="assets")


@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    # API routes are registered above and take precedence; any /api path that
    # reaches here is genuinely unknown.
    if full_path.startswith("api/"):
        return JSONResponse({"detail": "Not Found"}, status_code=404)

    index_file = DIST_DIR / "index.html"
    if not index_file.is_file():
        return JSONResponse(
            {"detail": "Frontend build not found. Run the Expo web export first."},
            status_code=503,
        )

    # Serve a concrete file if it exists (favicon.ico, metadata.json, etc.),
    # otherwise fall back to index.html for client-side routing.
    # Use canonical containment (is_relative_to) — never a string prefix check,
    # which a sibling-prefix path (e.g. "dist-evil/...") could bypass.
    if full_path:
        candidate = (DIST_DIR / full_path).resolve()
        if candidate.is_file() and candidate.is_relative_to(DIST_DIR):
            return FileResponse(str(candidate))

    return FileResponse(str(index_file))

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.routes import router
from app.web.routes import router as web_router

STATIC_DIR = Path(__file__).parent / "web" / "static"

app = FastAPI(
    title="CVInsight AI",
    version="0.1.0",
    description="Multi-signal CV analysis API that scores and ranks candidates against technical role requirements with full skill-gap reporting.",
)

# Allow dashboard access from alternate local origins (e.g., VS Code Live Server).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

app.include_router(web_router)
app.include_router(router)

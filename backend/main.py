import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import SPACES_DIR, DATA_DIR
from routers import spaces, files, audio, settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    SPACES_DIR.mkdir(parents=True, exist_ok=True)
    yield


app = FastAPI(title="reader-lm", lifespan=lifespan)

_origins = os.environ.get("CORS_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(spaces.router)
app.include_router(files.router)
app.include_router(audio.router)
app.include_router(settings.router)


@app.get("/health")
def health():
    return {"status": "ok"}

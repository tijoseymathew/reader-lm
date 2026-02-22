from fastapi import APIRouter

from models import Settings
import storage
from services.tts_service import VOICES

router = APIRouter(prefix="/api/settings", tags=["settings"])


@router.get("", response_model=Settings)
def get_settings():
    return storage.get_settings()


@router.put("", response_model=Settings)
def update_settings(settings: Settings):
    return storage.update_settings(settings)


@router.get("/voices")
def list_voices():
    return VOICES

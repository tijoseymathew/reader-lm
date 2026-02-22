from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from config import SPACES_DIR
import storage

router = APIRouter(prefix="/api/spaces", tags=["audio"])


@router.get("/{space_id}/files/{file_id}/audio/{section_id}")
def get_audio(space_id: str, file_id: str, section_id: str):
    if not storage.get_space(space_id):
        raise HTTPException(status_code=404, detail="Space not found")
    if not storage.get_file(space_id, file_id):
        raise HTTPException(status_code=404, detail="File not found")

    audio_path = SPACES_DIR / space_id / "files" / file_id / "audio" / f"{section_id}.wav"
    if not audio_path.exists():
        raise HTTPException(status_code=404, detail="Audio not ready")

    return FileResponse(str(audio_path), media_type="audio/wav")

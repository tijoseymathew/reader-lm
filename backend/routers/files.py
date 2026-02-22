import asyncio
import sys
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, BackgroundTasks, HTTPException, UploadFile
from fastapi.responses import FileResponse
from pydantic import BaseModel

from config import SPACES_DIR
import storage
from models import FileMeta, Section
from services.pdf_service import parse_pdf
from services.tts_service import generate_audio

router = APIRouter(prefix="/api/spaces", tags=["files"])


class FileStatusResponse(BaseModel):
    status: str
    sections: list[Section]


async def process_pdf_background(space_id: str, file_id: str) -> None:
    loop = asyncio.get_event_loop()
    file_meta = storage.get_file(space_id, file_id)
    if not file_meta:
        return

    pdf_path = str(SPACES_DIR / space_id / "files" / file_id / "original.pdf")

    try:
        # Run CPU-bound parsing in thread pool
        sections, page_count = await loop.run_in_executor(
            None, parse_pdf, pdf_path
        )
    except Exception as e:
        print(f"PDF parsing error: {e}", file=sys.stderr)
        file_meta.status = "error"
        storage.update_file_meta(space_id, file_id, file_meta)
        return

    # Save sections and mark PDF as ready
    storage.update_sections(space_id, file_id, sections)
    file_meta.page_count = page_count
    file_meta.status = "ready"
    file_meta.sections = sections
    storage.update_file_meta(space_id, file_id, file_meta)

    # Generate audio for each section
    audio_dir = SPACES_DIR / space_id / "files" / file_id / "audio"
    audio_dir.mkdir(exist_ok=True)

    for section in sections:
        storage.update_section_audio_status(space_id, file_id, section.id, "generating")
        audio_path = str(audio_dir / f"{section.id}.wav")
        try:
            await loop.run_in_executor(
                None, generate_audio, section.text, audio_path
            )
            storage.update_section_audio_status(space_id, file_id, section.id, "ready")
        except Exception as e:
            print(f"TTS error for section {section.id}: {e}", file=sys.stderr)
            storage.update_section_audio_status(space_id, file_id, section.id, "error")


@router.get("/{space_id}/files", response_model=list[FileMeta])
def list_files(space_id: str):
    if not storage.get_space(space_id):
        raise HTTPException(status_code=404, detail="Space not found")
    return storage.get_files(space_id)


@router.post("/{space_id}/files", response_model=FileMeta, status_code=201)
async def upload_file(
    space_id: str, file: UploadFile, background_tasks: BackgroundTasks
):
    if not storage.get_space(space_id):
        raise HTTPException(status_code=404, detail="Space not found")

    file_id = str(uuid4())
    file_dir = SPACES_DIR / space_id / "files" / file_id
    file_dir.mkdir(parents=True, exist_ok=True)
    (file_dir / "audio").mkdir(exist_ok=True)

    pdf_path = file_dir / "original.pdf"
    content = await file.read()
    with open(pdf_path, "wb") as f:
        f.write(content)

    meta = FileMeta(
        id=file_id,
        space_id=space_id,
        name=file.filename or "document.pdf",
        page_count=0,
        status="processing",
        sections=[],
    )
    storage.create_file(meta)

    background_tasks.add_task(process_pdf_background, space_id, file_id)

    return meta


@router.get("/{space_id}/files/{file_id}", response_model=FileMeta)
def get_file(space_id: str, file_id: str):
    if not storage.get_space(space_id):
        raise HTTPException(status_code=404, detail="Space not found")
    meta = storage.get_file(space_id, file_id)
    if not meta:
        raise HTTPException(status_code=404, detail="File not found")
    # Merge live sections
    sections = storage.get_sections(space_id, file_id)
    if sections:
        meta.sections = sections
    return meta


@router.delete("/{space_id}/files/{file_id}", status_code=204)
def delete_file(space_id: str, file_id: str):
    if not storage.get_space(space_id):
        raise HTTPException(status_code=404, detail="Space not found")
    if not storage.delete_file(space_id, file_id):
        raise HTTPException(status_code=404, detail="File not found")


@router.get("/{space_id}/files/{file_id}/pdf")
def serve_pdf(space_id: str, file_id: str):
    if not storage.get_space(space_id):
        raise HTTPException(status_code=404, detail="Space not found")
    pdf_path = SPACES_DIR / space_id / "files" / file_id / "original.pdf"
    if not pdf_path.exists():
        raise HTTPException(status_code=404, detail="PDF not found")
    return FileResponse(str(pdf_path), media_type="application/pdf")


@router.get("/{space_id}/files/{file_id}/status", response_model=FileStatusResponse)
def get_file_status(space_id: str, file_id: str):
    if not storage.get_space(space_id):
        raise HTTPException(status_code=404, detail="Space not found")
    meta = storage.get_file(space_id, file_id)
    if not meta:
        raise HTTPException(status_code=404, detail="File not found")
    sections = storage.get_sections(space_id, file_id)
    return FileStatusResponse(status=meta.status, sections=sections)

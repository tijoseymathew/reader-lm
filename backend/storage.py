import json
import shutil
from pathlib import Path
from typing import Optional

from config import SPACES_DIR, SETTINGS_PATH
from models import SpaceMeta, FileMeta, Section, Settings


def _read_json(path: Path) -> dict:
    with open(path) as f:
        return json.load(f)


def _write_json(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w") as f:
        json.dump(data, f, indent=2)


# --- Settings ---

def get_settings() -> Settings:
    if not SETTINGS_PATH.exists():
        return Settings()
    return Settings(**_read_json(SETTINGS_PATH))


def update_settings(settings: Settings) -> Settings:
    _write_json(SETTINGS_PATH, settings.model_dump())
    return settings


# --- Spaces ---

def get_spaces() -> list[SpaceMeta]:
    spaces = []
    if not SPACES_DIR.exists():
        return spaces
    for space_dir in SPACES_DIR.iterdir():
        if space_dir.is_dir():
            meta_path = space_dir / "meta.json"
            if meta_path.exists():
                spaces.append(SpaceMeta(**_read_json(meta_path)))
    return sorted(spaces, key=lambda s: s.created_at)


def get_space(space_id: str) -> Optional[SpaceMeta]:
    meta_path = SPACES_DIR / space_id / "meta.json"
    if not meta_path.exists():
        return None
    return SpaceMeta(**_read_json(meta_path))


def create_space(meta: SpaceMeta) -> SpaceMeta:
    space_dir = SPACES_DIR / meta.id
    space_dir.mkdir(parents=True, exist_ok=True)
    (space_dir / "files").mkdir(exist_ok=True)
    _write_json(space_dir / "meta.json", meta.model_dump())
    return meta


def delete_space(space_id: str) -> bool:
    space_dir = SPACES_DIR / space_id
    if not space_dir.exists():
        return False
    shutil.rmtree(space_dir)
    return True


# --- Files ---

def get_files(space_id: str) -> list[FileMeta]:
    files_dir = SPACES_DIR / space_id / "files"
    files = []
    if not files_dir.exists():
        return files
    for file_dir in files_dir.iterdir():
        if file_dir.is_dir():
            meta_path = file_dir / "meta.json"
            if meta_path.exists():
                files.append(FileMeta(**_read_json(meta_path)))
    return files


def get_file(space_id: str, file_id: str) -> Optional[FileMeta]:
    meta_path = SPACES_DIR / space_id / "files" / file_id / "meta.json"
    if not meta_path.exists():
        return None
    return FileMeta(**_read_json(meta_path))


def create_file(meta: FileMeta) -> FileMeta:
    file_dir = SPACES_DIR / meta.space_id / "files" / meta.id
    file_dir.mkdir(parents=True, exist_ok=True)
    (file_dir / "audio").mkdir(exist_ok=True)
    _write_json(file_dir / "meta.json", meta.model_dump())
    return meta


def update_file_meta(space_id: str, file_id: str, meta: FileMeta) -> None:
    meta_path = SPACES_DIR / space_id / "files" / file_id / "meta.json"
    _write_json(meta_path, meta.model_dump())


def delete_file(space_id: str, file_id: str) -> bool:
    file_dir = SPACES_DIR / space_id / "files" / file_id
    if not file_dir.exists():
        return False
    shutil.rmtree(file_dir)
    return True


# --- Sections ---

def get_sections(space_id: str, file_id: str) -> list[Section]:
    sections_path = SPACES_DIR / space_id / "files" / file_id / "sections.json"
    if not sections_path.exists():
        return []
    data = _read_json(sections_path)
    return [Section(**s) for s in data]


def update_sections(space_id: str, file_id: str, sections: list[Section]) -> None:
    sections_path = SPACES_DIR / space_id / "files" / file_id / "sections.json"
    _write_json(sections_path, [s.model_dump() for s in sections])


def update_section_audio_status(
    space_id: str, file_id: str, section_id: str, status: str
) -> None:
    sections = get_sections(space_id, file_id)
    for section in sections:
        if section.id == section_id:
            section.audio_status = status  # type: ignore
            break
    update_sections(space_id, file_id, sections)

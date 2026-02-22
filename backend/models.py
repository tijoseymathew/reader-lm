from pydantic import BaseModel
from typing import Literal


class SpaceMeta(BaseModel):
    id: str
    name: str
    description: str
    created_at: str


class Section(BaseModel):
    id: str
    text: str
    headings: list[str]
    page_nos: list[int]
    label: str
    audio_status: Literal["pending", "generating", "ready", "error"]


class FileMeta(BaseModel):
    id: str
    space_id: str
    name: str
    page_count: int
    status: Literal["processing", "ready", "error"]
    sections: list[Section]

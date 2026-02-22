from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

import storage
from models import SpaceMeta

router = APIRouter(prefix="/api/spaces", tags=["spaces"])


class CreateSpaceRequest(BaseModel):
    name: str
    description: str = ""


@router.get("", response_model=list[SpaceMeta])
def list_spaces():
    return storage.get_spaces()


@router.post("", response_model=SpaceMeta, status_code=201)
def create_space(body: CreateSpaceRequest):
    meta = SpaceMeta(
        id=str(uuid4()),
        name=body.name,
        description=body.description,
        created_at=datetime.now(timezone.utc).isoformat(),
    )
    return storage.create_space(meta)


@router.delete("/{space_id}", status_code=204)
def delete_space(space_id: str):
    if not storage.delete_space(space_id):
        raise HTTPException(status_code=404, detail="Space not found")

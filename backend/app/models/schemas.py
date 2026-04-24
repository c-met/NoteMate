from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field


class DocumentResponse(BaseModel):
    id: str
    filename: str
    size_bytes: int
    created_at: datetime


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    conversation_id: Optional[str] = None


class Citation(BaseModel):
    document: str
    page: int | str
    snippet: str


class ChatResponse(BaseModel):
    answer: str
    conversation_id: str
    citations: list[Citation]
    debug: dict[str, Any] = Field(default_factory=dict)


class HealthResponse(BaseModel):
    status: str
    provider: str

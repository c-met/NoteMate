import asyncio
import uuid
from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.core.config import get_settings
from app.models.schemas import ChatRequest, ChatResponse, DocumentResponse, HealthResponse
from app.rag.engine import rag_engine

router = APIRouter()
settings = get_settings()


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    return HealthResponse(status="ok", provider=settings.llm_provider)


@router.post("/upload", response_model=list[DocumentResponse])
async def upload_documents(files: list[UploadFile] = File(...)) -> list[DocumentResponse]:
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded.")
    responses: list[DocumentResponse] = []

    for file in files:
        suffix = Path(file.filename or "").suffix.lower()
        if suffix not in settings.allowed_file_extensions:
            raise HTTPException(status_code=400, detail=f"Invalid file type: {file.filename}")
        blob = await file.read()
        if len(blob) > settings.max_upload_size_mb * 1024 * 1024:
            raise HTTPException(status_code=413, detail=f"{file.filename} exceeds max size limit.")

        file_id = str(uuid.uuid4())
        disk_path = Path(settings.upload_dir) / f"{file_id}_{file.filename}"
        disk_path.write_bytes(blob)
        try:
            indexed = await asyncio.to_thread(rag_engine.index_pdf, str(disk_path), file.filename)
        except Exception as exc:  # noqa: BLE001
            disk_path.unlink(missing_ok=True)
            raise HTTPException(status_code=400, detail=f"Failed to process {file.filename}: {exc}") from exc

        responses.append(
            DocumentResponse(
                id=indexed.id,
                filename=indexed.filename,
                size_bytes=indexed.size_bytes,
                created_at=datetime.utcnow(),
            )
        )
    return responses


@router.get("/documents", response_model=list[DocumentResponse])
async def list_documents() -> list[DocumentResponse]:
    docs = []
    for d in rag_engine.get_documents():
        docs.append(
            DocumentResponse(
                id=d.id,
                filename=d.filename,
                size_bytes=d.size_bytes,
                created_at=datetime.utcnow(),
            )
        )
    return docs


@router.delete("/documents/{document_id}")
async def delete_document(document_id: str) -> dict:
    deleted = rag_engine.remove_document(document_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Document not found.")
    return {"deleted": True}


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    conversation_id = request.conversation_id or str(uuid.uuid4())
    try:
        answer = await rag_engine.ask(request.message, conversation_id)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Chat request failed: {exc}") from exc
    return ChatResponse(
        answer=answer["answer"],
        conversation_id=conversation_id,
        citations=answer["citations"],
        debug=answer["debug"],
    )

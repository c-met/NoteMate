from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import ORJSONResponse

from app.api.routes import router
from app.core.config import get_settings
from app.rag.engine import rag_engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Pre-warm the embedding model at startup so the first upload
    # doesn't stall waiting for a model download.
    try:
        rag_engine._ensure_clients()
        print("✅ Embedding model ready.")
    except Exception as exc:  # noqa: BLE001
        print(f"⚠️  Could not pre-warm embeddings: {exc}")
    yield


settings = get_settings()
settings.validate_ai_provider()
app = FastAPI(title=settings.app_name, default_response_class=ORJSONResponse, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix=settings.api_prefix, tags=["pdf-chat"])

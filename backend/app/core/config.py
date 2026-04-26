from functools import lru_cache
from pathlib import Path
import shutil
from typing import Literal, Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

ENV_FILE = Path(__file__).resolve().parents[2] / ".env"


class Settings(BaseSettings):
    app_name: str = "AI PDF Chatbot API"
    app_env: Literal["development", "production", "test"] = "development"
    api_prefix: str = "/api/v1"
    max_upload_size_mb: int = 3
    allowed_file_extensions: tuple[str, ...] = (".pdf",)

    gemini_api_key: Optional[str] = Field(default=None, alias="GEMINI_API_KEY")
    openrouter_api_key: Optional[str] = Field(default=None, alias="OPENROUTER_API_KEY")
    groq_api_key: Optional[str] = Field(default=None, alias="GROQ_API_KEY")

    llm_provider: Literal["gemini", "openrouter", "groq"] = "openrouter"
    llm_model: str = "gemini-2.5-flash"
    groq_model: str = Field(default="llama-3.1-8b-instant", alias="GROQ_MODEL")
    openrouter_model: str = Field(default="openrouter/auto", alias="OPENROUTER_MODEL")
    openrouter_free_models_raw: str = Field(
        default=(
            "meta-llama/llama-3.1-8b-instruct:free,"
            "mistralai/mistral-7b-instruct:free,"
            "qwen/qwen-2.5-7b-instruct:free"
        ),
        alias="OPENROUTER_FREE_MODELS",
    )
    embeddings_provider: Literal["local", "gemini"] = Field(default="local", alias="EMBEDDINGS_PROVIDER")
    embedding_model: str = Field(default="BAAI/bge-small-en-v1.5", alias="EMBEDDING_MODEL")

    vector_db_path: str = Field(default="./data/chroma", alias="VECTOR_DB_PATH")
    upload_dir: str = Field(default="./data/uploads", alias="UPLOAD_DIR")
    clear_on_reload: bool = Field(default=True, alias="CLEAR_ON_RELOAD")
    chunk_size: int = 2000
    chunk_overlap: int = 100
    retrieval_k: int = 2
    max_context_chars: int = 6000
    max_history_chars: int = 900
    memory_window: int = 4
    llm_max_tokens: int = 4096
    llm_timeout_seconds: int = 60
    ultra_fast_mode: bool = Field(default=False, alias="ULTRA_FAST_MODE")
    max_answer_chars: int = Field(default=2000, alias="MAX_ANSWER_CHARS")

    model_config = SettingsConfigDict(env_file=str(ENV_FILE), env_file_encoding="utf-8", extra="ignore")

    def model_post_init(self, __context) -> None:
        if isinstance(self.gemini_api_key, str) and not self.gemini_api_key.strip():
            self.gemini_api_key = None
        if isinstance(self.openrouter_api_key, str) and not self.openrouter_api_key.strip():
            self.openrouter_api_key = None
        if isinstance(self.groq_api_key, str) and not self.groq_api_key.strip():
            self.groq_api_key = None

        # Always read the .env file directly as the authoritative source for
        # API keys.  On Windows, uvicorn --reload spawns a child process
        # whose environment can shadow .env values with empty strings,
        # causing pydantic-settings to pick up the blank value instead.
        if not ENV_FILE.exists():
            return
        env_keys: dict[str, str] = {}
        for raw_line in ENV_FILE.read_text(encoding="utf-8").splitlines():
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            env_keys[key.strip()] = value.strip().strip('"').strip("'")

        file_gemini = env_keys.get("GEMINI_API_KEY", "")
        file_openrouter = env_keys.get("OPENROUTER_API_KEY", "")
        file_groq = env_keys.get("GROQ_API_KEY", "")
        if file_gemini and not self.gemini_api_key:
            self.gemini_api_key = file_gemini
        if file_openrouter and not self.openrouter_api_key:
            self.openrouter_api_key = file_openrouter
        if file_groq and not self.groq_api_key:
            self.groq_api_key = file_groq

    def init_storage(self) -> None:
        vector_path = Path(self.vector_db_path)
        upload_path = Path(self.upload_dir)
        if self.clear_on_reload:
            shutil.rmtree(vector_path, ignore_errors=True)
            shutil.rmtree(upload_path, ignore_errors=True)
        vector_path.mkdir(parents=True, exist_ok=True)
        upload_path.mkdir(parents=True, exist_ok=True)

    def validate_ai_provider(self) -> None:
        if self.llm_provider == "gemini" and not self.gemini_api_key:
            raise ValueError("Missing GEMINI_API_KEY in backend/.env")
        if self.llm_provider == "openrouter" and not self.openrouter_api_key:
            raise ValueError("Missing OPENROUTER_API_KEY in backend/.env")
        if self.llm_provider == "groq" and not self.groq_api_key:
            raise ValueError("Missing GROQ_API_KEY in backend/.env")

    @property
    def openrouter_free_models(self) -> list[str]:
        return [m.strip() for m in self.openrouter_free_models_raw.split(",") if m.strip()]


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    settings.init_storage()
    return settings

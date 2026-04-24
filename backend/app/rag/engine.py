import uuid
from collections import defaultdict, deque
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable
import re

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from langchain_chroma import Chroma
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.embeddings.fastembed import FastEmbedEmbeddings
from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI
from tenacity import retry, stop_after_attempt, wait_fixed

from app.core.config import Settings, get_settings
from app.rag.prompts import SYSTEM_PROMPT, USER_PROMPT_TEMPLATE


@dataclass
class IndexedDocument:
    id: str
    filename: str
    size_bytes: int


class RagEngine:
    def __init__(self) -> None:
        self.settings = get_settings()
        self.embeddings = None
        self.llm = None
        self.vectorstore = None
        self.memory: dict[str, deque[HumanMessage | AIMessage]] = defaultdict(
            lambda: deque(maxlen=self.settings.memory_window)
        )
        self.documents: dict[str, IndexedDocument] = {}
        self.prompt = ChatPromptTemplate.from_messages(
            [("system", SYSTEM_PROMPT), ("human", USER_PROMPT_TEMPLATE)]
        )

    def _refresh_settings_from_env(self) -> None:
        """
        Reload settings from `.env` so runtime changes are picked up without
        requiring a full server restart.
        """
        latest = Settings()
        # Adopt latest settings when current instance is missing a required key.
        if self.settings.llm_provider == "gemini":
            if latest.gemini_api_key and not self.settings.gemini_api_key:
                self.settings = latest
        elif self.settings.llm_provider == "openrouter":
            if latest.openrouter_api_key and not self.settings.openrouter_api_key:
                self.settings = latest

    def _build_embeddings(self):
        self._refresh_settings_from_env()
        if self.settings.embeddings_provider == "local":
            return FastEmbedEmbeddings(model_name="BAAI/bge-small-en-v1.5")
        raise ValueError("Invalid EMBEDDINGS_PROVIDER. Only 'local' is supported.")

    def _build_llm(self):
        self._refresh_settings_from_env()
        if self.settings.llm_provider == "gemini":
            if not self.settings.gemini_api_key:
                raise ValueError("Missing GEMINI_API_KEY in backend/.env")
            return ChatGoogleGenerativeAI(
                model=self.settings.llm_model,
                google_api_key=self.settings.gemini_api_key,
                temperature=0.1,
                max_output_tokens=self.settings.llm_max_tokens,
                timeout=self.settings.llm_timeout_seconds,
            )
        if self.settings.llm_provider == "openrouter":
            if not self.settings.openrouter_api_key:
                raise ValueError("Missing OPENROUTER_API_KEY in backend/.env")
            extra_body = None
            if self.settings.openrouter_model == "openrouter/auto":
                # Keep OpenRouter on auto, but constrain routing to free models.
                extra_body = {"models": self.settings.openrouter_free_models}
            return ChatOpenAI(
                model=self.settings.openrouter_model,
                api_key=self.settings.openrouter_api_key,
                base_url="https://openrouter.ai/api/v1",
                default_headers={"HTTP-Referer": "http://localhost:5173", "X-Title": "AI PDF Chatbot"},
                extra_body=extra_body,
                temperature=0.1,
                max_tokens=self.settings.llm_max_tokens,
                timeout=self.settings.llm_timeout_seconds,
            )
        raise ValueError("Invalid LLM_PROVIDER. Use 'gemini' or 'openrouter'.")

    def _ensure_clients(self, require_llm: bool = False) -> None:
        if self.embeddings is None:
            self.embeddings = self._build_embeddings()
        if require_llm and self.llm is None:
            self.llm = self._build_llm()
        if self.vectorstore is None:
            self.vectorstore = Chroma(
                collection_name="pdf_chatbot",
                embedding_function=self.embeddings,
                persist_directory=self.settings.vector_db_path,
            )
        if not self.documents:
            self._sync_documents_from_vectorstore()

    def _sync_documents_from_vectorstore(self) -> None:
        """
        Rebuild the in-memory document registry from persisted vector metadata.

        Chroma persists embeddings across restarts, but this app keeps document
        listings in memory; without syncing, retrieval can query documents that
        are invisible in the UI and cannot be deleted.
        """
        if self.vectorstore is None:
            return

        try:
            payload = self.vectorstore.get(include=["metadatas"])
        except Exception:  # noqa: BLE001
            return

        metadatas = payload.get("metadatas", []) if isinstance(payload, dict) else []
        dedup: dict[str, IndexedDocument] = {}
        for meta in metadatas:
            if not isinstance(meta, dict):
                continue
            document_id = str(meta.get("document_id", "")).strip()
            if not document_id:
                continue
            raw_name = str(meta.get("document_name", "Unknown")).strip() or "Unknown"
            document_name = self._display_filename(raw_name)
            if document_id not in dedup:
                dedup[document_id] = IndexedDocument(id=document_id, filename=document_name, size_bytes=0)

        self.documents = dedup

    def _load_pdf_pages(self, file_path: str) -> list[Document]:
        loader = PyPDFLoader(file_path)
        pages: list[Document] = []
        for page in loader.load():
            text = (page.page_content or "").strip()
            if text:
                pages.append(page)
        return pages

    def _chunk_pages(self, pages: Iterable[Document], document_id: str, filename: str) -> list[Document]:
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.settings.chunk_size,
            chunk_overlap=self.settings.chunk_overlap,
            separators=["\n\n", "\n", ". ", " ", ""],
        )
        chunks = splitter.split_documents(list(pages))
        for idx, chunk in enumerate(chunks):
            chunk.metadata["document_id"] = document_id
            chunk.metadata["document_name"] = filename
            chunk.metadata["chunk_id"] = f"{document_id}_{idx}"
            chunk.metadata["page"] = chunk.metadata.get("page", "N/A")
        return chunks

    @staticmethod
    def _display_filename(filename: str) -> str:
        """
        Use user-facing filename (strip internal UUID prefix if present).
        """
        return re.sub(r"^[0-9a-fA-F-]{36}_", "", filename).strip() or "Unknown.pdf"

    @retry(stop=stop_after_attempt(3), wait=wait_fixed(1))
    def index_pdf(self, file_path: str, original_filename: str | None = None) -> IndexedDocument:
        self._ensure_clients()
        path = Path(file_path)
        display_name = self._display_filename(original_filename or path.name)
        document_id = str(uuid.uuid4())
        pages = self._load_pdf_pages(file_path)
        if not pages:
            raise ValueError("The uploaded PDF has no readable text content.")
        chunks = self._chunk_pages(pages, document_id, display_name)
        self.vectorstore.add_documents(chunks)
        indexed = IndexedDocument(id=document_id, filename=display_name, size_bytes=path.stat().st_size)
        self.documents[document_id] = indexed
        return indexed

    def remove_document(self, document_id: str) -> bool:
        self._ensure_clients()
        doc = self.documents.get(document_id)
        if not doc:
            return False
        self.vectorstore.delete(where={"document_id": document_id})
        self.documents.pop(document_id, None)
        return True

    def get_documents(self) -> list[IndexedDocument]:
        self._ensure_clients()
        return sorted(self.documents.values(), key=lambda x: x.filename.lower())

    def _format_history(self, conversation_id: str) -> str:
        history = self.memory.get(conversation_id, deque())
        if not history:
            return "(empty)"
        # Keep only the newest turns and cap prompt growth.
        recent_history = list(history)[-4:]
        lines: list[str] = []
        for msg in recent_history:
            role = "User" if isinstance(msg, HumanMessage) else "Assistant"
            lines.append(f"{role}: {msg.content}")
        formatted = "\n".join(lines)
        return formatted[-self.settings.max_history_chars :]

    def _to_citations(self, docs: list[Document]) -> list[dict]:
        out = []
        for d in docs:
            snippet = d.page_content[:220].replace("\n", " ").strip()
            out.append(
                {
                    "document": d.metadata.get("document_name", "Unknown"),
                    "page": d.metadata.get("page", "N/A"),
                    "snippet": snippet,
                }
            )
        return out

    async def ask(self, message: str, conversation_id: str) -> dict:
        self._ensure_clients(require_llm=True)
        retrieved = self.vectorstore.similarity_search(message, k=self.settings.retrieval_k)
        if not retrieved:
            fallback = (
                "No documents have been uploaded yet. Please upload a PDF "
                "and I'll be happy to help you with summaries, questions, "
                "notes, and more!"
            )
            self.memory[conversation_id].append(HumanMessage(content=message))
            self.memory[conversation_id].append(AIMessage(content=fallback))
            return {"answer": fallback, "citations": [], "debug": {"retrieved": 0}}

        context_parts: list[str] = []
        remaining_chars = self.settings.max_context_chars
        for d in retrieved:
            if remaining_chars <= 0:
                break
            header = f"[{d.metadata.get('document_name')} | page {d.metadata.get('page', 'N/A')}]\n"
            available_for_body = max(0, remaining_chars - len(header))
            if available_for_body <= 0:
                break
            body = d.page_content[:available_for_body]
            part = f"{header}{body}"
            context_parts.append(part)
            remaining_chars -= len(part) + 2
        context = "\n\n".join(context_parts)
        chain_input = {
            "history": self._format_history(conversation_id),
            "question": message,
            "context": context,
        }
        chain = self.prompt | self.llm
        ai_msg = await chain.ainvoke(chain_input)
        answer = str(ai_msg.content).strip()
        citations = self._to_citations(retrieved)

        self.memory[conversation_id].append(HumanMessage(content=message))
        self.memory[conversation_id].append(AIMessage(content=answer))
        return {"answer": answer, "citations": citations, "debug": {"retrieved": len(retrieved)}}


rag_engine = RagEngine()

<div align="center">
  <img src="frontend/public/logo.png" alt="NoteMate Logo" width="80" />
  <h1>📚 NoteMate</h1>
  <p><strong>AI-Powered PDF Study Assistant</strong></p>
  <p>Upload your study notes. Ask anything. Get instant, cited answers.</p>

  <br />

  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />

  <br /><br />

  <a href="#-quick-start"><strong>Quick Start →</strong></a> · <a href="#-architecture"><strong>Architecture →</strong></a> · <a href="#-deployment"><strong>Deploy →</strong></a>

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 📄 **PDF Upload & Parsing** | Upload single or multiple PDFs — text is extracted, chunked, and indexed automatically |
| 💬 **AI Chat with Citations** | Ask questions and receive detailed, cited answers referencing exact pages |
| 🧠 **RAG Pipeline** | Retrieval-Augmented Generation ensures answers are grounded in your documents |
| 📝 **Smart Study Tools** | Summarize, generate quiz questions, create study notes, predict exam topics |
| 💾 **Conversation Memory** | Maintains chat context across multiple questions in the same session |
| 🎨 **Glassmorphism UI** | Premium dark-mode interface with animations, floating blobs, and shimmer effects |
| 📱 **Fully Responsive** | Works seamlessly on desktop, tablet, and mobile with adaptive sidebar |
| ⚡ **Dual LLM Support** | Switch between Google Gemini and OpenRouter (free models available) |
| ☁️ **Cloud Embeddings** | Optionally offload embeddings to Gemini API for low-memory deployments |

---

## 🛠️ Tech Stack

### Backend

| Technology | Purpose |
|---|---|
| [**Python 3.11**](https://python.org) | Core language |
| [**FastAPI**](https://fastapi.tiangolo.com) | High-performance async REST API framework |
| [**LangChain**](https://langchain.com) | RAG orchestration, prompt management, and LLM integration |
| [**ChromaDB**](https://trychroma.com) | Vector database for document embeddings (persistent, file-based) |
| [**Google Gemini API**](https://ai.google.dev) | LLM provider & cloud embedding model (`gemini-embedding-001`) |
| [**OpenRouter**](https://openrouter.ai) | Alternative LLM provider with access to free models |
| [**FastEmbed**](https://github.com/qdrant/fastembed) | Local CPU-based embeddings via ONNX Runtime (optional) |
| [**PyPDF**](https://pypdf.readthedocs.io) | PDF text extraction |
| [**Pydantic**](https://docs.pydantic.dev) | Data validation, settings management, and API schemas |
| [**Uvicorn**](https://uvicorn.org) | ASGI server for production |
| [**Tenacity**](https://github.com/jd/tenacity) | Retry logic for resilient API calls |
| [**ORJSON**](https://github.com/ijl/orjson) | Fast JSON serialization for API responses |

### Frontend

| Technology | Purpose |
|---|---|
| [**React 18**](https://react.dev) | UI component library |
| [**TypeScript**](https://typescriptlang.org) | Type-safe JavaScript |
| [**Vite**](https://vitejs.dev) | Lightning-fast build tool and dev server |
| [**TailwindCSS 3**](https://tailwindcss.com) | Utility-first CSS framework |
| [**Framer Motion**](https://motion.dev) | Spring-based animations and transitions |
| [**React Markdown**](https://github.com/remarkjs/react-markdown) | Render AI responses as rich formatted Markdown |
| [**Remark GFM**](https://github.com/remarkjs/remark-gfm) | GitHub Flavored Markdown (tables, task lists, etc.) |
| [**Axios**](https://axios-http.com) | HTTP client for backend API communication |

### DevOps & Deployment

| Technology | Purpose |
|---|---|
| [**Docker**](https://docker.com) | Containerized backend |
| [**Docker Compose**](https://docs.docker.com/compose) | Multi-service local development |
| [**Render**](https://render.com) | Backend cloud hosting (free tier) |
| [**Vercel**](https://vercel.com) | Frontend cloud hosting |

---

## 📁 Project Structure

```
NoteMate/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes.py          # API endpoints (upload, chat, documents, health)
│   │   ├── core/
│   │   │   └── config.py          # Settings & environment variables
│   │   ├── models/
│   │   │   └── schemas.py         # Pydantic request/response models
│   │   ├── rag/
│   │   │   ├── engine.py          # RAG pipeline (embed, index, retrieve, generate)
│   │   │   └── prompts.py         # System & user prompt templates
│   │   └── main.py                # FastAPI app entry point
│   ├── Dockerfile                 # Production container config
│   ├── requirements.txt           # Python dependencies
│   └── .env                       # API keys & settings (git-ignored)
│
├── frontend/
│   ├── public/
│   │   └── logo.png               # App logo
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatPanel.tsx       # Chat UI with markdown rendering & prompt cards
│   │   │   ├── DocumentSidebar.tsx # PDF library sidebar with upload & delete
│   │   │   └── GlassCard.tsx      # Reusable glassmorphism card component
│   │   ├── pages/
│   │   │   └── App.tsx            # Main app — state management & coordination
│   │   ├── services/
│   │   │   └── api.ts             # Axios API client
│   │   ├── types/
│   │   │   └── index.ts           # TypeScript interfaces
│   │   ├── styles.css             # Global styles, animations & design system
│   │   └── main.tsx               # React entry point
│   ├── .env                       # Frontend environment variables (git-ignored)
│   ├── package.json
│   ├── tailwind.config.cjs
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── docker-compose.yml             # Local multi-service orchestration
├── .gitignore
└── README.md
```

---

## 🔄 How It Works

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Upload PDF │────▶│  Extract & Chunk  │────▶│  Generate Embeds  │
│              │     │    (PyPDF +       │     │  (Gemini API or   │
│              │     │   LangChain)      │     │   Local FastEmbed)│
└──────────────┘     └──────────────────┘     └────────┬─────────┘
                                                       │
                                                       ▼
┌──────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  AI Response │◀────│  LLM Generation  │◀────│  Similarity Search│
│  with Citations    │ (Gemini/OpenRouter)│    │    (ChromaDB)     │
└──────────────┘     └──────────────────┘     └──────────────────┘
```

**Step-by-step:**

1. **Upload** — User uploads a PDF via the frontend
2. **Extract** — Backend uses PyPDF to pull out all readable text
3. **Chunk** — LangChain's `RecursiveCharacterTextSplitter` breaks text into ~1000-char chunks with 200-char overlap
4. **Embed** — Each chunk is converted into a vector using Gemini cloud embeddings (or local FastEmbed)
5. **Store** — Vectors are persisted in ChromaDB for fast retrieval
6. **Query** — When the user asks a question, it's embedded and matched against stored chunks
7. **Generate** — The top matching chunks + chat history are sent to the LLM as context
8. **Respond** — The AI crafts a detailed, cited answer rendered as Markdown in the chat

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **A Gemini API key** — Get one free at [Google AI Studio](https://aistudio.google.com/app/apikey)

### 1. Clone the Repository

```bash
git clone https://github.com/c-met/NoteMate.git
cd NoteMate
```

### 2. Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate it
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# If using local embeddings (optional):
pip install fastembed
```

Create a `backend/.env` file:

```env
# ── LLM Provider (choose one) ──
LLM_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here

# OR use OpenRouter (free models available):
# LLM_PROVIDER=openrouter
# OPENROUTER_API_KEY=your_openrouter_key_here
# OPENROUTER_MODEL=openrouter/free

# ── Embeddings ──
EMBEDDINGS_PROVIDER=gemini
# For local embeddings instead: EMBEDDINGS_PROVIDER=local

# ── Storage ──
VECTOR_DB_PATH=./data/chroma
UPLOAD_DIR=./data/uploads
CLEAR_ON_RELOAD=true
```

Start the backend:

```bash
uvicorn app.main:app --reload --port 8000
```

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install
```

Create a `frontend/.env` file:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

Start the frontend:

```bash
npm run dev
```

### 4. Open the App

Navigate to **http://localhost:5173** and start uploading your PDFs!

---

## 🐳 Docker (Alternative)

Run both services with a single command:

```bash
docker-compose up --build
```

- **Backend:** http://localhost:8000
- **Frontend:** http://localhost:5173

---

## 🌐 API Reference

All endpoints are prefixed with `/api/v1`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check — returns status and active LLM provider |
| `POST` | `/upload` | Upload one or more PDF files (multipart form data) |
| `GET` | `/documents` | List all indexed documents |
| `DELETE` | `/documents/{id}` | Delete a document and its vectors |
| `POST` | `/chat` | Send a message and receive an AI-generated response |

### Chat Request Body

```json
{
  "message": "Summarize chapter 3",
  "conversation_id": "optional-uuid"
}
```

### Chat Response

```json
{
  "answer": "Chapter 3 covers...",
  "conversation_id": "uuid",
  "citations": [
    {
      "document": "lecture_notes.pdf",
      "page": 12,
      "snippet": "The key concept here is..."
    }
  ]
}
```

---

## ☁️ Deployment

### Backend → Render

1. Push your code to GitHub
2. Create a new **Web Service** on [Render](https://render.com)
3. Connect your GitHub repo and set the **Root Directory** to `backend`
4. Set **Build Command:** `pip install -r requirements.txt`
5. Set **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port 8000`
6. Add environment variables:

   | Key | Value |
   |---|---|
   | `LLM_PROVIDER` | `openrouter` |
   | `OPENROUTER_API_KEY` | `sk-or-v1-...` |
   | `OPENROUTER_MODEL` | `openrouter/free` |
   | `EMBEDDINGS_PROVIDER` | `gemini` |
   | `GEMINI_API_KEY` | `your_key` |
   | `MALLOC_ARENA_MAX` | `2` |
   | `OMP_NUM_THREADS` | `1` |
   | `OPENBLAS_NUM_THREADS` | `1` |

### Frontend → Vercel

1. Import the repo on [Vercel](https://vercel.com)
2. Set **Root Directory** to `frontend`
3. Set **Framework Preset** to `Vite`
4. Add environment variable:

   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://your-backend.onrender.com/api/v1` |

---

## ⚙️ Configuration Reference

All settings are managed via environment variables in `backend/.env`:

| Variable | Default | Description |
|---|---|---|
| `LLM_PROVIDER` | `gemini` | LLM backend: `gemini` or `openrouter` |
| `GEMINI_API_KEY` | — | Google Gemini API key |
| `OPENROUTER_API_KEY` | — | OpenRouter API key |
| `OPENROUTER_MODEL` | `openrouter/auto` | OpenRouter model (use `openrouter/free` for free tier) |
| `EMBEDDINGS_PROVIDER` | `local` | Embedding method: `local` (FastEmbed) or `gemini` (cloud) |
| `EMBEDDING_MODEL` | `BAAI/bge-small-en-v1.5` | Local embedding model name |
| `CHUNK_SIZE` | `1000` | Text chunk size in characters |
| `CHUNK_OVERLAP` | `200` | Overlap between chunks |
| `RETRIEVAL_K` | `2` | Number of chunks retrieved per query |
| `MAX_CONTEXT_CHARS` | `6000` | Max characters sent as context to LLM |
| `MEMORY_WINDOW` | `4` | Number of conversation turns to remember |
| `LLM_MAX_TOKENS` | `4096` | Max tokens in LLM response |
| `LLM_TIMEOUT_SECONDS` | `60` | LLM request timeout |
| `MAX_UPLOAD_SIZE_MB` | `25` | Maximum PDF file size |
| `CLEAR_ON_RELOAD` | `true` | Clear vector DB on server restart |
| `ULTRA_FAST_MODE` | `false` | Enable speed optimizations |
| `MAX_ANSWER_CHARS` | `2000` | Max characters in AI response |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">
  <p>Built with ❤️ for students who want to study smarter, not harder.</p>
  <p><sub>Made by <a href="https://github.com/c-met">c-met</a></sub></p>
</div>

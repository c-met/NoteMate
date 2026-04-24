<div align="center">
  <h1>🤖 AI PDF Chatbot</h1>
  <p><strong>A Production-Ready Full-Stack RAG Application</strong></p>
  
  [![Frontend](https://img.shields.io/badge/Frontend-React%20%7C%20Vite%20%7C%20TypeScript-blue?style=flat-square&logo=react)](frontend/)
  [![Backend](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python-green?style=flat-square&logo=fastapi)](backend/)
  [![AI](https://img.shields.io/badge/AI-LangChain%20%7C%20Gemini%20%7C%20ChromaDB-purple?style=flat-square&logo=google)](backend/app/rag/)
  [![Deployment](https://img.shields.io/badge/Deployment-Docker-2496ED?style=flat-square&logo=docker)](docker-compose.yml)
</div>

<br/>

A modern full-stack web application that allows users to upload multiple PDF documents and converse with an AI about their contents. It features advanced **Retrieval-Augmented Generation (RAG)** to ensure answers are highly accurate, strictly grounded in the uploaded context, and backed by page-level citations.

---

## ✨ Key Features

- **📄 Multi-PDF Support:** Upload and index multiple PDF files simultaneously.
- **🧠 Advanced RAG Engine:** Built with LangChain, utilizing chunking with overlap for optimal context retrieval.
- **🔗 Citation & Grounding:** AI responses include precise citations pointing to the exact document and page snippet.
- **🚫 Zero Hallucinations:** Enforces a strict grounding prompt. If the answer isn't in the PDFs, the AI reliably admits it.
- **⚡ Real-time UI:** Fluid, responsive chat interface built with React, TailwindCSS, and Framer Motion.
- **🐳 Dockerized:** Easily deployable via `docker-compose`.

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 with Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Framer Motion (for animations)
- **Utilities:** Axios (API calls), React Markdown (rendering responses)

### Backend
- **Framework:** FastAPI (Python)
- **AI/LLM:** Google Gemini API
- **RAG & Vector DB:** LangChain, ChromaDB
- **Data Processing:** PyPDF (Document Parsing), Pydantic (Validation)

## 🏗️ Architecture Workflow

1. **Ingestion:** User uploads PDFs from the frontend.
2. **Processing:** The backend extracts text, splits it into semantically meaningful chunks with overlap, and generates embeddings.
3. **Storage:** Embeddings and metadata (filename, page numbers) are persisted in a local ChromaDB vector store.
4. **Retrieval:** User queries trigger a semantic search across the vector store.
5. **Generation:** Relevant chunks are injected into a strict prompt template and sent to the LLM (Gemini).
6. **Response:** The LLM streams back an answer paired with citation cards (source doc + page snippet) to the frontend.

## 📁 Folder Structure

```text
.
├── backend/                  # FastAPI Application
│   ├── app/                  # Main application source code
│   │   ├── api/              # API router and endpoints
│   │   ├── core/             # Configuration & environment setup
│   │   ├── models/           # Pydantic data schemas
│   │   └── rag/              # LangChain RAG pipeline & ChromaDB logic
│   └── tests/                # Pytest suite
├── frontend/                 # React Application
│   └── src/
│       ├── components/       # Reusable UI components
│       ├── pages/            # Application views
│       ├── services/         # API integration via Axios
│       └── types/            # TypeScript interfaces
└── docker-compose.yml        # Docker configuration
```

## 🚀 Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+
- [Docker & Docker Compose](https://www.docker.com/) *(Optional)*
- A [Google Gemini API Key](https://aistudio.google.com/)

### 1️⃣ Option A: Local Development Setup

**Backend (Terminal 1)**
```bash
cd backend
python -m venv .venv
# Activate virtual environment
# Windows: .venv\Scripts\activate
# Mac/Linux: source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# --> Add your GEMINI_API_KEY to the .env file

uvicorn app.main:app --reload
```

**Frontend (Terminal 2)**
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The frontend will run on `http://localhost:5173` and the backend on `http://localhost:8000`.

### 2️⃣ Option B: Docker Setup

Run both services seamlessly with Docker:
```bash
# Ensure both .env files are configured first!
docker compose up --build
```

## 🔐 Environment Variables

You will need to configure the following environment variables:

**`backend/.env`**
```env
GEMINI_API_KEY="your_google_gemini_api_key"
VECTOR_DB_PATH="./chroma_db"
UPLOAD_DIR="./uploads"
```

**`frontend/.env`**
```env
VITE_API_URL="http://localhost:8000"
```

## 📡 API Reference

The backend provides a fully documented OpenAPI interface via Swagger UI. Once the backend is running, visit `http://localhost:8000/docs` to interact with the API directly.

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/v1/upload` | `POST` | Uploads and indexes PDF documents |
| `/api/v1/documents` | `GET` | Lists all currently indexed documents |
| `/api/v1/documents/{id}` | `DELETE`| Removes a specific document from the vector store |
| `/api/v1/chat` | `POST` | Sends a query and retrieves a cited response |
| `/api/v1/health` | `GET` | API Healthcheck status |

## 🧪 Testing

The backend includes a comprehensive `pytest` suite covering API endpoints and RAG functionality:
```bash
cd backend
pytest
```

---
<div align="center">
  <i>Built with ❤️ using React, FastAPI, and LangChain</i>
</div>

<div align="center">
  <img src="frontend/public/logo.png" alt="NoteMate Logo" width="80" />
  <h1>📚 NoteMate</h1>
  <p><strong>Your Friendly AI Study Buddy!</strong></p>
  <p>Upload your notes. Ask anything. Get instant, cited answers.</p>

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

## 👋 Hey there! Let's talk about NoteMate.

If you've ever stared at a 100-page PDF textbook and thought, *"I wish I could just talk to this book,"* you are exactly why I built NoteMate. I wanted to create a tool that actually feels like a study partner, not just a search engine. 

### 👶 Explain it to me like I'm 5...
Imagine you have a super-smart robot friend who reads incredibly fast. You hand this robot a giant, heavy book. The robot reads the whole thing in seconds. 
Then, you ask the robot: *"Hey, what was chapter 3 about?"* 
The robot instantly answers you and even points to the exact page where it found the answer so you know it's not making things up. That's NoteMate! It turns your boring PDF documents into a smart friend you can chat with.

### 👩‍💻 Explain it to me like I'm a Senior Engineer...
NoteMate is a modern, full-stack **Retrieval-Augmented Generation (RAG)** application. It ingests PDF documents, chunks the extracted text, calculates vector embeddings (using a local BGE-small model to save costs), and stores them in a persistent ChromaDB vector store. 

When a user issues a query, the backend performs a similarity search to retrieve the most semantically relevant chunks. These chunks are injected into the context window of an LLM (via Groq or OpenRouter) along with the chat history. The LLM then returns a synthesized response with exact page citations, preventing hallucinations. The frontend is a highly responsive React SPA built with Vite and Tailwind CSS.

---

## ✨ What can it do?

| Feature | Description |
|---|---|
| 📄 **PDF Upload & Parsing** | Drop in your PDFs. Text is extracted, chunked, and indexed automatically. |
| 💬 **AI Chat with Citations** | Ask questions and get answers that literally point to the page number. |
| 🧠 **True RAG Pipeline** | Answers are mathematically grounded in your documents. |
| 📝 **Smart Study Tools** | Summarize, generate quiz questions, or predict exam topics effortlessly. |
| 💾 **Conversation Memory** | It remembers what you just said, so you can have a real conversation. |
| 🎨 **Beautiful UI** | A premium, dark-mode glassmorphism interface. No more ugly academic tools! |
| ⚡ **Flexible LLMs** | Built to easily switch between Groq (Llama 3) and OpenRouter models. |

---

## 🛠️ The Tech Stack

I chose these tools because they hit the perfect sweet spot between developer experience and raw performance.

### Backend (The Brain)
- **[Python 3.11](https://python.org)** & **[FastAPI](https://fastapi.tiangolo.com)**: Lightning-fast async REST API.
- **[LangChain](https://langchain.com)**: Orchestrates the RAG pipeline.
- **[ChromaDB](https://trychroma.com)**: Our trusty persistent vector database.
- **[Groq](https://groq.com) / [OpenRouter](https://openrouter.ai)**: LLM providers to do the heavy thinking.
- **[FastEmbed](https://github.com/qdrant/fastembed)**: Local CPU-based embeddings (`BAAI/bge-small-en-v1.5`) via ONNX. Fast and free!
- **[PyPDF](https://pypdf.readthedocs.io)**: For ripping text out of those stubborn PDFs.

### Frontend (The Face)
- **[React 18](https://react.dev)** & **[TypeScript](https://typescriptlang.org)**: For a scalable, type-safe UI.
- **[Vite](https://vitejs.dev)**: Because nobody has time for slow builds.
- **[TailwindCSS 3](https://tailwindcss.com)**: For that beautiful, utility-first styling.
- **[Framer Motion](https://motion.dev)**: Adding that buttery-smooth "human touch" to the animations.
- **[React Markdown](https://github.com/remarkjs/react-markdown)**: To render the AI's responses perfectly.

---

## 🔄 The Architecture (How the magic happens)

```text
┌──────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Upload PDF │────▶│  Extract & Chunk  │────▶│  Generate Embeds  │
│              │     │    (PyPDF +       │     │  (Local BGE-Small)│
│              │     │   LangChain)      │     │                 │
└──────────────┘     └──────────────────┘     └────────┬─────────┘
                                                       │
                                                       ▼
┌──────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  AI Response │◀────│  LLM Generation  │◀────│  Similarity Search│
│  with Citations    │  (Groq / Llama3)   │    │    (ChromaDB)     │
└──────────────┘     └──────────────────┘     └──────────────────┘
```

---

## 🚀 Quick Start (Run it locally)

Want to play with it yourself? It's pretty easy to spin up!

### Prerequisites
- Python 3.11+
- Node.js 18+
- An API Key from [Groq](https://console.groq.com/keys) or [OpenRouter](https://openrouter.ai/keys)

### 1. Clone it
```bash
git clone https://github.com/c-met/NoteMate.git
cd NoteMate
```

### 2. Boot up the Backend
```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate  |  Mac/Linux: source .venv/bin/activate
pip install -r requirements.txt
```

Create a `backend/.env` file. You can look at `.env.example`, but it basically looks like this:
```env
LLM_PROVIDER=groq
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.1-8b-instant
EMBEDDINGS_PROVIDER=local
EMBEDDING_MODEL=BAAI/bge-small-en-v1.5
VECTOR_DB_PATH=./data/chroma
UPLOAD_DIR=./data/uploads
MAX_UPLOAD_SIZE_MB=3
```

Run it!
```bash
uvicorn app.main:app --reload --port 8000
```

### 3. Boot up the Frontend
Open a new terminal window:
```bash
cd frontend
npm install
```

Create a `frontend/.env` file:
```env
VITE_API_URL=http://localhost:8000/api/v1
```

Run it!
```bash
npm run dev
```
Boom. Go to **http://localhost:5173** and you're officially running NoteMate.

---

## ☁️ Deployment (Taking it live)

Running locally is fun, but deploying is where it gets real. We split the deployment: the heavy backend goes to Hugging Face, and the lightning-fast frontend goes to Vercel.

### 1. Backend → Hugging Face Spaces 
Why Hugging Face? Because standard free tiers (like Render) will put your server to sleep, causing 50-second "cold starts", and they limit your RAM so strictly that local vector embeddings crash the server. Hugging Face Spaces gives us the memory and persistence we need!

We built a handy script to do this:
1. Run `python prepare_hf_space.py` from the root directory.
2. It will package exactly what you need into an `hf-space/` folder.
3. Create a free Docker Space on [Hugging Face](https://huggingface.co/spaces).
4. `cd hf-space`, initialize git, and push directly to your Hugging Face space remote!
5. Add your `GROQ_API_KEY` to the Space Secrets.

### 2. Frontend → Vercel
1. Import your GitHub repository to [Vercel](https://vercel.com).
2. Set the **Root Directory** to `frontend`.
3. Vercel will automatically detect Vite and set everything up.
4. Add your Environment Variable:
   - `VITE_API_URL` = `https://your-huggingface-space-url.hf.space/api/v1`

---

## 🤝 Contributing

Found a bug? Have an idea? I'd love your help! 
1. Fork it.
2. Branch it (`git checkout -b feature/cool-idea`).
3. Commit it (`git commit -m 'Added something cool'`).
4. Push it.
5. Open a Pull Request!

---

<div align="center">
  <p>Built with ❤️ for students who want to study smarter, not harder.</p>
  <p><sub>Made by <a href="https://github.com/c-met">c-met</a> (and maybe a little AI magic)</sub></p>
</div>

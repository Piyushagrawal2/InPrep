# InPrep — AI Interview Platform

> Practice with AI interviewers that feel impossibly real.

## 🏗️ Project Structure

```
InPrep/
├── frontend/          # Next.js 15 + React 19 + Tailwind CSS
│   └── src/
│       ├── app/
│       │   ├── page.tsx              # Landing page
│       │   ├── auth/page.tsx         # Login/Register
│       │   ├── dashboard/page.tsx    # Dashboard + interview history
│       │   ├── interview/
│       │   │   ├── new/page.tsx      # Interview setup wizard
│       │   │   └── [id]/
│       │   │       ├── page.tsx      # Live interview chat
│       │   │       └── summary/page.tsx  # Post-interview results
│       │   └── globals.css           # Design system
│       ├── context/AuthContext.tsx    # Auth state management
│       └── lib/api.ts                # API client
│
├── backend/           # Python FastAPI
│   ├── app/
│   │   ├── main.py                   # FastAPI app entry
│   │   ├── core/
│   │   │   ├── config.py             # Settings & env vars
│   │   │   └── database.py           # SQLAlchemy async setup
│   │   ├── models/models.py          # Database models
│   │   ├── schemas/schemas.py        # Pydantic schemas
│   │   ├── services/
│   │   │   ├── auth_service.py       # JWT + password hashing
│   │   │   ├── resume_parser.py      # PDF/DOCX parsing
│   │   │   └── interview_engine.py   # AI interview engine
│   │   └── api/routes/
│   │       ├── auth.py               # Auth endpoints
│   │       └── interviews.py         # Interview endpoints
│   ├── requirements.txt
│   └── .env.example
│
└── .gitignore
```

## 🚀 Quick Start

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # macOS/Linux
pip install -r requirements.txt

# Create .env from template
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# Start the server
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit **http://localhost:3000**

### 3. Docker (Recommended)

```bash
# Start everything with one command
docker compose up --build

# Or run in background
docker compose up --build -d

# Stop
docker compose down
```

- Backend: **http://localhost:8000**
- Frontend: **http://localhost:3000**

Hot-reload is enabled — edit code locally and changes reflect in the containers.

### Environment Variables

Create `backend/.env`:
```env
OPENAI_API_KEY=sk-your-openai-api-key
SECRET_KEY=your-random-secret-key
DATABASE_URL=sqlite+aiosqlite:///./inprep.db
```

## 🎯 Features (Phase 1 MVP)

- **Resume Upload** — PDF/DOCX parsing with skill & experience extraction
- **Job Title Setup** — Interview tailored to your target role
- **Self Introduction** — AI references your intro instead of generic openers
- **3 Difficulty Modes** — Easy (Sarah), Intermediate (David), Hard (Victoria)
- **Flexible Duration** — 15 to 90 minute sessions
- **Live AI Chat** — Real-time conversation with follow-ups and natural flow
- **Post-Interview Summary** — Scores, strengths, improvements, hire recommendation
- **Dashboard** — Track all interviews with stats

## 🧠 AI Interviewer Personas

| Persona | Difficulty | Style |
|---------|-----------|-------|
| **Sarah Mitchell** | Easy | Warm HR partner, foundational questions |
| **David Chen** | Intermediate | Technical manager, scenario-based probing |
| **Victoria Okafor** | Hard | VP of Engineering, high-pressure, deep dives |

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login |
| GET | `/api/v1/auth/me` | Get current user |
| POST | `/api/v1/interviews/` | Create interview |
| GET | `/api/v1/interviews/` | List user interviews |
| GET | `/api/v1/interviews/{id}` | Get interview + messages |
| POST | `/api/v1/interviews/{id}/upload-resume` | Upload resume |
| POST | `/api/v1/interviews/{id}/start` | Start (AI greeting) |
| POST | `/api/v1/interviews/{id}/message` | Send candidate message |
| POST | `/api/v1/interviews/{id}/end` | End + generate summary |

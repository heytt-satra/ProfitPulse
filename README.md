# ProfitPulse

**ProfitPulse** is an AI-powered financial intelligence platform for SME founders.

## 🚀 Getting Started

This project is a full-stack application with a **FastAPI Backend** and **Next.js Frontend**.

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL & Redis (or Docker)

---

### 1. Backend Setup (FastAPI)

The backend handles Authentication, AI Logic (Vanna.ai), and Integrations.

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Create a virtual environment:
    ```bash
    python -m venv venv
    .\venv\Scripts\activate  # Windows
    # source venv/bin/activate  # Mac/Linux
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Setup Environment & Database:
    ```bash
    copy .env.example .env
    # Check .env and ensure DATABASE_URL/OPENAI_API_KEY are set
    ```
    *Tip: Run `docker-compose up -d` in `/backend` to start Postgres/Redis if needed.*

5.  Run Migrations:
    ```bash
    alembic revision --autogenerate -m "Init"
    alembic upgrade head
    ```
6.  Start the Server:
    ```bash
    uvicorn app.main:app --reload
    ```
    *Backend will be running at [http://localhost:8000](http://localhost:8000)*

---

### 2. Frontend Setup (Next.js)

The frontend provides the Dashboard and Chat Interface.

1.  Navigate to the root directory (if not already there):
    ```bash
    cd ..
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the Development Server:
    ```bash
    npm run dev
    ```
4.  Open [http://localhost:3000](http://localhost:3000)

---

## 🌟 Key Features Implemented

-   **Dashboard**: Real-time financial metrics (Revenue, Profit, Margins).
-   **AI Analyst**: Ask natural language questions ("What was my profit last week?") via Vanna.ai.
-   **Integrations**: Connect Stripe and Meta Ads (Mock OAuth flows ready).
-   **Authentication**: Secure Login/Signup with JWT.

## 🛠️ Tech Stack

-   **Frontend**: Next.js 14, TailwindCSS, Shadcn UI, Recharts, Zustand.
-   **Backend**: FastAPI, SQLAlchemy, Alembic, Pydantic.
-   **AI**: Vanna.ai (OpenAI + ChromaDB).
-   **Infrastructure**: Docker, Redis, Celery.

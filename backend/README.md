# ProfitPulse Backend

## Setup

1.  **Create a virtual environment:**
    ```bash
    python -m venv venv
    .\venv\Scripts\activate  # Windows
    # source venv/bin/activate  # Mac/Linux
    ```

2.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

3.  **Environment Variables:**
    Copy `.env.example` to `.env` and update the values.
    ```bash
    copy .env.example .env
    ```

4.  **Database:**
    Ensure you have PostgreSQL running (or use Docker).
    ```bash
    docker-compose up -d db redis
    ```

5.  **Migrations:**
    Initialize the database schema.
    ```bash
    alembic revision --autogenerate -m "Initial migration"
    alembic upgrade head
    ```

6.  **Run Server:**
    ```bash
    uvicorn app.main:app --reload
    ```

## API Documentation
Once running, visit `http://localhost:8000/docs` for the interactive API docs.

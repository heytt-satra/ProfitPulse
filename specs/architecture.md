# ProfitPulse MVP Architecture Specification

## Project Overview
**Name:** ProfitPulse
**Description:** AI-powered financial intelligence platform for SME founders. Unified P&L across Stripe, Shopify, Meta Ads with natural language querying.

## High-Level Decisions
- **Monorepo:** No (Separate `frontend` and `backend` directories)
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind, Shadcn/ui
- **Backend:** FastAPI, Python 3.11, Supabase (PostgreSQL), SQLAlchemy
- **Database:** PostgreSQL (Supabase) with pgvector
- **ETL:** Airbyte Cloud
- **AI:** Vanna.ai (Text-to-SQL) + OpenAI

## Repository Structure
### Frontend (`./frontend` or current root)
- Next.js 14
- App Router (`/app`)
- Shadcn UI Components
- React Query + Zustand

### Backend (`./backend`)
- FastAPI application
- `/app/api`: Endpoints
- `/app/core`: Config, DB, Security
- `/app/services`: Business logic (Vanna, Airbyte, Calculations)
- `/app/workers`: Celery tasks

## Database Schema (Supabase)
### Core Tables
- `users`: Core user accounts
- `integrations`: OAuth tokens (Stripe, Meta, etc.)
- `fact_daily_financials`: Aggregated financial metrics
- `chat_history`: NLQ logs
- `vanna_training_data`: RAG examples
- `notification_preferences`: Settings

## Key Features
1.  **Authentication:** Custom Auth with Supabase + JWT
2.  **Integrations:** Stripe, Shopify, Meta Ads (via Airbyte)
3.  **AI Analyst:** Vanna.ai text-to-SQL for queries like "Why is profit down?"
4.  **Morning Pulse:** Daily email summary via Celery + Resend

## Development Roadmap
1.  **Week 1: Backend Setup** (FastAPI, DB Schema, Auth)
2.  **Week 2: Integrations** (Airbyte, OAuth flows)
3.  **Week 3: AI Layer** (Vanna training, Chat API)
4.  **Week 4: Frontend** (Dashboard, Charts, Chat UI)
5.  **Week 5: Workers** (Celery, Email notifications)

## Deployment
- **Frontend:** Vercel
- **Backend:** Railway/Render
- **DB:** Supabase
- **Redis:** Upstash

## Immediate Next Steps (Cursor Instructions)
1.  Generate backend FastAPI structure.
2.  Implement User model and Auth endpoints.
3.  Set up Supabase connection.

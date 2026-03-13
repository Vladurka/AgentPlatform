# AgentPlatform

> SaaS platform for creating, training, and embedding AI agents on any website.

---

## What is it?

AgentPlatform lets you create AI chatbots, feed them your data (URLs, PDFs, text), and embed them on any website with a single `<script>` tag. Each agent is powered by RAG (Retrieval-Augmented Generation) — it answers questions based on your knowledge base.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend API | .NET 10 / ASP.NET Core (Modular Monolith) |
| AI Service | Python / FastAPI / LangChain |
| Database | PostgreSQL 16 |
| Vector DB | Qdrant |
| Cache | Redis 7 |
| Queue | RabbitMQ 3 |
| Payments | Stripe |
| Auth | JWT + Refresh Tokens |

---

## Architecture

```
┌─────────────────────────────────┐        ┌──────────────────────┐
│  .NET Modular Monolith          │  HTTP   │  Python AI Service   │
│                                 │◄──────►│  (FastAPI)           │
│  ├── Auth                       │        │                      │
│  ├── Agents                     │        │  RAG pipeline        │
│  ├── Chat                       │        │  Vector DB ops       │
│  └── Billing                    │        │  LLM calls           │
│                                 │        └──────────┬───────────┘
└──────────────┬──────────────────┘                   │
               │                            ┌─────────▼──────────┐
               └───────────────────────────►│  RabbitMQ          │
                                            └────────────────────┘
               ┌──────────────────────┐
               │  PostgreSQL + Redis  │
               └──────────────────────┘
```

---

## Plans

| Plan | Agents | Knowledge Sources | Messages/month |
|---|---|---|---|
| Free | 1 | 5 | 100 |
| Pro | 10 | Unlimited | 5,000 |
| Business | Unlimited | Unlimited | Unlimited |

---

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) + Docker Compose
- Stripe account (for billing)
- OpenAI API key

### 1. Clone the repo

```bash
git clone https://github.com/Vladurka/AgentPlatform.git
cd AgentPlatform
```

### 2. Configure environment

Create a `.env` file in the root:

```env
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_BUSINESS_PRICE_ID=price_...
```

Copy and fill in `appsettings.Development.json`:

```bash
cp backend/src/AgentPlatform.API/appsettings.Development.json.example \
   backend/src/AgentPlatform.API/appsettings.Development.json
```

### 3. Run

```bash
docker-compose -f docker-compose.dev.yml up
```

| Service | URL |
|---|---|
| Backend API | http://localhost:5000 |
| Swagger UI | http://localhost:5000/swagger |
| AI Service | http://localhost:8001 |
| RabbitMQ Management | http://localhost:15672 |

---

## API Overview

### Auth
```
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
GET  /api/v1/auth/me
```

### Agents
```
GET    /api/v1/agents
POST   /api/v1/agents
PUT    /api/v1/agents/{id}
DELETE /api/v1/agents/{id}
```

### Knowledge Sources
```
GET  /api/v1/agents/{id}/knowledge
POST /api/v1/agents/{id}/knowledge
```

### Chat (public — no auth required)
```
POST /api/v1/chat/{embedToken}/message
```

### Billing
```
GET  /api/v1/billing/usage
POST /api/v1/billing/checkout/{plan}
```

---

## Project Structure

```
/
├── backend/          # .NET 10 Modular Monolith
│   └── src/
│       ├── AgentPlatform.API/
│       ├── AgentPlatform.Shared/
│       └── Modules/
│           ├── Auth/
│           ├── Agents/
│           ├── Chat/
│           └── Billing/
├── ai-service/       # Python FastAPI + LangChain
├── docker-compose.yml
└── docker-compose.dev.yml
```

---

## License

MIT

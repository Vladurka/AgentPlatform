# CLAUDE.md — AI Agent Platform

## Project Overview
SaaS platform for creating, training, and embedding AI agents on any website.
Users create agents, feed them data (URL, PDF, text), and get an embed script.

## Architecture — Modular Monolith + AI Microservice

```
┌─────────────────────────────────┐        ┌──────────────────────┐
│  .NET Modular Monolith          │  HTTP   │  Python AI Service   │
│  (ASP.NET Core 10)              │◄──────►│  (FastAPI)           │
│                                 │        │                      │
│  Modules:                       │        │  - RAG pipeline      │
│  ├── Auth (JWT, users, plans)   │        │  - Vector DB ops     │
│  ├── Agents (CRUD, management)  │        │  - LLM calls         │
│  ├── Chat (widget API)          │        │  - Doc parsing       │
│  └── Billing (plans, limits)    │        │  - Ingestion worker  │
│                                 │        └──────────┬───────────┘
│  Shared kernel: EF Core, Auth   │                   │
└──────────────┬──────────────────┘        ┌──────────▼───────────┐
               │                           │  RabbitMQ            │
               └──────────┬───────────────►│  (ingestion queue)   │
                          │                └──────────────────────┘
               ┌──────────▼───────────┐
               │  PostgreSQL + Redis  │
               └──────────────────────┘
```

## Tech Stack

### .NET Service (`/backend`)
- **Runtime:** .NET 10 / ASP.NET Core 10
- **ORM:** Entity Framework Core + PostgreSQL (Npgsql)
- **Auth:** JWT + Refresh tokens
- **Caching:** Redis (StackExchange.Redis)
- **Messaging:** RabbitMQ (MassTransit)
- **Validation:** FluentValidation
- **CQRS:** MediatR (commands/queries within modules)
- **Mapping:** Mapster
- **Logging:** Serilog
- **Docs:** Swagger / OpenAPI

### Python AI Service (`/ai-service`)
- **Framework:** FastAPI
- **AI Orchestration:** LangChain
- **Vector DB:** Qdrant
- **LLM:** OpenAI GPT-4o / Anthropic Claude via API
- **Embeddings:** OpenAI text-embedding-3-small
- **Doc parsing:** pypdf, beautifulsoup4, unstructured
- **Queue consumer:** aio-pika (RabbitMQ)
- **HTTP client:** httpx

### Frontend Dashboard (`/frontend`)
- **Framework:** React 18 + TypeScript
- **Styling:** Tailwind CSS
- **State:** Zustand
- **API client:** React Query + Axios
- **UI:** shadcn/ui

### Widget (`/widget`)
- Pure vanilla TypeScript
- Single `<script>` embed tag
- No external dependencies
- Builds to single minified JS file (esbuild)

### Infrastructure
- **DB:** PostgreSQL 16
- **Cache:** Redis 7
- **Queue:** RabbitMQ 3
- **Vector DB:** Qdrant
- **Containerization:** Docker + Docker Compose

## Project Structure

```
/
├── backend/                            # .NET Modular Monolith
│   ├── src/
│   │   ├── AgentPlatform.API/          # Host, middleware, composition root
│   │   ├── AgentPlatform.Shared/       # Shared kernel (base entities, interfaces, common)
│   │   ├── Modules/
│   │   │   ├── Auth/                   # Auth module
│   │   │   │   ├── AgentPlatform.Auth.Application/
│   │   │   │   ├── AgentPlatform.Auth.Domain/
│   │   │   │   ├── AgentPlatform.Auth.Infrastructure/
│   │   │   │   └── AgentPlatform.Auth.Endpoints/
│   │   │   ├── Agents/                 # Agents module
│   │   │   │   ├── AgentPlatform.Agents.Application/
│   │   │   │   ├── AgentPlatform.Agents.Domain/
│   │   │   │   ├── AgentPlatform.Agents.Infrastructure/
│   │   │   │   └── AgentPlatform.Agents.Endpoints/
│   │   │   ├── Chat/                   # Chat/Widget module
│   │   │   │   ├── AgentPlatform.Chat.Application/
│   │   │   │   ├── AgentPlatform.Chat.Domain/
│   │   │   │   ├── AgentPlatform.Chat.Infrastructure/
│   │   │   │   └── AgentPlatform.Chat.Endpoints/
│   │   │   └── Billing/               # Billing module
│   │   │       ├── AgentPlatform.Billing.Application/
│   │   │       ├── AgentPlatform.Billing.Domain/
│   │   │       ├── AgentPlatform.Billing.Infrastructure/
│   │   │       └── AgentPlatform.Billing.Endpoints/
│   │   └── AgentPlatform.sln
│   └── tests/
├── ai-service/                         # Python FastAPI
│   ├── app/
│   │   ├── api/                        # Routers
│   │   ├── services/                   # RAG, ingestion, chat
│   │   ├── models/                     # Pydantic schemas
│   │   ├── workers/                    # RabbitMQ consumers
│   │   └── core/                       # Config, deps
│   ├── tests/
│   └── requirements.txt
├── frontend/                           # React dashboard
│   ├── src/
│   └── package.json
├── widget/                             # Embeddable JS widget
│   ├── src/
│   └── package.json
├── docker-compose.yml
├── docker-compose.dev.yml
└── CLAUDE.md
```

## Core Domain Entities

### User (Auth module)
```
id, email, password_hash, plan (free/pro/business),
api_key, created_at
```

### Agent (Agents module)
```
id, name, description, instructions (system prompt),
owner_id, embed_token (unique),
status (active/inactive/training),
created_at, updated_at
```

### KnowledgeSource (Agents module)
```
id, agent_id, type (url/pdf/text/faq),
content_raw, status (pending/processing/ready/failed),
vector_namespace, created_at
```

### Conversation (Chat module)
```
id, agent_id, session_id, messages (JSONB),
created_at, updated_at
```

## API Contracts

### Public API (.NET)
- `POST /api/v1/auth/register` — register
- `POST /api/v1/auth/login` — login, returns JWT
- `POST /api/v1/auth/refresh` — refresh token
- `GET/POST/PUT/DELETE /api/v1/agents` — agent CRUD
- `POST /api/v1/agents/{id}/knowledge` — add knowledge source
- `POST /api/v1/chat/{token}/message` — widget chat (no auth)

### Internal: .NET → Python AI Service (HTTP)
```
POST /chat         { agent_id, session_id, message, history[] } → { answer, sources[], tokens_used }
GET  /agent/{id}/status → { sources_count, vectors_count, status }
DELETE /agent/{id} → { success }
```

### Internal: .NET → Python AI Service (RabbitMQ)
```
Queue: ingestion.requests
Message: { agent_id, source_id, source_type, content }
→ Python processes async, updates status in DB
```

## Key Business Rules
- Free: 1 agent, 5 sources, 100 msgs/month
- Pro: 10 agents, unlimited sources, 5000 msgs/month
- Business: unlimited + custom branding
- Embed token validated on every chat request
- Rate limit: 100 req/min per agent token
- Knowledge ingestion is async via RabbitMQ

## Development Commands

```bash
# Everything
docker-compose -f docker-compose.dev.yml up

# .NET
cd backend && dotnet run --project src/AgentPlatform.API
dotnet test

# Python
cd ai-service && uvicorn app.main:app --reload --port 8001

# Frontend
cd frontend && npm run dev

# Widget
cd widget && npm run build
```

## Coding Conventions

### .NET
- Modular monolith: each module has Domain/Application/Infrastructure/Endpoints
- MediatR for CQRS (commands & queries within modules)
- Repository pattern per module (each module owns its DB tables)
- Always async/await
- DTOs for API responses, never domain entities
- Thin endpoints — logic in MediatR handlers
- Shared kernel for cross-cutting: base entities, interfaces, auth context

### Python
- Pydantic v2 for schemas
- FastAPI Depends() for DI
- Stateless services
- All LLM calls wrapped in try/except
- Background workers for ingestion via RabbitMQ

### General
- API responses: `{ data, error, meta }`
- Semantic HTTP status codes
- All endpoints require auth except widget chat and auth endpoints

## Current Status
- [x] Project scaffolding
- [ ] Database schema + migrations
- [ ] Auth module (register/login/JWT)
- [ ] Agents module (CRUD + knowledge sources)
- [ ] Knowledge ingestion (Python + RabbitMQ)
- [ ] Chat endpoint + RAG (Python)
- [ ] Widget embed
- [ ] Dashboard frontend
- [ ] Billing module
- [ ] Deploy pipeline

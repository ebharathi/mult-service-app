# Outreach

## What is Outreach

An outreach platform by ToolPioneers — full-stack monorepo with AI-powered features.

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌────────────┐
│  app (Next.js)  │────▶│  graphql (Nexus)  │────▶│ PostgreSQL │
│   port 3000     │     │   port 8080       │     │  port 5432 │
│                 │     └──────────────────┘     └────────────┘
│                 │     ┌──────────────────┐           │
│                 │────▶│  gen-ai (LangGraph)│──────────┘
│                 │     │   port 8081       │────▶ LLM API
└─────────────────┘     └──────────────────┘
```

- **app/** — Next.js 16 frontend (React 19, Tailwind v4, shadcn/ui, NextAuth, Apollo Client)
- **services/graphql/** — GraphQL API (Express 5, Apollo Server 5, Nexus, nexus-prisma). **Core** service — owns DB migrations.
- **services/gen-ai/** — AI service (Express 5, LangGraph, LangChain, streaming SSE)
- **docker/** — Docker Compose (PostgreSQL 17 + pgvector)
- **scripts/** — Shared scripts (prisma-generate-all.sh)

## Directory Structure

```
/
├── app/                    # Next.js frontend
├── services/
│   ├── gen-ai/            # AI service (LangGraph)
│   └── graphql/           # GraphQL API (core — owns migrations)
├── scripts/
│   └── prisma-generate-all.sh  # Copy schema + generate all clients
└── docker/
    ├── docker-compose.yaml
    └── Postgres.Dockerfile
```

## Getting Started

Prerequisites: Node.js 22+, Docker

```bash
# 1. Start database
cd docker && docker compose up -d

# 2. Set up env files (copy .env.example to .env in each service + app)

# 3. Run Prisma migrations
cd services/graphql && npx prisma migrate dev

# 4. Generate Prisma clients for all services
./scripts/prisma-generate-all.sh

# 5. Start services (each in its own terminal)
cd app && npm run dev              # port 3000
cd services/graphql && npm run dev # port 8080 (nodemon)
cd services/gen-ai && npm run dev  # port 8081 (nodemon)
```

## Database Rules

- **All column names**: snake_case (`hashed_password`, `google_id`, `created_at`)
- **All table names**: lowercase with underscores (`users`, `user_activity`)
- **No @map()**: field names in schema.prisma must match the actual DB column names
- **Prisma field access in code**: use snake_case as defined in schema (`prisma.users.google_id`)

## Prisma Workflow

1. **Schema lives in**: `services/graphql/prisma/schema.prisma` (single source of truth)
2. **Migrations run in**: `services/graphql` only (`npx prisma migrate dev --name <name>`)
3. **After schema changes**: run `./scripts/prisma-generate-all.sh` to copy schema + regenerate clients in all services
4. **Nexus types**: after schema changes, also run `npm run nexus` in `services/graphql`
5. **NEVER** run `npx prisma migrate reset` without explicit user approval — it drops all data
6. The app schema auto-strips the `nexusPrisma` generator (handled by the script)

## Build Rules

- Do NOT run `npm run build` or `next build` after every change — only on big changes or before deployment
- Use `npx prisma generate` / `./scripts/prisma-generate-all.sh` after schema changes
- Run `npm run nexus` in graphql service after schema or resolver changes

## Shared Conventions

- **TypeScript** strict mode in all services
- **Backend**: CommonJS module system, ES2020 target
- **Auth**: NextAuth v4 JWT strategy, cookie-based. Same `NEXTAUTH_SECRET` must be set in all services
- **Database**: Prisma ORM. All services share the same PostgreSQL database and identical schema
- **Config**: Environment variables via `dotenv`. Each service has `.env.example`
- **No test suite** yet — placeholder scripts in package.json

## Key Environment Variables

| Variable | Used By | Description |
|----------|---------|-------------|
| `DATABASE_URL` | All services | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | All services | Must be identical across all services |
| `NEXTAUTH_URL` | app | Frontend URL (http://localhost:3000) |
| `GOOGLE_SIGNIN_CLIENT_ID` | app | Google OAuth client ID |
| `GOOGLE_SIGNIN_CLIENT_SECRET` | app | Google OAuth client secret |

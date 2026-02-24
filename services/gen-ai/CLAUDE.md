# Gen-AI Service

## Tech Stack

- Express 5 (port 8081)
- LangGraph + LangChain (AI agent orchestration)
- ChatOpenAI (OpenAI-compatible — supports OpenAI, DeepSeek, etc.)
- Prisma ORM 5.14.0 (PostgreSQL)
- TypeScript (CommonJS, ES2020, strict)

## Project Structure

```
src/
├── server.ts                              # Express app, middleware stack, route mounting
├── prisma.ts                              # PrismaClient singleton
├── routes/route.ts                        # API route definitions
├── controllers/
│   └── chat.controller.ts                 # LangGraph streaming controller
├── middlewares/auth.ts                     # NextAuth JWT cookie decoder
└── langgraph/
    ├── graph.ts                           # StateGraph definition (agent → tools → fallback)
    ├── state.ts                           # AgentState (messages + userId)
    ├── runner.ts                          # runChatStream() entry point (SSE streaming)
    ├── router.ts                          # Conditional edge routing
    ├── utils.ts                           # safeString, needsFallback, parseToolJsonResult
    ├── model.ts                           # Model registry + createAgent()
    ├── prompt.ts                          # System prompt
    ├── logger.ts                          # Tool execution logger
    ├── types.ts                           # Module declarations for @langchain/core
    ├── nodes/
    │   ├── agent.ts                       # LLM invocation node
    │   ├── tool.ts                        # Tool execution node (injects userId)
    │   └── fallback.ts                    # Handles empty LLM responses
    └── tools/
        ├── index.ts                       # Tool registry + getToolByName()
        └── addNumber.ts                   # Example tool
```

## API Endpoints

| Method | Path | Auth | Response | Description |
|--------|------|------|----------|-------------|
| POST | `/api/v1/chat` | Cookie | SSE stream | Chat with LangGraph agent |
| GET | `/api/health` | None | JSON | Health check |

## Middleware Stack

```
CORS (origin: localhost:3000, credentials: true)
  → cookieParser
    → bodyParser.json
      → authMiddleware (per-route)
        → setStreamingHeaders (SSE)
          → controller
```

## LangGraph Architecture

Everything lives in `src/langgraph/`. The agent uses a `StateGraph` with 3 nodes:

```
START → agent → [conditional] → tools → agent (loop)
                               → fallback → agent (retry)
                               → END (final response)
```

### State (`state.ts`)
- `messages` — LangGraph MessagesAnnotation (auto-accumulates)
- `userId` — injected per-request, not exposed to LLM

### Router logic (`router.ts`)
- AIMessage has `tool_calls` → route to `"tools"`
- AIMessage has empty content → route to `"fallback"`
- Otherwise → `END`

### Model registry (`model.ts`)
- `MODEL_REGISTRY` — purpose-based config (swap provider by changing one line)
- `createAgent()` — creates ChatOpenAI with tools bound
- Supports OpenAI, DeepSeek (via baseURL), Anthropic

### Recursion limit: 100

## Tool Creation Pattern

### Step 1: Create the tool file

```typescript
// src/langgraph/tools/myTool.ts
const { DynamicStructuredTool } = require("@langchain/core/tools");
import { z } from "zod";
import { logger } from "../logger";

export const myTool = new DynamicStructuredTool({
  name: "my_tool",
  description: "What this tool does. Use this when...",
  schema: z.object({
    param1: z.string().describe("Description of param1"),
    userId: z.string().describe("The user id who is making the request"),
  }),
  func: async ({ param1, userId }: { param1: string; userId: string }) => {
    logger.info("my_tool", "Executing", { param1, userId });
    return "Result string";
  },
});
```

### Step 2: Register in tools/index.ts

```typescript
import { myTool } from "./myTool";
export const tools: DynamicStructuredTool[] = [addNumbersTool, myTool];
```

### Key rules:
- Always include `userId: z.string()` in the schema — it's auto-injected by the tools node
- Use `const { DynamicStructuredTool } = require(...)` (CommonJS require for runtime)
- Return a string from `func` — this becomes the ToolMessage content

## Prisma (Read-Only Consumer)

This service does NOT own the schema or migrations. The graphql service is the source of truth.

- Schema is copied here by `../../scripts/prisma-generate-all.sh`
- Do NOT edit `prisma/schema.prisma` directly — edit in `services/graphql/prisma/` and re-run the script
- Do NOT run `prisma migrate` here

## Auth Pattern

Identical to graphql service:
- Reads NextAuth JWT from cookie (`next-auth.session-token` in dev)
- Decodes with `NEXTAUTH_SECRET`
- Sets `req.user` as `AuthenticatedUser` with `userId`, `email`, `role`, `name`

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 8081 | Server port |
| `DATABASE_URL` | — | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | — | Must match app's secret |
| `OPENAI_API_KEY` | — | API key for LLM provider |
| `ADMIN_EMAIL` | — | Admin email address |

## Commands

```bash
npm run dev                           # Start with nodemon + ts-node
npm run build                         # TypeScript compilation to dist/
npm run start                         # Run compiled JS
npx prisma generate                   # Regenerate Prisma client (after schema copy)
../../scripts/prisma-generate-all.sh  # Copy schema + generate all services
```

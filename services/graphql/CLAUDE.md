# GraphQL Service (Core)

This is the **core** service — it owns the Prisma schema and migrations.

## Tech Stack

- Express 5 (port 8080)
- Apollo Server 5 (expressMiddleware integration)
- Nexus (code-first GraphQL schema)
- nexus-prisma (Prisma → Nexus type bridge)
- Prisma ORM 5.14.0 (PostgreSQL)
- TypeScript (CommonJS, ES2020, strict)

## Project Structure

```
src/
├── server.ts                          # Express + Apollo Server setup
├── middlewares/auth.ts                # NextAuth JWT cookie decoder
└── modules/
    ├── context.ts                     # GraphQL context ({ prisma, user })
    ├── schema/
    │   ├── index.ts                   # makeSchema() — registers all types
    │   ├── utils.ts                   # Custom scalars (DateTime, JSON)
    │   └── User/
    │       ├── index.ts               # Re-exports model + query
    │       ├── model.ts               # objectType + enumType for users
    │       └── query.ts               # extendType Query (getMe)
    └── generated/
        ├── schema.graphql             # Auto-generated SDL
        └── nexus-typegen.ts           # Auto-generated TypeScript types
```

## Prisma Workflow (This Service Owns Migrations)

```bash
# 1. Edit schema here: prisma/schema.prisma

# 2. Create migration
npx prisma migrate dev --name <migration_name>

# 3. Regenerate Nexus types
npm run nexus

# 4. Copy schema + regenerate clients for all services
../../scripts/prisma-generate-all.sh
```

**NEVER run `npx prisma migrate reset` without explicit user approval** — it drops all data.

The script `prisma-generate-all.sh`:
- Copies `prisma/schema.prisma` to `services/gen-ai/prisma/` and `app/prisma/` (strips nexusPrisma generator for app)
- Runs `npx prisma generate` in all services

## Adding a New Feature Module

### Step 1: Create the module folder

```
src/modules/schema/FeatureName/
├── index.ts
├── model.ts
└── query.ts   (or mutation.ts)
```

### Step 2: Define the model (`model.ts`)

```typescript
import { objectType } from "nexus";
import * as np from "nexus-prisma";

export const FeatureType = objectType({
  name: np.feature_model.$name,
  description: "Description of this type",
  definition(t) {
    t.field(np.feature_model.id);
    t.field(np.feature_model.name);
    // Fields use names as defined in schema.prisma
  },
});
```

### Step 3: Define queries/mutations (`query.ts`)

```typescript
import { extendType, nonNull, stringArg } from "nexus";

export const FeatureQuery = extendType({
  type: "Query",
  definition(t) {
    t.field("getFeature", {
      type: "FeatureType",
      args: { id: nonNull(stringArg()) },
      resolve: async (_, { id }, ctx) => {
        // ctx.prisma — database access
        // ctx.user — authenticated user (userId, email, role)
        return ctx.prisma.feature_model.findUnique({ where: { id } });
      },
    });
  },
});
```

### Step 4: Export from index.ts

```typescript
export * from "./model";
export * from "./query";
```

### Step 5: Register in schema/index.ts

```typescript
import * as FeatureSchemas from "./FeatureName";

export const schema = makeSchema({
  types: [
    ...Object.values(Utils),
    ...Object.values(UserSchemas),
    ...Object.values(FeatureSchemas),  // Add here
  ],
  // ...
});
```

### Step 6: Regenerate types

```bash
npm run nexus
../../scripts/prisma-generate-all.sh
```

## Context

Defined in `src/modules/context.ts`:

```typescript
ctx.prisma  // PrismaClient instance
ctx.user    // { userId, email, role, name, picture }
```

- `ctx.user` is populated by auth middleware from NextAuth JWT cookie
- Access `ctx.user.userId` for the authenticated user's ID

## Auth Pattern

- Reads NextAuth JWT from cookie
- Cookie: `next-auth.session-token` (dev) / `__Secure-next-auth.session-token` (prod)
- Decodes with `NEXTAUTH_SECRET`
- Sets `req.user` on Express request, passed into GraphQL context

## Middleware Stack

```
CORS (origin: localhost:3000, credentials: true)
  → cookieParser
    → bodyParser.json
      → authMiddleware
        → expressMiddleware(apolloServer, { context })
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 8080 | Server port |
| `DATABASE_URL` | — | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | — | Must match app's secret |

## Commands

```bash
npm run dev                           # Start with nodemon + ts-node
npm run build                         # TypeScript compilation
npm run start                         # Run compiled JS
npm run nexus                         # Regenerate Nexus types (schema.graphql + nexus-typegen.ts)
npx prisma migrate dev --name <name>  # Create new migration
npx prisma generate                   # Regenerate Prisma client (this service only)
../../scripts/prisma-generate-all.sh  # Copy schema + generate all services
```

## TypeScript Notes

- Two tsconfigs: `tsconfig.json` (main) and `tsconfig.nexus.json` (for Nexus type generation)
- `skipLibCheck: true` enabled
- Generated files in `src/modules/generated/` — do not edit manually

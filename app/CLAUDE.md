# App — Next.js Frontend

## Tech Stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS v4 (CSS variables)
- shadcn/ui (new-york style, lucide-react icons)
- NextAuth v4 (Google OAuth, JWT strategy)
- Apollo Client (GraphQL queries to graphql service)
- next-themes (dark/light mode)

## Project Structure

```
app/
├── app/
│   ├── page.tsx                        # Home page
│   ├── auth/signin/page.tsx            # Sign-in page
│   ├── api/auth/[...nextauth]/route.ts # NextAuth API handler
│   ├── layout.tsx                      # Root layout (Providers, fonts)
│   └── globals.css                     # Tailwind + CSS variables
├── components/
│   ├── ui/                             # shadcn primitives (Button, Card)
│   ├── Home.tsx                        # Auth home view
│   ├── Providers.tsx                   # Apollo + SessionProvider + ThemeProvider
│   ├── theme-toggle.tsx                # Dark/light toggle button
│   └── theme-toggle-wrapper.tsx        # Fixed-position toggle wrapper
├── lib/
│   ├── auth.ts                         # NextAuth config (providers, callbacks, cookies)
│   ├── api/graphql.tsx                 # Apollo Client setup
│   ├── utils.ts                        # cn() utility (clsx + tailwind-merge)
│   └── on-init.ts                      # Post-registration hook
├── constants/
│   ├── api.constant.ts                 # Service URLs (CORE_SERVICE = localhost:8080)
│   └── query.graphql.ts               # GraphQL queries (GET_ME)
├── types/
│   └── next-auth.d.ts                  # Session/JWT type augmentation
├── middleware.ts                        # Route protection (JWT check)
└── prisma/schema.prisma               # Prisma schema (copied from graphql)
```

## Auth Flow

1. Unauthenticated user visits any protected route
2. `middleware.ts` redirects to `/auth/signin?callbackUrl=...`
3. User signs in via Google OAuth
4. NextAuth `redirect` callback sends user to dashboard
5. Authenticated user visiting `/auth/signin` is redirected

### Public paths (no auth): `/`, `/auth/signin`, `/api/auth`

### Session shape:
```typescript
session.user = { id: string, email: string, name: string, image: string, role: 'ADMIN' | 'OTHER' }
```

### Cookie names:
- Dev: `next-auth.session-token`
- Prod: `__Secure-next-auth.session-token`

## Component Patterns

### Client components
- Add `"use client"` directive at top
- Use `useSession()` for auth state
- Sign out: `signOut({ redirect: false }).then(() => window.location.href = "/")`

### Styling
- Use `cn()` from `@/lib/utils` for conditional class merging
- Tailwind semantic classes: `bg-background`, `text-foreground`, `text-muted-foreground`
- shadcn Button variants: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`

### Adding shadcn components
```bash
npx shadcn@latest add <component-name>
```

## Prisma (Read-Only Consumer)

This app does NOT own the schema or migrations. The graphql service is the source of truth.

- Schema is copied here by `../scripts/prisma-generate-all.sh` (auto-strips nexusPrisma generator)
- Do NOT edit `prisma/schema.prisma` directly — edit in `services/graphql/prisma/` and re-run the script

## GraphQL Integration

- Apollo Client in `lib/api/graphql.tsx` with `credentials: "include"`
- Service URL: `http://localhost:8080/api/graphql` (from `constants/api.constant.ts`)
- Queries in `constants/query.graphql.ts`
- ApolloProvider wraps the app in `Providers.tsx`

## Commands

```bash
npm run dev    # Start dev server (port 3000)
npm run build  # Production build (only when needed)
npm run lint   # ESLint
```

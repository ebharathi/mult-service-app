#!/bin/bash
# Copies schema.prisma from core (graphql) to all services and runs prisma generate

set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CORE_SCHEMA="$ROOT/services/graphql/prisma/schema.prisma"

echo ">> Copying schema from graphql to gen-ai..."
cp "$CORE_SCHEMA" "$ROOT/services/gen-ai/prisma/schema.prisma"

echo ">> Copying schema from graphql to app (without nexusPrisma generator)..."
sed '/generator nexusPrisma/,/}/d' "$CORE_SCHEMA" > "$ROOT/app/prisma/schema.prisma"

echo ">> Running prisma generate in graphql..."
cd "$ROOT/services/graphql" && npx prisma generate

echo ">> Running prisma generate in gen-ai..."
cd "$ROOT/services/gen-ai" && npx prisma generate

echo ">> Running prisma generate in app..."
cd "$ROOT/app" && (source .env 2>/dev/null; export DATABASE_URL; npx prisma generate)

echo ">> Done. All Prisma clients regenerated."

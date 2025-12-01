#!/bin/bash
set -e

# Script to prepare migration files for Lambda deployment
# This copies the migration files from the database library to the Lambda folder

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
LAMBDA_DIR="$PROJECT_ROOT/infra/aws/lambda/migrate"
DATABASE_DIR="$PROJECT_ROOT/libs/database"

echo "[Prepare] Preparing migration Lambda..."
echo "[Prepare] Project root: $PROJECT_ROOT"
echo "[Prepare] Lambda dir: $LAMBDA_DIR"
echo "[Prepare] Database dir: $DATABASE_DIR"

# Create migrations directory in Lambda folder
mkdir -p "$LAMBDA_DIR/migrations/drizzle/core"

# Copy migration files
if [ -d "$DATABASE_DIR/drizzle/core" ]; then
  echo "[Prepare] Copying migration files from database library..."
  cp -r "$DATABASE_DIR/drizzle/core"/* "$LAMBDA_DIR/migrations/drizzle/core/" 2>/dev/null || echo "[Prepare] No core migrations found"
else
  echo "[Prepare] Warning: No drizzle/core directory found. Run migrations locally first:"
  echo "[Prepare]   nx run database:generate"
fi

# Copy schema files (needed for drizzle-orm)
if [ -d "$DATABASE_DIR/src" ]; then
  echo "[Prepare] Copying schema files..."
  mkdir -p "$LAMBDA_DIR/migrations/schema"
  cp -r "$DATABASE_DIR/src"/* "$LAMBDA_DIR/migrations/schema/" 2>/dev/null || true
fi

echo "[Prepare] ✓ Migration Lambda preparation complete"
echo "[Prepare] Files are ready in: $LAMBDA_DIR/migrations"

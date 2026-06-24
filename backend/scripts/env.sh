#!/bin/bash
# Shared environment setup for backend scripts

ENVIRONMENT="${ENVIRONMENT:-development}"

if [[ "${ENVIRONMENT}" == "production" ]]; then
  echo "Starting in production mode..."
  export NODE_ENV="production"
  DATA_DIR="${DATA_DIR:-/data}"
  export DATABASE_FILE="${DATA_DIR}/production.db"
  export DATABASE_URL="${SUPABASE_DATABASE_URL:-${DATABASE_URL:-file:${DATABASE_FILE}}}"
else
  echo "Starting in development mode..."
  export NODE_ENV="development"
  export DATABASE_URL="${SUPABASE_DATABASE_URL:-${DATABASE_URL:-file:./dev.db}}"
fi

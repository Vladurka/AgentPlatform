#!/bin/bash
# AgentForge — Hetzner VPS deploy script
# Usage: ./deploy.sh
# Prerequisites: Docker, Docker Compose v2, .env file at project root

set -euo pipefail

echo "==> Pulling latest changes..."
git pull origin main

echo "==> Building and starting services..."
docker compose -f docker-compose.prod.yml --env-file .env up -d --build

echo "==> Waiting for backend health..."
for i in {1..30}; do
  if curl -sf http://localhost:8080/health > /dev/null 2>&1; then
    echo "==> Backend is healthy"
    break
  fi
  echo "    Waiting... ($i/30)"
  sleep 3
done

echo "==> Deploy complete!"
docker compose -f docker-compose.prod.yml ps

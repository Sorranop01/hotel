# ===========================================
# StayLock - Makefile
# ===========================================

.PHONY: help dev build up down logs clean test

# Default target
help:
	@echo "StayLock - Available commands:"
	@echo ""
	@echo "Development:"
	@echo "  make dev          - Start development servers (pnpm)"
	@echo "  make dev-docker   - Start development with Docker"
	@echo "  make test         - Run E2E tests"
	@echo ""
	@echo "Production:"
	@echo "  make build        - Build Docker images"
	@echo "  make up           - Start production containers"
	@echo "  make down         - Stop containers"
	@echo "  make logs         - View container logs"
	@echo "  make restart      - Restart containers"
	@echo ""
	@echo "Utility:"
	@echo "  make clean        - Remove containers and images"
	@echo "  make shell-api    - Shell into API container"
	@echo "  make shell-web    - Shell into frontend container"

# ===========================================
# Development
# ===========================================

dev:
	pnpm dev

dev-docker:
	docker compose -f docker-compose.dev.yml up --build

test:
	pnpm test

typecheck:
	pnpm typecheck

lint:
	pnpm lint

# ===========================================
# Production
# ===========================================

build:
	docker compose build

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

logs-api:
	docker compose logs -f api

logs-web:
	docker compose logs -f frontend

restart:
	docker compose restart

# ===========================================
# Utility
# ===========================================

clean:
	docker compose down -v --rmi all --remove-orphans

shell-api:
	docker compose exec api sh

shell-web:
	docker compose exec frontend sh

# Health check
health:
	@echo "Checking API health..."
	@curl -s http://localhost:3000/api/health | jq . || echo "API not responding"
	@echo ""
	@echo "Checking Frontend..."
	@curl -s -o /dev/null -w "Frontend: HTTP %{http_code}\n" http://localhost:80/

# Show status
status:
	docker compose ps

# ──────────────────────────────────────────────
# InPrep — Docker Development Commands
# Usage: make <command>
# ──────────────────────────────────────────────

# ─── Start / Stop ─────────────────────────────

## Start all services (with build)
up:
	docker compose up --build

## Start in background (detached)
up-d:
	docker compose up --build -d

## Stop all services
down:
	docker compose down

## Restart all services
restart:
	docker compose down && docker compose up --build -d

## Stop and remove volumes (⚠️ deletes database & uploads)
down-clean:
	docker compose down -v

# ─── Logs ─────────────────────────────────────

## View all logs
logs:
	docker compose logs -f

## View backend logs only
logs-backend:
	docker compose logs -f backend

## View frontend logs only
logs-frontend:
	docker compose logs -f frontend

# ─── Shell Access ─────────────────────────────

## Open shell in backend container
shell-backend:
	docker compose exec backend bash

## Open shell in frontend container
shell-frontend:
	docker compose exec frontend sh

## Open Python REPL in backend
python:
	docker compose exec backend python

# ─── Database ─────────────────────────────────

## Open SQLite shell inside backend container
db:
	docker compose exec backend sqlite3 inprep.db

## List all tables
db-tables:
	docker compose exec backend sqlite3 inprep.db ".tables"

## Show all users
db-users:
	docker compose exec backend sqlite3 inprep.db "SELECT * FROM users;"

## Show all interviews
db-interviews:
	docker compose exec backend sqlite3 inprep.db "SELECT * FROM interviews;"

## Show all messages
db-messages:
	docker compose exec backend sqlite3 inprep.db "SELECT * FROM interview_messages;"

# ─── Build ────────────────────────────────────

## Rebuild without cache
rebuild:
	docker compose build --no-cache

## Rebuild backend only
rebuild-backend:
	docker compose build --no-cache backend

## Rebuild frontend only
rebuild-frontend:
	docker compose build --no-cache frontend

# ─── Status / Debug ───────────────────────────

## Show running containers
ps:
	docker compose ps

## Show container resource usage
stats:
	docker stats --no-stream

## Check backend health
health:
	curl -s http://localhost:8000/health | python3 -m json.tool

## Hit the backend root endpoint
api:
	curl -s http://localhost:8000/ | python3 -m json.tool

# ─── Cleanup ──────────────────────────────────

## Remove stopped containers
clean:
	docker compose rm -f

## Full cleanup: containers, volumes, images
nuke:
	docker compose down -v --rmi local
	docker system prune -f

# ─── Help ─────────────────────────────────────

## Show this help
help:
	@echo ""
	@echo "  InPrep Docker Commands"
	@echo "  ──────────────────────────────────"
	@echo ""
	@echo "  make up              Start all services (with build)"
	@echo "  make up-d            Start in background"
	@echo "  make down            Stop all services"
	@echo "  make restart         Restart everything"
	@echo "  make down-clean      Stop + delete volumes (⚠️ db reset)"
	@echo ""
	@echo "  make logs            All logs (follow)"
	@echo "  make logs-backend    Backend logs only"
	@echo "  make logs-frontend   Frontend logs only"
	@echo ""
	@echo "  make shell-backend   Bash into backend"
	@echo "  make shell-frontend  Shell into frontend"
	@echo "  make python          Python REPL in backend"
	@echo ""
	@echo "  make db              SQLite shell"
	@echo "  make db-tables       List tables"
	@echo "  make db-users        Show all users"
	@echo "  make db-interviews   Show all interviews"
	@echo ""
	@echo "  make ps              Running containers"
	@echo "  make health          Backend health check"
	@echo "  make rebuild         Rebuild without cache"
	@echo "  make nuke            Full cleanup (⚠️ destructive)"
	@echo ""

.PHONY: up up-d down restart down-clean logs logs-backend logs-frontend \
        shell-backend shell-frontend python db db-tables db-users db-interviews \
        db-messages rebuild rebuild-backend rebuild-frontend ps stats health api \
        clean nuke help

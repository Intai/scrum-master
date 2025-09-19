.PHONY: help dev dev-bg dev-stop dev-logs dev-clean prod prod-stop prod-logs prod-clean build-dev build-prod clean-all

# Default target
help:
	@echo "Available commands:"
	@echo "  make dev        - Start development environment with hot-reload"
	@echo "  make dev-bg     - Start development environment in background"
	@echo "  make dev-stop   - Stop development environment"
	@echo "  make dev-logs   - View development logs"
	@echo "  make dev-clean  - Clean development containers and volumes"
	@echo ""
	@echo "  make prod       - Start production environment"
	@echo "  make prod-stop  - Stop production environment"
	@echo "  make prod-logs  - View production logs"
	@echo "  make prod-clean - Clean production containers and volumes"
	@echo ""
	@echo "  make build-dev  - Build development images"
	@echo "  make build-prod - Build production images"
	@echo "  make clean-all  - Clean all Docker resources"

# Development environment
dev:
	@echo "Starting development environment..."
	docker-compose up --build

dev-bg:
	@echo "Starting development environment in background..."
	docker-compose up --build -d
	@echo "Services started. Use 'make dev-logs' to view logs."

dev-stop:
	@echo "Stopping development environment..."
	docker-compose down

dev-logs:
	@echo "Viewing development logs (Ctrl+C to exit)..."
	docker-compose logs -f

dev-clean:
	@echo "Cleaning development environment..."
	docker-compose down -v --remove-orphans
	docker-compose rm -f

# Production environment
prod:
	@echo "Starting production environment..."
	docker-compose -f docker-compose.prod.yml up --build

prod-bg:
	@echo "Starting production environment in background..."
	docker-compose -f docker-compose.prod.yml up --build -d
	@echo "Production services started. Use 'make prod-logs' to view logs."

prod-stop:
	@echo "Stopping production environment..."
	docker-compose -f docker-compose.prod.yml down

prod-logs:
	@echo "Viewing production logs (Ctrl+C to exit)..."
	docker-compose -f docker-compose.prod.yml logs -f

prod-clean:
	@echo "Cleaning production environment..."
	docker-compose -f docker-compose.prod.yml down -v --remove-orphans
	docker-compose -f docker-compose.prod.yml rm -f

# Build targets
build-dev:
	@echo "Building development images..."
	docker-compose build

build-prod:
	@echo "Building production images..."
	docker-compose -f docker-compose.prod.yml build

# Utility targets
clean-all:
	@echo "Cleaning all Docker resources..."
	docker-compose down -v --remove-orphans
	docker-compose -f docker-compose.prod.yml down -v --remove-orphans
	docker system prune -f
	@echo "Cleanup complete."

# Database operations
db-migrate:
	@echo "Running database migrations..."
	docker-compose exec backend npm run migrate

db-seed:
	@echo "Seeding database..."
	docker-compose exec backend npm run seed

db-setup:
	@echo "Setting up database (migrate + seed)..."
	docker-compose exec backend npm run setup

# Health checks
status:
	@echo "Checking service status..."
	@docker-compose ps
	@echo ""
	@echo "Health status:"
	@docker-compose exec backend curl -f http://localhost:3000/health 2>/dev/null && echo "✓ Backend healthy" || echo "✗ Backend unhealthy"
	@docker-compose exec frontend curl -f http://localhost:8080 2>/dev/null && echo "✓ Frontend healthy" || echo "✗ Frontend unhealthy"
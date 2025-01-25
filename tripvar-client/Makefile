.PHONY: up down build dev logs clean

# Start production containers
up:
	docker-compose up -d

# Start development container
dev:
	docker-compose up client-dev

# Stop all containers
down:
	docker-compose down

# Build or rebuild services
build:
	docker-compose build

# View logs
logs:
	docker-compose logs -f

# Clean up Docker resources
clean:
	docker-compose down -v --remove-orphans
	docker system prune -f

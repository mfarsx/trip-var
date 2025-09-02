#!/bin/bash

# Tripvar Status Display Script
# Run this after docker compose up to see service status and URLs

echo ""
echo "🚀 Tripvar Application Status"
echo "=============================="
echo ""

# Function to check if a service is running
check_service() {
    local service_name=$1
    local port=$2
    local description=$3
    
    if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "${service_name}.*Up"; then
        echo "✅ ${description}: Running on port ${port}"
        return 0
    else
        echo "❌ ${description}: Not running"
        return 1
    fi
}

# Check all services
echo "📊 Service Status:"
echo "------------------"

check_service "tripvar-mongodb" "27017" "MongoDB"
check_service "tripvar-redis" "6379" "Redis"
check_service "tripvar-server" "8000" "Server"
check_service "tripvar-client" "5173" "Client"

echo ""
echo "🌐 Application URLs:"
echo "-------------------"

# Get client port from docker compose config
CLIENT_PORT=$(docker compose config 2>/dev/null | grep -A 10 "client:" | grep "CLIENT_PORT" | cut -d: -f2 | tr -d ' "' 2>/dev/null || echo "5173")

echo "Frontend (Client): http://localhost:${CLIENT_PORT}"
echo "Backend (Server):  http://localhost:8000"
echo "API Documentation: http://localhost:8000/api-docs"
echo "Health Check:      http://localhost:8000/health"
echo ""

echo "📝 Quick Commands:"
echo "------------------"
echo "View all logs:     docker compose logs -f"
echo "View server logs:  docker compose logs -f server"
echo "View client logs:  docker compose logs -f client"
echo "Stop services:     docker compose down"
echo "Restart services:  docker compose restart"
echo ""

echo "🔧 Development Tips:"
echo "-------------------"
echo "• Logs are configured to show only warnings and errors by default"
echo "• To see more logs: LOG_LEVEL=info docker compose up"
echo "• To see debug logs: LOG_LEVEL=debug docker compose up"
echo "• Check .env.example for all configuration options"
echo ""

# Check if services are healthy
echo "❤️  Health Check:"
echo "----------------"
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Server health check: PASSED"
else
    echo "❌ Server health check: FAILED"
fi

echo ""
echo "🎉 Your Tripvar application is ready to use!"
echo ""
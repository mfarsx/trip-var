#!/bin/bash

# Tripvar Startup Information Script
# This script displays helpful information after docker compose up

echo ""
echo "🚀 Tripvar Application Started Successfully!"
echo "=============================================="
echo ""

# Wait a moment for services to fully start
sleep 3

# Check if services are running
echo "📊 Service Status:"
echo "------------------"

# Check MongoDB
if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "tripvar-mongodb.*Up"; then
    echo "✅ MongoDB: Running on port 27017"
else
    echo "❌ MongoDB: Not running"
fi

# Check Redis
if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "tripvar-redis.*Up"; then
    echo "✅ Redis: Running on port 6379"
else
    echo "❌ Redis: Not running"
fi

# Check Server
if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "tripvar-server.*Up"; then
    echo "✅ Server: Running on port 8000"
else
    echo "❌ Server: Not running"
fi

# Check Client
if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "tripvar-client.*Up"; then
    CLIENT_PORT=$(docker compose config | grep -A 10 "client:" | grep "CLIENT_PORT" | cut -d: -f2 | tr -d ' "' || echo "5173")
    echo "✅ Client: Running on port ${CLIENT_PORT}"
else
    echo "❌ Client: Not running"
fi

echo ""
echo "🌐 Application URLs:"
echo "-------------------"
echo "Frontend (Client): http://localhost:${CLIENT_PORT:-5173}"
echo "Backend (Server):  http://localhost:8000"
echo "API Documentation: http://localhost:8000/api-docs"
echo "Health Check:      http://localhost:8000/health"
echo ""

echo "📝 Useful Commands:"
echo "------------------"
echo "View logs:         docker compose logs -f"
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

echo "🎉 Happy coding! Your Tripvar application is ready to use."
echo ""
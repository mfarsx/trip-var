#!/bin/bash

echo "🐳 Testing Docker Networking for Tripvar"
echo "========================================"

# Check if containers are running
echo "📋 Checking container status..."
docker-compose ps

echo ""
echo "🔍 Testing network connectivity..."

# Test if client can reach server
echo "Testing client -> server connectivity..."
docker-compose exec client ping -c 2 server 2>/dev/null && echo "✅ Client can reach server" || echo "❌ Client cannot reach server"

# Test if server is listening on port 8000
echo "Testing server port 8000..."
docker-compose exec server netstat -tlnp | grep :8000 && echo "✅ Server is listening on port 8000" || echo "❌ Server is not listening on port 8000"

# Test HTTP connectivity
echo "Testing HTTP connectivity..."
docker-compose exec client curl -s -o /dev/null -w "%{http_code}" http://server:8000/health && echo "✅ HTTP connectivity works" || echo "❌ HTTP connectivity failed"

echo ""
echo "📊 Container logs (last 10 lines each):"
echo "======================================"

echo "Server logs:"
docker-compose logs --tail=10 server

echo ""
echo "Client logs:"
docker-compose logs --tail=10 client

echo ""
echo "🌐 Network inspection:"
docker network ls | grep tripvar
docker network inspect tripvar_app-network 2>/dev/null | grep -A 5 -B 5 "Containers"
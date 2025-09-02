#!/bin/bash

# Tripvar Client Debug Script
# This script helps debug client-side issues

echo ""
echo "🔍 Tripvar Client Debug Information"
echo "==================================="
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

echo "📊 Service Status:"
echo "------------------"
check_service "tripvar-client" "5173" "Client"
check_service "tripvar-server" "8000" "Server"
check_service "tripvar-mongodb" "27017" "MongoDB"
check_service "tripvar-redis" "6379" "Redis"

echo ""
echo "🔍 Client Container Debug:"
echo "--------------------------"

# Check if client container exists
if docker ps -a --format "table {{.Names}}\t{{.Status}}" | grep -q "tripvar-client"; then
    echo "📦 Client container found"
    
    # Check container logs
    echo ""
    echo "📋 Recent client logs (last 20 lines):"
    echo "--------------------------------------"
    docker logs --tail=20 tripvar-client 2>&1 | sed 's/^/  /'
    
    # Check if container is healthy
    echo ""
    echo "❤️  Container health:"
    echo "--------------------"
    if docker inspect tripvar-client --format='{{.State.Health.Status}}' 2>/dev/null; then
        echo "Health check status: $(docker inspect tripvar-client --format='{{.State.Health.Status}}')"
    else
        echo "No health check configured"
    fi
    
    # Check container resources
    echo ""
    echo "💾 Container resources:"
    echo "----------------------"
    docker stats tripvar-client --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}" 2>/dev/null || echo "  Unable to get resource stats"
    
else
    echo "❌ Client container not found"
fi

echo ""
echo "🌐 Network connectivity:"
echo "------------------------"

# Test if client port is accessible
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "✅ Client port 5173: Accessible"
else
    echo "❌ Client port 5173: Not accessible"
fi

# Test if server is accessible from client perspective
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Server port 8000: Accessible"
else
    echo "❌ Server port 8000: Not accessible"
fi

echo ""
echo "🔧 Debug Commands:"
echo "------------------"
echo "View client logs:     docker logs -f tripvar-client"
echo "Enter client container: docker exec -it tripvar-client sh"
echo "Check client files:   docker exec tripvar-client ls -la /app"
echo "Check node modules:   docker exec tripvar-client ls -la /app/node_modules"
echo "Check package.json:   docker exec tripvar-client cat /app/package.json"
echo "Restart client:       docker compose restart client"
echo "Rebuild client:       docker compose up --build client"
echo ""

echo "🚀 Quick Fixes:"
echo "---------------"
echo "1. If 'vite: not found' error:"
echo "   docker compose down"
echo "   docker compose up --build client"
echo ""
echo "2. If port already in use:"
echo "   docker compose down"
echo "   lsof -ti:5173 | xargs kill -9"
echo "   docker compose up client"
echo ""
echo "3. If node_modules issues:"
echo "   docker compose down"
echo "   docker volume prune -f"
echo "   docker compose up --build client"
echo ""

# Check for common issues
echo "🔍 Common Issues Check:"
echo "-----------------------"

# Check if vite is installed
if docker exec tripvar-client sh -c "which vite" > /dev/null 2>&1; then
    echo "✅ Vite is installed"
else
    echo "❌ Vite is not installed - this is likely the main issue"
    echo "   Solution: Rebuild the client container"
fi

# Check if node_modules exists
if docker exec tripvar-client sh -c "test -d /app/node_modules" > /dev/null 2>&1; then
    echo "✅ node_modules directory exists"
else
    echo "❌ node_modules directory missing"
    echo "   Solution: Rebuild the client container"
fi

# Check if package.json exists
if docker exec tripvar-client sh -c "test -f /app/package.json" > /dev/null 2>&1; then
    echo "✅ package.json exists"
else
    echo "❌ package.json missing"
fi

echo ""
echo "🎯 Recommended Action:"
echo "---------------------"
echo "Run: docker compose down && docker compose up --build"
echo ""
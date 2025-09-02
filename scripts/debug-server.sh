#!/bin/bash

# Tripvar Server Debug Script
# This script helps debug server issues

echo ""
echo "🔍 Tripvar Server Debug Information"
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
check_service "tripvar-server" "8000" "Server"
check_service "tripvar-mongodb" "27017" "MongoDB"
check_service "tripvar-redis" "6379" "Redis"

echo ""
echo "🔍 Server Container Debug:"
echo "--------------------------"

# Check if server container exists
if docker ps -a --format "table {{.Names}}\t{{.Status}}" | grep -q "tripvar-server"; then
    echo "📦 Server container found"
    
    # Check container logs
    echo ""
    echo "📋 Recent server logs (last 30 lines):"
    echo "--------------------------------------"
    docker logs --tail=30 tripvar-server 2>&1 | sed 's/^/  /'
    
    # Check if server is healthy
    echo ""
    echo "❤️  Server health check:"
    echo "-----------------------"
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo "✅ Server health endpoint: Accessible"
        # Get health response
        echo "Health response:"
        curl -s http://localhost:8000/health | jq . 2>/dev/null || curl -s http://localhost:8000/health
    else
        echo "❌ Server health endpoint: Not accessible"
    fi
    
    # Check container resources
    echo ""
    echo "💾 Container resources:"
    echo "----------------------"
    docker stats tripvar-server --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}" 2>/dev/null || echo "  Unable to get resource stats"
    
    # Check if node process is running
    echo ""
    echo "🔧 Process information:"
    echo "----------------------"
    if docker exec tripvar-server ps aux | grep -q "node.*index.js"; then
        echo "✅ Node.js process is running"
        docker exec tripvar-server ps aux | grep "node.*index.js" | head -1
    else
        echo "❌ Node.js process not found"
    fi
    
else
    echo "❌ Server container not found"
fi

echo ""
echo "🌐 Network connectivity:"
echo "------------------------"

# Test if server port is accessible
if curl -s http://localhost:8000 > /dev/null 2>&1; then
    echo "✅ Server port 8000: Accessible"
else
    echo "❌ Server port 8000: Not accessible"
fi

# Test API endpoints
echo ""
echo "🔌 API endpoint tests:"
echo "---------------------"

# Test health endpoint
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ /health endpoint: Working"
else
    echo "❌ /health endpoint: Failed"
fi

# Test API docs endpoint
if curl -s http://localhost:8000/api-docs > /dev/null 2>&1; then
    echo "✅ /api-docs endpoint: Working"
else
    echo "❌ /api-docs endpoint: Failed"
fi

# Test API v1 endpoint
if curl -s http://localhost:8000/api/v1 > /dev/null 2>&1; then
    echo "✅ /api/v1 endpoint: Working"
else
    echo "❌ /api/v1 endpoint: Failed"
fi

echo ""
echo "🔧 Debug Commands:"
echo "------------------"
echo "View server logs:     docker logs -f tripvar-server"
echo "Enter server container: docker exec -it tripvar-server sh"
echo "Check server files:   docker exec tripvar-server ls -la /usr/src/app"
echo "Check package.json:   docker exec tripvar-server cat /usr/src/app/package.json"
echo "Restart server:       docker compose restart server"
echo "Rebuild server:       docker compose up --build server"
echo ""

echo "🚀 Quick Fixes:"
echo "---------------"
echo "1. If server keeps crashing:"
echo "   docker compose down"
echo "   docker compose up --build server"
echo ""
echo "2. If validation errors:"
echo "   Check the validation middleware fixes"
echo "   Server should not crash on validation errors"
echo ""
echo "3. If MongoDB connection errors:"
echo "   ./scripts/debug-mongodb.sh"
echo ""

# Check for common issues
echo "🔍 Common Issues Check:"
echo "-----------------------"

# Check if .env file exists
if docker exec tripvar-server test -f /usr/src/app/.env; then
    echo "✅ .env file exists"
else
    echo "❌ .env file missing"
fi

# Check if MongoDB URI is set
if docker exec tripvar-server sh -c "grep -q 'MONGODB_URI' /usr/src/app/.env"; then
    echo "✅ MONGODB_URI is set in .env"
else
    echo "❌ MONGODB_URI not found in .env"
fi

# Check if node_modules exists
if docker exec tripvar-server test -d /usr/src/app/node_modules; then
    echo "✅ node_modules directory exists"
else
    echo "❌ node_modules directory missing"
fi

# Check for validation errors in logs
echo ""
echo "🔍 Recent Error Analysis:"
echo "-------------------------"
if docker logs tripvar-server 2>&1 | grep -q "Validation failed"; then
    echo "⚠️  Validation errors detected in logs"
    echo "Recent validation errors:"
    docker logs tripvar-server 2>&1 | grep "Validation failed" | tail -3 | sed 's/^/  /'
else
    echo "✅ No recent validation errors"
fi

if docker logs tripvar-server 2>&1 | grep -q "unhandledRejection"; then
    echo "⚠️  Unhandled rejections detected in logs"
    echo "Recent unhandled rejections:"
    docker logs tripvar-server 2>&1 | grep "unhandledRejection" | tail -3 | sed 's/^/  /'
else
    echo "✅ No recent unhandled rejections"
fi

echo ""
echo "🎯 Recommended Action:"
echo "---------------------"
echo "Run: docker compose restart server"
echo "If issues persist: docker compose down && docker compose up --build"
echo ""
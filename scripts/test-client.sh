#!/bin/bash

# Tripvar Client Test Script
# This script tests if the client is working properly

echo ""
echo "🧪 Tripvar Client Test"
echo "======================"
echo ""

# Function to test URL
test_url() {
    local url=$1
    local description=$2
    
    echo -n "Testing ${description}... "
    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200\|404"; then
        echo "✅ OK"
        return 0
    else
        echo "❌ FAILED"
        return 1
    fi
}

echo "🌐 Testing Client URLs:"
echo "-----------------------"

# Test client accessibility
test_url "http://localhost:5173" "Client Homepage"
test_url "http://localhost:5173/src/main.jsx" "Main JSX File"

echo ""
echo "🔍 Testing Client Container:"
echo "----------------------------"

# Test if container is running
if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "tripvar-client.*Up"; then
    echo "✅ Client container is running"
    
    # Test if vite is working
    echo -n "Testing Vite server... "
    if docker exec tripvar-client sh -c "ps aux | grep vite" > /dev/null 2>&1; then
        echo "✅ Vite is running"
    else
        echo "❌ Vite is not running"
    fi
    
    # Test if node_modules exists
    echo -n "Testing node_modules... "
    if docker exec tripvar-client sh -c "test -d /app/node_modules" > /dev/null 2>&1; then
        echo "✅ node_modules exists"
    else
        echo "❌ node_modules missing"
    fi
    
    # Test if vite is installed
    echo -n "Testing Vite installation... "
    if docker exec tripvar-client sh -c "which vite" > /dev/null 2>&1; then
        echo "✅ Vite is installed"
    else
        echo "❌ Vite not found"
    fi
    
else
    echo "❌ Client container is not running"
fi

echo ""
echo "📋 Container Information:"
echo "-------------------------"

# Show container status
docker ps --filter "name=tripvar-client" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🔧 If tests fail, try:"
echo "----------------------"
echo "1. docker compose down"
echo "2. docker compose up --build client"
echo "3. ./scripts/debug-client.sh"
echo ""
#!/bin/bash

# Tripvar MongoDB Debug Script
# This script helps debug MongoDB connection issues

echo ""
echo "🔍 Tripvar MongoDB Debug Information"
echo "===================================="
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
check_service "tripvar-mongodb" "27017" "MongoDB"

echo ""
echo "🔍 MongoDB Container Debug:"
echo "---------------------------"

# Check if MongoDB container exists
if docker ps -a --format "table {{.Names}}\t{{.Status}}" | grep -q "tripvar-mongodb"; then
    echo "📦 MongoDB container found"
    
    # Check container logs
    echo ""
    echo "📋 Recent MongoDB logs (last 20 lines):"
    echo "---------------------------------------"
    docker logs --tail=20 tripvar-mongodb 2>&1 | sed 's/^/  /'
    
    # Check if MongoDB is accepting connections
    echo ""
    echo "🔌 Connection test:"
    echo "------------------"
    if docker exec tripvar-mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
        echo "✅ MongoDB is accepting connections"
    else
        echo "❌ MongoDB is not accepting connections"
    fi
    
    # Check authentication
    echo ""
    echo "🔐 Authentication test:"
    echo "----------------------"
    
    # Test root user authentication
    if docker exec tripvar-mongodb mongosh -u admin -p password --authenticationDatabase admin --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
        echo "✅ Root user authentication works"
    else
        echo "❌ Root user authentication failed"
    fi
    
    # Test tripvar user authentication
    if docker exec tripvar-mongodb mongosh -u tripvar_user -p tripvar_password123 --authenticationDatabase tripvar --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
        echo "✅ Tripvar user authentication works"
    else
        echo "❌ Tripvar user authentication failed"
    fi
    
    # Check databases
    echo ""
    echo "🗄️  Database information:"
    echo "------------------------"
    docker exec tripvar-mongodb mongosh -u admin -p password --authenticationDatabase admin --eval "show dbs" 2>/dev/null | sed 's/^/  /'
    
    # Check users
    echo ""
    echo "👥 User information:"
    echo "-------------------"
    docker exec tripvar-mongodb mongosh -u admin -p password --authenticationDatabase admin --eval "db.getUsers()" 2>/dev/null | sed 's/^/  /'
    
else
    echo "❌ MongoDB container not found"
fi

echo ""
echo "🌐 Network connectivity:"
echo "------------------------"

# Test if MongoDB port is accessible
if nc -z localhost 27017 2>/dev/null; then
    echo "✅ MongoDB port 27017: Accessible"
else
    echo "❌ MongoDB port 27017: Not accessible"
fi

echo ""
echo "🔧 Debug Commands:"
echo "------------------"
echo "View MongoDB logs:     docker logs -f tripvar-mongodb"
echo "Enter MongoDB shell:   docker exec -it tripvar-mongodb mongosh"
echo "Connect as root:       docker exec -it tripvar-mongodb mongosh -u admin -p password --authenticationDatabase admin"
echo "Connect as tripvar:    docker exec -it tripvar-mongodb mongosh -u tripvar_user -p tripvar_password123 --authenticationDatabase tripvar"
echo "Restart MongoDB:       docker compose restart mongodb"
echo "Rebuild MongoDB:       docker compose up --build mongodb"
echo ""

echo "🚀 Quick Fixes:"
echo "---------------"
echo "1. If authentication errors:"
echo "   docker compose down"
echo "   docker volume rm tripvar_mongodb_data"
echo "   docker compose up --build"
echo ""
echo "2. If connection refused:"
echo "   docker compose restart mongodb"
echo "   sleep 10"
echo "   docker compose restart server"
echo ""
echo "3. If user doesn't exist:"
echo "   Check mongo-init.js file"
echo "   Rebuild MongoDB container"
echo ""

# Check for common issues
echo "🔍 Common Issues Check:"
echo "-----------------------"

# Check if mongo-init.js exists
if [ -f "./mongo-init.js" ]; then
    echo "✅ mongo-init.js exists"
else
    echo "❌ mongo-init.js missing"
fi

# Check if MongoDB URI is correct in .env
if grep -q "mongodb://tripvar_user:tripvar_password123@mongodb:27017/tripvar" ./tripvar-server/.env; then
    echo "✅ MongoDB URI in .env looks correct"
else
    echo "❌ MongoDB URI in .env may be incorrect"
    echo "   Expected: mongodb://tripvar_user:tripvar_password123@mongodb:27017/tripvar?authSource=tripvar"
fi

echo ""
echo "🎯 Recommended Action:"
echo "---------------------"
echo "Run: docker compose down && docker compose up --build"
echo ""
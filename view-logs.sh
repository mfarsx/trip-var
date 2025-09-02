#!/bin/bash

# TripVar Docker Logs Viewer
echo "🐳 TripVar Docker Logs Viewer"
echo "=============================="
echo ""

case "$1" in
    "all")
        echo "📋 Showing logs for all containers..."
        docker-compose logs -f
        ;;
    "mongo")
        echo "🍃 Showing MongoDB logs..."
        docker logs -f tripvar-mongodb
        ;;
    "redis")
        echo "🔴 Showing Redis logs..."
        docker logs -f tripvar-redis
        ;;
    "server")
        echo "🖥️  Showing Server logs..."
        docker logs -f tripvar-server
        ;;
    "client")
        echo "⚛️  Showing Client logs..."
        docker logs -f tripvar-client
        ;;
    "mongo-full")
        echo "🍃 Showing full MongoDB logs (including verbose)..."
        docker exec tripvar-mongodb cat /var/log/mongodb/mongod.log
        ;;
    *)
        echo "Usage: $0 {all|mongo|redis|server|client|mongo-full}"
        echo ""
        echo "Options:"
        echo "  all        - Show logs for all containers (like docker-compose up)"
        echo "  mongo      - Show MongoDB logs (filtered)"
        echo "  redis      - Show Redis logs"
        echo "  server     - Show Server logs"
        echo "  client     - Show Client logs"
        echo "  mongo-full - Show full MongoDB logs (verbose)"
        echo ""
        echo "Examples:"
        echo "  $0 all      # View all logs in real-time"
        echo "  $0 mongo    # View only MongoDB logs"
        echo "  $0 mongo-full # View full MongoDB logs"
        ;;
esac
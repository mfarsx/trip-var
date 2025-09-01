#!/bin/bash

# Simple script to manage Docker Compose logs

case "$1" in
  "quiet")
    echo "Starting with quiet logging..."
    docker-compose -f docker-compose.quiet.yml up -d
    ;;
  "normal")
    echo "Starting with normal logging..."
    docker-compose up -d
    ;;
  "logs")
    if [ "$2" = "server" ]; then
      docker-compose logs -f server
    elif [ "$2" = "mongodb" ]; then
      docker-compose logs -f mongodb
    elif [ "$2" = "redis" ]; then
      docker-compose logs -f redis
    elif [ "$2" = "client" ]; then
      docker-compose logs -f client
    else
      docker-compose logs -f
    fi
    ;;
  "clean")
    echo "Cleaning up logs..."
    docker-compose logs --tail=0 > /dev/null 2>&1
    ;;
  *)
    echo "Usage: $0 {quiet|normal|logs [service]|clean}"
    echo ""
    echo "Commands:"
    echo "  quiet   - Start with minimal logging"
    echo "  normal  - Start with normal logging"
    echo "  logs    - Show logs (optionally for specific service)"
    echo "  clean   - Clean up logs"
    echo ""
    echo "Examples:"
    echo "  $0 quiet"
    echo "  $0 logs server"
    echo "  $0 logs mongodb"
    ;;
esac
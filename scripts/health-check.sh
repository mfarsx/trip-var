#!/bin/bash

# TripVar Health Check Script
# Comprehensive health monitoring for all services

set -e

# Configuration
PROJECT_DIR="/opt/tripvar"
LOG_FILE="$PROJECT_DIR/logs/health-check.log"
ALERT_EMAIL=""
SLACK_WEBHOOK=""
CHECK_INTERVAL=60
MAX_RETRIES=3

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Create log directory
mkdir -p "$(dirname "$LOG_FILE")"

# Health check results
declare -A HEALTH_STATUS
declare -A HEALTH_MESSAGES

# Check system resources
check_system_resources() {
    log "Checking system resources..."
    
    # Check CPU usage
    CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')
    if (( $(echo "$CPU_USAGE > 80" | bc -l) )); then
        HEALTH_STATUS["cpu"]="CRITICAL"
        HEALTH_MESSAGES["cpu"]="CPU usage is ${CPU_USAGE}%"
    elif (( $(echo "$CPU_USAGE > 60" | bc -l) )); then
        HEALTH_STATUS["cpu"]="WARNING"
        HEALTH_MESSAGES["cpu"]="CPU usage is ${CPU_USAGE}%"
    else
        HEALTH_STATUS["cpu"]="OK"
        HEALTH_MESSAGES["cpu"]="CPU usage is ${CPU_USAGE}%"
    fi
    
    # Check memory usage
    MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
    if (( $(echo "$MEMORY_USAGE > 90" | bc -l) )); then
        HEALTH_STATUS["memory"]="CRITICAL"
        HEALTH_MESSAGES["memory"]="Memory usage is ${MEMORY_USAGE}%"
    elif (( $(echo "$MEMORY_USAGE > 80" | bc -l) )); then
        HEALTH_STATUS["memory"]="WARNING"
        HEALTH_MESSAGES["memory"]="Memory usage is ${MEMORY_USAGE}%"
    else
        HEALTH_STATUS["memory"]="OK"
        HEALTH_MESSAGES["memory"]="Memory usage is ${MEMORY_USAGE}%"
    fi
    
    # Check disk usage
    DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ "$DISK_USAGE" -gt 90 ]; then
        HEALTH_STATUS["disk"]="CRITICAL"
        HEALTH_MESSAGES["disk"]="Disk usage is ${DISK_USAGE}%"
    elif [ "$DISK_USAGE" -gt 80 ]; then
        HEALTH_STATUS["disk"]="WARNING"
        HEALTH_MESSAGES["disk"]="Disk usage is ${DISK_USAGE}%"
    else
        HEALTH_STATUS["disk"]="OK"
        HEALTH_MESSAGES["disk"]="Disk usage is ${DISK_USAGE}%"
    fi
    
    # Check temperature (Raspberry Pi specific)
    if [ -f "/sys/class/thermal/thermal_zone0/temp" ]; then
        TEMP=$(cat /sys/class/thermal/thermal_zone0/temp)
        TEMP_C=$((TEMP / 1000))
        if [ "$TEMP_C" -gt 80 ]; then
            HEALTH_STATUS["temperature"]="CRITICAL"
            HEALTH_MESSAGES["temperature"]="Temperature is ${TEMP_C}°C"
        elif [ "$TEMP_C" -gt 70 ]; then
            HEALTH_STATUS["temperature"]="WARNING"
            HEALTH_MESSAGES["temperature"]="Temperature is ${TEMP_C}°C"
        else
            HEALTH_STATUS["temperature"]="OK"
            HEALTH_MESSAGES["temperature"]="Temperature is ${TEMP_C}°C"
        fi
    fi
}

# Check Docker service
check_docker_service() {
    log "Checking Docker service..."
    
    if systemctl is-active --quiet docker; then
        HEALTH_STATUS["docker"]="OK"
        HEALTH_MESSAGES["docker"]="Docker service is running"
    else
        HEALTH_STATUS["docker"]="CRITICAL"
        HEALTH_MESSAGES["docker"]="Docker service is not running"
    fi
}

# Check TripVar service
check_tripvar_service() {
    log "Checking TripVar service..."
    
    if systemctl is-active --quiet tripvar; then
        HEALTH_STATUS["tripvar_service"]="OK"
        HEALTH_MESSAGES["tripvar_service"]="TripVar service is running"
    else
        HEALTH_STATUS["tripvar_service"]="CRITICAL"
        HEALTH_MESSAGES["tripvar_service"]="TripVar service is not running"
    fi
}

# Check Docker containers
check_docker_containers() {
    log "Checking Docker containers..."
    
    cd "$PROJECT_DIR"
    
    # Check if all containers are running
    RUNNING_CONTAINERS=$(docker-compose -f docker-compose.prod.yml ps --services --filter "status=running" | wc -l)
    TOTAL_CONTAINERS=$(docker-compose -f docker-compose.prod.yml ps --services | wc -l)
    
    if [ "$RUNNING_CONTAINERS" -eq "$TOTAL_CONTAINERS" ] && [ "$TOTAL_CONTAINERS" -gt 0 ]; then
        HEALTH_STATUS["containers"]="OK"
        HEALTH_MESSAGES["containers"]="All $TOTAL_CONTAINERS containers are running"
    else
        HEALTH_STATUS["containers"]="CRITICAL"
        HEALTH_MESSAGES["containers"]="Only $RUNNING_CONTAINERS of $TOTAL_CONTAINERS containers are running"
    fi
    
    # Check individual container health
    for container in $(docker-compose -f docker-compose.prod.yml ps --services); do
        if docker-compose -f docker-compose.prod.yml ps "$container" | grep -q "Up"; then
            HEALTH_STATUS["container_$container"]="OK"
            HEALTH_MESSAGES["container_$container"]="Container $container is running"
        else
            HEALTH_STATUS["container_$container"]="CRITICAL"
            HEALTH_MESSAGES["container_$container"]="Container $container is not running"
        fi
    done
}

# Check API health
check_api_health() {
    log "Checking API health..."
    
    local retries=0
    local api_healthy=false
    
    while [ $retries -lt $MAX_RETRIES ]; do
        if curl -f -s http://localhost:8000/health > /dev/null 2>&1; then
            api_healthy=true
            break
        fi
        retries=$((retries + 1))
        sleep 5
    done
    
    if [ "$api_healthy" = true ]; then
        HEALTH_STATUS["api"]="OK"
        HEALTH_MESSAGES["api"]="API health check passed"
    else
        HEALTH_STATUS["api"]="CRITICAL"
        HEALTH_MESSAGES["api"]="API health check failed after $MAX_RETRIES attempts"
    fi
}

# Check database connectivity
check_database_health() {
    log "Checking database health..."
    
    # Check MongoDB
    if docker-compose -f "$PROJECT_DIR/docker-compose.prod.yml" exec -T mongodb mongosh --eval "db.runCommand('ping')" > /dev/null 2>&1; then
        HEALTH_STATUS["mongodb"]="OK"
        HEALTH_MESSAGES["mongodb"]="MongoDB is accessible"
    else
        HEALTH_STATUS["mongodb"]="CRITICAL"
        HEALTH_MESSAGES["mongodb"]="MongoDB is not accessible"
    fi
    
    # Check Redis
    if docker-compose -f "$PROJECT_DIR/docker-compose.prod.yml" exec -T redis redis-cli ping > /dev/null 2>&1; then
        HEALTH_STATUS["redis"]="OK"
        HEALTH_MESSAGES["redis"]="Redis is accessible"
    else
        HEALTH_STATUS["redis"]="CRITICAL"
        HEALTH_MESSAGES["redis"]="Redis is not accessible"
    fi
}

# Check SSL certificate
check_ssl_certificate() {
    log "Checking SSL certificate..."
    
    if [ -f "$PROJECT_DIR/ssl/cert.pem" ]; then
        # Check certificate expiration
        EXPIRY_DATE=$(openssl x509 -in "$PROJECT_DIR/ssl/cert.pem" -enddate -noout | cut -d= -f2)
        EXPIRY_TIMESTAMP=$(date -d "$EXPIRY_DATE" +%s)
        CURRENT_TIMESTAMP=$(date +%s)
        DAYS_UNTIL_EXPIRY=$(( (EXPIRY_TIMESTAMP - CURRENT_TIMESTAMP) / 86400 ))
        
        if [ "$DAYS_UNTIL_EXPIRY" -lt 7 ]; then
            HEALTH_STATUS["ssl"]="CRITICAL"
            HEALTH_MESSAGES["ssl"]="SSL certificate expires in $DAYS_UNTIL_EXPIRY days"
        elif [ "$DAYS_UNTIL_EXPIRY" -lt 30 ]; then
            HEALTH_STATUS["ssl"]="WARNING"
            HEALTH_MESSAGES["ssl"]="SSL certificate expires in $DAYS_UNTIL_EXPIRY days"
        else
            HEALTH_STATUS["ssl"]="OK"
            HEALTH_MESSAGES["ssl"]="SSL certificate expires in $DAYS_UNTIL_EXPIRY days"
        fi
    else
        HEALTH_STATUS["ssl"]="CRITICAL"
        HEALTH_MESSAGES["ssl"]="SSL certificate file not found"
    fi
}

# Check network connectivity
check_network_connectivity() {
    log "Checking network connectivity..."
    
    # Check internet connectivity
    if ping -c 1 8.8.8.8 > /dev/null 2>&1; then
        HEALTH_STATUS["internet"]="OK"
        HEALTH_MESSAGES["internet"]="Internet connectivity is working"
    else
        HEALTH_STATUS["internet"]="CRITICAL"
        HEALTH_MESSAGES["internet"]="No internet connectivity"
    fi
    
    # Check DNS resolution
    if nslookup google.com > /dev/null 2>&1; then
        HEALTH_STATUS["dns"]="OK"
        HEALTH_MESSAGES["dns"]="DNS resolution is working"
    else
        HEALTH_STATUS["dns"]="CRITICAL"
        HEALTH_MESSAGES["dns"]="DNS resolution is not working"
    fi
}

# Send alert notification
send_alert() {
    local status="$1"
    local message="$2"
    
    if [ -n "$SLACK_WEBHOOK" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🚨 TripVar Alert: $status - $message\"}" \
            "$SLACK_WEBHOOK" > /dev/null 2>&1
    fi
    
    if [ -n "$ALERT_EMAIL" ]; then
        echo "TripVar Alert: $status - $message" | mail -s "TripVar Health Alert" "$ALERT_EMAIL" 2>/dev/null || true
    fi
}

# Generate health report
generate_health_report() {
    log "Generating health report..."
    
    local overall_status="OK"
    local critical_count=0
    local warning_count=0
    
    # Count status types
    for status in "${HEALTH_STATUS[@]}"; do
        case "$status" in
            "CRITICAL")
                critical_count=$((critical_count + 1))
                overall_status="CRITICAL"
                ;;
            "WARNING")
                warning_count=$((warning_count + 1))
                if [ "$overall_status" = "OK" ]; then
                    overall_status="WARNING"
                fi
                ;;
        esac
    done
    
    # Log overall status
    log "=== HEALTH CHECK SUMMARY ==="
    log "Overall Status: $overall_status"
    log "Critical Issues: $critical_count"
    log "Warnings: $warning_count"
    log "Total Checks: ${#HEALTH_STATUS[@]}"
    log ""
    
    # Log individual statuses
    for check in "${!HEALTH_STATUS[@]}"; do
        local status="${HEALTH_STATUS[$check]}"
        local message="${HEALTH_MESSAGES[$check]}"
        
        case "$status" in
            "OK")
                success "$check: $message"
                ;;
            "WARNING")
                warning "$check: $message"
                ;;
            "CRITICAL")
                error "$check: $message"
                send_alert "CRITICAL" "$check: $message"
                ;;
        esac
    done
    
    log "=== END HEALTH CHECK ==="
    log ""
    
    # Return overall status
    echo "$overall_status"
}

# Main health check function
main() {
    log "Starting comprehensive health check..."
    
    check_system_resources
    check_docker_service
    check_tripvar_service
    check_docker_containers
    check_api_health
    check_database_health
    check_ssl_certificate
    check_network_connectivity
    
    local overall_status=$(generate_health_report)
    
    if [ "$overall_status" = "CRITICAL" ]; then
        exit 1
    elif [ "$overall_status" = "WARNING" ]; then
        exit 2
    else
        exit 0
    fi
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --email)
            ALERT_EMAIL="$2"
            shift 2
            ;;
        --slack-webhook)
            SLACK_WEBHOOK="$2"
            shift 2
            ;;
        --interval)
            CHECK_INTERVAL="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --email EMAIL           Email address for alerts"
            echo "  --slack-webhook URL     Slack webhook URL for alerts"
            echo "  --interval SECONDS      Check interval for continuous monitoring"
            echo "  --help                  Show this help message"
            exit 0
            ;;
        *)
            error "Unknown option: $1"
            ;;
    esac
done

# Run main function
main "$@"
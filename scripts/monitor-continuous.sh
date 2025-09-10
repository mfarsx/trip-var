#!/bin/bash

# TripVar Continuous Monitoring Script
# Runs health checks continuously with configurable intervals

set -e

# Configuration
PROJECT_DIR="/opt/tripvar"
LOG_FILE="$PROJECT_DIR/logs/monitor-continuous.log"
HEALTH_CHECK_SCRIPT="$PROJECT_DIR/scripts/health-check.sh"
CHECK_INTERVAL=300  # 5 minutes
ALERT_COOLDOWN=3600 # 1 hour
LAST_ALERT_FILE="$PROJECT_DIR/logs/last-alert.timestamp"

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

# Check if alert cooldown has passed
check_alert_cooldown() {
    if [ -f "$LAST_ALERT_FILE" ]; then
        local last_alert=$(cat "$LAST_ALERT_FILE")
        local current_time=$(date +%s)
        local time_diff=$((current_time - last_alert))
        
        if [ "$time_diff" -lt "$ALERT_COOLDOWN" ]; then
            return 1  # Still in cooldown
        fi
    fi
    return 0  # Cooldown passed
}

# Update last alert timestamp
update_alert_timestamp() {
    date +%s > "$LAST_ALERT_FILE"
}

# Send alert with cooldown
send_alert_with_cooldown() {
    local message="$1"
    
    if check_alert_cooldown; then
        log "Sending alert: $message"
        # Add your alert mechanism here (email, Slack, etc.)
        update_alert_timestamp
    else
        log "Alert suppressed due to cooldown: $message"
    fi
}

# Run health check and handle results
run_health_check() {
    log "Running health check..."
    
    if [ ! -f "$HEALTH_CHECK_SCRIPT" ]; then
        error "Health check script not found: $HEALTH_CHECK_SCRIPT"
        return 1
    fi
    
    # Run health check
    local exit_code=0
    "$HEALTH_CHECK_SCRIPT" || exit_code=$?
    
    case $exit_code in
        0)
            success "Health check passed - all systems OK"
            ;;
        1)
            error "Health check failed - CRITICAL issues detected"
            send_alert_with_cooldown "CRITICAL health issues detected"
            ;;
        2)
            warning "Health check completed with WARNINGs"
            send_alert_with_cooldown "Health check warnings detected"
            ;;
        *)
            error "Health check script returned unexpected exit code: $exit_code"
            ;;
    esac
    
    return $exit_code
}

# Check system uptime
check_system_uptime() {
    local uptime_seconds=$(cat /proc/uptime | cut -d' ' -f1 | cut -d'.' -f1)
    local uptime_days=$((uptime_seconds / 86400))
    
    if [ "$uptime_days" -gt 30 ]; then
        warning "System has been up for $uptime_days days - consider rebooting"
    else
        log "System uptime: $uptime_days days"
    fi
}

# Check log file sizes
check_log_sizes() {
    local max_log_size=10485760  # 10MB
    
    for log_file in "$PROJECT_DIR/logs"/*.log; do
        if [ -f "$log_file" ]; then
            local file_size=$(stat -c%s "$log_file" 2>/dev/null || echo "0")
            if [ "$file_size" -gt "$max_log_size" ]; then
                warning "Log file is large: $log_file ($file_size bytes)"
            fi
        fi
    done
}

# Clean up old logs
cleanup_old_logs() {
    log "Cleaning up old log files..."
    
    # Remove log files older than 30 days
    find "$PROJECT_DIR/logs" -name "*.log" -mtime +30 -delete 2>/dev/null || true
    
    # Remove backup files older than 7 days
    find "$PROJECT_DIR/backups" -name "*.tar.gz" -mtime +7 -delete 2>/dev/null || true
    
    success "Log cleanup completed"
}

# Generate daily report
generate_daily_report() {
    local report_date=$(date +%Y-%m-%d)
    local report_file="$PROJECT_DIR/logs/daily-report-$report_date.txt"
    
    log "Generating daily report: $report_file"
    
    {
        echo "=== TripVar Daily Report - $report_date ==="
        echo ""
        echo "System Information:"
        echo "  Hostname: $(hostname)"
        echo "  Uptime: $(uptime)"
        echo "  Load Average: $(cat /proc/loadavg)"
        echo ""
        echo "Disk Usage:"
        df -h
        echo ""
        echo "Memory Usage:"
        free -h
        echo ""
        echo "Docker Containers:"
        cd "$PROJECT_DIR"
        docker-compose -f docker-compose.prod.yml ps
        echo ""
        echo "Service Status:"
        systemctl status tripvar --no-pager
        echo ""
        echo "Recent Log Entries:"
        tail -n 50 "$LOG_FILE"
        echo ""
        echo "=== End Report ==="
    } > "$report_file"
    
    success "Daily report generated: $report_file"
}

# Main monitoring loop
monitoring_loop() {
    local check_count=0
    local last_daily_report=""
    
    log "Starting continuous monitoring (interval: ${CHECK_INTERVAL}s)"
    log "Press Ctrl+C to stop monitoring"
    
    # Trap Ctrl+C
    trap 'log "Monitoring stopped by user"; exit 0' INT
    
    while true; do
        check_count=$((check_count + 1))
        log "=== Monitoring Cycle #$check_count ==="
        
        # Run health check
        run_health_check
        
        # Additional checks
        check_system_uptime
        check_log_sizes
        
        # Daily tasks
        local current_date=$(date +%Y-%m-%d)
        if [ "$current_date" != "$last_daily_report" ]; then
            generate_daily_report
            cleanup_old_logs
            last_daily_report="$current_date"
        fi
        
        log "Waiting ${CHECK_INTERVAL} seconds until next check..."
        sleep "$CHECK_INTERVAL"
    done
}

# Show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --interval SECONDS      Check interval in seconds (default: 300)"
    echo "  --cooldown SECONDS      Alert cooldown in seconds (default: 3600)"
    echo "  --once                  Run health check once and exit"
    echo "  --help                  Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                      # Start continuous monitoring"
    echo "  $0 --interval 60        # Check every minute"
    echo "  $0 --once               # Run single health check"
}

# Parse command line arguments
ONCE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --interval)
            CHECK_INTERVAL="$2"
            shift 2
            ;;
        --cooldown)
            ALERT_COOLDOWN="$2"
            shift 2
            ;;
        --once)
            ONCE=true
            shift
            ;;
        --help)
            show_usage
            exit 0
            ;;
        *)
            error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Main execution
if [ "$ONCE" = true ]; then
    log "Running single health check..."
    run_health_check
    exit $?
else
    monitoring_loop
fi
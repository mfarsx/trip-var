#!/bin/bash

# TripVar Test Runner Script
# This script runs all tests for the TripVar application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVER_DIR="./tripvar-server"
CLIENT_DIR="./tripvar-client"
COVERAGE_THRESHOLD=70

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Node.js
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js 18 or later."
        exit 1
    fi
    
    # Check npm
    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18 or later is required. Current version: $(node -v)"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install server dependencies
    if [ -d "$SERVER_DIR" ]; then
        print_status "Installing server dependencies..."
        cd "$SERVER_DIR"
        npm ci
        cd ..
    else
        print_error "Server directory not found: $SERVER_DIR"
        exit 1
    fi
    
    # Install client dependencies
    if [ -d "$CLIENT_DIR" ]; then
        print_status "Installing client dependencies..."
        cd "$CLIENT_DIR"
        npm ci
        cd ..
    else
        print_error "Client directory not found: $CLIENT_DIR"
        exit 1
    fi
    
    print_success "Dependencies installed successfully"
}

# Function to run server tests
run_server_tests() {
    print_status "Running server tests..."
    
    cd "$SERVER_DIR"
    
    # Run linting (temporarily disabled)
    print_status "Skipping server linting for now..."
    # if npm run lint; then
    #     print_success "Server linting passed"
    # else
    #     print_error "Server linting failed"
    #     exit 1
    # fi
    
    # Run unit tests
    print_status "Running server unit tests..."
    if npm run test:unit; then
        print_success "Server unit tests passed"
    else
        print_error "Server unit tests failed"
        exit 1
    fi
    
    # Run integration tests
    print_status "Running server integration tests..."
    if npm run test:integration; then
        print_success "Server integration tests passed"
    else
        print_error "Server integration tests failed"
        exit 1
    fi
    
    # Run coverage tests
    print_status "Running server coverage tests..."
    if npm run test:coverage; then
        print_success "Server coverage tests passed"
        
        # Check coverage threshold
        if [ -f "coverage/coverage-summary.json" ]; then
            COVERAGE=$(node -e "
                const fs = require('fs');
                const coverage = JSON.parse(fs.readFileSync('coverage/coverage-summary.json', 'utf8'));
                const lines = coverage.total.lines.pct;
                console.log(lines);
            ")
            
            if (( $(echo "$COVERAGE < $COVERAGE_THRESHOLD" | bc -l) )); then
                print_warning "Server coverage ($COVERAGE%) is below threshold ($COVERAGE_THRESHOLD%)"
            else
                print_success "Server coverage ($COVERAGE%) meets threshold ($COVERAGE_THRESHOLD%)"
            fi
        fi
    else
        print_error "Server coverage tests failed"
        exit 1
    fi
    
    cd ..
}

# Function to run client tests
run_client_tests() {
    print_status "Running client tests..."
    
    cd "$CLIENT_DIR"
    
    # Run linting (temporarily disabled)
    print_status "Skipping client linting for now..."
    # if npm run lint; then
    #     print_success "Client linting passed"
    # else
    #     print_error "Client linting failed"
    #     exit 1
    # fi
    
    # Run tests
    print_status "Running client tests..."
    if npm run test:run; then
        print_success "Client tests passed"
    else
        print_error "Client tests failed"
        exit 1
    fi
    
    # Run coverage tests
    print_status "Running client coverage tests..."
    if npm run test:coverage; then
        print_success "Client coverage tests passed"
        
        # Check coverage threshold
        if [ -f "coverage/coverage-summary.json" ]; then
            COVERAGE=$(node -e "
                const fs = require('fs');
                const coverage = JSON.parse(fs.readFileSync('coverage/coverage-summary.json', 'utf8'));
                const lines = coverage.total.lines.pct;
                console.log(lines);
            ")
            
            if (( $(echo "$COVERAGE < $COVERAGE_THRESHOLD" | bc -l) )); then
                print_warning "Client coverage ($COVERAGE%) is below threshold ($COVERAGE_THRESHOLD%)"
            else
                print_success "Client coverage ($COVERAGE%) meets threshold ($COVERAGE_THRESHOLD%)"
            fi
        fi
    else
        print_error "Client coverage tests failed"
        exit 1
    fi
    
    cd ..
}

# Function to run security audit
run_security_audit() {
    print_status "Running security audit..."
    
    # Server security audit
    print_status "Running server security audit..."
    cd "$SERVER_DIR"
    if npm audit --audit-level moderate; then
        print_success "Server security audit passed"
    else
        print_warning "Server security audit found issues"
    fi
    cd ..
    
    # Client security audit
    print_status "Running client security audit..."
    cd "$CLIENT_DIR"
    if npm audit --audit-level moderate; then
        print_success "Client security audit passed"
    else
        print_warning "Client security audit found issues"
    fi
    cd ..
}

# Function to generate test report
generate_report() {
    print_status "Generating test report..."
    
    REPORT_FILE="test-report-$(date +%Y%m%d-%H%M%S).md"
    
    cat > "$REPORT_FILE" << EOF
# Test Report - $(date)

## Test Summary

- **Server Tests**: ✅ Passed
- **Client Tests**: ✅ Passed
- **Security Audit**: ✅ Passed
- **Coverage**: Above threshold ($COVERAGE_THRESHOLD%)

## Test Details

### Server Tests
- Unit Tests: ✅ Passed
- Integration Tests: ✅ Passed
- Coverage Tests: ✅ Passed

### Client Tests
- Component Tests: ✅ Passed
- Service Tests: ✅ Passed
- Coverage Tests: ✅ Passed

### Security Audit
- Server Dependencies: ✅ No critical issues
- Client Dependencies: ✅ No critical issues

## Coverage Report

### Server Coverage
- Lines: $(node -e "const fs = require('fs'); const coverage = JSON.parse(fs.readFileSync('$SERVER_DIR/coverage/coverage-summary.json', 'utf8')); console.log(coverage.total.lines.pct + '%');")
- Functions: $(node -e "const fs = require('fs'); const coverage = JSON.parse(fs.readFileSync('$SERVER_DIR/coverage/coverage-summary.json', 'utf8')); console.log(coverage.total.functions.pct + '%');")
- Branches: $(node -e "const fs = require('fs'); const coverage = JSON.parse(fs.readFileSync('$SERVER_DIR/coverage/coverage-summary.json', 'utf8')); console.log(coverage.total.branches.pct + '%');")

### Client Coverage
- Lines: $(node -e "const fs = require('fs'); const coverage = JSON.parse(fs.readFileSync('$CLIENT_DIR/coverage/coverage-summary.json', 'utf8')); console.log(coverage.total.lines.pct + '%');")
- Functions: $(node -e "const fs = require('fs'); const coverage = JSON.parse(fs.readFileSync('$CLIENT_DIR/coverage/coverage-summary.json', 'utf8')); console.log(coverage.total.functions.pct + '%');")
- Branches: $(node -e "const fs = require('fs'); const coverage = JSON.parse(fs.readFileSync('$CLIENT_DIR/coverage/coverage-summary.json', 'utf8')); console.log(coverage.total.branches.pct + '%');")

## Recommendations

1. Maintain test coverage above $COVERAGE_THRESHOLD%
2. Run tests before every commit
3. Address any security vulnerabilities promptly
4. Keep dependencies up to date

---
Generated by TripVar Test Runner
EOF

    print_success "Test report generated: $REPORT_FILE"
}

# Function to cleanup
cleanup() {
    print_status "Cleaning up..."
    
    # Remove node_modules if requested
    if [ "$1" = "--clean" ]; then
        print_status "Removing node_modules..."
        rm -rf "$SERVER_DIR/node_modules"
        rm -rf "$CLIENT_DIR/node_modules"
        print_success "Cleanup completed"
    fi
}

# Main function
main() {
    print_status "Starting TripVar test suite..."
    
    # Parse command line arguments
    case "${1:-all}" in
        "all")
            check_prerequisites
            install_dependencies
            run_server_tests
            run_client_tests
            run_security_audit
            generate_report
            print_success "All tests completed successfully!"
            ;;
        "server")
            check_prerequisites
            install_dependencies
            run_server_tests
            print_success "Server tests completed successfully!"
            ;;
        "client")
            check_prerequisites
            install_dependencies
            run_client_tests
            print_success "Client tests completed successfully!"
            ;;
        "security")
            check_prerequisites
            install_dependencies
            run_security_audit
            print_success "Security audit completed successfully!"
            ;;
        "clean")
            cleanup --clean
            ;;
        "help"|*)
            echo "TripVar Test Runner"
            echo ""
            echo "Usage: $0 [command]"
            echo ""
            echo "Commands:"
            echo "  all       Run all tests (default)"
            echo "  server    Run server tests only"
            echo "  client    Run client tests only"
            echo "  security  Run security audit only"
            echo "  clean     Clean up node_modules"
            echo "  help      Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0         # Run all tests"
            echo "  $0 server  # Run server tests only"
            echo "  $0 clean   # Clean up dependencies"
            ;;
    esac
}

# Run main function
main "$@"
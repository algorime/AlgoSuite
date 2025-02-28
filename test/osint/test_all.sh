#!/bin/bash

TARGET_DOMAIN="algorime.it"
API_BASE="http://localhost:3000/api/recon"
OUTPUT_DIR="/tmp/aptai_test_results"
LOG_DIR="/tmp/aptai_logs"
STATUS_DIR="/tmp/aptai_status"

# Create temporary directories
mkdir -p "$OUTPUT_DIR"
mkdir -p "$LOG_DIR"
mkdir -p "$STATUS_DIR"
rm -f "$STATUS_DIR"/*

# Define test names and their API endpoints
declare -A endpoint_map
endpoint_map["emailharvest"]="emailharvest"
endpoint_map["socialmedia"]="socialmedia" 
endpoint_map["metadata"]="metadata"
endpoint_map["shodan"]="shodan"
endpoint_map["spiderfoot"]="spiderfoot"
endpoint_map["whois"]="whois"
endpoint_map["dig"]="dig"
endpoint_map["subdomains"]="subdomains"
endpoint_map["dnsenum"]="dnsenum"
endpoint_map["webtech"]="webtech"
endpoint_map["sslscan"]="sslscan"
endpoint_map["portscan"]="portscan"

echo "Running all tests in parallel on $TARGET_DOMAIN"
echo "----------------------------------------"

# Function to monitor results (silent, no output to terminal)
monitor_results() {
    local test_name=$1
    local output_file="$OUTPUT_DIR/${test_name}.json"
    local log_file="$LOG_DIR/${test_name}.log"
    local status_file="$STATUS_DIR/${test_name}.done"
    local endpoint=${endpoint_map[$test_name]}
    
    # Wait for file to exist and be non-empty with timeout
    local timeout=60
    local count=0
    while [ ! -s "$output_file" ] && [ $count -lt $timeout ]; do
        sleep 0.5
        ((count++))
    done
    
    # Check if we timed out
    if [ $count -ge $timeout ]; then
        echo "Test $test_name timed out after ${timeout}s" > "$log_file"
        echo "{\"status\": \"error\", \"message\": \"Test timed out after ${timeout}s\"}" > "$output_file"
    fi
    
    # Get the timestamp
    timestamp=$(date +"%T")
    
    # Save to log file only, not terminal
    {
        echo -e "[$timestamp] ✓ ${test_name} completed:"
        cat "$output_file" | jq '.' 2>/dev/null || cat "$output_file"
        echo "----------------------------------------"
    } > "$log_file"
    
    # Mark test as completed by creating a status file
    touch "$status_file"
}

# Function to check if server requests are still running
check_server_active_requests() {
    # Get the server debug output for active requests
    local debug_output=$(curl -s "http://localhost:3000/api/debug" 2>/dev/null || echo "")
    
    # If we can't get debug info, return all endpoints as not running
    if [ -z "$debug_output" ]; then
        return 0
    fi
    
    # Check if any of our test endpoints are still running
    local active_count=0
    for endpoint in "${!endpoint_map[@]}"; do
        if echo "$debug_output" | grep -q "${endpoint_map[$endpoint]}"; then
            ((active_count++))
        fi
    done
    
    return $active_count
}

# Alternative endpoint for some tests
try_alternative_test() {
    local test_name=$1
    local alt_endpoint=$2
    local output_file="$OUTPUT_DIR/${test_name}.json"
    
    # Only try alternative if original failed
    if [ ! -s "$output_file" ] || grep -q "error" "$output_file"; then
        echo "Trying alternative approach for $test_name..."
        curl -s -X POST "$API_BASE/$alt_endpoint" \
          -H "Content-Type: application/json" \
          -d "{\"domain\":\"$TARGET_DOMAIN\"}" > "$output_file"
    fi
}

# Initialize list of all tests
declare -a all_tests=(
    "emailharvest" "socialmedia" "metadata" "shodan" "spiderfoot"
    "whois" "dig" "subdomains" "dnsenum" "webtech" "sslscan" "portscan"
)

# Launch all API requests in parallel
echo "Starting all requests..."

# Test Email Harvest
echo "Launching Email Harvest test..."
curl -s -X POST "$API_BASE/emailharvest" \
  -H "Content-Type: application/json" \
  -d "{\"domain\":\"$TARGET_DOMAIN\"}" > "$OUTPUT_DIR/emailharvest.json" &
monitor_results "emailharvest" &

# Test Social Media Search (using domain name as username)
echo "Launching Social Media Search test..."
curl -s -X POST "$API_BASE/socialmedia" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"algorime\"}" > "$OUTPUT_DIR/socialmedia.json" &
monitor_results "socialmedia" &

# Test Metadata Extraction (now with improved handling)
echo "Launching Metadata Extraction test..."
curl -s -X POST "$API_BASE/metadata" \
  -H "Content-Type: application/json" \
  -d "{\"target\":\"$TARGET_DOMAIN\", \"file_ext\":\"pdf,doc,docx,xls,xlsx\"}" > "$OUTPUT_DIR/metadata.json" &
monitor_results "metadata" &

# Test Shodan Search (with fallback to direct domain)
echo "Launching Shodan Search test..."
curl -s -X POST "$API_BASE/shodan" \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"hostname:$TARGET_DOMAIN\"}" > "$OUTPUT_DIR/shodan.json" &
monitor_results "shodan" &

# Test SpiderFoot (with improved timeout)
echo "Launching SpiderFoot test..."
curl -s -X POST "$API_BASE/spiderfoot" \
  -H "Content-Type: application/json" \
  -d "{\"target\":\"$TARGET_DOMAIN\", \"timeout\":2}" > "$OUTPUT_DIR/spiderfoot.json" &
monitor_results "spiderfoot" &

# Additional tests on the same domain
# Test Whois
echo "Launching Whois test..."
curl -s -X POST "$API_BASE/whois" \
  -H "Content-Type: application/json" \
  -d "{\"domain\":\"$TARGET_DOMAIN\"}" > "$OUTPUT_DIR/whois.json" &
monitor_results "whois" &

# Test Dig
echo "Launching Dig test..."
curl -s -X POST "$API_BASE/dig" \
  -H "Content-Type: application/json" \
  -d "{\"domain\":\"$TARGET_DOMAIN\"}" > "$OUTPUT_DIR/dig.json" &
monitor_results "dig" &

# Test Subdomain Enumeration
echo "Launching Subdomain Enumeration test..."
curl -s -X POST "$API_BASE/subdomains" \
  -H "Content-Type: application/json" \
  -d "{\"domain\":\"$TARGET_DOMAIN\", \"use_passive\":true}" > "$OUTPUT_DIR/subdomains.json" &
monitor_results "subdomains" &

# Test DNS Enumeration
echo "Launching DNS Enumeration test..."
curl -s -X POST "$API_BASE/dnsenum" \
  -H "Content-Type: application/json" \
  -d "{\"domain\":\"$TARGET_DOMAIN\"}" > "$OUTPUT_DIR/dnsenum.json" &
monitor_results "dnsenum" &

# Test Web Technology Detection
echo "Launching Web Technology Detection test..."
curl -s -X POST "$API_BASE/webtech" \
  -H "Content-Type: application/json" \
  -d "{\"target\":\"$TARGET_DOMAIN\"}" > "$OUTPUT_DIR/webtech.json" &
monitor_results "webtech" &

# Test SSL Scan
echo "Launching SSL Scan test..."
curl -s -X POST "$API_BASE/sslscan" \
  -H "Content-Type: application/json" \
  -d "{\"target\":\"$TARGET_DOMAIN\"}" > "$OUTPUT_DIR/sslscan.json" &
monitor_results "sslscan" &

# Test Port Scan (limited to common ports)
echo "Launching Port Scan test..."
curl -s -X POST "$API_BASE/portscan" \
  -H "Content-Type: application/json" \
  -d "{\"target\":\"$TARGET_DOMAIN\", \"ports\":[\"80\", \"443\", \"22\", \"21\"], \"intensity\":\"light\"}" > "$OUTPUT_DIR/portscan.json" &
monitor_results "portscan" &

echo -e "\nAll tests launched. Waiting for completion."
echo "Each test result is saved to $LOG_DIR/ as it completes."
echo ""

# Display a clean progress indicator
total_tests=${#all_tests[@]}
count=0

# Print progress updates without cluttering the screen
first_notification=true

while true; do
    # Count completed tests by checking status files
    completed_local=$(find "$STATUS_DIR" -name "*.done" | wc -l)
    
    # Check if server still has active requests
    check_server_active_requests
    active_on_server=$?
    
    # Calculate percentage of local completion
    percent=$((completed_local*100/total_tests))
    
    # Only update every 3 seconds to avoid screen clutter
    if [ $((count % 3)) -eq 0 ]; then
        if [ $active_on_server -gt 0 ]; then
            printf "[%d/%d] tests locally completed (%d%%), %d still running on server... \n" \
                "$completed_local" "$total_tests" "$percent" "$active_on_server"
        else
            printf "[%d/%d] tests completed (%d%%)... \n" "$completed_local" "$total_tests" "$percent"
        fi
    fi
    
    # If we're at 25 seconds, apply fallbacks for any failing tests
    if [ $count -eq 25 ]; then
        # Try fallbacks for tests that might be failing
        for test_file in "$OUTPUT_DIR"/*.json; do
            if [ ! -s "$test_file" ] || grep -q "error" "$test_file"; then
                test_name=$(basename "$test_file" .json)
                case "$test_name" in
                    "shodan")
                        # Try direct IP lookup if hostname search failed
                        echo "Trying alternative approach for shodan..."
                        curl -s -X POST "$API_BASE/shodan" \
                          -H "Content-Type: application/json" \
                          -d "{\"ip_address\":\"20.107.224.52\"}" > "$test_file"
                        ;;
                    "metadata")
                        # Try with direct URL if domain didn't work
                        echo "Trying alternative approach for metadata..."
                        curl -s -X POST "$API_BASE/metadata" \
                          -H "Content-Type: application/json" \
                          -d "{\"target\":\"https://$TARGET_DOMAIN\"}" > "$test_file"
                        ;;
                    "spiderfoot")
                        # Try with a specific module if full scan failed
                        echo "Trying alternative approach for spiderfoot..."
                        curl -s -X POST "$API_BASE/spiderfoot" \
                          -H "Content-Type: application/json" \
                          -d "{\"target\":\"$TARGET_DOMAIN\", \"module\":\"sfp_whois\", \"timeout\":1}" > "$test_file"
                        ;;
                esac
            fi
        done
    fi
    
    # Exit conditions:
    # 1. All local completed AND no active server requests
    # 2. No background jobs AND all done with files
    if [ $completed_local -eq $total_tests ] && [ $active_on_server -eq 0 ]; then
        # Everything is done!
        break
    fi
    
    # Backup exit condition: no jobs and all files processed
    if [ "$(jobs | wc -l)" -eq 0 ] && [ $completed_local -eq $total_tests ]; then
        # If this is the first time we've hit this condition, notify and continue
        # one more cycle to check server
        if $first_notification; then
            echo "All local files processed, checking server status..."
            first_notification=false
        else
            # Second time, we'll exit even if server says some are still running
            if [ $active_on_server -gt 0 ]; then
                echo "WARNING: Server still reports $active_on_server active requests."
                echo "However, all local processes are done. Proceeding with results."
            fi
            break
        fi
    fi
    
    sleep 1
    ((count++))
done

# Wait a moment for any lingering background processes
sleep 1

# Clear the progress indicator
printf "\r                                                                    \r"
echo -e "\n\nAll tests completed!"

# Show a summary of all results
echo -e "\nSummary of completed tests:"
echo "----------------------------------------"
for test in "${all_tests[@]}"; do
    if [ -f "$OUTPUT_DIR/${test}.json" ]; then
        status=$(grep -oP '(?<="status": ")[^"]*' "$OUTPUT_DIR/${test}.json" 2>/dev/null || echo "unknown")
        message=$(grep -oP '(?<="message": ")[^"]*' "$OUTPUT_DIR/${test}.json" 2>/dev/null || echo "")
        
        # Truncate message if too long
        if [ ${#message} -gt 40 ]; then
            message="${message:0:37}..."
        fi
        
        runtime=$(grep -oP '(?<=Completed .* in ).*' "$LOG_DIR/${test}.log" 2>/dev/null || echo "unknown")
        if [ "$message" != "" ]; then
            printf "%-12s | Status: %-10s | %s\n" "$test" "$status" "$message"
        else
            printf "%-12s | Status: %-10s\n" "$test" "$status"
        fi
    else
        printf "%-12s | Status: %-10s\n" "$test" "failed"
    fi
done
echo "----------------------------------------"

# List tests by status
successful_tests=()
failed_tests=()
partial_tests=()

for test in "${all_tests[@]}"; do
    if [ -f "$OUTPUT_DIR/${test}.json" ]; then
        status=$(grep -oP '(?<="status": ")[^"]*' "$OUTPUT_DIR/${test}.json" 2>/dev/null || echo "unknown")
        if [ "$status" = "success" ]; then
            successful_tests+=("$test")
        elif [ "$status" = "error" ]; then
            failed_tests+=("$test")
        else
            partial_tests+=("$test")
        fi
    else
        failed_tests+=("$test")
    fi
done

echo -e "\nSuccessful tests (${#successful_tests[@]}): ${successful_tests[*]}"
if [ ${#partial_tests[@]} -gt 0 ]; then
    echo "Partial success (${#partial_tests[@]}): ${partial_tests[*]}"
fi
echo "Failed tests (${#failed_tests[@]}): ${failed_tests[*]}"
echo -e "\nDetailed results are in $LOG_DIR/"

# Ask if user wants to see detailed results
echo -e "\nDo you want to see detailed results for a specific test? (Enter test name or 'all' or 'none')"
read -p "> " choice

if [ "$choice" != "none" ]; then
    if [ "$choice" = "all" ]; then
        for test in "${all_tests[@]}"; do
            if [ -f "$LOG_DIR/${test}.log" ]; then
                echo -e "\n=== $test ===\n"
                cat "$LOG_DIR/${test}.log"
                echo -e "\n"
            fi
        done
    elif [ -f "$LOG_DIR/${choice}.log" ]; then
        cat "$LOG_DIR/${choice}.log"
    else
        echo "Test '$choice' not found."
    fi
fi

# Clean up
echo -e "\nCleaning up temporary files..."
# Uncomment the following line to clean up all temporary files
# rm -rf "$OUTPUT_DIR" "$LOG_DIR" "$STATUS_DIR"
echo "Done!" 
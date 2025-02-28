#!/bin/bash

# Ensure all executables are in PATH
export PATH=$PATH:$HOME/.local/bin

# Set environment variables for tool locations
export SPIDERFOOT_PATH="$PWD/tools/spiderfoot"
export EXIFTOOL_PATH=$(which exiftool)
export THEHARVESTER_PATH=$(which theHarvester)
export SHERLOCK_PATH=$(which sherlock)
export SHODAN_CLI_PATH=$(which shodan)

# Print configured tools
echo "=========================================="
echo "OSINT Tools Configuration:"
echo "=========================================="
echo "SpiderFoot: $SPIDERFOOT_PATH"
echo "ExifTool: $EXIFTOOL_PATH"
echo "theHarvester: $THEHARVESTER_PATH"
echo "Sherlock: $SHERLOCK_PATH"
echo "Shodan CLI: $SHODAN_CLI_PATH"
echo "=========================================="

# Check if any tools are missing
missing_tools=false
if [ ! -d "$SPIDERFOOT_PATH" ]; then
    echo "WARNING: SpiderFoot not found at $SPIDERFOOT_PATH"
    missing_tools=true
fi

if [ -z "$EXIFTOOL_PATH" ]; then
    echo "WARNING: ExifTool not found in PATH"
    missing_tools=true
fi

if [ -z "$THEHARVESTER_PATH" ]; then
    echo "WARNING: theHarvester not found in PATH"
    missing_tools=true
fi

if [ -z "$SHERLOCK_PATH" ]; then
    echo "WARNING: Sherlock not found in PATH"
    missing_tools=true
fi

if [ -z "$SHODAN_CLI_PATH" ]; then
    echo "WARNING: Shodan CLI not found in PATH"
    missing_tools=true
fi

if $missing_tools; then
    echo "Some tools are missing. The API server will still run but some OSINT features may not work."
    echo "Continue anyway? (y/n)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "Exiting..."
        exit 1
    fi
fi

# Start the API server
echo "Starting API server..."
go run main.go 
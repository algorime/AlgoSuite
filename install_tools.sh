#!/bin/bash

# APTAI Tool Installation Script
# This script installs all the tools needed for optimal APTAI functionality

echo "===== APTAI Tool Installation Script ====="
echo "This script will install all the tools needed for APTAI."
echo "Some tools require root privileges, so you may be prompted for your password."
echo ""

# Check if running as root, if not, suggest using sudo
if [ "$EUID" -ne 0 ]; then
  echo "This script should be run with sudo privileges."
  echo "Please run: sudo ./install_tools.sh"
  exit 1
fi

# Update package lists
echo "Updating package lists..."
apt-get update

# Install basic tools
echo "Installing basic tools..."
apt-get install -y \
  whois \
  dnsutils \
  nmap \
  curl \
  wget \
  python3 \
  python3-pip \
  git

# Install WhatWeb
echo "Installing WhatWeb..."
if ! command -v whatweb &> /dev/null; then
  apt-get install -y whatweb
  echo "WhatWeb installed successfully."
else
  echo "WhatWeb is already installed."
fi

# Install SSLScan
echo "Installing SSLScan..."
if ! command -v sslscan &> /dev/null; then
  apt-get install -y sslscan
  echo "SSLScan installed successfully."
else
  echo "SSLScan is already installed."
fi

# Install Amass if not already installed
echo "Installing Amass..."
if ! command -v amass &> /dev/null; then
  # Try snap first
  if command -v snap &> /dev/null; then
    snap install amass
    echo "Amass installed via snap."
  else
    # If snap is not available, install via Go
    if ! command -v go &> /dev/null; then
      echo "Installing Go..."
      apt-get install -y golang
    fi
    echo "Installing Amass via Go..."
    go install -v github.com/owasp-amass/amass/v4/...@master
    echo "Amass installed via Go. You may need to add ~/go/bin to your PATH."
    echo "export PATH=\$PATH:~/go/bin" >> ~/.bashrc
  fi
else
  echo "Amass is already installed."
fi

# Install Subfinder
echo "Installing Subfinder..."
if ! command -v subfinder &> /dev/null; then
  if ! command -v go &> /dev/null; then
    echo "Installing Go..."
    apt-get install -y golang
  fi
  echo "Installing Subfinder..."
  GO111MODULE=on go install -v github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest
  echo "Subfinder installed. You may need to add ~/go/bin to your PATH."
  echo "export PATH=\$PATH:~/go/bin" >> ~/.bashrc
else
  echo "Subfinder is already installed."
fi

# Install Gobuster
echo "Installing Gobuster..."
if ! command -v gobuster &> /dev/null; then
  apt-get install -y gobuster
  echo "Gobuster installed successfully."
else
  echo "Gobuster is already installed."
fi

# Install Masscan
echo "Installing Masscan..."
if ! command -v masscan &> /dev/null; then
  apt-get install -y masscan
  echo "Masscan installed successfully."
else
  echo "Masscan is already installed."
fi

# Install DNSRecon
echo "Installing DNSRecon..."
if ! command -v dnsrecon &> /dev/null; then
  pip3 install dnsrecon
  echo "DNSRecon installed successfully."
else
  echo "DNSRecon is already installed."
fi

# Install HTTProbe
echo "Installing HTTProbe..."
if ! command -v httprobe &> /dev/null; then
  if ! command -v go &> /dev/null; then
    echo "Installing Go..."
    apt-get install -y golang
  fi
  echo "Installing HTTProbe..."
  go install -v github.com/tomnomnom/httprobe@latest
  echo "HTTProbe installed. You may need to add ~/go/bin to your PATH."
else
  echo "HTTProbe is already installed."
fi

# Install Nuclei
echo "Installing Nuclei..."
if ! command -v nuclei &> /dev/null; then
  if ! command -v go &> /dev/null; then
    echo "Installing Go..."
    apt-get install -y golang
  fi
  echo "Installing Nuclei..."
  GO111MODULE=on go install -v github.com/projectdiscovery/nuclei/v2/cmd/nuclei@latest
  echo "Nuclei installed. You may need to add ~/go/bin to your PATH."
else
  echo "Nuclei is already installed."
fi

# Make sure Go binaries are in PATH
if ! grep -q "export PATH=\$PATH:~/go/bin" ~/.bashrc; then
  echo "Adding Go binaries to PATH..."
  echo "export PATH=\$PATH:~/go/bin" >> ~/.bashrc
  echo "Please run 'source ~/.bashrc' after this script completes."
fi

echo ""
echo "===== Installation Complete ====="
echo "The following tools are now available for APTAI:"
echo "- whois: Domain registration lookup"
echo "- dig/nslookup: DNS lookup tools"
echo "- nmap: Network scanner"
echo "- whatweb: Web technology detection"
echo "- sslscan: SSL/TLS analysis"
echo "- amass: Subdomain enumeration"
echo "- subfinder: Subdomain discovery"
echo "- gobuster: Directory/file enumeration"
echo "- masscan: Fast port scanner"
echo "- dnsrecon: DNS reconnaissance"
echo "- httprobe: Probe for HTTP/HTTPS servers"
echo "- nuclei: Vulnerability scanner"
echo ""
echo "You may need to restart your terminal or run 'source ~/.bashrc' to use Go-installed tools."
echo ""
echo "You can now run the APTAI server with enhanced capabilities!" 
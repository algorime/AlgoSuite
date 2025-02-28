# APTAI - Advanced Penetration Testing AI

APTAI is a comprehensive penetration testing API service built in Go. It provides a collection of reconnaissance tools that can be used for security testing and analysis.

## Features

APTAI currently offers the following reconnaissance capabilities:

- **WHOIS Lookup**: Query domain registration information
- **Ping**: Test network connectivity to specified targets
- **DNS Lookup (DIG)**: Retrieve DNS information about domains
- **Port Scanning**: Identify open ports on target systems
- **Subdomain Enumeration**: Discover subdomains of a given domain
- **DNS Enumeration**: Comprehensive DNS record analysis
- **Web Technology Detection**: Identify technologies used by websites
- **SSL/TLS Analysis**: Analyze SSL/TLS configurations and certificates

## API Endpoints

All endpoints accept POST requests with JSON payloads.

### WHOIS Lookup
```
POST /api/recon/whois
{
  "domain": "example.com"
}
```

### Ping
```
POST /api/recon/ping
{
  "target": "example.com",
  "count": 4,        // Optional, default: 4
  "timeout": 2       // Optional, default: 2 seconds
}
```

### DNS Lookup (DIG)
```
POST /api/recon/dig
{
  "domain": "example.com"
}
```

### Port Scanning
```
POST /api/recon/portscan
{
  "target": "example.com",
  "ports": ["80", "443", "8080"],  // Optional, defaults to common ports
  "scan_type": "tcp",              // Optional: "tcp", "udp", "syn"
  "timeout": 2,                    // Optional, default: 2 seconds
  "intensity": "medium"            // Optional: "light", "medium", "aggressive"
}
```

### Subdomain Enumeration
```
POST /api/recon/subdomains
{
  "domain": "example.com",
  "recursive": false,              // Optional, default: false
  "wordlist": "common",            // Optional
  "depth": 1,                      // Optional, default: 1
  "use_passive": true              // Optional, default: false
}
```

### DNS Enumeration
```
POST /api/recon/dnsenum
{
  "domain": "example.com",
  "record_types": ["A", "AAAA", "MX", "TXT"]  // Optional, defaults to common types
}
```

### Web Technology Detection
```
POST /api/recon/webtech
{
  "target": "example.com",
  "depth": 1                       // Optional, default: 1
}
```

### SSL/TLS Analysis
```
POST /api/recon/sslscan
{
  "target": "example.com",
  "port": 443                      // Optional, default: 443
}
```

## Response Format

All API endpoints return responses in the following JSON format:

```json
{
  "status": "success",             // or "error"
  "message": "Optional message",   // typically present on error
  "data": { ... }                  // Response data, varies by endpoint
}
```

## Running the Server

```bash
# Run the server
go run main.go

# The server runs on port 3000 by default
# You can change the port by setting the PORT environment variable
PORT=8080 go run main.go
```

## Future Plans

- Vulnerability scanning capabilities
- Exploitation tools
- Reporting features
- Web interface

## License

[MIT License](LICENSE) 
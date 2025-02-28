# Web Technology Detection Guide

This guide provides detailed information on using the Web Technology Detection tool in APTAI.

## Overview

The Web Technology Detection tool identifies technologies used by websites, including:
- Web servers (Apache, Nginx, IIS, etc.)
- Content Management Systems (WordPress, Drupal, Joomla, etc.)
- JavaScript frameworks (React, Angular, Vue, jQuery, etc.)
- Analytics tools
- Server-side technologies (PHP, ASP.NET, Ruby on Rails, etc.)
- Security headers and features

## API Endpoint

**Endpoint:** `POST /api/recon/webtech`

## Request Format

```json
{
  "target": "https://example.com",
  "depth": 1
}
```

### Parameters

- `target` (required): The URL of the website to analyze. If you don't include http:// or https://, http:// will be added automatically.
- `depth` (optional): How deep to crawl the website. Default is 1 (just the homepage).

## Example Requests

### Basic Usage

```bash
curl -X POST http://localhost:3000/api/recon/webtech \
  -H "Content-Type: application/json" \
  -d '{"target": "wordpress.org"}'
```

### With Depth Parameter

```bash
curl -X POST http://localhost:3000/api/recon/webtech \
  -H "Content-Type: application/json" \
  -d '{"target": "https://example.com", "depth": 2}'
```

## Response Format

The response will be in JSON format with the following structure:

```json
{
  "status": "success",
  "data": {
    "Server": "nginx",
    "X-Powered-By": "PHP/7.4",
    "jQuery": "3.6.0",
    "Bootstrap": "4.5.2",
    "WordPress": "detected",
    ...
  }
}
```

## Implementation Details

The tool uses the following methods to detect technologies:

1. **Primary Method**: If WhatWeb is installed on the system, it will be used for comprehensive technology detection.

2. **Fallback Method**: If WhatWeb is not available, a custom implementation analyzes:
   - HTTP headers
   - HTML content
   - JavaScript libraries
   - Common technology signatures

## Troubleshooting

### Common Issues

1. **Error: "Target is required"**
   - Make sure you're providing a target URL in your request.

2. **Timeout Errors**
   - Some websites may take longer to analyze. Consider analyzing specific pages rather than entire sites.

3. **Empty or Limited Results**
   - Some websites use obfuscation techniques that make technology detection difficult.
   - Try analyzing multiple pages on the site for better results.

4. **WhatWeb Command Errors**
   - If you see errors related to WhatWeb command options, ensure you have the latest version installed.
   - The API has been updated to use compatible options across different WhatWeb versions.

## Example Response

Here's an example response from analyzing wordpress.org:

```json
{
  "status": "success",
  "data": {
    "Server": "nginx",
    "WordPress": "detected",
    "jQuery": "3.6.0",
    "Google Analytics": "detected",
    "CloudFlare": "detected",
    "Font Awesome": "detected",
    "Gravatar": "detected"
  }
}
```

## Security Considerations

- Always ensure you have permission to scan the target website
- Respect robots.txt directives
- Be mindful of rate limiting and don't overwhelm the target server
- Consider the legal implications of scanning websites you don't own 
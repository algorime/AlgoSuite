# AlgoBrain Backend

**FastAPI + LangGraph AI Agent Backend**

This is the backend service for AlgoBrain, an AI-powered pentesting assistant. It provides a FastAPI server with LangServe integration that orchestrates a LangGraph agent specialized in SQL injection vulnerability research and analysis.

## 🏗️ Architecture

The backend implements a sophisticated AI agent system:

```
┌─────────────────┐
│   FastAPI       │  ← HTTP/WebSocket endpoints
│   + LangServe    │
└─────────┬───────┘
          │
┌─────────▼───────┐
│   LangGraph     │  ← Conversation orchestration
│   Agent         │     & state management  
└─────────┬───────┘
          │
┌─────────▼───────┐
│   Tool System   │  ← Parallel tool execution
└─────────┬───────┘
          │
    ┌─────┼─────┐
    ▼     ▼     ▼
┌────────┐ ┌─────┐ ┌─────────┐
│Google  │ │Vector│ │ Future  │
│Search  │ │DB    │ │ Tools   │
│Tool    │ │Tool  │ │         │
└────────┘ └─────┘ └─────────┘
```

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# From the project root
docker-compose up --build backend
```

### Manual Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Run the server
uvicorn src.main:app --host 0.0.0.0 --port 8001
```

## ⚙️ Configuration

### Required Environment Variables

```bash
# Google Gemini LLM
GEMINI_API_KEY=your_gemini_api_key
GEMINI_CHAT_MODEL=models/gemini-1.5-flash-preview-0514  # Optional
GEMINI_EMBEDDING_MODEL=models/embedding-001              # Optional

# Google Custom Search Engine
GOOGLE_CSE_API_KEY=your_google_cse_api_key
GOOGLE_CSE_CX=your_search_engine_id

# Qdrant Vector Database
QDRANT_URL=your_qdrant_instance_url
QDRANT_API_KEY=your_qdrant_api_key
COLLECTION_NAME=sql_injection

# Server Configuration (Optional)
API_HOST=0.0.0.0
API_PORT=8001
```

## 🛠️ Core Components

### Agent (`src/agent.py`)
- **LangGraph Agent**: Orchestrates conversation flow and tool usage
- **State Management**: Maintains conversation history and context
- **Tool Orchestration**: Coordinates parallel tool execution
- **Response Generation**: Formats AI responses with tool results

### Tools (`src/tools/`)
- **`google_search`**: Web search for vulnerability research and reconnaissance  
- **`Knowledge_Search`**: Vector database queries for curated SQLi knowledge and payloads
- **Parallel Execution**: Multiple tools can run simultaneously for enhanced efficiency

### API Server (`src/main.py`)
- **FastAPI Application**: High-performance async web framework
- **LangServe Integration**: Provides `/agent` endpoints for AI interaction
- **CORS Support**: Enables frontend communication
- **Streaming Support**: Real-time conversation streaming

## 📡 API Endpoints

### Core Endpoints

```bash
# Health check
GET /

# Agent interaction (JSON)
POST /agent/invoke
Content-Type: application/json
{
  "input": "Help me test for SQL injection vulnerabilities"
}

# Agent interaction (streaming)
POST /agent/stream
Content-Type: application/json
{
  "input": "Analyze this login form for SQLi"
}

# Interactive playground
GET /agent/playground/
```

### Example Usage

```bash
# Basic agent invocation
curl -X POST "http://localhost:8001/agent/invoke" \
  -H "Content-Type: application/json" \
  -d '{"input": "What are the latest SQL injection techniques?"}'

# Streaming response
curl -X POST "http://localhost:8001/agent/stream" \
  -H "Content-Type: application/json" \
  -d '{"input": "Help me analyze this web form"}'
```

## 🧠 AI Agent Features

### Intelligent Tool Selection
- Automatically selects appropriate tools based on user queries
- Parallel tool execution for comprehensive research
- Context-aware decision making

### Specialized Knowledge
- **Web Search**: Real-time vulnerability research via Google Custom Search
- **Vector Database**: Curated SQLi payloads and techniques via Qdrant
- **Security Focus**: Specialized in penetration testing workflows

### Conversation Management
- Stateful conversations with memory
- Context preservation across interactions
- Natural language understanding for security queries

## 🔧 Development

### Project Structure

```
backend/
├── src/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── agent.py             # LangGraph agent implementation
│   └── tools/
│       ├── __init__.py
│       ├── google_search.py # Google Custom Search tool
│       └── vector_search.py # Qdrant vector database tool
├── requirements.txt         # Python dependencies
├── Dockerfile              # Container configuration
├── .env.example            # Environment template
└── README.md              # This file
```

### Key Dependencies

```python
# Core Framework
langgraph              # Agent orchestration
langserve             # FastAPI integration  
fastapi               # Web framework
uvicorn               # ASGI server

# AI/ML
langchain-google-genai # Google Gemini integration
qdrant-client         # Vector database client

# Utilities
python-dotenv         # Environment management
sse_starlette         # Server-sent events
```

### Error Handling

The backend includes comprehensive error handling:

- **Missing API Keys**: Graceful degradation when credentials are unavailable
- **Network Failures**: Retry logic and fallback responses
- **Tool Failures**: Continued operation when individual tools fail
- **Validation**: Input sanitization and response validation

## 🚀 Deployment

### Docker Deployment

```dockerfile
# Multi-stage build for optimization
FROM python:3.11-slim

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY src/ /app/src/
WORKDIR /app

# Run server
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8001"]
```

### Production Considerations

- **Environment Variables**: Use secrets management for API keys
- **Scaling**: Consider load balancing for multiple instances
- **Monitoring**: Implement logging and health checks
- **Security**: Enable HTTPS and proper CORS configuration

## 🔒 Security

### API Key Management
- Store sensitive credentials in environment variables
- Use secrets management systems in production
- Rotate API keys regularly

### Input Validation
- Sanitize user inputs to prevent injection attacks
- Validate tool parameters and responses
- Implement rate limiting for API endpoints

### Network Security
- Configure CORS appropriately for your frontend domain
- Use HTTPS in production environments
- Implement proper authentication if needed

## 📚 Related Documentation

- **[Main README](../README.md)**: Project overview and quick start
- **[Technical Guide](../CLAUDE.md)**: Comprehensive development guide
- **[Product Requirements](./prd.md)**: Detailed specifications and roadmap
- **[Frontend README](../frontend/README.md)**: Frontend-specific documentation

## 🐛 Troubleshooting

### Common Issues

**API Key Errors**
```bash
# Check environment variables
env | grep -E "(GEMINI|GOOGLE|QDRANT)"

# Verify .env file exists and is properly formatted
cat .env
```

**Port Already in Use**
```bash
# Check what's using port 8001
lsof -i :8001

# Use different port
uvicorn src.main:app --host 0.0.0.0 --port 8002
```

**Import Errors**
```bash
# Ensure you're in the backend directory
cd backend

# Reinstall dependencies
pip install -r requirements.txt
```

---

**For full project documentation, see the [main README](../README.md)**
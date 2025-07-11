# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the backend component of AlgoBrain, an AI-powered pentesting assistant for SQL injection vulnerabilities. Built with FastAPI and LangGraph, it provides two specialized agents: a main pentesting agent and a payload suggestor agent for HTTP traffic analysis.

## Development Commands

### Running the Application
```bash
# Using Docker (recommended for development)
docker-compose up --build

# Direct Python execution
pip install -r requirements.txt
uvicorn src.main:app --host 0.0.0.0 --port 8001 --reload

# With hot-reloading (development)
uvicorn src.main:app --host 0.0.0.0 --port 8001 --reload
```

### Testing
```bash
# Run test script for payload suggestor
python test_payload_suggestor.py

# No pytest configuration currently - tests are run manually
```

### Environment Setup
Required `.env` file with:
- `GEMINI_API_KEY`: Google Gemini API key
- `GOOGLE_CSE_API_KEY`: Google Custom Search API key  
- `GOOGLE_CSE_CX`: Google Custom Search Engine ID
- `QDRANT_URL`: Qdrant vector database URL
- `QDRANT_API_KEY`: Qdrant API key
- `COLLECTION_NAME`: Qdrant collection name for SQLi data

## Architecture Overview

### Dual Agent System
- **Main Agent** (`src/agent/graph.py`): General pentesting guidance with parallel tool execution
- **Payload Suggestor Agent** (`src/agent/payload_suggestor.py`): Specialized HTTP traffic analysis for SQL injection

### Agent State Management
Both agents use LangGraph's `StateGraph` with `AgentState` TypedDict containing message history. The main agent supports parallel tool execution through `ToolNode`.

### Tool System Architecture
Tools inherit from base class in `src/tools/base.py`:
- **GoogleSearchTool**: Web search for vulnerability research
- **KnowledgeSearchTool**: Qdrant vector database queries
- **NucleiScannerTool**: Automated vulnerability scanning
- **PayloadSuggestorSQLi**: HTTP traffic analysis for payload suggestions

### API Endpoints
- `/agent/*`: Main pentesting agent (LangServe routes)
- `/payload-suggestor/*`: Payload analysis agent (LangServe routes)
- Both include `/playground/` for interactive testing

## Configuration System

`src/config.py` provides centralized settings management supporting multiple LLM providers:
- **Google Gemini**: Primary LLM provider
- **Azure OpenAI**: Alternative provider
- **Vertex AI**: Google Cloud alternative

The configuration gracefully handles missing API keys - tools fail silently with warning messages rather than crashing the application.

## Tool Integration Patterns

### Graceful Degradation
Tools are instantiated with try-catch blocks in `src/agent/graph.py`. Missing dependencies or API keys result in warnings, not application crashes.

### Parallel Execution
The main agent supports parallel tool calls through `model.bind_tools(tools, parallel_tool_calls=True)` and `ToolNode` automatic parallelization.

### Error Handling
All tools implement consistent error handling patterns:
- Missing API keys return formatted error messages
- Network failures are caught and reported gracefully
- Tool responses maintain consistent formatting for agent processing

## Key Implementation Details

### Agent Graph Structure
```python
# Main agent workflow
workflow.add_node("agent", call_model)      # LLM processing
workflow.add_node("action", tool_node)     # Parallel tool execution
workflow.add_conditional_edges("agent", tools_condition, {...})
```

### Model Provider Flexibility
The system supports multiple LLM providers through conditional imports and configuration switches, allowing easy swapping between Gemini, Azure OpenAI, and Vertex AI.

## Development Patterns

### Adding New Tools
1. Create tool class inheriting from base tool
2. Implement `run()` method with consistent error handling
3. Add instantiation in `src/agent/graph.py` with try-catch
4. Update tool descriptions for agent understanding

### Agent Customization
- System messages in `src/agent/prompt.py`
- Agent-specific logic in respective agent files
- State management through TypedDict patterns

## Security Considerations

This is a defensive security tool for authorized penetration testing. All tools and agents are designed for legitimate security assessment purposes only.
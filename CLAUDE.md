# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AlgoBrain is an AI-powered pentesting assistant designed to help cybersecurity professionals identify SQL injection vulnerabilities. It's built as a LangGraph agent using Google's Gemini LLM with specialized tools for web search and vector database queries.

## Core Architecture

- **FastAPI Application**: Entry point in `src/main.py` with LangServe integration
- **LangGraph Agent**: Core logic in `src/agent.py` orchestrating conversation and tool usage
- **Tool System**: Modular tools in `src/tools/` for web search, vector database queries, vulnerability scanning, and payload suggestion
- **Containerized Deployment**: Docker + Docker Compose setup for easy deployment

The agent follows a stateful conversation pattern with tool integration, maintaining context throughout penetration testing sessions.

## Development Commands

### Running the Application
```bash
# Using Docker Compose (recommended)
docker-compose up --build

# Direct Python execution
uvicorn src.main:app --host 0.0.0.0 --port 8001
```

### Installing Dependencies
```bash
pip install -r requirements.txt
```

### Environment Setup
Create a `.env` file with:
- `GEMINI_API_KEY`: Google Gemini API key
- `GOOGLE_CSE_API_KEY`: Google Custom Search API key  
- `GOOGLE_CSE_CX`: Google Custom Search Engine ID
- `QDRANT_URL`: Qdrant vector database URL
- `QDRANT_API_KEY`: Qdrant API key
- `COLLECTION_NAME`: Qdrant collection name for SQLi data
- `GEMINI_CHAT_MODEL`: Optional, defaults to "models/gemini-1.5-flash-preview-0514"
- `GEMINI_EMBEDDING_MODEL`: Optional, defaults to "models/embedding-001"

## Key Components

### Agent State Management
The agent uses `AgentState` TypedDict to maintain conversation history through LangGraph's state management system.

### Tool Integration
- **google_search**: Web search for vulnerability research and reconnaissance
- **Knowledge_Search**: Vector database queries for curated SQLi knowledge
- **nuclei_scanner**: Automated vulnerability scanning using Nuclei templates
- **payload_suggestor_sqli**: In-depth analysis of HTTP traffic to suggest targeted SQL injection payloads

**Parallel Tool Execution**: The agent can call multiple tools simultaneously in a single turn for enhanced efficiency. Examples:
- Reconnaissance: Simultaneously search Google for public information AND query vector database for relevant security techniques
- Vulnerability analysis: Parallel searches combining general web search with specialized security knowledge
- Research workflows: Multiple concurrent searches reduce response time and provide comprehensive results

### API Endpoints
- Main application serves at `http://localhost:8001`
- Interactive playground available at `http://localhost:8001/agent/playground/`
- LangServe routes mounted at `/agent` path with feedback and tracing enabled

## Technology Stack

- **Framework**: LangGraph + LangChain for agent orchestration
- **LLM**: Google Gemini via `langchain-google-genai`
- **API Server**: FastAPI with LangServe
- **Vector DB**: Qdrant for specialized security knowledge
- **Scanning Engine**: Nuclei for template-based vulnerability scanning
- **Search**: Google Custom Search API
- **Containerization**: Docker with Python 3.11-slim base

## Tool Error Handling

Both search tools include comprehensive error handling:
- Missing API keys/configuration detection
- Network/API failure graceful degradation  
- Client initialization safety checks
- Formatted error responses to maintain agent flow

## Vulnerability Scanning

The agent includes a powerful vulnerability scanning tool powered by Nuclei.

- **Automated Scanning**: Runs Nuclei scans against target URLs to identify vulnerabilities using predefined templates.
- **Targeted Templates**: Focused on SQL injection vulnerabilities (`sqli/`) for precise and efficient scanning.
- **JSON Output**: Parses Nuclei's JSON output to provide a clear, structured summary of findings.
- **Error Handling**: Includes robust error handling for missing dependencies, failed scans, and unexpected issues.

## Payload Suggestion

A specialized tool analyzes HTTP requests and responses to suggest SQL injection payloads.

- **Injection Point Analysis**: Identifies potential injection points in URL parameters, POST bodies (JSON and form data), and HTTP headers.
- **Risk Assessment**: Assigns risk levels (high, medium, low) to parameters based on common naming conventions and content.
- **Vulnerability Indicators**: Detects SQL error patterns and database-specific error messages in HTTP responses.
- **Context-Aware Suggestions**: Recommends error-based, boolean-blind, union-based, and time-based payloads based on the analysis.

## Frontend Architecture

AlgoBrain includes a modern React frontend that provides an intuitive interface for penetration testing workflows.

### Frontend Stack
- **React 19.1.0**: Latest stable version with enhanced performance and concurrent features
- **TypeScript 5.8+**: Type safety and modern JavaScript features
- **Vite 7.0**: Ultra-fast build tool with HMR and optimized production builds
- **Tailwind CSS 4.0**: Utility-first CSS framework with 100x faster builds
- **TanStack Query 5.81.5**: Server state management and data fetching
- **Monaco Editor 4.7.0**: VS Code-powered code editor for payload crafting
- **Recharts 3.0.2**: Data visualization for vulnerability analysis
- **Axios 1.7+**: HTTP client for API communication

### Component Architecture
- **ChatInterface**: Main conversation UI for interacting with the AI agent
- **PayloadEditor**: Monaco-powered editor for crafting and testing SQL injection payloads
- **VulnerabilityChart**: Dashboard with charts and visualizations for vulnerability analysis
- **UI Components**: Reusable button, card, and layout components with Tailwind styling

### Development Commands

#### Frontend Development
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

#### Environment Configuration
Create `.env` file in `/frontend/` directory:
```
VITE_API_URL=http://localhost:8001
VITE_DEV_MODE=true
```

### API Integration
- Frontend communicates with FastAPI backend via HTTP requests
- API client in `src/lib/api.ts` handles communication with LangServe endpoints
- Real-time chat interface connects to `/agent/invoke` endpoint
- Support for both standard and streaming responses

### Project Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/           # Reusable UI components (Button, Card)
│   │   ├── chat/         # Chat interface components
│   │   ├── editor/       # Monaco editor integration
│   │   └── dashboard/    # Vulnerability visualization
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities and API client
│   ├── types/            # TypeScript type definitions
│   └── App.tsx           # Main application component
├── public/               # Static assets
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite build configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── .env.example          # Environment variables template
```

## Studio Mode

AlgoBrain features an advanced "Studio Mode" for in-depth analysis of HTTP requests and responses. This interface provides a comprehensive suite of tools to identify and exploit SQL injection vulnerabilities in a controlled environment.

### Key Features
- **Interactive HTTP Editor**: Manually craft and edit HTTP requests (method, URL, headers, body) to probe for vulnerabilities.
- **Payload Suggestor Chat**: An AI-powered chat assistant that analyzes HTTP traffic and suggests targeted SQL injection payloads.
- **Vulnerability Analysis**: The chat agent identifies injection points, assesses their risk level, and detects vulnerability indicators in HTTP responses.
- **Drag-and-Drop Payloads**: Seamlessly drag and drop suggested payloads from the analysis panel directly into the HTTP request editor.

### How It Works
1. **Input HTTP Data**: Provide an HTTP request and response in the editor panels.
2. **Start Analysis**: Use the "Start Analysis" button or chat with the agent to initiate a vulnerability assessment.
3. **Review Suggestions**: The agent provides a list of suggested payloads, injection points, and vulnerability indicators.
4. **Craft and Test**: Drag payloads into the request editor, modify them as needed, and simulate the request to observe the response.

## Security Considerations

This is a defensive security tool designed for legitimate penetration testing. The agent should only be used for authorized security assessments and vulnerability research.

# MCP Server Usage Guide

This guide provides a comprehensive overview of the available MCP (Model Context Protocol) servers and their tools. It is designed to help you understand when and how to use these powerful resources to enhance your workflow.

## Connected MCP Servers

The following MCP servers are available:

- `package-version`
- `context7`
- `zen`
- `docker-mcp`
- `playwright`

---

## `package-version` Server

The `package-version` server helps you keep your project's dependencies up to date by checking for the latest stable versions of packages from various package managers.

### Available Tools

-   **`check_npm_versions`**: Check latest stable versions for npm packages.
-   **`check_python_versions`**: Check latest stable versions for Python packages.
-   **`check_pyproject_versions`**: Check latest stable versions for Python packages in `pyproject.toml`.
-   **`check_maven_versions`**: Check latest stable versions for Java packages in `pom.xml`.
-   **`check_gradle_versions`**: Check latest stable versions for Java packages in `build.gradle`.
-   **`check_go_versions`**: Check latest stable versions for Go packages in `go.mod`.
-   **`check_bedrock_models`**: Search, list, and get information about Amazon Bedrock models.
-   **`get_latest_bedrock_model`**: Get the latest Claude Sonnet model from Amazon Bedrock.
-   **`check_docker_tags`**: Check available tags for Docker container images.
-   **`check_swift_versions`**: Check latest stable versions for Swift packages in `Package.swift`.
-   **`check_github_actions`**: Check latest versions for GitHub Actions.

---

## `context7` Server

The `context7` server provides up-to-date documentation and code examples for any library.

### Available Tools

-   **`resolve-library-id`**: Resolves a package/product name to a Context7-compatible library ID.
-   **`get-library-docs`**: Fetches up-to-date documentation for a library using its Context7-compatible library ID.

---

## `zen` Server

The Zen server provides a suite of powerful tools for code analysis, debugging, and collaborative thinking.

### Available Tools

-   **`chat`**: General chat and collaborative thinking.
-   **`thinkdeep`**: Comprehensive investigation and reasoning for complex problems.
-   **`planner`**: Interactive sequential planner for breaking down complex tasks.
-   **`consensus`**: Comprehensive consensus workflow for multi-model decision-making.
-   **`codereview`**: Comprehensive code review workflow.
-   **`precommit`**: Comprehensive pre-commit validation workflow.
-   **`debug`**: Debugging and root cause analysis.
-   **`secaudit`**: Comprehensive security audit workflow.
-   **`docgen`**: Comprehensive documentation generation.
-   **`analyze`**: Comprehensive code analysis workflow.
-   **`refactor`**: Comprehensive refactoring workflow.
-   **`tracer`**: Step-by-step code tracing workflow.
-   **`testgen`**: Comprehensive test generation.
-   **`listmodels`**: List available AI models.
-   **`version`**: Get server version and configuration details.

---

## `docker-mcp` Server

The `docker-mcp` server provides tools for managing Docker containers.

### Available Tools

-   **`create-container`**: Create a new standalone Docker container.
-   **`deploy-compose`**: Deploy a Docker Compose stack.
-   **`get-logs`**: Retrieve the latest logs for a specified Docker container.
-   **`list-containers`**: List all Docker containers.

---

## `playwright` Server

The `playwright` server provides tools for browser automation and testing.

### Available Tools

-   **`browser_close`**: Close the browser page.
-   **`browser_resize`**: Resize the browser window.
-   **`browser_console_messages`**: Returns all console messages.
-   **`browser_handle_dialog`**: Handle a dialog.
-   **`browser_file_upload`**: Upload one or multiple files.
-   **`browser_install`**: Install the browser specified in the config.
-   **`browser_press_key`**: Press a key on the keyboard.
-   **`browser_navigate`**: Navigate to a URL.
-   **`browser_navigate_back`**: Go back to the previous page.
-   **`browser_navigate_forward`**: Go forward to the next page.
-   **`browser_network_requests`**: Returns all network requests since loading the page.
-   **`browser_pdf_save`**: Save page as PDF.
-   **`browser_take_screenshot`**: Take a screenshot of the current page.
-   **`browser_snapshot`**: Capture accessibility snapshot of the current page.
-   **`browser_click`**: Perform click on a web page.
-   **`browser_drag`**: Perform drag and drop between two elements.
-   **`browser_hover`**: Hover over an element on the page.
-   **`browser_type`**: Type text into an editable element.
-   **`browser_select_option`**: Select an option in a dropdown.
-   **`browser_tab_list`**: List browser tabs.
-   **`browser_tab_new`**: Open a new tab.
-   **`browser_tab_select`**: Select a tab by index.
-   **`browser_tab_close`**: Close a tab.
-   **`browser_generate_playwright_test`**: Generate a Playwright test for a given scenario.
- **`browser_wait_for`**: Wait for text to appear or disappear or a specified time to pass

### Using Gemini CLI for Large Codebase Analysis

  When analyzing large codebases or multiple files that might exceed context limits, use the Gemini CLI with its massive
  context window. Use `gemini -p` to leverage Google Gemini's large context capacity.

  ## File and Directory Inclusion Syntax

  Use the `@` syntax to include files and directories in your Gemini prompts. The paths should be relative to WHERE you run the
   gemini command:

  ### Examples:

  **Single file analysis:**
  ```bash
  gemini -p "@src/main.py Explain this file's purpose and structure"

  Multiple files:
  gemini -p "@package.json @src/index.js Analyze the dependencies used in the code"

  Entire directory:
  gemini -p "@src/ Summarize the architecture of this codebase"

  Multiple directories:
  gemini -p "@src/ @tests/ Analyze test coverage for the source code"

  Current directory and subdirectories:
  gemini -p "@./ Give me an overview of this entire project"
  
#
 Or use --all_files flag:
  gemini --all_files -p "Analyze the project structure and dependencies"

  Implementation Verification Examples

  Check if a feature is implemented:
  gemini -p "@src/ @lib/ Has dark mode been implemented in this codebase? Show me the relevant files and functions"

  Verify authentication implementation:
  gemini -p "@src/ @middleware/ Is JWT authentication implemented? List all auth-related endpoints and middleware"

  Check for specific patterns:
  gemini -p "@src/ Are there any React hooks that handle WebSocket connections? List them with file paths"

  Verify error handling:
  gemini -p "@src/ @api/ Is proper error handling implemented for all API endpoints? Show examples of try-catch blocks"

  Check for rate limiting:
  gemini -p "@backend/ @middleware/ Is rate limiting implemented for the API? Show the implementation details"

  Verify caching strategy:
  gemini -p "@src/ @lib/ @services/ Is Redis caching implemented? List all cache-related functions and their usage"

  Check for specific security measures:
  gemini -p "@src/ @api/ Are SQL injection protections implemented? Show how user inputs are sanitized"

  Verify test coverage for features:
  gemini -p "@src/payment/ @tests/ Is the payment processing module fully tested? List all test cases"

  When to Use Gemini CLI

  Use gemini -p when:
  - Analyzing entire codebases or large directories
  - Comparing multiple large files
  - Need to understand project-wide patterns or architecture
  - Current context window is insufficient for the task
  - Working with files totaling more than 100KB
  - Verifying if specific features, patterns, or security measures are implemented
  - Checking for the presence of certain coding patterns across the entire codebase

  Important Notes

  - Paths in @ syntax are relative to your current working directory when invoking gemini
  - The CLI will include file contents directly in the context
  - No need for --yolo flag for read-only analysis
  - Gemini's context window can handle entire codebases that would overflow Claude's context
  - When checking implementations, be specific about what you're looking for to get accurate results # Using Gemini CLI for Large Codebase Analysis


  When analyzing large codebases or multiple files that might exceed context limits, use the Gemini CLI with its massive
  context window. Use `gemini -p` to leverage Google Gemini's large context capacity.


  ## File and Directory Inclusion Syntax


  Use the `@` syntax to include files and directories in your Gemini prompts. The paths should be relative to WHERE you run the
   gemini command:


  ### Examples:


  **Single file analysis:**
  ```bash
  gemini -p "@src/main.py Explain this file's purpose and structure"


  Multiple files:
  gemini -p "@package.json @src/index.js Analyze the dependencies used in the code"


  Entire directory:
  gemini -p "@src/ Summarize the architecture of this codebase"


  Multiple directories:
  gemini -p "@src/ @tests/ Analyze test coverage for the source code"


  Current directory and subdirectories:
  gemini -p "@./ Give me an overview of this entire project"
  # Or use --all_files flag:
  gemini --all_files -p "Analyze the project structure and dependencies"


  Implementation Verification Examples


  Check if a feature is implemented:
  gemini -p "@src/ @lib/ Has dark mode been implemented in this codebase? Show me the relevant files and functions"


  Verify authentication implementation:
  gemini -p "@src/ @middleware/ Is JWT authentication implemented? List all auth-related endpoints and middleware"


  Check for specific patterns:
  gemini -p "@src/ Are there any React hooks that handle WebSocket connections? List them with file paths"


  Verify error handling:
  gemini -p "@src/ @api/ Is proper error handling implemented for all API endpoints? Show examples of try-catch blocks"


  Check for rate limiting:
  gemini -p "@backend/ @middleware/ Is rate limiting implemented for the API? Show the implementation details"


  Verify caching strategy:
  gemini -p "@src/ @lib/ @services/ Is Redis caching implemented? List all cache-related functions and their usage"


  Check for specific security measures:
  gemini -p "@src/ @api/ Are SQL injection protections implemented? Show how user inputs are sanitized"


  Verify test coverage for features:
  gemini -p "@src/payment/ @tests/ Is the payment processing module fully tested? List all test cases"


  When to Use Gemini CLI


  Use gemini -p when:
  - Analyzing entire codebases or large directories
  - Comparing multiple large files
  - Need to understand project-wide patterns or architecture
  - Current context window is insufficient for the task
  - Working with files totaling more than 100KB
  - Verifying if specific features, patterns, or security measures are implemented
  - Checking for the presence of certain coding patterns across the entire codebase


  Important Notes


  - Paths in @ syntax are relative to your current working directory when invoking gemini
  - The CLI will include file contents directly in the context
  - No need for --yolo flag for read-only analysis
  - Gemini's context window can handle entire codebases that would overflow Claude's context
  - When checking implementations, be specific about what you're looking for to get accurate results
# AlgoBrain 🧠

**An AI-Powered Pentesting Assistant for SQL Injection Vulnerabilities**

AlgoBrain is an intelligent cybersecurity assistant designed to help penetration testers identify, understand, and analyze SQL injection vulnerabilities. Built on cutting-edge AI technology, it combines the power of Google's Gemini LLM with specialized tools for web search and vector database queries to accelerate the pentesting workflow.

## 🎯 Overview

AlgoBrain acts as an interactive partner that augments pentester workflows by:
- **Automating Research**: Intelligent web search and specialized security knowledge queries
- **Providing Expert Guidance**: AI-powered analysis and suggestions for SQL injection testing
- **Streamlining Workflows**: Real-time conversation interface with tool integration
- **Maintaining Context**: Stateful conversations that remember your testing session

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React UI      │    │   FastAPI +      │    │   AI Tools      │
│   Frontend      │◄──►│   LangServe      │◄──►│   & Services    │
│                 │    │   Backend        │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │   LangGraph      │
                       │   Agent          │
                       └──────────────────┘
                              │
                    ┌─────────┼─────────┐
                    ▼         ▼         ▼
              ┌──────────┐ ┌──────┐ ┌─────────┐
              │  Google  │ │Qdrant│ │ Future  │
              │  Search  │ │Vector│ │ Tools   │
              │   API    │ │  DB  │ │         │
              └──────────┘ └──────┘ └─────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Docker & Docker Compose** (recommended)
- **Python 3.11+** (for direct execution)
- **Node.js 18+** (for frontend development)

### 🐳 Docker Deployment (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/algorime/AlgoBrain.git
   cd AlgoBrain
   ```

2. **Configure environment**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your API keys (see Configuration section)
   ```

3. **Start the application**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Backend API: http://localhost:8001
   - Interactive Playground: http://localhost:8001/agent/playground/

### 🔧 Manual Development Setup

#### Backend Setup

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Configure your .env file
uvicorn src.main:app --host 0.0.0.0 --port 8001
```

#### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Configure your .env file
npm run dev
```

## ⚙️ Configuration

### Required Environment Variables

Create a `.env` file in the `backend/` directory with the following:

```bash
# Google Gemini LLM
GEMINI_API_KEY=your_gemini_api_key
GEMINI_CHAT_MODEL=models/gemini-1.5-flash-preview-0514
GEMINI_EMBEDDING_MODEL=models/embedding-001

# Google Custom Search (for web search tool)
GOOGLE_CSE_API_KEY=your_google_cse_api_key
GOOGLE_CSE_CX=your_search_engine_id

# Qdrant Vector Database (for specialized security knowledge)
QDRANT_URL=your_qdrant_instance_url
QDRANT_API_KEY=your_qdrant_api_key
COLLECTION_NAME=sql_injection
```

### Frontend Configuration

Create a `.env` file in the `frontend/` directory:

```bash
VITE_API_URL=http://localhost:8001
VITE_DEV_MODE=true
```

## 🎮 Usage

### Interactive Chat Interface

1. Start the application using Docker or manual setup
2. Open the playground at http://localhost:8001/agent/playground/
3. Begin a conversation about SQL injection testing
4. The AI will use its tools to search for information and provide guidance

### Example Conversations

```
👤 "I found a login form at example.com/login. How should I test for SQL injection?"

🤖 AlgoBrain will:
   - Search for current SQLi testing methodologies
   - Query its knowledge base for relevant payloads
   - Provide step-by-step testing guidance
   - Suggest specific payloads to try
```

### API Integration

Access the LangServe API directly:

```bash
# Invoke the agent
curl -X POST "http://localhost:8001/agent/invoke" \
  -H "Content-Type: application/json" \
  -d '{"input": "Help me test for SQL injection in a login form"}'
```

## 🛠️ Technology Stack

### Backend
- **Framework**: LangGraph + LangChain for agent orchestration
- **LLM**: Google Gemini via `langchain-google-genai`
- **API Server**: FastAPI with LangServe
- **Vector DB**: Qdrant for specialized security knowledge
- **Search**: Google Custom Search API

### Frontend
- **React 19.1.0**: Latest stable version with enhanced performance
- **TypeScript 5.8+**: Type safety and modern JavaScript features
- **Vite 7.0**: Ultra-fast build tool with HMR
- **Tailwind CSS 4.0**: Utility-first CSS framework
- **TanStack Query 5.81.5**: Server state management
- **Monaco Editor 4.7.0**: VS Code-powered code editor for payloads

### Infrastructure
- **Containerization**: Docker with Python 3.11-slim base
- **Deployment**: Docker Compose for easy orchestration

## 🧪 Features

### Current (V1 MVP)
- ✅ **Interactive AI Agent** with specialized pentesting knowledge
- ✅ **Google Search Integration** for real-time vulnerability research
- ✅ **Vector Database Queries** for curated SQL injection knowledge
- ✅ **Real-time Streaming Interface** with conversation history
- ✅ **Parallel Tool Execution** for enhanced efficiency
- ✅ **Docker Deployment** for easy setup

### Planned (V2+)
- 🔄 **HTTP Request Tool** for direct target interaction
- 🔄 **Vulnerability Validation** capabilities
- 🔄 **SQLMap Integration** for automated testing
- 🔄 **Report Generation** for findings documentation
- 🔄 **Multi-vulnerability Support** (XSS, CSRF, etc.)

## 🔒 Security Considerations

⚠️ **Important**: AlgoBrain is a **defensive security tool** designed for legitimate penetration testing.

- Only use for **authorized security assessments**
- Ensure you have **proper permissions** before testing any systems
- Follow **responsible disclosure** practices for any vulnerabilities found
- The tool is designed for **ethical hacking** and security research only

## 📁 Project Structure

```
AlgoBrain/
├── backend/                 # Python FastAPI backend
│   ├── src/
│   │   ├── main.py         # FastAPI application entry point
│   │   ├── agent.py        # LangGraph agent implementation
│   │   └── tools/          # AI tools (search, knowledge queries)
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile         # Backend container configuration
├── frontend/               # React TypeScript frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── lib/           # Utilities and API client
│   │   └── types/         # TypeScript definitions
│   ├── package.json       # Node.js dependencies
│   └── Dockerfile        # Frontend container configuration
├── docker-compose.yml     # Multi-container orchestration
└── README.md             # This file
```

## 🤝 Contributing

We welcome contributions! Please see our [development guidelines](./CLAUDE.md) for detailed information about:

- Local development setup
- Code architecture and patterns
- Testing procedures
- Submission guidelines

## 📄 Documentation

- **[Technical Guide](./CLAUDE.md)**: Comprehensive development and architecture guide
- **[Product Requirements](./backend/prd.md)**: Detailed product specifications and roadmap
- **[Backend README](./backend/README.md)**: Backend-specific documentation
- **[Frontend README](./frontend/README.md)**: Frontend-specific documentation

## 📋 Development Commands

### Full Stack Development
```bash
# Start everything with Docker
docker-compose up --build

# Backend only
cd backend && uvicorn src.main:app --host 0.0.0.0 --port 8001

# Frontend only  
cd frontend && npm run dev
```

### Testing & Quality
```bash
# Backend
cd backend && python -m pytest  # (when tests are added)

# Frontend
cd frontend && npm run lint
cd frontend && npm run build
```

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/algorime/AlgoBrain/issues)
- **Discussions**: [GitHub Discussions](https://github.com/algorime/AlgoBrain/discussions)

---

**Built with ❤️ for the cybersecurity community**

*AlgoBrain helps security professionals work smarter, not harder.*
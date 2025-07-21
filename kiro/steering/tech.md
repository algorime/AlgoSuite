# AlgoBrain Technology Stack

## Backend

- **Framework**: LangGraph + LangChain for agent orchestration
- **LLM**: Google Gemini via `langchain-google-genai`
- **API Server**: FastAPI with LangServe
- **Vector DB**: Qdrant for specialized security knowledge
- **Search**: Google Custom Search API
- **Runtime**: Python 3.11+

## Frontend

- **Framework**: React 19.1.0
- **Language**: TypeScript 5.8+
- **Build Tool**: Vite 7.0
- **Styling**: Tailwind CSS 4.0
- **State Management**: TanStack Query 5.81.5
- **Code Editor**: Monaco Editor 4.7.0
- **Visualization**: Recharts 3.0.2
- **Routing**: React Router DOM 7.0
- **Layout**: React Resizable Panels 3.0

## Infrastructure

- **Containerization**: Docker with Docker Compose
- **Base Images**: Python 3.11-slim (backend), Node 20-alpine (frontend)
- **Web Server**: Nginx (production frontend)

## Common Commands

### Docker Setup

```bash
# Start all services
docker-compose up --build

# Start only backend
docker-compose up --build backend

# Start only frontend
docker-compose up --build frontend
```

### Backend Development

```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env

# Run development server
uvicorn src.main:app --host 0.0.0.0 --port 8001 --reload
```

### Frontend Development

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Run development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint
```

## Environment Configuration

### Backend (.env)

Required environment variables:
- `GEMINI_API_KEY`: Google Gemini API key
- `GOOGLE_CSE_API_KEY`: Google Custom Search API key
- `GOOGLE_CSE_CX`: Google Custom Search Engine ID
- `QDRANT_URL`: Qdrant Vector Database URL
- `QDRANT_API_KEY`: Qdrant API key
- `COLLECTION_NAME`: Vector database collection name

### Frontend (.env)

Required environment variables:
- `VITE_API_URL`: Backend API URL (default: http://localhost:8001)
- `VITE_DEV_MODE`: Development mode flag (true/false)
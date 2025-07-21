# AlgoBrain Project Structure

## Root Directory

- `docker-compose.yml`: Multi-container orchestration
- `.env.example`: Template for environment variables
- `README.md`: Main project documentation
- `LICENSE`: Project license information

## Backend (`/backend`)

- `/src`: Main application code
  - `main.py`: FastAPI application entry point
  - `agent.py`: LangGraph agent implementation
  - `/tools`: AI tools for search and knowledge queries
    - `google_search.py`: Web search tool
    - `vector_search.py`: Vector database tool
- `requirements.txt`: Python dependencies
- `Dockerfile`: Backend container configuration
- `.env.example`: Environment variables template
- `README.md`: Backend-specific documentation
- `prd.md`: Product requirements document

## Frontend (`/frontend`)

- `/src`: Application source code
  - `/components`: React components
    - `/ui`: Reusable UI components
    - `/chat`: Chat interface components
    - `/editor`: Monaco editor integration
    - `/dashboard`: Vulnerability visualization
  - `/hooks`: Custom React hooks
  - `/lib`: Utilities and configurations
  - `/types`: TypeScript definitions
  - `App.tsx`: Main application component
- `package.json`: Node.js dependencies
- `tsconfig.json`: TypeScript configuration
- `vite.config.ts`: Vite build configuration
- `eslint.config.js`: ESLint configuration
- `Dockerfile`: Production container configuration
- `Dockerfile.dev`: Development container configuration
- `.env.example`: Environment variables template
- `README.md`: Frontend-specific documentation

## Code Organization Principles

1. **Separation of Concerns**: Backend and frontend are clearly separated
2. **Modular Architecture**: Components are organized by feature and function
3. **Container-First**: Docker setup for consistent development and deployment
4. **Configuration as Code**: Environment templates and Docker configurations
5. **Documentation**: README files at multiple levels

## Naming Conventions

- **Backend**: Snake case for Python files and functions (`google_search.py`, `vector_search.py`)
- **Frontend**: 
  - PascalCase for React components (`ChatMessage.tsx`)
  - camelCase for functions and variables
  - kebab-case for CSS classes

## Development Workflow

1. Configure environment variables using `.env.example` templates
2. Start services using Docker Compose or individual development servers
3. Backend API is accessible at `http://localhost:8001`
4. Frontend development server runs at `http://localhost:5173`
5. API playground available at `http://localhost:8001/agent/playground/`
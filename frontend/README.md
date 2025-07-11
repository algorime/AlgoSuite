# AlgoBrain Frontend

**Modern React Interface for AI-Powered Pentesting**

This is the frontend application for AlgoBrain, providing an intuitive web interface for interacting with the AI pentesting assistant. Built with React 19, TypeScript, and modern web technologies, it offers a seamless user experience for cybersecurity professionals.

## 🎨 Interface Overview

The frontend provides several key interfaces:

- **🗣️ Chat Interface**: Natural language conversation with the AI agent
- **📝 Payload Editor**: Monaco-powered code editor for crafting SQL injection payloads  
- **📊 Vulnerability Dashboard**: Charts and visualizations for analysis results
- **🎮 Interactive Playground**: Real-time agent interaction with streaming responses

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and **npm**
- **Backend service** running (see [backend README](../backend/README.md))

### Development Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your backend URL

# Start development server
npm run dev
```

### Using Docker

```bash
# From project root (when frontend is enabled in docker-compose.yml)
docker-compose up --build frontend
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the `frontend/` directory:

```bash
# Backend API configuration
VITE_API_URL=http://localhost:8001

# Development settings
VITE_DEV_MODE=true

# Optional: Custom branding
VITE_APP_TITLE=AlgoBrain
VITE_APP_DESCRIPTION="AI-Powered Pentesting Assistant"
```

## 🛠️ Technology Stack

### Core Technologies
- **⚛️ React 19.1.0**: Latest stable version with enhanced performance and concurrent features
- **📘 TypeScript 5.8+**: Type safety and modern JavaScript features  
- **⚡ Vite 7.0**: Ultra-fast build tool with HMR and optimized production builds
- **🎨 Tailwind CSS 4.0**: Utility-first CSS framework with 100x faster builds

### Key Libraries
- **🔄 TanStack Query 5.81.5**: Server state management and data fetching
- **📝 Monaco Editor 4.7.0**: VS Code-powered code editor for payload crafting
- **📊 Recharts 3.0.2**: Data visualization for vulnerability analysis
- **🌐 Axios 1.7+**: HTTP client for API communication
- **🧭 React Router DOM 7.0**: Client-side routing
- **📐 React Resizable Panels 3.0**: Flexible layout system

## 🏗️ Architecture

### Component Structure

```
src/
├── components/
│   ├── ui/                 # Reusable UI components
│   │   ├── Button.tsx     # Styled button component
│   │   ├── Card.tsx       # Container component
│   │   └── Input.tsx      # Form input component
│   ├── chat/              # Chat interface components
│   │   ├── ChatMessage.tsx
│   │   ├── ChatInput.tsx
│   │   └── ChatHistory.tsx
│   ├── editor/            # Monaco editor integration
│   │   ├── PayloadEditor.tsx
│   │   └── EditorSettings.tsx
│   └── dashboard/         # Vulnerability visualization
│       ├── VulnerabilityChart.tsx
│       └── MetricsDisplay.tsx
├── hooks/                 # Custom React hooks
│   ├── useApi.ts         # API communication
│   ├── useChat.ts        # Chat state management
│   └── useWebSocket.ts   # Real-time connections
├── lib/                  # Utilities and configurations
│   ├── api.ts            # API client configuration
│   ├── types.ts          # TypeScript definitions
│   └── utils.ts          # Helper functions
├── types/                # Global TypeScript definitions
└── App.tsx              # Main application component
```

### Data Flow

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   User Input    │    │   React State    │    │   Backend API   │
│   (Chat/Forms)  │───▶│   Management     │───▶│   (FastAPI)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │                          │
                              ▼                          ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   UI Updates    │◄───│   TanStack       │◄───│   LangServe     │
│   (Real-time)   │    │   Query Cache    │    │   Responses     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🎯 Key Features

### Chat Interface
- **Real-time Conversations**: Streaming responses from the AI agent
- **Message History**: Persistent conversation state
- **Markdown Support**: Rich text formatting for responses
- **Tool Visibility**: See when the agent uses Google search or vector database

### Payload Editor
- **Syntax Highlighting**: SQL injection payload highlighting
- **Code Completion**: Intelligent autocomplete for common payloads
- **Error Detection**: Built-in validation and error checking
- **Template Library**: Pre-built payload templates

### Dashboard & Visualization
- **Vulnerability Charts**: Visual representation of findings
- **Metrics Display**: Real-time statistics and progress tracking
- **Export Functions**: Save results and reports

### Responsive Design
- **Mobile-First**: Works seamlessly on all device sizes
- **Dark/Light Mode**: Adaptive theming (planned)
- **Accessibility**: WCAG compliance for inclusive design

## 📡 API Integration

### Backend Communication

The frontend communicates with the FastAPI backend via HTTP and WebSocket connections:

```typescript
// API client configuration (src/lib/api.ts)
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Agent interaction
const response = await apiClient.post('/agent/invoke', {
  input: userMessage,
});
```

### Real-time Features

```typescript
// Streaming conversations
const eventSource = new EventSource('/agent/stream');
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  updateChatMessage(data);
};
```

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server with HMR
npm run dev -- --port 3000  # Use custom port

# Building
npm run build        # Build for production
npm run preview      # Preview production build locally

# Code Quality
npm run lint         # ESLint code checking
npm run lint:fix     # Auto-fix ESLint issues
npm run type-check   # TypeScript type checking
```

### Development Workflow

1. **Start Backend**: Ensure the backend is running on port 8001
2. **Install Dependencies**: `npm install`
3. **Start Frontend**: `npm run dev`
4. **Access Application**: http://localhost:5173

### Code Style & Standards

The project uses ESLint with React-specific rules:

```javascript
// eslint.config.js configuration
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    // React-specific configurations
  },
])
```

### Component Development Guidelines

```typescript
// Example component structure
interface ComponentProps {
  // Define props with TypeScript
  message: string;
  onSubmit: (data: FormData) => void;
}

export const MyComponent: React.FC<ComponentProps> = ({ 
  message, 
  onSubmit 
}) => {
  // Component logic
  return (
    <div className="component-container">
      {/* JSX content */}
    </div>
  );
};
```

## 🎨 Styling

### Tailwind CSS

The project uses Tailwind CSS 4.0 for styling:

```typescript
// Component styling example
<div className="
  bg-white dark:bg-gray-800 
  rounded-lg shadow-md 
  p-6 m-4
  transition-colors duration-200
">
  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
    Chat Interface
  </h2>
</div>
```

### Design System

- **Colors**: Consistent color palette for cybersecurity theme
- **Typography**: Clear, readable fonts optimized for technical content
- **Spacing**: Systematic spacing scale using Tailwind classes
- **Components**: Reusable UI components in `src/components/ui/`

## 🚀 Deployment

### Production Build

```bash
# Build optimized production bundle
npm run build

# Output files in dist/ directory
ls dist/
```

### Docker Deployment

```dockerfile
# Multi-stage build
FROM node:20-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```

### Environment-Specific Configuration

```bash
# Production environment
VITE_API_URL=https://api.algobrain.com

# Staging environment  
VITE_API_URL=https://staging-api.algobrain.com
VITE_DEV_MODE=false
```

## 🧪 Testing

### Testing Framework (Planned)

The project is set up to support comprehensive testing:

```bash
# Unit tests (when implemented)
npm run test

# Integration tests
npm run test:integration

# E2E tests with Playwright
npm run test:e2e
```

### Testing Structure

```
src/
├── __tests__/           # Test files
│   ├── components/      # Component tests
│   ├── hooks/          # Hook tests
│   └── utils/          # Utility tests
└── test-utils/         # Testing utilities
```

## 🔒 Security Considerations

### Input Sanitization
- All user inputs are sanitized before sending to backend
- XSS prevention through proper React practices
- CSRF protection via secure headers

### Environment Variables
- Sensitive data only in backend environment
- Frontend environment variables are public by nature
- No API keys or secrets in frontend code

## 🐛 Troubleshooting

### Common Issues

**Development Server Won't Start**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check port availability
lsof -i :5173
```

**Backend Connection Issues**
```bash
# Verify backend is running
curl http://localhost:8001/

# Check environment configuration
cat .env
```

**Build Errors**
```bash
# Type check
npm run type-check

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

## 📚 Related Documentation

- **[Main README](../README.md)**: Project overview and setup
- **[Backend README](../backend/README.md)**: Backend API documentation
- **[Technical Guide](../CLAUDE.md)**: Comprehensive development guide
- **[Product Requirements](../backend/prd.md)**: Product specifications

---

**For complete project setup, refer to the [main README](../README.md)**

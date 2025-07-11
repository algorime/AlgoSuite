# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the frontend for AlgoBrain, an AI-powered pentesting assistant. Built with React 19, TypeScript, and Vite, it provides a modern interface for cybersecurity professionals to interact with the AI agent. The application features multiple specialized interfaces including a chat interface, payload editor, vulnerability dashboard, and an advanced Studio Mode for HTTP request analysis.

## Development Commands

### Running the Application
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Required environment variables
VITE_API_URL=http://localhost:8001  # Backend API URL
VITE_DEV_MODE=true                  # Development mode
```

## Key Architecture

### Component Structure
- **App.tsx**: Main application with tab-based navigation (chat, editor, dashboard, studio)
- **StudioInterface**: Advanced HTTP request/response analysis interface with resizable panels
- **PayloadSuggestorChat**: AI-powered chat for analyzing HTTP traffic and suggesting payloads
- **PayloadEditor**: Monaco editor integration for crafting SQL injection payloads
- **UI Components**: Reusable components in `src/components/ui/`

### API Integration
The frontend communicates with the FastAPI backend through two main endpoints:
- **Main Agent**: `/agent/invoke` - General AI assistant interactions
- **Payload Suggestor**: `/payload-suggestor/invoke` - Specialized SQL injection analysis

API client configuration is in `src/lib/api.ts` with hardcoded base URL for Docker deployment.

### Studio Mode Architecture
The Studio interface is the most complex component, featuring:
- **Resizable Panels**: Uses `react-resizable-panels` for flexible layout
- **HTTP Request Editor**: Real-time parsing and editing of HTTP requests
- **Payload Application**: Drag-and-drop payload integration system
- **State Management**: Complex state handling for HTTP data, payloads, and analysis results

### Technology Stack
- **React 19.1.0**: Latest stable version with concurrent features
- **TypeScript 5.8+**: Full type safety
- **Vite 7.0**: Build tool with HMR
- **Tailwind CSS 4.0**: Utility-first styling
- **TanStack Query 5.81.5**: Server state management (planned)
- **Monaco Editor 4.7.0**: VS Code-powered editor
- **Recharts 3.0.2**: Data visualization
- **React Resizable Panels**: Layout management

## Key Features

### Studio Mode
The Studio interface (`src/components/studio/`) is the flagship feature:
- **HTTP Request/Response Editor**: Manual editing with real-time parsing
- **Payload Suggestor Chat**: AI analysis of HTTP traffic for SQL injection vulnerabilities
- **Payload Application System**: Drag-and-drop payload integration with preview
- **Resizable Layout**: Three-panel layout with drag handles

### Data Flow in Studio
1. User inputs HTTP request/response data
2. Chat interface analyzes the data using the backend payload suggestor agent
3. AI suggests SQL injection payloads based on analysis
4. User can drag-and-drop payloads into the HTTP request editor
5. Applied payloads are tracked and can be modified

### Type System
Comprehensive TypeScript definitions in `src/types/index.ts`:
- **HttpRequest/HttpResponse**: HTTP traffic structures
- **PayloadSuggestion**: AI-generated payload recommendations
- **InjectionPoint**: Identified vulnerability locations
- **PayloadAnalysisResult**: Complete analysis output

## Development Guidelines

### State Management
- Use React hooks for local component state
- Complex state in Studio interface uses multiple useState hooks
- Real-time parsing with debounced updates to prevent performance issues

### HTTP Request Parsing
The Studio interface includes sophisticated HTTP request parsing:
- Real-time parsing of raw HTTP text into structured data
- Debounced updates to prevent constant re-parsing
- Cursor position preservation during programmatic updates

### Payload Application
The `PayloadApplicator` service handles applying suggested payloads:
- Modifies HTTP requests at specific injection points
- Provides preview of changes before application
- Tracks applied payloads for user reference

### Error Handling
- API errors are caught and displayed to users
- Parsing errors are handled gracefully without breaking the interface
- Network timeouts are configured for long-running analysis operations

## Common Development Tasks

### Adding New Payload Types
1. Update `PayloadSuggestion` type in `src/types/index.ts`
2. Modify backend integration in `src/lib/api.ts`
3. Update UI components to handle new payload types

### Extending Studio Interface
1. Add new panels to the `PanelGroup` structure
2. Create new component in `src/components/studio/`
3. Update state management in `StudioInterface.tsx`

### API Integration
- Backend runs on port 8001 (configurable via VITE_API_URL)
- LangServe endpoints expect specific message structures
- Timeout set to 300 seconds for long-running analysis

## Security Considerations

This is a defensive security tool for authorized penetration testing:
- No sensitive data should be stored in frontend
- All environment variables are public by nature in Vite
- Input sanitization handled by backend, not frontend
- HTTPS should be used in production deployments
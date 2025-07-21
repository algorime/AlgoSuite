import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext.js';
import App from './App.tsx';

// Mock the components to avoid complex dependencies
vi.mock('./components/studio/StudioIslandWrapper', () => ({
  default: () => <div data-testid="studio-island-wrapper">Studio Island Wrapper</div>
}));

vi.mock('./components/chat/ChatIslandWrapper', () => ({
  default: () => <div data-testid="chat-island-wrapper">Chat Island Wrapper</div>
}));

vi.mock('./components/editor/EditorIslandWrapper', () => ({
  default: () => <div data-testid="editor-island-wrapper">Editor Island Wrapper</div>
}));

vi.mock('./components/dashboard/DashboardIslandWrapper', () => ({
  default: () => <div data-testid="dashboard-island-wrapper">Dashboard Island Wrapper</div>
}));

vi.mock('./components/ui/AnimationDemo', () => ({
  default: () => <div data-testid="animation-demo">Animation Demo</div>
}));

vi.mock('./components/ui/IslandDemo', () => ({
  IslandDemo: () => <div data-testid="island-demo">Island Demo</div>
}));

vi.mock('./components/ui/ButtonDemo', () => ({
  default: () => <div data-testid="button-demo">Button Demo</div>
}));

vi.mock('./components/ui/NavigationIsland', () => ({
  default: ({ activeTab, onTabChange }: any) => (
    <nav data-testid="navigation-island">
      <button onClick={() => onTabChange('studio')}>Studio</button>
      <span data-testid="active-tab">{activeTab}</span>
    </nav>
  )
}));

vi.mock('./components/pages/StudioPage', () => ({
  default: () => <div data-testid="studio-page">Studio Page</div>
}));

vi.mock('./hooks/useTheme.js', () => ({
  useTheme: () => ({})
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithProviders = (ui: React.ReactElement, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          {ui}
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

describe('App Router Configuration', () => {
  it('should render main app on root route', () => {
    renderWithProviders(<App />, { route: '/' });
    
    expect(screen.getByTestId('navigation-island')).toBeInTheDocument();
  });

  it('should render StudioPage on /studio route', () => {
    renderWithProviders(<App />, { route: '/studio' });
    
    expect(screen.getByTestId('studio-page')).toBeInTheDocument();
  });

  it('should handle direct navigation to /studio route', () => {
    // Simulate direct URL access
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/studio'
      },
      writable: true
    });
    
    renderWithProviders(<App />, { route: '/studio' });
    
    expect(screen.getByTestId('studio-page')).toBeInTheDocument();
  });
});
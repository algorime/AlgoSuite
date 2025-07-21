import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { vi } from 'vitest';
import ChatInterface from './ChatInterface';

// Mock the API
vi.mock('../../lib/api', () => ({
  agentApi: {
    sendMessage: vi.fn(),
  },
}));

// Mock scrollIntoView
Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
  value: vi.fn(),
  writable: true,
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
};

describe('ChatInterface', () => {
  it('renders welcome message when no messages', () => {
    render(<ChatInterface />, { wrapper: createWrapper() });
    
    expect(screen.getByText('Welcome to AlgoBrain')).toBeInTheDocument();
    expect(screen.getByText(/AI-powered penetration testing assistant/)).toBeInTheDocument();
  });

  it('renders chat input', () => {
    render(<ChatInterface />, { wrapper: createWrapper() });
    
    expect(screen.getByPlaceholderText('Ask about SQL injection vulnerabilities...')).toBeInTheDocument();
  });

  it('renders send button', () => {
    render(<ChatInterface />, { wrapper: createWrapper() });
    
    const sendButton = screen.getByRole('button');
    expect(sendButton).toBeInTheDocument();
    expect(sendButton).toBeDisabled(); // Should be disabled when input is empty
  });
});
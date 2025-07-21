import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ErrorBoundary, IslandErrorBoundary, withErrorBoundary, useErrorHandler } from './ErrorBoundary.js';

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
});

// Test component that throws an error
const ThrowError = ({ shouldThrow = false, message = 'Test error' }) => {
  if (shouldThrow) {
    throw new Error(message);
  }
  return <div>No error</div>;
};

// Test component for async errors
const AsyncError = ({ shouldThrow = false }) => {
  React.useEffect(() => {
    if (shouldThrow) {
      setTimeout(() => {
        throw new Error('Async error');
      }, 0);
    }
  }, [shouldThrow]);
  
  return <div>Async component</div>;
};

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders error UI when child component throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>;
    
    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('calls onError callback when error occurs', () => {
    const onError = vi.fn();
    
    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} message="Callback test error" />
      </ErrorBoundary>
    );
    
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Callback test error' }),
      expect.objectContaining({ componentStack: expect.any(String) })
    );
  });

  it('resets error state when retry button is clicked', async () => {
    const TestComponent = () => {
      const [shouldThrow, setShouldThrow] = React.useState(true);
      
      return (
        <ErrorBoundary resetKeys={[shouldThrow]}>
          <button onClick={() => setShouldThrow(false)}>Fix error</button>
          <ThrowError shouldThrow={shouldThrow} />
        </ErrorBoundary>
      );
    };
    
    render(<TestComponent />);
    
    // Error should be displayed
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    
    // Click retry button
    fireEvent.click(screen.getByText('Try Again'));
    
    // Should reset and show content
    await waitFor(() => {
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });
  });

  it('shows error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    render(
      <ErrorBoundary showErrorDetails={true}>
        <ThrowError shouldThrow={true} message="Detailed error" />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Error Details')).toBeInTheDocument();
    
    process.env.NODE_ENV = originalEnv;
  });

  it('auto-resets after timeout when isolateError is true', async () => {
    vi.useFakeTimers();
    
    render(
      <ErrorBoundary isolateError={true}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    
    // Fast-forward time
    vi.advanceTimersByTime(5000);
    
    await waitFor(() => {
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });
    
    vi.useRealTimers();
  });

  it('resets when resetKeys change', () => {
    const TestComponent = () => {
      const [key, setKey] = React.useState(1);
      const [shouldThrow, setShouldThrow] = React.useState(true);
      
      return (
        <div>
          <button onClick={() => setKey(k => k + 1)}>Change key</button>
          <button onClick={() => setShouldThrow(false)}>Fix error</button>
          <ErrorBoundary resetOnPropsChange={true} resetKeys={[key]}>
            <ThrowError shouldThrow={shouldThrow} />
          </ErrorBoundary>
        </div>
      );
    };
    
    render(<TestComponent />);
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    
    // Change reset key
    fireEvent.click(screen.getByText('Change key'));
    
    // Should reset the error boundary
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });
});

describe('IslandErrorBoundary', () => {
  it('renders compact error fallback', () => {
    render(
      <IslandErrorBoundary>
        <ThrowError shouldThrow={true} />
      </IslandErrorBoundary>
    );
    
    expect(screen.getByText('Unable to load this section')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('applies custom island props to fallback', () => {
    render(
      <IslandErrorBoundary islandProps={{ 'data-testid': 'error-island' }}>
        <ThrowError shouldThrow={true} />
      </IslandErrorBoundary>
    );
    
    expect(screen.getByTestId('error-island')).toBeInTheDocument();
  });
});

describe('withErrorBoundary HOC', () => {
  it('wraps component with error boundary', () => {
    const TestComponent = ({ shouldThrow }: { shouldThrow: boolean }) => (
      <ThrowError shouldThrow={shouldThrow} />
    );
    
    const WrappedComponent = withErrorBoundary(TestComponent);
    
    render(<WrappedComponent shouldThrow={true} />);
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('passes through props to wrapped component', () => {
    const TestComponent = ({ message }: { message: string }) => (
      <div>{message}</div>
    );
    
    const WrappedComponent = withErrorBoundary(TestComponent);
    
    render(<WrappedComponent message="Test message" />);
    
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('applies error boundary props', () => {
    const onError = vi.fn();
    const TestComponent = () => <ThrowError shouldThrow={true} />;
    
    const WrappedComponent = withErrorBoundary(TestComponent, { onError });
    
    render(<WrappedComponent />);
    
    expect(onError).toHaveBeenCalled();
  });
});

describe('useErrorHandler', () => {
  it('logs errors when called', () => {
    const TestComponent = () => {
      const handleError = useErrorHandler();
      
      React.useEffect(() => {
        handleError(new Error('Hook error'));
      }, [handleError]);
      
      return <div>Test</div>;
    };
    
    render(<TestComponent />);
    
    expect(console.error).toHaveBeenCalledWith(
      'Error caught by useErrorHandler:',
      expect.objectContaining({ message: 'Hook error' }),
      undefined
    );
  });
});

describe('Error boundary accessibility', () => {
  it('has proper ARIA attributes', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    const errorElement = screen.getByRole('alert');
    expect(errorElement).toHaveAttribute('aria-label', 'Error occurred');
  });

  it('has focusable retry button', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    const retryButton = screen.getByText('Try Again');
    expect(retryButton).toBeInTheDocument();
    expect(retryButton.tagName).toBe('BUTTON');
  });

  it('provides screen reader friendly error message', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('This component encountered an error and couldn\'t be displayed properly.')).toBeInTheDocument();
  });
});

describe('Error boundary edge cases', () => {
  it('handles errors in error boundary itself gracefully', () => {
    // This is a meta-test to ensure error boundaries don't crash when they encounter errors
    const ProblematicErrorBoundary = ({ children }: { children: React.ReactNode }) => {
      const [hasError, setHasError] = React.useState(false);
      
      if (hasError) {
        // Simulate an error in the error boundary's render method
        throw new Error('Error boundary error');
      }
      
      return (
        <ErrorBoundary onError={() => setHasError(true)}>
          {children}
        </ErrorBoundary>
      );
    };
    
    // This should not crash the test
    expect(() => {
      render(
        <ErrorBoundary>
          <ProblematicErrorBoundary>
            <ThrowError shouldThrow={true} />
          </ProblematicErrorBoundary>
        </ErrorBoundary>
      );
    }).not.toThrow();
  });

  it('handles multiple consecutive errors', () => {
    const MultiErrorComponent = () => {
      const [errorCount, setErrorCount] = React.useState(0);
      
      React.useEffect(() => {
        if (errorCount < 3) {
          setTimeout(() => {
            setErrorCount(c => c + 1);
            throw new Error(`Error ${errorCount + 1}`);
          }, 100);
        }
      }, [errorCount]);
      
      return <div>Error count: {errorCount}</div>;
    };
    
    render(
      <ErrorBoundary>
        <MultiErrorComponent />
      </ErrorBoundary>
    );
    
    // Should handle the first error gracefully
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('cleans up timers on unmount', () => {
    vi.useFakeTimers();
    
    const { unmount } = render(
      <ErrorBoundary isolateError={true}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // Unmount before timeout
    unmount();
    
    // Should not cause any issues
    vi.advanceTimersByTime(10000);
    
    vi.useRealTimers();
  });
});
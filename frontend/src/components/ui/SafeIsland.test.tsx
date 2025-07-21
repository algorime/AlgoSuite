import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SafeIsland, withSafeIsland, useIslandError, IslandErrorDisplay } from './SafeIsland.js';

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

// Mock the Island component
vi.mock('./Island.js', () => ({
  Island: ({ children, ...props }: any) => (
    <div data-testid="island" {...props}>
      {children}
    </div>
  ),
}));

describe('SafeIsland', () => {
  it('renders children when there is no error', () => {
    render(
      <SafeIsland>
        <div>Test content</div>
      </SafeIsland>
    );
    
    expect(screen.getByText('Test content')).toBeInTheDocument();
    expect(screen.getByTestId('island')).toBeInTheDocument();
  });

  it('renders compact error fallback by default', () => {
    render(
      <SafeIsland>
        <ThrowError shouldThrow={true} />
      </SafeIsland>
    );
    
    expect(screen.getByText('Unable to load this section')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders full error fallback when compactErrorFallback is false', () => {
    render(
      <SafeIsland compactErrorFallback={false}>
        <ThrowError shouldThrow={true} />
      </SafeIsland>
    );
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('renders custom error fallback when provided', () => {
    const customFallback = <div>Custom error message</div>;
    
    render(
      <SafeIsland compactErrorFallback={false} errorFallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </SafeIsland>
    );
    
    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('calls onError callback when error occurs', () => {
    const onError = vi.fn();
    
    render(
      <SafeIsland onError={onError}>
        <ThrowError shouldThrow={true} message="Callback test error" />
      </SafeIsland>
    );
    
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Callback test error' }),
      expect.objectContaining({ componentStack: expect.any(String) })
    );
  });

  it('passes island props to underlying Island component', () => {
    render(
      <SafeIsland variant="accent" size="lg" data-testid="safe-island">
        <div>Test content</div>
      </SafeIsland>
    );
    
    const island = screen.getByTestId('safe-island');
    expect(island).toHaveAttribute('variant', 'accent');
    expect(island).toHaveAttribute('size', 'lg');
  });

  it('resets error when resetKeys change', async () => {
    const TestComponent = () => {
      const [key, setKey] = React.useState(1);
      const [shouldThrow, setShouldThrow] = React.useState(true);
      
      return (
        <div>
          <button onClick={() => setKey(k => k + 1)}>Change key</button>
          <button onClick={() => setShouldThrow(false)}>Fix error</button>
          <SafeIsland resetKeys={[key]}>
            <ThrowError shouldThrow={shouldThrow} />
          </SafeIsland>
        </div>
      );
    };
    
    render(<TestComponent />);
    
    expect(screen.getByText('Unable to load this section')).toBeInTheDocument();
    
    // Change reset key
    fireEvent.click(screen.getByText('Change key'));
    
    // Should reset the error boundary
    await waitFor(() => {
      expect(screen.queryByText('Unable to load this section')).not.toBeInTheDocument();
    });
  });

  it('shows error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    render(
      <SafeIsland compactErrorFallback={false} showErrorDetails={true}>
        <ThrowError shouldThrow={true} message="Detailed error" />
      </SafeIsland>
    );
    
    expect(screen.getByText('Error Details')).toBeInTheDocument();
    
    process.env.NODE_ENV = originalEnv;
  });

  it('isolates errors by default', () => {
    vi.useFakeTimers();
    
    render(
      <SafeIsland>
        <ThrowError shouldThrow={true} />
      </SafeIsland>
    );
    
    expect(screen.getByText('Unable to load this section')).toBeInTheDocument();
    
    // Should auto-reset after 5 seconds
    vi.advanceTimersByTime(5000);
    
    waitFor(() => {
      expect(screen.queryByText('Unable to load this section')).not.toBeInTheDocument();
    });
    
    vi.useRealTimers();
  });
});

describe('withSafeIsland HOC', () => {
  it('wraps component with SafeIsland', () => {
    const TestComponent = ({ shouldThrow }: { shouldThrow: boolean }) => (
      <ThrowError shouldThrow={shouldThrow} />
    );
    
    const WrappedComponent = withSafeIsland(TestComponent);
    
    render(<WrappedComponent shouldThrow={true} />);
    
    expect(screen.getByText('Unable to load this section')).toBeInTheDocument();
  });

  it('passes through props to wrapped component', () => {
    const TestComponent = ({ message }: { message: string }) => (
      <div>{message}</div>
    );
    
    const WrappedComponent = withSafeIsland(TestComponent);
    
    render(<WrappedComponent message="Test message" />);
    
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('applies SafeIsland props', () => {
    const onError = vi.fn();
    const TestComponent = () => <ThrowError shouldThrow={true} />;
    
    const WrappedComponent = withSafeIsland(TestComponent, { 
      onError,
      compactErrorFallback: false 
    });
    
    render(<WrappedComponent />);
    
    expect(onError).toHaveBeenCalled();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('sets correct display name', () => {
    const TestComponent = () => <div>Test</div>;
    TestComponent.displayName = 'TestComponent';
    
    const WrappedComponent = withSafeIsland(TestComponent);
    
    expect(WrappedComponent.displayName).toBe('withSafeIsland(TestComponent)');
  });
});

describe('useIslandError', () => {
  it('manages error state correctly', () => {
    let errorHook: any;
    
    const TestComponent = () => {
      errorHook = useIslandError();
      return (
        <div>
          <span>Has error: {errorHook.hasError.toString()}</span>
          <span>Error: {errorHook.error?.message || 'none'}</span>
          <button onClick={() => errorHook.handleError(new Error('Test error'))}>
            Trigger Error
          </button>
          <button onClick={errorHook.resetError}>Reset Error</button>
        </div>
      );
    };
    
    render(<TestComponent />);
    
    expect(screen.getByText('Has error: false')).toBeInTheDocument();
    expect(screen.getByText('Error: none')).toBeInTheDocument();
    
    // Trigger error
    fireEvent.click(screen.getByText('Trigger Error'));
    
    expect(screen.getByText('Has error: true')).toBeInTheDocument();
    expect(screen.getByText('Error: Test error')).toBeInTheDocument();
    
    // Reset error
    fireEvent.click(screen.getByText('Reset Error'));
    
    expect(screen.getByText('Has error: false')).toBeInTheDocument();
    expect(screen.getByText('Error: none')).toBeInTheDocument();
  });

  it('tryAction handles successful actions', async () => {
    let errorHook: any;
    let result: any;
    
    const TestComponent = () => {
      errorHook = useIslandError();
      
      const handleTryAction = async () => {
        result = await errorHook.tryAction(() => 'success');
      };
      
      return (
        <div>
          <button onClick={handleTryAction}>Try Action</button>
          <span>Result: {result || 'none'}</span>
        </div>
      );
    };
    
    render(<TestComponent />);
    
    fireEvent.click(screen.getByText('Try Action'));
    
    await waitFor(() => {
      expect(screen.getByText('Result: success')).toBeInTheDocument();
    });
  });

  it('tryAction handles failed actions', async () => {
    let errorHook: any;
    let result: any;
    
    const TestComponent = () => {
      errorHook = useIslandError();
      
      const handleTryAction = async () => {
        result = await errorHook.tryAction(
          () => { throw new Error('Action failed'); },
          'fallback'
        );
      };
      
      return (
        <div>
          <button onClick={handleTryAction}>Try Action</button>
          <span>Result: {result || 'none'}</span>
          <span>Has error: {errorHook.hasError.toString()}</span>
        </div>
      );
    };
    
    render(<TestComponent />);
    
    fireEvent.click(screen.getByText('Try Action'));
    
    await waitFor(() => {
      expect(screen.getByText('Result: fallback')).toBeInTheDocument();
      expect(screen.getByText('Has error: true')).toBeInTheDocument();
    });
  });

  it('tryAction resets error on successful retry', async () => {
    let errorHook: any;
    let shouldFail = true;
    
    const TestComponent = () => {
      errorHook = useIslandError();
      
      const handleTryAction = async () => {
        await errorHook.tryAction(() => {
          if (shouldFail) {
            throw new Error('Action failed');
          }
          return 'success';
        });
      };
      
      return (
        <div>
          <button onClick={handleTryAction}>Try Action</button>
          <button onClick={() => { shouldFail = false; }}>Fix Action</button>
          <span>Has error: {errorHook.hasError.toString()}</span>
        </div>
      );
    };
    
    render(<TestComponent />);
    
    // First attempt should fail
    fireEvent.click(screen.getByText('Try Action'));
    
    await waitFor(() => {
      expect(screen.getByText('Has error: true')).toBeInTheDocument();
    });
    
    // Fix the action and try again
    fireEvent.click(screen.getByText('Fix Action'));
    fireEvent.click(screen.getByText('Try Action'));
    
    await waitFor(() => {
      expect(screen.getByText('Has error: false')).toBeInTheDocument();
    });
  });
});

describe('IslandErrorDisplay', () => {
  it('renders compact error display', () => {
    render(
      <IslandErrorDisplay
        compact={true}
        title="Compact error"
        showRetry={true}
        onRetry={vi.fn()}
      />
    );
    
    expect(screen.getByText('Compact error')).toBeInTheDocument();
    expect(screen.getByText('⚠️')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('renders full error display', () => {
    render(
      <IslandErrorDisplay
        compact={false}
        title="Full error"
        description="This is a full error description"
        showRetry={true}
        onRetry={vi.fn()}
      />
    );
    
    expect(screen.getByText('Full error')).toBeInTheDocument();
    expect(screen.getByText('This is a full error description')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('shows error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    const error = new Error('Test error with stack');
    error.stack = 'Error: Test error\n    at TestComponent';
    
    render(
      <IslandErrorDisplay
        error={error}
        compact={false}
      />
    );
    
    expect(screen.getByText('Error Details')).toBeInTheDocument();
    expect(screen.getByText('Error: Test error with stack')).toBeInTheDocument();
    
    process.env.NODE_ENV = originalEnv;
  });

  it('calls onRetry when retry button is clicked', () => {
    const onRetry = vi.fn();
    
    render(
      <IslandErrorDisplay
        compact={false}
        showRetry={true}
        onRetry={onRetry}
      />
    );
    
    fireEvent.click(screen.getByText('Try Again'));
    
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('hides retry button when showRetry is false', () => {
    render(
      <IslandErrorDisplay
        compact={false}
        showRetry={false}
      />
    );
    
    expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
  });

  it('uses default title and description', () => {
    render(<IslandErrorDisplay compact={false} />);
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('This section encountered an error and couldn\'t be displayed.')).toBeInTheDocument();
  });
});
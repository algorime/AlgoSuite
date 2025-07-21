import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Island } from './Island.js';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  isolateError?: boolean;
  showErrorDetails?: boolean;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

/**
 * Error boundary component that catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 * 
 * Specifically designed for Island components with graceful degradation.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to console and external error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call the onError callback if provided
    this.props.onError?.(error, errorInfo);

    // Auto-reset after 5 seconds if isolateError is true
    if (this.props.isolateError) {
      this.resetTimeoutId = window.setTimeout(() => {
        this.resetErrorBoundary();
      }, 5000);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetOnPropsChange, resetKeys } = this.props;
    const { hasError } = this.state;

    // Reset error boundary when resetKeys change
    if (hasError && resetOnPropsChange && resetKeys) {
      const prevResetKeys = prevProps.resetKeys || [];
      const hasResetKeyChanged = resetKeys.some(
        (resetKey, idx) => prevResetKeys[idx] !== resetKey
      );

      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
      this.resetTimeoutId = null;
    }
    
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
    });
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, showErrorDetails = false } = this.props;

    if (hasError) {
      // Custom fallback UI provided
      if (fallback) {
        return fallback;
      }

      // Default fallback UI with Island styling
      return (
        <Island
          variant="danger"
          elevation="low"
          size="md"
          ariaLabel="Error occurred"
          role="alert"
          className="error-boundary-fallback"
        >
          <div className="error-boundary-content">
            <div className="error-boundary-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            
            <div className="error-boundary-message">
              <h3 className="error-boundary-title">Something went wrong</h3>
              <p className="error-boundary-description">
                This component encountered an error and couldn't be displayed properly.
              </p>
              
              {showErrorDetails && error && (
                <details className="error-boundary-details">
                  <summary>Error Details</summary>
                  <div className="error-boundary-error-info">
                    <p><strong>Error:</strong> {error.message}</p>
                    {error.stack && (
                      <pre className="error-boundary-stack">
                        <code>{error.stack}</code>
                      </pre>
                    )}
                    {errorInfo && errorInfo.componentStack && (
                      <div className="error-boundary-component-stack">
                        <p><strong>Component Stack:</strong></p>
                        <pre>
                          <code>{errorInfo.componentStack}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
              
              <div className="error-boundary-actions">
                <button
                  onClick={this.resetErrorBoundary}
                  className="error-boundary-retry-button"
                  type="button"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </Island>
      );
    }

    return children;
  }
}

/**
 * Hook-based error boundary for functional components
 */
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Error caught by useErrorHandler:', error, errorInfo);
    
    // In a real application, you might want to send this to an error reporting service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  };
}

/**
 * Higher-order component that wraps a component with an error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

/**
 * Specialized error boundary for Island components
 */
export function IslandErrorBoundary({ 
  children, 
  islandProps = {},
  ...errorBoundaryProps 
}: ErrorBoundaryProps & { 
  islandProps?: Partial<React.ComponentProps<typeof Island>> 
}) {
  return (
    <ErrorBoundary
      {...errorBoundaryProps}
      fallback={
        <Island
          variant="danger"
          elevation="low"
          size="sm"
          ariaLabel="Component error"
          role="alert"
          {...islandProps}
          className={`island-error-fallback ${islandProps.className || ''}`}
        >
          <div className="island-error-content">
            <span className="island-error-icon" aria-hidden="true">⚠️</span>
            <span className="island-error-text">
              Unable to load this section
            </span>
          </div>
        </Island>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
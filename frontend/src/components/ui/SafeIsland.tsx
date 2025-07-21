import React from 'react';
import { Island, IslandProps } from './Island.js';
import { ErrorBoundary, IslandErrorBoundary } from './ErrorBoundary.js';

/**
 * Enhanced Island component with built-in error boundary protection
 * and graceful degradation support
 */
export interface SafeIslandProps extends IslandProps {
  /** Whether to use the compact error fallback */
  compactErrorFallback?: boolean;
  /** Custom error fallback component */
  errorFallback?: React.ReactNode;
  /** Whether to show error details in development */
  showErrorDetails?: boolean;
  /** Callback when an error occurs */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /** Whether to auto-retry after errors */
  autoRetry?: boolean;
  /** Keys that trigger error boundary reset when changed */
  resetKeys?: Array<string | number>;
  /** Whether to isolate errors to this island only */
  isolateError?: boolean;
}

/**
 * SafeIsland wraps the base Island component with error boundary protection
 * and provides graceful degradation for older browsers
 */
export function SafeIsland({
  compactErrorFallback = true,
  errorFallback,
  showErrorDetails = process.env.NODE_ENV === 'development',
  onError,
  autoRetry = false,
  resetKeys,
  isolateError = true,
  children,
  ...islandProps
}: SafeIslandProps) {
  const handleError = React.useCallback((error: Error, errorInfo: React.ErrorInfo) => {
    // Log error for debugging
    console.error('SafeIsland caught error:', error, errorInfo);
    
    // Call custom error handler if provided
    onError?.(error, errorInfo);
    
    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: errorInfo });
    }
  }, [onError]);

  if (compactErrorFallback) {
    return (
      <IslandErrorBoundary
        onError={handleError}
        isolateError={isolateError}
        resetOnPropsChange={!!resetKeys}
        resetKeys={resetKeys}
        islandProps={islandProps}
      >
        <Island {...islandProps}>
          {children}
        </Island>
      </IslandErrorBoundary>
    );
  }

  return (
    <ErrorBoundary
      onError={handleError}
      isolateError={isolateError}
      resetOnPropsChange={!!resetKeys}
      resetKeys={resetKeys}
      showErrorDetails={showErrorDetails}
      fallback={errorFallback}
    >
      <Island {...islandProps}>
        {children}
      </Island>
    </ErrorBoundary>
  );
}

/**
 * Higher-order component that wraps any component with SafeIsland
 */
export function withSafeIsland<P extends object>(
  Component: React.ComponentType<P>,
  islandProps?: Partial<SafeIslandProps>
) {
  const WrappedComponent = (props: P) => (
    <SafeIsland {...islandProps}>
      <Component {...props} />
    </SafeIsland>
  );

  WrappedComponent.displayName = `withSafeIsland(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

/**
 * Hook for handling errors within island components
 */
export function useIslandError() {
  const [error, setError] = React.useState<Error | null>(null);
  const [hasError, setHasError] = React.useState(false);

  const handleError = React.useCallback((error: Error) => {
    setError(error);
    setHasError(true);
    console.error('Island error:', error);
  }, []);

  const resetError = React.useCallback(() => {
    setError(null);
    setHasError(false);
  }, []);

  const tryAction = React.useCallback(async <T,>(
    action: () => Promise<T> | T,
    fallback?: T
  ): Promise<T | undefined> => {
    try {
      const result = await action();
      if (hasError) {
        resetError();
      }
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      handleError(error);
      return fallback;
    }
  }, [hasError, handleError, resetError]);

  return {
    error,
    hasError,
    handleError,
    resetError,
    tryAction,
  };
}

/**
 * Component for displaying error states within islands
 */
export interface IslandErrorDisplayProps {
  error?: Error | null;
  title?: string;
  description?: string;
  showRetry?: boolean;
  onRetry?: () => void;
  compact?: boolean;
}

export function IslandErrorDisplay({
  error,
  title = 'Something went wrong',
  description = 'This section encountered an error and couldn\'t be displayed.',
  showRetry = true,
  onRetry,
  compact = false,
}: IslandErrorDisplayProps) {
  if (compact) {
    return (
      <div className="island-error-content">
        <span className="island-error-icon" aria-hidden="true">⚠️</span>
        <span className="island-error-text">
          {title}
        </span>
        {showRetry && onRetry && (
          <button
            onClick={onRetry}
            className="ml-2 text-sm underline hover:no-underline"
            type="button"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
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
        <h3 className="error-boundary-title">{title}</h3>
        <p className="error-boundary-description">{description}</p>
        
        {error && process.env.NODE_ENV === 'development' && (
          <details className="error-boundary-details">
            <summary>Error Details</summary>
            <div className="error-boundary-error-info">
              <p><strong>Error:</strong> {error.message}</p>
              {error.stack && (
                <pre className="error-boundary-stack">
                  <code>{error.stack}</code>
                </pre>
              )}
            </div>
          </details>
        )}
        
        {showRetry && onRetry && (
          <div className="error-boundary-actions">
            <button
              onClick={onRetry}
              className="error-boundary-retry-button"
              type="button"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SafeIsland;
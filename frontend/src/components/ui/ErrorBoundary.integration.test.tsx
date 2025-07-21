import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SafeIsland } from './SafeIsland.js';
import { ErrorBoundary } from './ErrorBoundary.js';
import { initializeProgressiveEnhancement } from '../../utils/progressiveEnhancement.js';

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
});

// Mock the useTheme hook to avoid ThemeProvider dependency
vi.mock('../../hooks/useTheme.js', () => ({
  useTheme: () => ({
    config: {
      colors: {
        background: { primary: '#ffffff', secondary: '#f8fafc' },
        island: { background: '#ffffff', border: '#e2e8f0' },
        text: { primary: '#1e293b', secondary: '#64748b' },
        interactive: { primary: '#3b82f6', hover: '#2563eb' },
      },
      spacing: {
        island: { padding: '1.5rem', margin: '1rem', gap: '1rem' },
      },
      borderRadius: { island: '0.75rem' },
      shadows: { low: '0 1px 3px rgba(0,0,0,0.1)', medium: '0 4px 6px rgba(0,0,0,0.1)', high: '0 10px 15px rgba(0,0,0,0.1)' },
      animations: { transitions: { elevation: 'all 0.3s ease' } },
    },
    resolvedTheme: 'light' as const,
  }),
}));

// Mock the useResponsive hook
vi.mock('../../hooks/useResponsive.js', () => ({
  useResponsive: () => ({
    breakpoint: 'desktop' as const,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isTouchDevice: false,
    prefersReducedMotion: false,
    prefersHighContrast: false,
  }),
  useContainerQuery: () => ({ size: 'medium' }),
  getResponsiveSpacing: () => ({ padding: '1.5rem', margin: '1rem', gap: '1rem' }),
}));

// Test component that throws an error
const ThrowError = ({ shouldThrow = false, message = 'Test error' }) => {
  if (shouldThrow) {
    throw new Error(message);
  }
  return <div>Component working normally</div>;
};

// Test component that simulates async errors
const AsyncErrorComponent = ({ shouldThrow = false }) => {
  React.useEffect(() => {
    if (shouldThrow) {
      // Simulate an async error that would be caught by error boundaries
      Promise.reject(new Error('Async error')).catch(() => {
        throw new Error('Uncaught async error');
      });
    }
  }, [shouldThrow]);
  
  return <div>Async component loaded</div>;
};

describe('Error Boundaries Integration', () => {
  beforeEach(() => {
    // Clear any existing progressive enhancement styles
    const existingStyle = document.getElementById('progressive-enhancement-fallbacks');
    if (existingStyle) {
      existingStyle.remove();
    }
  });

  it('integrates error boundaries with progressive enhancement', () => {
    // Initialize progressive enhancement
    const support = initializeProgressiveEnhancement();
    
    render(
      <SafeIsland variant="primary" size="md">
        <div>Content with progressive enhancement</div>
      </SafeIsland>
    );
    
    expect(screen.getByText('Content with progressive enhancement')).toBeInTheDocument();
    
    // Check that progressive enhancement styles were applied
    const styleElement = document.getElementById('progressive-enhancement-fallbacks');
    expect(styleElement).toBeInTheDocument();
    
    // Check that browser support classes were added
    const html = document.documentElement;
    const classes = Array.from(html.classList);
    const hasFeatureClasses = classes.some(cls => cls.startsWith('supports-') || cls.startsWith('no-'));
    expect(hasFeatureClasses).toBe(true);
  });

  it('handles errors gracefully with fallback UI', () => {
    render(
      <SafeIsland compactErrorFallback={true}>
        <ThrowError shouldThrow={true} message="Integration test error" />
      </SafeIsland>
    );
    
    expect(screen.getByText('Unable to load this section')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('provides detailed error information in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    render(
      <SafeIsland compactErrorFallback={false} showErrorDetails={true}>
        <ThrowError shouldThrow={true} message="Detailed integration error" />
      </SafeIsland>
    );
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
    
    process.env.NODE_ENV = originalEnv;
  });

  it('recovers from errors when conditions change', async () => {
    const TestComponent = () => {
      const [hasError, setHasError] = React.useState(true);
      
      return (
        <div>
          <button onClick={() => setHasError(false)}>Fix Error</button>
          <SafeIsland resetKeys={[hasError]}>
            <ThrowError shouldThrow={hasError} />
          </SafeIsland>
        </div>
      );
    };
    
    render(<TestComponent />);
    
    // Initially should show error
    expect(screen.getByText('Unable to load this section')).toBeInTheDocument();
    
    // Fix the error
    fireEvent.click(screen.getByText('Fix Error'));
    
    // Should recover and show normal content
    await waitFor(() => {
      expect(screen.getByText('Component working normally')).toBeInTheDocument();
    });
  });

  it('handles nested error boundaries correctly', () => {
    render(
      <ErrorBoundary>
        <div>
          <h2>Outer Content</h2>
          <SafeIsland>
            <div>
              <h3>Inner Content</h3>
              <ThrowError shouldThrow={true} />
            </div>
          </SafeIsland>
        </div>
      </ErrorBoundary>
    );
    
    // Outer content should still be visible
    expect(screen.getByText('Outer Content')).toBeInTheDocument();
    
    // Inner error should be contained
    expect(screen.getByText('Unable to load this section')).toBeInTheDocument();
  });

  it('maintains accessibility during error states', () => {
    render(
      <SafeIsland 
        ariaLabel="Test island"
        compactErrorFallback={false}
      >
        <ThrowError shouldThrow={true} />
      </SafeIsland>
    );
    
    const errorElement = screen.getByRole('alert');
    expect(errorElement).toBeInTheDocument();
    expect(errorElement).toHaveAttribute('aria-label', 'Error occurred');
    
    const retryButton = screen.getByText('Try Again');
    expect(retryButton).toBeInTheDocument();
    expect(retryButton.tagName).toBe('BUTTON');
  });

  it('works with different island variants during errors', () => {
    const variants = ['primary', 'secondary', 'accent', 'danger'] as const;
    
    variants.forEach(variant => {
      const { unmount } = render(
        <SafeIsland variant={variant} data-testid={`island-${variant}`}>
          <ThrowError shouldThrow={true} />
        </SafeIsland>
      );
      
      expect(screen.getByTestId(`island-${variant}`)).toBeInTheDocument();
      expect(screen.getByText('Unable to load this section')).toBeInTheDocument();
      
      unmount();
    });
  });

  it('handles multiple simultaneous errors', () => {
    render(
      <div>
        <SafeIsland data-testid="island-1">
          <ThrowError shouldThrow={true} message="Error 1" />
        </SafeIsland>
        <SafeIsland data-testid="island-2">
          <ThrowError shouldThrow={true} message="Error 2" />
        </SafeIsland>
        <SafeIsland data-testid="island-3">
          <div>Working component</div>
        </SafeIsland>
      </div>
    );
    
    // Two error messages should be present
    const errorMessages = screen.getAllByText('Unable to load this section');
    expect(errorMessages).toHaveLength(2);
    
    // Working component should still be visible
    expect(screen.getByText('Working component')).toBeInTheDocument();
  });

  it('preserves island styling during error states', () => {
    render(
      <SafeIsland 
        variant="accent" 
        size="lg" 
        elevation="high"
        className="custom-class"
        data-testid="error-island"
      >
        <ThrowError shouldThrow={true} />
      </SafeIsland>
    );
    
    const errorIsland = screen.getByTestId('error-island');
    expect(errorIsland).toBeInTheDocument();
    expect(errorIsland).toHaveAttribute('variant', 'danger'); // Error state overrides variant
    expect(errorIsland).toHaveAttribute('elevation', 'low'); // Error state uses low elevation
    expect(errorIsland).toHaveClass('island-error-fallback');
  });

  it('integrates with progressive enhancement fallbacks', () => {
    // Mock CSS.supports to return false for some features
    const originalCSS = window.CSS;
    window.CSS = {
      ...originalCSS,
      supports: vi.fn().mockReturnValue(false),
    };
    
    initializeProgressiveEnhancement();
    
    render(
      <SafeIsland>
        <div>Content with fallback styles</div>
      </SafeIsland>
    );
    
    expect(screen.getByText('Content with fallback styles')).toBeInTheDocument();
    
    // Check that fallback styles were applied
    const styleElement = document.getElementById('progressive-enhancement-fallbacks');
    expect(styleElement).toBeInTheDocument();
    expect(styleElement?.textContent).toContain('background-color: #ffffff');
    
    // Restore original CSS
    window.CSS = originalCSS;
  });

  it('handles errors during progressive enhancement initialization', () => {
    // Mock document to throw an error
    const originalDocument = global.document;
    const mockDocument = {
      ...originalDocument,
      createElement: vi.fn().mockImplementation(() => {
        throw new Error('DOM manipulation failed');
      }),
    };
    
    global.document = mockDocument as any;
    
    // Should not throw even if progressive enhancement fails
    expect(() => {
      render(
        <SafeIsland>
          <div>Content despite PE failure</div>
        </SafeIsland>
      );
    }).not.toThrow();
    
    expect(screen.getByText('Content despite PE failure')).toBeInTheDocument();
    
    // Restore original document
    global.document = originalDocument;
  });

  it('provides custom error callbacks for monitoring', () => {
    const errorCallback = vi.fn();
    
    render(
      <SafeIsland onError={errorCallback}>
        <ThrowError shouldThrow={true} message="Monitored error" />
      </SafeIsland>
    );
    
    expect(errorCallback).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Monitored error' }),
      expect.objectContaining({ componentStack: expect.any(String) })
    );
    
    expect(screen.getByText('Unable to load this section')).toBeInTheDocument();
  });
});

describe('Graceful Degradation Scenarios', () => {
  it('handles complete feature absence gracefully', () => {
    // Mock a very old browser environment
    const originalWindow = global.window;
    const mockWindow = {
      ...originalWindow,
      CSS: undefined,
      localStorage: undefined,
      sessionStorage: undefined,
      requestAnimationFrame: undefined,
      IntersectionObserver: undefined,
      ResizeObserver: undefined,
      matchMedia: undefined,
    };
    
    global.window = mockWindow as any;
    
    const support = initializeProgressiveEnhancement();
    
    // All features should be detected as unsupported
    expect(support.cssCustomProperties).toBe(false);
    expect(support.localStorage).toBe(false);
    expect(support.requestAnimationFrame).toBe(false);
    
    // Component should still render
    render(
      <SafeIsland>
        <div>Works in old browsers</div>
      </SafeIsland>
    );
    
    expect(screen.getByText('Works in old browsers')).toBeInTheDocument();
    
    // Restore original window
    global.window = originalWindow;
  });

  it('provides appropriate fallbacks for missing APIs', () => {
    const support = {
      cssCustomProperties: false,
      localStorage: false,
      requestAnimationFrame: false,
      intersectionObserver: false,
      resizeObserver: false,
      matchMedia: false,
      containerQueries: false,
      cssGrid: false,
      flexbox: false,
      transforms3d: false,
      transitions: false,
      animations: false,
      mutationObserver: false,
      sessionStorage: false,
    };
    
    // Apply fallback styles
    const fallbackStyles = document.createElement('style');
    fallbackStyles.textContent = `
      .island { background: white; border: 1px solid #ccc; padding: 1rem; }
      .no-flexbox .island-layout-compact { display: block; }
      .no-cssGrid .grid-cols-2 { display: block; }
    `;
    document.head.appendChild(fallbackStyles);
    
    render(
      <div className="no-flexbox no-cssGrid">
        <SafeIsland className="island-layout-compact">
          <div>Fallback layout content</div>
        </SafeIsland>
      </div>
    );
    
    expect(screen.getByText('Fallback layout content')).toBeInTheDocument();
    
    // Clean up
    document.head.removeChild(fallbackStyles);
  });
});
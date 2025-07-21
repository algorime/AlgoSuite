import React, { useState } from 'react';
import { SafeIsland } from './SafeIsland.js';
import { ErrorBoundary } from './ErrorBoundary.js';
import { Island } from './Island.js';

/**
 * Demo component showing error boundaries and graceful degradation in action
 */
export function ErrorBoundaryDemo() {
  const [triggerError, setTriggerError] = useState(false);
  const [errorType, setErrorType] = useState<'render' | 'async'>('render');
  const [resetKey, setResetKey] = useState(0);

  // Component that throws an error for demonstration
  const ErrorComponent = () => {
    if (triggerError && errorType === 'render') {
      throw new Error('Demonstration render error - this is intentional!');
    }
    
    React.useEffect(() => {
      if (triggerError && errorType === 'async') {
        setTimeout(() => {
          console.error('Demonstration async error - this would be caught by error monitoring');
        }, 100);
      }
    }, []);

    return (
      <div className="p-4 bg-green-50 rounded">
        <h4 className="text-green-800 font-semibold">✅ Component Working</h4>
        <p className="text-green-700">This component is functioning normally without any errors.</p>
      </div>
    );
  };

  const handleTriggerError = (type: 'render' | 'async') => {
    setErrorType(type);
    setTriggerError(true);
    
    // Auto-reset after 3 seconds for demonstration
    setTimeout(() => {
      setTriggerError(false);
      setResetKey(k => k + 1);
    }, 3000);
  };

  const handleReset = () => {
    setTriggerError(false);
    setResetKey(k => k + 1);
  };

  return (
    <div className="error-boundary-demo space-y-6">
      <Island variant="primary" size="lg">
        <h2 className="text-2xl font-bold mb-4">Error Boundary & Graceful Degradation Demo</h2>
        <p className="text-gray-600 mb-4">
          This demo shows how Islands UI handles errors gracefully and provides fallbacks for older browsers.
        </p>
        
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => handleTriggerError('render')}
            disabled={triggerError}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            Trigger Render Error
          </button>
          <button
            onClick={() => handleTriggerError('async')}
            disabled={triggerError}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50 transition-colors"
          >
            Trigger Async Error
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Reset Demo
          </button>
        </div>
      </Island>

      {/* SafeIsland with Compact Error Fallback */}
      <Island variant="secondary" size="md">
        <h3 className="text-lg font-semibold mb-3">SafeIsland with Compact Error Fallback</h3>
        <SafeIsland
          compactErrorFallback={true}
          resetKeys={[resetKey]}
          onError={(error, errorInfo) => {
            console.log('Error caught by SafeIsland:', error.message);
          }}
        >
          <ErrorComponent />
        </SafeIsland>
      </Island>

      {/* SafeIsland with Full Error Fallback */}
      <Island variant="accent" size="md">
        <h3 className="text-lg font-semibold mb-3">SafeIsland with Full Error Fallback</h3>
        <SafeIsland
          compactErrorFallback={false}
          showErrorDetails={true}
          resetKeys={[resetKey]}
          onError={(error, errorInfo) => {
            console.log('Detailed error caught:', error.message, errorInfo);
          }}
        >
          <ErrorComponent />
        </SafeIsland>
      </Island>

      {/* Standard ErrorBoundary */}
      <Island variant="secondary" size="md">
        <h3 className="text-lg font-semibold mb-3">Standard ErrorBoundary</h3>
        <ErrorBoundary
          resetKeys={[resetKey]}
          showErrorDetails={true}
          onError={(error, errorInfo) => {
            console.log('Standard ErrorBoundary caught:', error.message);
          }}
        >
          <ErrorComponent />
        </ErrorBoundary>
      </Island>

      {/* Nested Error Boundaries */}
      <Island variant="primary" size="md">
        <h3 className="text-lg font-semibold mb-3">Nested Error Boundaries</h3>
        <p className="text-gray-600 mb-4">
          This shows how errors are isolated to specific components while keeping the rest of the UI functional.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SafeIsland size="sm" resetKeys={[resetKey]}>
            <ErrorComponent />
          </SafeIsland>
          
          <SafeIsland size="sm">
            <div className="p-4 bg-blue-50 rounded">
              <h4 className="text-blue-800 font-semibold">🛡️ Protected Component</h4>
              <p className="text-blue-700">This component remains unaffected by errors in other islands.</p>
            </div>
          </SafeIsland>
        </div>
      </Island>

      {/* Progressive Enhancement Demo */}
      <Island variant="accent" size="md">
        <h3 className="text-lg font-semibold mb-3">Progressive Enhancement Features</h3>
        <div className="space-y-4">
          <div className="p-4 border rounded" style={{
            backgroundColor: 'var(--color-island-bg, #ffffff)',
            borderColor: 'var(--color-island-border, #e2e8f0)',
            color: 'var(--color-text-primary, #1e293b)'
          }}>
            <h4 className="font-semibold">CSS Custom Properties</h4>
            <p>This box uses CSS custom properties with fallback values for older browsers.</p>
          </div>
          
          <div className="island-layout-compact">
            <div className="p-2 bg-purple-100 rounded">Flexbox Item 1</div>
            <div className="p-2 bg-pink-100 rounded">Flexbox Item 2</div>
            <div className="p-2 bg-indigo-100 rounded">Flexbox Item 3</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-100 rounded">CSS Grid Item 1</div>
            <div className="p-4 bg-yellow-100 rounded">CSS Grid Item 2</div>
            <div className="p-4 bg-red-100 rounded">CSS Grid Item 3</div>
          </div>
        </div>
      </Island>

      {/* Browser Support Information */}
      <Island variant="secondary" size="md">
        <h3 className="text-lg font-semibold mb-3">Browser Support Detection</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>CSS Custom Properties: <span className="font-mono">{CSS.supports('color', 'var(--test)') ? '✅' : '❌'}</span></div>
          <div>CSS Grid: <span className="font-mono">{CSS.supports('display', 'grid') ? '✅' : '❌'}</span></div>
          <div>Flexbox: <span className="font-mono">{CSS.supports('display', 'flex') ? '✅' : '❌'}</span></div>
          <div>3D Transforms: <span className="font-mono">{CSS.supports('transform', 'translateZ(0)') ? '✅' : '❌'}</span></div>
          <div>Local Storage: <span className="font-mono">{'localStorage' in window ? '✅' : '❌'}</span></div>
          <div>Intersection Observer: <span className="font-mono">{'IntersectionObserver' in window ? '✅' : '❌'}</span></div>
        </div>
      </Island>

      {/* Status Information */}
      <Island variant="primary" size="sm">
        <div className="text-center">
          <p className="text-sm text-gray-600">
            {triggerError ? (
              <span className="text-red-600">⚠️ Error triggered - components will recover automatically</span>
            ) : (
              <span className="text-green-600">✅ All components functioning normally</span>
            )}
          </p>
        </div>
      </Island>
    </div>
  );
}

export default ErrorBoundaryDemo;
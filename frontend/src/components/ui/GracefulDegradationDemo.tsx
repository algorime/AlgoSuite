import React, { useState, useEffect } from 'react';
import { SafeIsland } from './SafeIsland.js';
import { Island } from './Island.js';
import { detectBrowserSupport, BrowserSupport } from '../../utils/progressiveEnhancement.js';

/**
 * Demo component to test graceful degradation scenarios
 */
export function GracefulDegradationDemo() {
  const [support, setSupport] = useState<BrowserSupport | null>(null);
  const [forceError, setForceError] = useState(false);
  const [errorType, setErrorType] = useState<'render' | 'async' | 'boundary'>('render');

  useEffect(() => {
    setSupport(detectBrowserSupport());
  }, []);

  // Component that throws an error for testing
  const ErrorComponent = () => {
    if (forceError && errorType === 'render') {
      throw new Error('Intentional render error for testing');
    }
    
    useEffect(() => {
      if (forceError && errorType === 'async') {
        setTimeout(() => {
          throw new Error('Intentional async error for testing');
        }, 100);
      }
    }, []);

    return (
      <div>
        <h4>This component works normally</h4>
        <p>No errors here when forceError is false.</p>
      </div>
    );
  };

  const handleAsyncError = () => {
    setErrorType('async');
    setForceError(true);
    
    // Reset after demonstration
    setTimeout(() => {
      setForceError(false);
    }, 3000);
  };

  const handleRenderError = () => {
    setErrorType('render');
    setForceError(true);
    
    // Reset after demonstration
    setTimeout(() => {
      setForceError(false);
    }, 3000);
  };

  if (!support) {
    return (
      <Island variant="secondary" size="md">
        <div>Loading browser support detection...</div>
      </Island>
    );
  }

  return (
    <div className="graceful-degradation-demo">
      <Island variant="primary" size="lg" className="mb-6">
        <h2>Graceful Degradation Demo</h2>
        <p>This demo shows how the Islands UI handles errors and browser compatibility.</p>
      </Island>

      {/* Browser Support Information */}
      <Island variant="secondary" size="md" className="mb-6">
        <h3>Browser Support Detection</h3>
        <div className="grid grid-cols-2 gap-4 mt-4">
          {Object.entries(support).map(([feature, isSupported]) => (
            <div key={feature} className="flex items-center justify-between">
              <span className="capitalize">{feature.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
              <span className={`font-semibold ${isSupported ? 'text-green-600' : 'text-red-600'}`}>
                {isSupported ? '✓ Supported' : '✗ Not Supported'}
              </span>
            </div>
          ))}
        </div>
      </Island>

      {/* Error Boundary Testing */}
      <Island variant="accent" size="md" className="mb-6">
        <h3>Error Boundary Testing</h3>
        <div className="flex gap-4 mb-4">
          <button
            onClick={handleRenderError}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            disabled={forceError}
          >
            Test Render Error
          </button>
          <button
            onClick={handleAsyncError}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
            disabled={forceError}
          >
            Test Async Error
          </button>
          <button
            onClick={() => setForceError(false)}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Reset
          </button>
        </div>
        
        <SafeIsland
          variant="secondary"
          size="sm"
          compactErrorFallback={true}
          resetKeys={[forceError, errorType]}
        >
          <ErrorComponent />
        </SafeIsland>
      </Island>

      {/* Progressive Enhancement Examples */}
      <Island variant="primary" size="md" className="mb-6">
        <h3>Progressive Enhancement Examples</h3>
        
        {/* CSS Custom Properties Test */}
        <div className="mb-4">
          <h4>CSS Custom Properties</h4>
          <div 
            className="p-4 rounded"
            style={{
              backgroundColor: 'var(--color-island-bg, #ffffff)',
              border: '1px solid var(--color-island-border, #e2e8f0)',
              color: 'var(--color-text-primary, #1e293b)'
            }}
          >
            This box uses CSS custom properties with fallbacks
          </div>
        </div>

        {/* Flexbox Test */}
        <div className="mb-4">
          <h4>Flexbox Layout</h4>
          <div className="island-layout-compact">
            <div className="p-2 bg-blue-100 rounded">Item 1</div>
            <div className="p-2 bg-green-100 rounded">Item 2</div>
            <div className="p-2 bg-yellow-100 rounded">Item 3</div>
          </div>
        </div>

        {/* CSS Grid Test */}
        <div className="mb-4">
          <h4>CSS Grid Layout</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-purple-100 rounded">Grid Item 1</div>
            <div className="p-4 bg-pink-100 rounded">Grid Item 2</div>
            <div className="p-4 bg-indigo-100 rounded">Grid Item 3</div>
          </div>
        </div>

        {/* Container Queries Test */}
        {support.containerQueries && (
          <div className="mb-4">
            <h4>Container Queries (Supported)</h4>
            <div className="container-queries">
              <Island size="md" className="resize-x overflow-auto min-w-0">
                <p>This island uses container queries for responsive sizing. Try resizing this container.</p>
              </Island>
            </div>
          </div>
        )}

        {!support.containerQueries && (
          <div className="mb-4">
            <h4>Container Queries (Fallback)</h4>
            <div className="no-containerQueries">
              <Island size="md">
                <p>This island uses media query fallbacks since container queries are not supported.</p>
              </Island>
            </div>
          </div>
        )}
      </Island>

      {/* Accessibility Features */}
      <Island variant="secondary" size="md" className="mb-6">
        <h3>Accessibility Features</h3>
        <div className="space-y-4">
          <Island
            interactive
            ariaLabel="Interactive island example"
            ariaDescription="This island demonstrates keyboard navigation and screen reader support"
            onClick={() => alert('Island clicked!')}
            size="sm"
          >
            <p>Interactive Island (click me or press Enter/Space when focused)</p>
          </Island>

          <Island
            landmark
            landmarkRole="region"
            ariaLabel="Important content region"
            size="sm"
          >
            <p>Landmark Island (marked as important region for screen readers)</p>
          </Island>

          <Island
            focusManagement={{
              focusable: true,
              trapFocus: true
            }}
            size="sm"
          >
            <p>Focus Management Island</p>
            <button>Button 1</button>
            <button>Button 2</button>
            <input type="text" placeholder="Input field" />
          </Island>
        </div>
      </Island>

      {/* Performance Considerations */}
      <Island variant="accent" size="md">
        <h3>Performance Considerations</h3>
        <div className="space-y-2">
          <p><strong>Hardware Acceleration:</strong> {support.transforms3d ? 'Enabled' : 'Disabled'}</p>
          <p><strong>Smooth Animations:</strong> {support.transitions && support.animations ? 'Enabled' : 'Fallback'}</p>
          <p><strong>Reduced Motion:</strong> {window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'Respected' : 'Normal'}</p>
          <p><strong>Touch Optimized:</strong> {'ontouchstart' in window ? 'Yes' : 'No'}</p>
        </div>
      </Island>
    </div>
  );
}

export default GracefulDegradationDemo;
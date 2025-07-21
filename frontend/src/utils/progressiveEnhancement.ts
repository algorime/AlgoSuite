/**
 * Progressive Enhancement utilities for graceful degradation
 * Provides fallbacks for modern CSS features and browser APIs
 */

export interface BrowserSupport {
  containerQueries: boolean;
  cssCustomProperties: boolean;
  cssGrid: boolean;
  flexbox: boolean;
  transforms3d: boolean;
  transitions: boolean;
  animations: boolean;
  intersectionObserver: boolean;
  resizeObserver: boolean;
  mutationObserver: boolean;
  localStorage: boolean;
  sessionStorage: boolean;
  matchMedia: boolean;
  requestAnimationFrame: boolean;
}

/**
 * Detect browser support for various features
 */
export function detectBrowserSupport(): BrowserSupport {
  const support: BrowserSupport = {
    containerQueries: false,
    cssCustomProperties: false,
    cssGrid: false,
    flexbox: false,
    transforms3d: false,
    transitions: false,
    animations: false,
    intersectionObserver: false,
    resizeObserver: false,
    mutationObserver: false,
    localStorage: false,
    sessionStorage: false,
    matchMedia: false,
    requestAnimationFrame: false,
  };

  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return support;
  }

  try {
    // Container Queries support
    support.containerQueries = CSS.supports('container-type: inline-size');
  } catch {
    support.containerQueries = false;
  }

  try {
    // CSS Custom Properties support
    support.cssCustomProperties = CSS.supports('color', 'var(--test)');
  } catch {
    support.cssCustomProperties = false;
  }

  try {
    // CSS Grid support
    support.cssGrid = CSS.supports('display', 'grid');
  } catch {
    support.cssGrid = false;
  }

  try {
    // Flexbox support
    support.flexbox = CSS.supports('display', 'flex');
  } catch {
    support.flexbox = false;
  }

  try {
    // 3D Transforms support
    support.transforms3d = CSS.supports('transform', 'translateZ(0)');
  } catch {
    support.transforms3d = false;
  }

  try {
    // CSS Transitions support
    support.transitions = CSS.supports('transition', 'all 0.3s ease');
  } catch {
    support.transitions = false;
  }

  try {
    // CSS Animations support
    support.animations = CSS.supports('animation', 'test 1s ease');
  } catch {
    support.animations = false;
  }

  // JavaScript API support
  support.intersectionObserver = 'IntersectionObserver' in window;
  support.resizeObserver = 'ResizeObserver' in window;
  support.mutationObserver = 'MutationObserver' in window;
  support.matchMedia = 'matchMedia' in window;
  support.requestAnimationFrame = 'requestAnimationFrame' in window;

  // Storage support
  try {
    const testKey = '__test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    support.localStorage = true;
  } catch {
    support.localStorage = false;
  }

  try {
    const testKey = '__test__';
    sessionStorage.setItem(testKey, 'test');
    sessionStorage.removeItem(testKey);
    support.sessionStorage = true;
  } catch {
    support.sessionStorage = false;
  }

  return support;
}

/**
 * Get fallback CSS values for unsupported features
 */
export function getFallbackStyles(support: BrowserSupport) {
  const fallbacks: Record<string, string> = {};

  // CSS Custom Properties fallbacks
  if (!support.cssCustomProperties) {
    fallbacks['--color-bg-primary'] = '#ffffff';
    fallbacks['--color-bg-secondary'] = '#f8fafc';
    fallbacks['--color-island-bg'] = '#ffffff';
    fallbacks['--color-island-border'] = '#e2e8f0';
    fallbacks['--color-text-primary'] = '#1e293b';
    fallbacks['--color-text-secondary'] = '#64748b';
    fallbacks['--color-interactive-primary'] = '#3b82f6';
    fallbacks['--color-interactive-hover'] = '#2563eb';
    fallbacks['--border-radius-island'] = '0.75rem';
    fallbacks['--shadow-low'] = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
    fallbacks['--shadow-medium'] = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
    fallbacks['--shadow-high'] = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
    fallbacks['--spacing-island-padding'] = '1.5rem';
    fallbacks['--spacing-island-margin'] = '1rem';
    fallbacks['--transition-duration-fast'] = '150ms';
    fallbacks['--transition-duration-normal'] = '300ms';
    fallbacks['--transition-easing'] = 'cubic-bezier(0.4, 0, 0.2, 1)';
  }

  return fallbacks;
}

/**
 * Apply fallback styles to the document
 */
export function applyFallbackStyles(support: BrowserSupport) {
  if (typeof document === 'undefined') return;

  const fallbacks = getFallbackStyles(support);
  const style = document.createElement('style');
  style.id = 'progressive-enhancement-fallbacks';
  
  let css = '';

  // CSS Custom Properties fallbacks
  if (!support.cssCustomProperties) {
    css += `
      /* Fallback styles for browsers without CSS custom properties support */
      body {
        background-color: ${fallbacks['--color-bg-primary']};
        color: ${fallbacks['--color-text-primary']};
      }
      
      .island {
        background-color: ${fallbacks['--color-island-bg']};
        border: 1px solid ${fallbacks['--color-island-border']};
        border-radius: ${fallbacks['--border-radius-island']};
        padding: ${fallbacks['--spacing-island-padding']};
        margin: ${fallbacks['--spacing-island-margin']};
        box-shadow: ${fallbacks['--shadow-medium']};
      }
      
      .island-elevation-low {
        box-shadow: ${fallbacks['--shadow-low']};
      }
      
      .island-elevation-high {
        box-shadow: ${fallbacks['--shadow-high']};
      }
      
      .island:hover {
        box-shadow: ${fallbacks['--shadow-high']};
      }
    `;
  }

  // Flexbox fallbacks
  if (!support.flexbox) {
    css += `
      /* Fallback for browsers without flexbox support */
      .island-layout-compact,
      .island-layout-spacious,
      .island-layout-minimal {
        display: block;
      }
      
      .island-layout-compact > * {
        margin-bottom: 0.5rem;
      }
      
      .island-layout-spacious > * {
        margin-bottom: 1rem;
      }
      
      .island-layout-minimal > * {
        margin-bottom: 0.25rem;
      }
    `;
  }

  // CSS Grid fallbacks
  if (!support.cssGrid) {
    css += `
      /* Fallback for browsers without CSS Grid support */
      .grid-cols-1,
      .grid-cols-2,
      .grid-cols-3,
      .grid-cols-4,
      .grid-cols-5,
      .grid-cols-6 {
        display: block;
      }
      
      .grid-cols-2 > * {
        width: 48%;
        display: inline-block;
        vertical-align: top;
        margin-right: 2%;
      }
      
      .grid-cols-3 > * {
        width: 31%;
        display: inline-block;
        vertical-align: top;
        margin-right: 2%;
      }
      
      .grid-cols-4 > * {
        width: 23%;
        display: inline-block;
        vertical-align: top;
        margin-right: 2%;
      }
    `;
  }

  // Transitions fallbacks
  if (!support.transitions) {
    css += `
      /* Remove transitions for browsers that don't support them */
      .island,
      .island:hover,
      .interactive-hover,
      .button-island {
        transition: none !important;
      }
    `;
  }

  // 3D Transforms fallbacks
  if (!support.transforms3d) {
    css += `
      /* Fallback for browsers without 3D transform support */
      .island:hover {
        transform: none;
      }
      
      .interactive-hover:hover {
        transform: none;
      }
      
      .button-island:hover {
        transform: none;
      }
    `;
  }

  // Container Queries fallbacks
  if (!support.containerQueries) {
    css += `
      /* Fallback responsive styles for browsers without container queries */
      @media (max-width: 640px) {
        .container-queries .island-size-sm { padding: 0.5rem; }
        .container-queries .island-size-md { padding: 0.75rem; }
        .container-queries .island-size-lg { padding: 1rem; }
      }
      
      @media (min-width: 641px) and (max-width: 1024px) {
        .container-queries .island-size-sm { padding: 0.75rem; }
        .container-queries .island-size-md { padding: 1rem; }
        .container-queries .island-size-lg { padding: 1.5rem; }
      }
      
      @media (min-width: 1025px) {
        .container-queries .island-size-md { padding: 1.25rem; }
        .container-queries .island-size-lg { padding: 2rem; }
        .container-queries .island-size-xl { padding: 2.5rem; }
      }
    `;
  }

  style.textContent = css;
  document.head.appendChild(style);
}

/**
 * Storage fallback for browsers without localStorage/sessionStorage
 */
export class StorageFallback {
  private data: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.data.get(key) || null;
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }

  removeItem(key: string): void {
    this.data.delete(key);
  }

  clear(): void {
    this.data.clear();
  }

  get length(): number {
    return this.data.size;
  }

  key(index: number): string | null {
    const keys = Array.from(this.data.keys());
    return keys[index] || null;
  }
}

/**
 * Get storage with fallback
 */
export function getStorage(type: 'local' | 'session', support: BrowserSupport): Storage | StorageFallback {
  if (typeof window === 'undefined') {
    return new StorageFallback();
  }
  
  if (type === 'local' && support.localStorage) {
    return window.localStorage;
  }
  
  if (type === 'session' && support.sessionStorage) {
    return window.sessionStorage;
  }
  
  return new StorageFallback();
}

/**
 * RequestAnimationFrame fallback
 */
export function getRequestAnimationFrame(support: BrowserSupport): (callback: FrameRequestCallback) => number {
  if (typeof window === 'undefined') {
    return (callback: FrameRequestCallback) => {
      return setTimeout(() => callback(Date.now()), 16) as any;
    };
  }
  
  if (support.requestAnimationFrame && window.requestAnimationFrame) {
    return window.requestAnimationFrame.bind(window);
  }
  
  return (callback: FrameRequestCallback) => {
    return window.setTimeout(() => callback(Date.now()), 16);
  };
}

/**
 * CancelAnimationFrame fallback
 */
export function getCancelAnimationFrame(support: BrowserSupport): (handle: number) => void {
  if (typeof window === 'undefined') {
    return (handle: number) => {
      clearTimeout(handle);
    };
  }
  
  if (support.requestAnimationFrame && 'cancelAnimationFrame' in window) {
    return window.cancelAnimationFrame.bind(window);
  }
  
  return (handle: number) => {
    clearTimeout(handle);
  };
}

/**
 * MatchMedia fallback
 */
export function getMatchMedia(support: BrowserSupport) {
  if (support.matchMedia) {
    return window.matchMedia.bind(window);
  }
  
  // Simple fallback that always returns false
  return (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

/**
 * Observer fallbacks
 */
export class IntersectionObserverFallback {
  constructor(
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit
  ) {
    // Fallback: immediately call callback with mock entries
    setTimeout(() => {
      callback([], this as any);
    }, 0);
  }

  observe() {}
  unobserve() {}
  disconnect() {}
}

export class ResizeObserverFallback {
  constructor(callback: ResizeObserverCallback) {
    // Fallback: use window resize event
    const handleResize = () => {
      callback([], this as any);
    };
    
    window.addEventListener('resize', handleResize);
  }

  observe() {}
  unobserve() {}
  disconnect() {}
}

/**
 * Get observer with fallback
 */
export function getIntersectionObserver(support: BrowserSupport) {
  return support.intersectionObserver ? IntersectionObserver : IntersectionObserverFallback;
}

export function getResizeObserver(support: BrowserSupport) {
  return support.resizeObserver ? ResizeObserver : ResizeObserverFallback;
}

/**
 * Initialize progressive enhancement
 */
export function initializeProgressiveEnhancement() {
  const support = detectBrowserSupport();
  
  // Apply fallback styles
  applyFallbackStyles(support);
  
  // Add browser support classes to document
  if (typeof document !== 'undefined') {
    const html = document.documentElement;
    
    Object.entries(support).forEach(([feature, isSupported]) => {
      html.classList.add(isSupported ? `supports-${feature}` : `no-${feature}`);
    });
  }
  
  return support;
}

/**
 * Graceful degradation wrapper for components
 */
export function withGracefulDegradation<P extends object>(
  Component: React.ComponentType<P>,
  fallbackComponent?: React.ComponentType<P>
) {
  return function GracefulComponent(props: P) {
    const [support, setSupport] = React.useState<BrowserSupport | null>(null);
    
    React.useEffect(() => {
      setSupport(detectBrowserSupport());
    }, []);
    
    // Show loading or fallback while detecting support
    if (!support) {
      return fallbackComponent ? React.createElement(fallbackComponent, props) : null;
    }
    
    // Use fallback component if critical features are missing
    const criticalFeaturesMissing = !support.cssCustomProperties || !support.flexbox;
    
    if (criticalFeaturesMissing && fallbackComponent) {
      return React.createElement(fallbackComponent, props);
    }
    
    return React.createElement(Component, props);
  };
}

export { detectBrowserSupport as default };
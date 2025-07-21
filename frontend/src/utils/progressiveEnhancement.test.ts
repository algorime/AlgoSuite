import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  detectBrowserSupport,
  getFallbackStyles,
  applyFallbackStyles,
  StorageFallback,
  getStorage,
  getRequestAnimationFrame,
  getCancelAnimationFrame,
  getMatchMedia,
  getIntersectionObserver,
  getResizeObserver,
  initializeProgressiveEnhancement,
  IntersectionObserverFallback,
  ResizeObserverFallback,
} from './progressiveEnhancement.js';

// Mock global objects
const mockCSS = {
  supports: vi.fn(),
};

const mockWindow = {
  CSS: mockCSS,
  IntersectionObserver: vi.fn(),
  ResizeObserver: vi.fn(),
  MutationObserver: vi.fn(),
  matchMedia: vi.fn(),
  requestAnimationFrame: vi.fn(),
  cancelAnimationFrame: vi.fn(),
  localStorage: {
    setItem: vi.fn(),
    getItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  },
  sessionStorage: {
    setItem: vi.fn(),
    getItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  },
  setTimeout: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

const mockDocument = {
  createElement: vi.fn(),
  head: {
    appendChild: vi.fn(),
  },
  documentElement: {
    classList: {
      add: vi.fn(),
    },
  },
};

// Store original globals
const originalWindow = global.window;
const originalDocument = global.document;

beforeEach(() => {
  vi.clearAllMocks();
  
  // Mock CSS.supports
  mockCSS.supports.mockImplementation((property: string, value?: string) => {
    if (property === 'container-type' && value === 'inline-size') return true;
    if (property === 'color' && value === 'var(--test)') return true;
    if (property === 'display' && value === 'grid') return true;
    if (property === 'display' && value === 'flex') return true;
    if (property === 'transform' && value === 'translateZ(0)') return true;
    if (property === 'transition' && value === 'all 0.3s ease') return true;
    if (property === 'animation' && value === 'test 1s ease') return true;
    return false;
  });

  // Mock localStorage/sessionStorage
  mockWindow.localStorage.setItem.mockImplementation(() => {});
  mockWindow.localStorage.removeItem.mockImplementation(() => {});
  mockWindow.sessionStorage.setItem.mockImplementation(() => {});
  mockWindow.sessionStorage.removeItem.mockImplementation(() => {});

  // Mock document.createElement
  const mockStyleElement = {
    id: '',
    textContent: '',
  };
  mockDocument.createElement.mockReturnValue(mockStyleElement);

  // Set up global mocks
  global.window = mockWindow as any;
  global.document = mockDocument as any;
});

afterEach(() => {
  global.window = originalWindow;
  global.document = originalDocument;
});

describe('detectBrowserSupport', () => {
  it('detects all features as supported when available', () => {
    const support = detectBrowserSupport();
    
    expect(support.containerQueries).toBe(true);
    expect(support.cssCustomProperties).toBe(true);
    expect(support.cssGrid).toBe(true);
    expect(support.flexbox).toBe(true);
    expect(support.transforms3d).toBe(true);
    expect(support.transitions).toBe(true);
    expect(support.animations).toBe(true);
    expect(support.intersectionObserver).toBe(true);
    expect(support.resizeObserver).toBe(true);
    expect(support.mutationObserver).toBe(true);
    expect(support.localStorage).toBe(true);
    expect(support.sessionStorage).toBe(true);
    expect(support.matchMedia).toBe(true);
    expect(support.requestAnimationFrame).toBe(true);
  });

  it('detects features as unsupported when not available', () => {
    // Mock CSS.supports to return false
    mockCSS.supports.mockReturnValue(false);
    
    // Remove APIs from window
    delete (mockWindow as any).IntersectionObserver;
    delete (mockWindow as any).ResizeObserver;
    delete (mockWindow as any).matchMedia;
    delete (mockWindow as any).requestAnimationFrame;
    
    const support = detectBrowserSupport();
    
    expect(support.containerQueries).toBe(false);
    expect(support.cssCustomProperties).toBe(false);
    expect(support.cssGrid).toBe(false);
    expect(support.flexbox).toBe(false);
    expect(support.transforms3d).toBe(false);
    expect(support.transitions).toBe(false);
    expect(support.animations).toBe(false);
    expect(support.intersectionObserver).toBe(false);
    expect(support.resizeObserver).toBe(false);
    expect(support.matchMedia).toBe(false);
    expect(support.requestAnimationFrame).toBe(false);
  });

  it('handles CSS.supports throwing errors', () => {
    mockCSS.supports.mockImplementation(() => {
      throw new Error('CSS.supports not available');
    });
    
    const support = detectBrowserSupport();
    
    expect(support.containerQueries).toBe(false);
    expect(support.cssCustomProperties).toBe(false);
    expect(support.cssGrid).toBe(false);
    expect(support.flexbox).toBe(false);
    expect(support.transforms3d).toBe(false);
    expect(support.transitions).toBe(false);
    expect(support.animations).toBe(false);
  });

  it('handles localStorage/sessionStorage throwing errors', () => {
    mockWindow.localStorage.setItem.mockImplementation(() => {
      throw new Error('localStorage not available');
    });
    mockWindow.sessionStorage.setItem.mockImplementation(() => {
      throw new Error('sessionStorage not available');
    });
    
    const support = detectBrowserSupport();
    
    expect(support.localStorage).toBe(false);
    expect(support.sessionStorage).toBe(false);
  });

  it('returns default support object in non-browser environment', () => {
    global.window = undefined as any;
    
    const support = detectBrowserSupport();
    
    // All features should be false in non-browser environment
    Object.values(support).forEach(value => {
      expect(value).toBe(false);
    });
  });
});

describe('getFallbackStyles', () => {
  it('returns fallback styles when CSS custom properties are not supported', () => {
    const support = {
      cssCustomProperties: false,
      containerQueries: true,
      cssGrid: true,
      flexbox: true,
      transforms3d: true,
      transitions: true,
      animations: true,
      intersectionObserver: true,
      resizeObserver: true,
      mutationObserver: true,
      localStorage: true,
      sessionStorage: true,
      matchMedia: true,
      requestAnimationFrame: true,
    };
    
    const fallbacks = getFallbackStyles(support);
    
    expect(fallbacks['--color-bg-primary']).toBe('#ffffff');
    expect(fallbacks['--color-island-bg']).toBe('#ffffff');
    expect(fallbacks['--border-radius-island']).toBe('0.75rem');
    expect(fallbacks['--shadow-medium']).toContain('rgba(0, 0, 0, 0.1)');
  });

  it('returns empty object when CSS custom properties are supported', () => {
    const support = {
      cssCustomProperties: true,
      containerQueries: true,
      cssGrid: true,
      flexbox: true,
      transforms3d: true,
      transitions: true,
      animations: true,
      intersectionObserver: true,
      resizeObserver: true,
      mutationObserver: true,
      localStorage: true,
      sessionStorage: true,
      matchMedia: true,
      requestAnimationFrame: true,
    };
    
    const fallbacks = getFallbackStyles(support);
    
    expect(Object.keys(fallbacks)).toHaveLength(0);
  });
});

describe('applyFallbackStyles', () => {
  it('creates and appends style element with fallback CSS', () => {
    const support = {
      cssCustomProperties: false,
      containerQueries: false,
      cssGrid: false,
      flexbox: false,
      transforms3d: false,
      transitions: false,
      animations: true,
      intersectionObserver: true,
      resizeObserver: true,
      mutationObserver: true,
      localStorage: true,
      sessionStorage: true,
      matchMedia: true,
      requestAnimationFrame: true,
    };
    
    applyFallbackStyles(support);
    
    expect(mockDocument.createElement).toHaveBeenCalledWith('style');
    expect(mockDocument.head.appendChild).toHaveBeenCalled();
    
    const styleElement = mockDocument.createElement.mock.results[0].value;
    expect(styleElement.id).toBe('progressive-enhancement-fallbacks');
    expect(styleElement.textContent).toContain('background-color: #ffffff');
    expect(styleElement.textContent).toContain('display: block');
    expect(styleElement.textContent).toContain('transition: none');
    expect(styleElement.textContent).toContain('transform: none');
  });

  it('does nothing in non-browser environment', () => {
    global.document = undefined as any;
    
    const support = {
      cssCustomProperties: false,
      containerQueries: true,
      cssGrid: true,
      flexbox: true,
      transforms3d: true,
      transitions: true,
      animations: true,
      intersectionObserver: true,
      resizeObserver: true,
      mutationObserver: true,
      localStorage: true,
      sessionStorage: true,
      matchMedia: true,
      requestAnimationFrame: true,
    };
    
    expect(() => applyFallbackStyles(support)).not.toThrow();
  });
});

describe('StorageFallback', () => {
  it('implements Storage interface with in-memory fallback', () => {
    const storage = new StorageFallback();
    
    expect(storage.getItem('test')).toBeNull();
    
    storage.setItem('test', 'value');
    expect(storage.getItem('test')).toBe('value');
    expect(storage.length).toBe(1);
    
    storage.removeItem('test');
    expect(storage.getItem('test')).toBeNull();
    expect(storage.length).toBe(0);
    
    storage.setItem('key1', 'value1');
    storage.setItem('key2', 'value2');
    expect(storage.key(0)).toBe('key1');
    expect(storage.key(1)).toBe('key2');
    expect(storage.key(2)).toBeNull();
    
    storage.clear();
    expect(storage.length).toBe(0);
  });
});

describe('getStorage', () => {
  it('returns localStorage when supported', () => {
    const support = { localStorage: true, sessionStorage: true } as any;
    const storage = getStorage('local', support);
    expect(storage).toBe(mockWindow.localStorage);
  });

  it('returns sessionStorage when supported', () => {
    const support = { localStorage: true, sessionStorage: true } as any;
    const storage = getStorage('session', support);
    expect(storage).toBe(mockWindow.sessionStorage);
  });

  it('returns StorageFallback when not supported', () => {
    const support = { localStorage: false, sessionStorage: false } as any;
    const localStorage = getStorage('local', support);
    const sessionStorage = getStorage('session', support);
    
    expect(localStorage).toBeInstanceOf(StorageFallback);
    expect(sessionStorage).toBeInstanceOf(StorageFallback);
  });
});

describe('getRequestAnimationFrame', () => {
  it('returns native requestAnimationFrame when supported', () => {
    const support = { requestAnimationFrame: true } as any;
    const raf = getRequestAnimationFrame(support);
    
    expect(raf).toBe(mockWindow.requestAnimationFrame);
  });

  it('returns setTimeout fallback when not supported', () => {
    const support = { requestAnimationFrame: false } as any;
    const raf = getRequestAnimationFrame(support);
    
    const callback = vi.fn();
    raf(callback);
    
    expect(mockWindow.setTimeout).toHaveBeenCalledWith(expect.any(Function), 16);
  });
});

describe('getCancelAnimationFrame', () => {
  it('returns native cancelAnimationFrame when supported', () => {
    const support = { requestAnimationFrame: true } as any;
    const caf = getCancelAnimationFrame(support);
    
    expect(caf).toBe(mockWindow.cancelAnimationFrame);
  });

  it('returns clearTimeout fallback when not supported', () => {
    const support = { requestAnimationFrame: false } as any;
    const caf = getCancelAnimationFrame(support);
    
    const clearTimeout = vi.fn();
    global.clearTimeout = clearTimeout;
    
    caf(123);
    
    expect(clearTimeout).toHaveBeenCalledWith(123);
  });
});

describe('getMatchMedia', () => {
  it('returns native matchMedia when supported', () => {
    const support = { matchMedia: true } as any;
    const mm = getMatchMedia(support);
    
    expect(mm).toBe(mockWindow.matchMedia);
  });

  it('returns fallback when not supported', () => {
    const support = { matchMedia: false } as any;
    const mm = getMatchMedia(support);
    
    const result = mm('(max-width: 768px)');
    
    expect(result.matches).toBe(false);
    expect(result.media).toBe('(max-width: 768px)');
    expect(typeof result.addListener).toBe('function');
    expect(typeof result.removeListener).toBe('function');
  });
});

describe('Observer fallbacks', () => {
  it('creates IntersectionObserver fallback', () => {
    const callback = vi.fn();
    const observer = new IntersectionObserverFallback(callback, {});
    
    expect(observer).toBeInstanceOf(IntersectionObserverFallback);
    expect(typeof observer.observe).toBe('function');
    expect(typeof observer.unobserve).toBe('function');
    expect(typeof observer.disconnect).toBe('function');
    
    // Should call callback asynchronously
    setTimeout(() => {
      expect(callback).toHaveBeenCalled();
    }, 0);
  });

  it('creates ResizeObserver fallback', () => {
    const callback = vi.fn();
    const observer = new ResizeObserverFallback(callback);
    
    expect(observer).toBeInstanceOf(ResizeObserverFallback);
    expect(typeof observer.observe).toBe('function');
    expect(typeof observer.unobserve).toBe('function');
    expect(typeof observer.disconnect).toBe('function');
  });

  it('returns native observers when supported', () => {
    const support = { intersectionObserver: true, resizeObserver: true } as any;
    
    const IntersectionObs = getIntersectionObserver(support);
    const ResizeObs = getResizeObserver(support);
    
    expect(IntersectionObs).toBe(mockWindow.IntersectionObserver);
    expect(ResizeObs).toBe(mockWindow.ResizeObserver);
  });

  it('returns fallback observers when not supported', () => {
    const support = { intersectionObserver: false, resizeObserver: false } as any;
    
    const IntersectionObs = getIntersectionObserver(support);
    const ResizeObs = getResizeObserver(support);
    
    expect(IntersectionObs).toBe(IntersectionObserverFallback);
    expect(ResizeObs).toBe(ResizeObserverFallback);
  });
});

describe('initializeProgressiveEnhancement', () => {
  it('detects support, applies styles, and adds classes', () => {
    const support = initializeProgressiveEnhancement();
    
    expect(support).toBeDefined();
    expect(mockDocument.createElement).toHaveBeenCalled();
    expect(mockDocument.head.appendChild).toHaveBeenCalled();
    expect(mockDocument.documentElement.classList.add).toHaveBeenCalled();
    
    // Check that classes were added for each feature
    const addCalls = mockDocument.documentElement.classList.add.mock.calls;
    expect(addCalls.some(call => call[0].startsWith('supports-') || call[0].startsWith('no-'))).toBe(true);
  });

  it('handles non-browser environment gracefully', () => {
    global.document = undefined as any;
    
    expect(() => initializeProgressiveEnhancement()).not.toThrow();
  });
});
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useResponsive, useContainerQuery, getResponsiveSpacing } from './useResponsive';
import { ThemeProvider } from '../contexts/ThemeContext';
import React from 'react';

// Mock theme context
const mockThemeConfig = {
  mode: 'light' as const,
  colors: {
    background: { primary: '#fff', secondary: '#f8f8f8', gradient: 'linear-gradient(...)' },
    island: { background: '#fff', border: '#e5e5e5', shadow: '0 2px 4px rgba(0,0,0,0.1)' },
    text: { primary: '#000', secondary: '#666', accent: '#007bff' },
    interactive: { primary: '#007bff', secondary: '#666', hover: '#0056b3', active: '#004085' }
  },
  spacing: {
    island: { padding: '1rem', margin: '0.5rem', gap: '0.5rem' },
    responsive: {
      mobile: { padding: '0.75rem', margin: '0.25rem', gap: '0.25rem' },
      tablet: { padding: '1rem', margin: '0.5rem', gap: '0.5rem' },
      desktop: { padding: '1.25rem', margin: '0.75rem', gap: '0.75rem' }
    }
  },
  breakpoints: {
    mobile: '640px',
    tablet: '1024px',
    desktop: '1280px',
    wide: '1536px',
    containerQueries: {
      small: '320px',
      medium: '480px',
      large: '768px',
      xlarge: '1024px'
    }
  },
  borderRadius: { island: '0.5rem', button: '0.25rem', input: '0.25rem' },
  shadows: { low: '0 1px 2px rgba(0,0,0,0.1)', medium: '0 2px 4px rgba(0,0,0,0.1)', high: '0 4px 8px rgba(0,0,0,0.1)' },
  animations: {
    duration: { fast: '150ms', normal: '300ms', slow: '500ms' },
    easing: { ease: 'ease', easeIn: 'ease-in', easeOut: 'ease-out', easeInOut: 'ease-in-out' },
    transitions: { island: 'all 300ms ease', theme: 'all 500ms ease', hover: 'all 150ms ease', elevation: 'all 300ms ease' }
  }
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  React.createElement(ThemeProvider, { 
    value: { 
      theme: 'light', 
      resolvedTheme: 'light', 
      setTheme: vi.fn(), 
      config: mockThemeConfig 
    } 
  }, children)
);

describe('useResponsive', () => {
  let mockMatchMedia: any;

  beforeEach(() => {
    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    });

    // Mock matchMedia
    mockMatchMedia = vi.fn((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });

    // Mock touch support
    Object.defineProperty(window, 'ontouchstart', {
      writable: true,
      value: undefined,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return correct breakpoint for tablet size', () => {
    const { result } = renderHook(() => useResponsive(), { wrapper });
    
    expect(result.current.breakpoint).toBe('tablet');
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isDesktop).toBe(false);
  });

  it('should return correct breakpoint for mobile size', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 480,
    });

    const { result } = renderHook(() => useResponsive(), { wrapper });
    
    expect(result.current.breakpoint).toBe('mobile');
    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
  });

  it('should return correct breakpoint for desktop size', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1400,
    });

    const { result } = renderHook(() => useResponsive(), { wrapper });
    
    expect(result.current.breakpoint).toBe('desktop');
    expect(result.current.isDesktop).toBe(true);
    expect(result.current.isTablet).toBe(false);
  });

  it('should detect touch device correctly', () => {
    Object.defineProperty(window, 'ontouchstart', {
      writable: true,
      value: {},
    });

    const { result } = renderHook(() => useResponsive(), { wrapper });
    
    expect(result.current.isTouchDevice).toBe(true);
  });

  it('should detect orientation correctly', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    });

    const { result } = renderHook(() => useResponsive(), { wrapper });
    
    expect(result.current.orientation).toBe('landscape');
  });

  it('should detect reduced motion preference', () => {
    mockMatchMedia.mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useResponsive(), { wrapper });
    
    expect(result.current.prefersReducedMotion).toBe(true);
  });

  it('should update on window resize', () => {
    const { result } = renderHook(() => useResponsive(), { wrapper });
    
    expect(result.current.breakpoint).toBe('tablet');

    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      });
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.breakpoint).toBe('mobile');
  });
});

describe('getResponsiveSpacing', () => {
  it('should return mobile spacing for mobile breakpoint', () => {
    const spacing = getResponsiveSpacing('mobile', mockThemeConfig.spacing);
    
    expect(spacing).toEqual({
      padding: '0.75rem',
      margin: '0.25rem',
      gap: '0.25rem'
    });
  });

  it('should return tablet spacing for tablet breakpoint', () => {
    const spacing = getResponsiveSpacing('tablet', mockThemeConfig.spacing);
    
    expect(spacing).toEqual({
      padding: '1rem',
      margin: '0.5rem',
      gap: '0.5rem'
    });
  });

  it('should return desktop spacing for desktop breakpoint', () => {
    const spacing = getResponsiveSpacing('desktop', mockThemeConfig.spacing);
    
    expect(spacing).toEqual({
      padding: '1.25rem',
      margin: '0.75rem',
      gap: '0.75rem'
    });
  });
});

describe('useContainerQuery', () => {
  it('should return initial container state', () => {
    const mockRef = { current: null };
    const { result } = renderHook(() => useContainerQuery(mockRef), { wrapper });
    
    expect(result.current.size).toBe('medium');
    expect(result.current.width).toBe(0);
    expect(result.current.height).toBe(0);
  });

  it('should update when container size changes', () => {
    const mockElement = {
      getBoundingClientRect: vi.fn(() => ({
        width: 600,
        height: 400,
        top: 0,
        left: 0,
        bottom: 400,
        right: 600,
        x: 0,
        y: 0,
        toJSON: vi.fn()
      }))
    };
    
    const mockRef = { current: mockElement as any };
    
    // Mock ResizeObserver
    const mockResizeObserver = vi.fn();
    mockResizeObserver.prototype.observe = vi.fn();
    mockResizeObserver.prototype.disconnect = vi.fn();
    global.ResizeObserver = mockResizeObserver;

    const { result } = renderHook(() => useContainerQuery(mockRef), { wrapper });
    
    expect(result.current.width).toBe(600);
    expect(result.current.height).toBe(400);
  });
});
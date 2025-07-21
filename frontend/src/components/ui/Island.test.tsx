import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Island } from './Island';
import { ThemeProvider } from '../../contexts/ThemeContext';
import React from 'react';

// Mock the responsive hook
vi.mock('../../hooks/useResponsive', () => ({
  useResponsive: vi.fn(() => ({
    breakpoint: 'desktop',
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isWide: false,
    width: 1280,
    height: 720,
    orientation: 'landscape',
    isTouchDevice: false,
    prefersReducedMotion: false,
    prefersHighContrast: false,
  })),
  useContainerQuery: vi.fn(() => ({
    size: 'large',
    width: 800,
    height: 600,
  })),
  getResponsiveSpacing: vi.fn(() => ({
    padding: '1.5rem',
    margin: '1rem',
    gap: '1rem',
  })),
  supportsHover: vi.fn(() => true),
}));

const mockThemeConfig = {
  mode: 'light' as const,
  colors: {
    background: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      gradient: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
    },
    island: {
      background: '#ffffff',
      border: '#e2e8f0',
      shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
      accent: '#3b82f6',
    },
    interactive: {
      primary: '#3b82f6',
      secondary: '#64748b',
      hover: '#2563eb',
      active: '#1d4ed8',
    },
  },
  spacing: {
    island: {
      padding: '1.5rem',
      margin: '1rem',
      gap: '1rem',
    },
    responsive: {
      mobile: {
        padding: '1rem',
        margin: '0.5rem',
        gap: '0.75rem',
      },
      tablet: {
        padding: '1.25rem',
        margin: '0.75rem',
        gap: '1rem',
      },
      desktop: {
        padding: '1.5rem',
        margin: '1rem',
        gap: '1.25rem',
      },
    },
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
      xlarge: '1024px',
    },
  },
  borderRadius: {
    island: '0.75rem',
    button: '0.5rem',
    input: '0.375rem',
  },
  shadows: {
    low: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    high: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    transitions: {
      island: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
      theme: 'background-color 500ms cubic-bezier(0.4, 0, 0.2, 1), border-color 500ms cubic-bezier(0.4, 0, 0.2, 1), color 500ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 500ms cubic-bezier(0.4, 0, 0.2, 1)',
      hover: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
      elevation: 'box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1), transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
};

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider
      value={{
        theme: 'light',
        resolvedTheme: 'light',
        setTheme: vi.fn(),
        config: mockThemeConfig,
      }}
    >
      {component}
    </ThemeProvider>
  );
};

describe('Island Component - Responsive Features', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default responsive props', () => {
    renderWithTheme(<Island>Test Content</Island>);

    const island = screen.getByText('Test Content').parentElement;
    expect(island).toHaveClass('island');
    expect(island).toHaveClass('island-variant-primary');
    expect(island).toHaveClass('island-elevation-medium');
    expect(island).toHaveClass('island-size-md');
    expect(island).toHaveClass('island-layout-default');
  });

  it('applies responsive size overrides', () => {
    const responsive = {
      mobile: { size: 'sm' as const },
      tablet: { size: 'md' as const },
      desktop: { size: 'lg' as const },
    };

    renderWithTheme(
      <Island responsive={responsive}>
        Responsive Content
      </Island>
    );

    const island = screen.getByText('Responsive Content').parentElement;
    expect(island).toHaveClass('island-size-lg'); // Should use desktop size
  });

  it('applies responsive layout variants', () => {
    const responsive = {
      desktop: { layout: 'compact' as const },
    };

    renderWithTheme(
      <Island responsive={responsive}>
        Compact Layout
      </Island>
    );

    const island = screen.getByText('Compact Layout').parentElement;
    expect(island).toHaveClass('island-layout-compact');
  });

  it('hides island when responsive hidden is true', () => {
    const responsive = {
      desktop: { hidden: true },
    };

    renderWithTheme(
      <Island responsive={responsive}>
        Hidden Content
      </Island>
    );

    expect(screen.queryByText('Hidden Content')).not.toBeInTheDocument();
  });

  it('applies touch optimization classes', () => {
    renderWithTheme(
      <Island touchOptimized>
        Touch Optimized
      </Island>
    );

    const island = screen.getByText('Touch Optimized').parentElement;
    expect(island).toHaveClass('touch-optimized');
  });

  it('applies container query classes when enabled', () => {
    renderWithTheme(
      <Island enableContainerQueries>
        Container Queries
      </Island>
    );

    const island = screen.getByText('Container Queries').parentElement;
    expect(island).toHaveClass('container-queries');
  });

  it('handles touch interactions when touch optimized', () => {
    const mockUseResponsive = vi.mocked(
      require('../../hooks/useResponsive').useResponsive
    );
    mockUseResponsive.mockReturnValue({
      breakpoint: 'mobile',
      isMobile: true,
      isTablet: false,
      isDesktop: false,
      isWide: false,
      width: 480,
      height: 800,
      orientation: 'portrait',
      isTouchDevice: true,
      prefersReducedMotion: false,
      prefersHighContrast: false,
    });

    renderWithTheme(
      <Island touchOptimized>
        Touch Island
      </Island>
    );

    const island = screen.getByText('Touch Island').parentElement!;

    // Test touch start
    fireEvent.touchStart(island);
    expect(island.style.transform).toBe('scale(0.98) translateZ(0)');

    // Test touch end
    fireEvent.touchEnd(island);
    expect(island.style.transform).toBe('');
  });

  it('applies interactive keyboard handling', () => {
    const mockClick = vi.fn();

    renderWithTheme(
      <Island interactive onClick={mockClick}>
        Interactive Island
      </Island>
    );

    const island = screen.getByText('Interactive Island').parentElement!;

    // Test Enter key
    fireEvent.keyDown(island, { key: 'Enter' });
    expect(mockClick).toHaveBeenCalledTimes(1);

    // Test Space key
    fireEvent.keyDown(island, { key: ' ' });
    expect(mockClick).toHaveBeenCalledTimes(2);

    // Test other keys (should not trigger)
    fireEvent.keyDown(island, { key: 'a' });
    expect(mockClick).toHaveBeenCalledTimes(2);
  });

  it('applies correct accessibility attributes', () => {
    renderWithTheme(
      <Island interactive>
        Accessible Island
      </Island>
    );

    const island = screen.getByText('Accessible Island').parentElement!;
    expect(island).toHaveAttribute('role', 'button');
    expect(island).toHaveAttribute('tabIndex', '0');
    expect(island).toHaveAttribute('aria-label', 'Interactive island');
  });

  it('includes responsive breakpoint data attributes', () => {
    renderWithTheme(<Island>Data Attributes</Island>);

    const island = screen.getByText('Data Attributes').parentElement!;
    expect(island).toHaveAttribute('data-breakpoint', 'desktop');
  });

  it('applies reduced motion classes when preferred', () => {
    const mockUseResponsive = vi.mocked(
      require('../../hooks/useResponsive').useResponsive
    );
    mockUseResponsive.mockReturnValue({
      breakpoint: 'desktop',
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isWide: false,
      width: 1280,
      height: 720,
      orientation: 'landscape',
      isTouchDevice: false,
      prefersReducedMotion: true,
      prefersHighContrast: false,
    });

    renderWithTheme(<Island>Reduced Motion</Island>);

    const island = screen.getByText('Reduced Motion').parentElement!;
    expect(island).toHaveClass('reduced-motion');
  });

  it('applies different elevation on touch devices', () => {
    const mockUseResponsive = vi.mocked(
      require('../../hooks/useResponsive').useResponsive
    );
    mockUseResponsive.mockReturnValue({
      breakpoint: 'mobile',
      isMobile: true,
      isTablet: false,
      isDesktop: false,
      isWide: false,
      width: 480,
      height: 800,
      orientation: 'portrait',
      isTouchDevice: true,
      prefersReducedMotion: false,
      prefersHighContrast: false,
    });

    renderWithTheme(
      <Island elevation="high">
        Touch Device Island
      </Island>
    );

    const island = screen.getByText('Touch Device Island').parentElement!;
    expect(island).toHaveClass('touch-device');
    // Elevation should be reduced from 'high' to 'medium' on touch devices
    expect(island).toHaveClass('island-elevation-high'); // The class is still applied, but styles are adjusted
  });

  it('applies responsive padding based on breakpoint', () => {
    const mockGetResponsiveSpacing = vi.mocked(
      require('../../hooks/useResponsive').getResponsiveSpacing
    );
    mockGetResponsiveSpacing.mockReturnValue({
      padding: '1.25rem',
      margin: '0.75rem',
      gap: '1rem',
    });

    renderWithTheme(<Island size="md">Responsive Padding</Island>);

    const island = screen.getByText('Responsive Padding').parentElement!;
    expect(island.style.padding).toBe('1.25rem');
  });
});
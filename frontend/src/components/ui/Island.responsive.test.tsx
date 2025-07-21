import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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
      theme="light"
      setTheme={vi.fn()}
    >
      {component}
    </ThemeProvider>
  );
};

describe('Island Component - Responsive Rendering', () => {
  it('renders basic island without errors', () => {
    renderWithTheme(<Island>Test Content</Island>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders with responsive props without errors', () => {
    const responsive = {
      mobile: { size: 'sm' as const, layout: 'compact' as const },
      tablet: { size: 'md' as const, layout: 'default' as const },
      desktop: { size: 'lg' as const, layout: 'spacious' as const },
    };

    renderWithTheme(
      <Island responsive={responsive}>
        Responsive Content
      </Island>
    );
    
    expect(screen.getByText('Responsive Content')).toBeInTheDocument();
  });

  it('renders with touch optimization without errors', () => {
    renderWithTheme(
      <Island touchOptimized>
        Touch Optimized
      </Island>
    );
    
    expect(screen.getByText('Touch Optimized')).toBeInTheDocument();
  });

  it('renders with container queries without errors', () => {
    renderWithTheme(
      <Island enableContainerQueries>
        Container Queries
      </Island>
    );
    
    expect(screen.getByText('Container Queries')).toBeInTheDocument();
  });

  it('renders interactive island without errors', () => {
    const mockClick = vi.fn();
    
    renderWithTheme(
      <Island interactive onClick={mockClick}>
        Interactive Island
      </Island>
    );
    
    expect(screen.getByText('Interactive Island')).toBeInTheDocument();
  });
});
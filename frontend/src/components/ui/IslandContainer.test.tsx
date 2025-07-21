import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { IslandContainer } from './IslandContainer';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { Island } from './Island';
import React from 'react';

// Mock ResizeObserver for responsive tests
global.ResizeObserver = class ResizeObserver {
  observe() { }
  unobserve() { }
  disconnect() { }
};

// Mock matchMedia for system theme detection
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => { },
    removeListener: () => { },
    addEventListener: () => { },
    removeEventListener: () => { },
    dispatchEvent: () => { },
  }),
});

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(() => 'light'),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
});

// Test wrapper with ThemeProvider
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('IslandContainer', () => {
  beforeEach(() => {
    // Reset any CSS custom properties
    document.documentElement.style.cssText = '';
  });

  afterEach(() => {
    cleanup();
  });

  describe('Basic Rendering', () => {
    it('renders children correctly', () => {
      render(
        <TestWrapper>
          <IslandContainer>
            <div data-testid="child">Test Content</div>
          </IslandContainer>
        </TestWrapper>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('applies default classes', () => {
      render(
        <TestWrapper>
          <IslandContainer data-testid="container">
            <div>Content</div>
          </IslandContainer>
        </TestWrapper>
      );

      const container = screen.getByTestId('container');
      expect(container).toHaveClass('island-container');
      expect(container).toHaveClass('island-container-layout-default');
      expect(container).toHaveClass('island-container-spacing-normal');
      expect(container).toHaveClass('island-container-gradient');
    });

    it('applies custom className', () => {
      render(
        <TestWrapper>
          <IslandContainer className="custom-class" data-testid="container">
            <div>Content</div>
          </IslandContainer>
        </TestWrapper>
      );

      const container = screen.getByTestId('container');
      expect(container).toHaveClass('custom-class');
    });
  });

  describe('Layout System', () => {
    it('applies grid layout correctly', () => {
      render(
        <TestWrapper>
          <IslandContainer layout="grid" data-testid="container">
            <div>Content</div>
          </IslandContainer>
        </TestWrapper>
      );

      const container = screen.getByTestId('container');
      expect(container).toHaveClass('island-container-layout-grid');
      expect(container.style.display).toBe('grid');
      expect(container.style.gap).toBe('1rem');
      expect(container.style.gridTemplateColumns).toBe('repeat(auto-fit, minmax(300px, 1fr))');
    });

    it('applies flex layout correctly', () => {
      render(
        <TestWrapper>
          <IslandContainer layout="flex" data-testid="container">
            <div>Content</div>
          </IslandContainer>
        </TestWrapper>
      );

      const container = screen.getByTestId('container');
      expect(container).toHaveClass('island-container-layout-flex');
      expect(container.style.display).toBe('flex');
      expect(container.style.flexWrap).toBe('wrap');
      expect(container.style.gap).toBe('1rem');
    });

    it('applies masonry layout correctly', () => {
      render(
        <TestWrapper>
          <IslandContainer layout="masonry" data-testid="container">
            <div>Content</div>
          </IslandContainer>
        </TestWrapper>
      );

      const container = screen.getByTestId('container');
      expect(container).toHaveClass('island-container-layout-masonry');
      expect(container.style.display).toBe('grid');
      expect(container.style.gap).toBe('1rem');
    });

    it('applies default layout when not specified', () => {
      render(
        <TestWrapper>
          <IslandContainer data-testid="container">
            <div>Content</div>
          </IslandContainer>
        </TestWrapper>
      );

      const container = screen.getByTestId('container');
      expect(container).toHaveClass('island-container-layout-default');
      expect(container.style.display).toBe('block');
    });
  });

  describe('Spacing System', () => {
    it('applies tight spacing', () => {
      render(
        <TestWrapper>
          <IslandContainer spacing="tight" layout="grid" data-testid="container">
            <div>Content</div>
          </IslandContainer>
        </TestWrapper>
      );

      const container = screen.getByTestId('container');
      expect(container).toHaveClass('island-container-spacing-tight');
      expect(container.style.gap).toBe('0.5rem');
    });

    it('applies loose spacing', () => {
      render(
        <TestWrapper>
          <IslandContainer spacing="loose" layout="grid" data-testid="container">
            <div>Content</div>
          </IslandContainer>
        </TestWrapper>
      );

      const container = screen.getByTestId('container');
      expect(container).toHaveClass('island-container-spacing-loose');
      expect(container.style.gap).toBe('2rem');
    });

    it('applies custom spacing', () => {
      render(
        <TestWrapper>
          <IslandContainer
            spacing="custom"
            customSpacing="3rem"
            layout="grid"
            data-testid="container"
          >
            <div>Content</div>
          </IslandContainer>
        </TestWrapper>
      );

      const container = screen.getByTestId('container');
      expect(container).toHaveClass('island-container-spacing-custom');
      expect(container.style.gap).toBe('3rem');
    });
  });

  describe('Responsive Grid System', () => {
    it('applies responsive grid columns', () => {
      render(
        <TestWrapper>
          <IslandContainer
            layout="grid"
            grid={{
              columns: {
                mobile: 1,
                tablet: 2,
                desktop: 3
              }
            }}
            data-testid="container"
          >
            <div>Content</div>
          </IslandContainer>
        </TestWrapper>
      );

      const container = screen.getByTestId('container');
      expect(container).toHaveClass('mobile:grid-cols-1');
      expect(container).toHaveClass('tablet:grid-cols-2');
      expect(container).toHaveClass('desktop:grid-cols-3');
    });

    it('applies default grid template when no responsive columns specified', () => {
      render(
        <TestWrapper>
          <IslandContainer layout="grid" data-testid="container">
            <div>Content</div>
          </IslandContainer>
        </TestWrapper>
      );

      const container = screen.getByTestId('container');
      expect(container.style.gridTemplateColumns).toBe('repeat(auto-fit, minmax(300px, 1fr))');
    });
  });

  describe('Background System', () => {
    it('applies gradient background by default', () => {
      render(
        <TestWrapper>
          <IslandContainer data-testid="container">
            <div>Content</div>
          </IslandContainer>
        </TestWrapper>
      );

      const container = screen.getByTestId('container');
      expect(container).toHaveClass('island-container-gradient');
    });

    it('disables gradient when gradient=false', () => {
      render(
        <TestWrapper>
          <IslandContainer gradient={false} data-testid="container">
            <div>Content</div>
          </IslandContainer>
        </TestWrapper>
      );

      const container = screen.getByTestId('container');
      expect(container).not.toHaveClass('island-container-gradient');
    });

    it('applies custom gradient', () => {
      const customGradient = 'linear-gradient(45deg, red, blue)';
      render(
        <TestWrapper>
          <IslandContainer customGradient={customGradient} data-testid="container">
            <div>Content</div>
          </IslandContainer>
        </TestWrapper>
      );

      const container = screen.getByTestId('container');
      expect(container.style.background).toBe(customGradient);
    });
  });

  describe('Container Properties', () => {
    it('applies maxWidth correctly', () => {
      render(
        <TestWrapper>
          <IslandContainer maxWidth="800px" data-testid="container">
            <div>Content</div>
          </IslandContainer>
        </TestWrapper>
      );

      const container = screen.getByTestId('container');
      expect(container.style.maxWidth).toBe('800px');
    });

    it('centers container when centered=true', () => {
      render(
        <TestWrapper>
          <IslandContainer centered data-testid="container">
            <div>Content</div>
          </IslandContainer>
        </TestWrapper>
      );

      const container = screen.getByTestId('container');
      expect(container).toHaveClass('island-container-centered');
      expect(container.style.margin).toBe('0px auto');
    });

    it('applies custom style props', () => {
      render(
        <TestWrapper>
          <IslandContainer
            style={{ backgroundColor: 'red', fontSize: '16px' }}
            data-testid="container"
          >
            <div>Content</div>
          </IslandContainer>
        </TestWrapper>
      );

      const container = screen.getByTestId('container');
      expect(container.style.backgroundColor).toBe('red');
      expect(container.style.fontSize).toBe('16px');
    });
  });

  describe('Integration with Islands', () => {
    it('properly contains multiple Island components', () => {
      render(
        <TestWrapper>
          <IslandContainer layout="grid" data-testid="container">
            <Island data-testid="island-1">Island 1</Island>
            <Island data-testid="island-2">Island 2</Island>
            <Island data-testid="island-3">Island 3</Island>
          </IslandContainer>
        </TestWrapper>
      );

      const container = screen.getByTestId('container');
      const island1 = screen.getByTestId('island-1');
      const island2 = screen.getByTestId('island-2');
      const island3 = screen.getByTestId('island-3');

      expect(container).toContainElement(island1);
      expect(container).toContainElement(island2);
      expect(container).toContainElement(island3);
      expect(container.style.display).toBe('grid');
    });

    it('maintains proper spacing between islands', () => {
      render(
        <TestWrapper>
          <IslandContainer layout="flex" spacing="loose" data-testid="container">
            <Island>Island 1</Island>
            <Island>Island 2</Island>
          </IslandContainer>
        </TestWrapper>
      );

      const container = screen.getByTestId('container');
      expect(container.style.display).toBe('flex');
      expect(container.style.flexWrap).toBe('wrap');
      expect(container.style.gap).toBe('2rem');
    });
  });

  describe('Accessibility', () => {
    it('forwards ref correctly', () => {
      const ref = { current: null };
      render(
        <TestWrapper>
          <IslandContainer ref={ref as any} data-testid="container">
            <div>Content</div>
          </IslandContainer>
        </TestWrapper>
      );

      expect(ref.current).toBeTruthy();
    });

    it('passes through ARIA attributes', () => {
      render(
        <TestWrapper>
          <IslandContainer
            aria-label="Main content container"
            role="main"
            data-testid="container"
          >
            <div>Content</div>
          </IslandContainer>
        </TestWrapper>
      );

      const container = screen.getByTestId('container');
      expect(container).toHaveAttribute('aria-label', 'Main content container');
      expect(container).toHaveAttribute('role', 'main');
    });
  });

  describe('Responsive Behavior', () => {
    // Note: These tests verify the classes are applied correctly
    // Actual responsive behavior would need visual regression testing

    it('applies responsive padding classes', () => {
      render(
        <TestWrapper>
          <IslandContainer
            padding={{
              mobile: '0.5rem',
              tablet: '1rem',
              desktop: '1.5rem'
            }}
            data-testid="container"
          >
            <div>Content</div>
          </IslandContainer>
        </TestWrapper>
      );

      const container = screen.getByTestId('container');
      expect(container).toHaveClass('mobile:p-[0.5rem]');
      expect(container).toHaveClass('tablet:p-[1rem]');
      expect(container).toHaveClass('desktop:p-[1.5rem]');
    });

    it('handles viewport changes gracefully', () => {
      const { rerender } = render(
        <TestWrapper>
          <IslandContainer
            layout="grid"
            grid={{ columns: { mobile: 1, desktop: 3 } }}
            data-testid="container"
          >
            <Island>Island 1</Island>
            <Island>Island 2</Island>
            <Island>Island 3</Island>
          </IslandContainer>
        </TestWrapper>
      );

      const container = screen.getByTestId('container');
      expect(container).toHaveClass('mobile:grid-cols-1');
      expect(container).toHaveClass('desktop:grid-cols-3');

      // Rerender with different grid configuration
      rerender(
        <TestWrapper>
          <IslandContainer
            layout="grid"
            grid={{ columns: { mobile: 2, desktop: 4 } }}
            data-testid="container"
          >
            <Island>Island 1</Island>
            <Island>Island 2</Island>
            <Island>Island 3</Island>
          </IslandContainer>
        </TestWrapper>
      );

      expect(container).toHaveClass('mobile:grid-cols-2');
      expect(container).toHaveClass('desktop:grid-cols-4');
    });
  });
});
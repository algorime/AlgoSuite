import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Island } from './Island';
import { ThemeProvider } from '../../contexts/ThemeContext';

// Mock theme context
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
      shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
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
  },
  borderRadius: {
    island: '0.75rem',
    button: '0.5rem',
    input: '0.375rem',
  },
  shadows: {
    low: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    high: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
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
      theme: 'background-color 500ms cubic-bezier(0.4, 0, 0.2, 1)',
      hover: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
      elevation: 'box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    {children}
  </ThemeProvider>
);

describe('Island Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders children correctly', () => {
      render(
        <TestWrapper>
          <Island>
            <span>Test content</span>
          </Island>
        </TestWrapper>
      );

      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('applies default classes', () => {
      render(
        <TestWrapper>
          <Island data-testid="island">Test</Island>
        </TestWrapper>
      );

      const island = screen.getByTestId('island');
      expect(island).toHaveClass('island');
      expect(island).toHaveClass('island-variant-primary');
      expect(island).toHaveClass('island-elevation-medium');
      expect(island).toHaveClass('island-size-md');
    });

    it('applies custom className', () => {
      render(
        <TestWrapper>
          <Island className="custom-class" data-testid="island">Test</Island>
        </TestWrapper>
      );

      const island = screen.getByTestId('island');
      expect(island).toHaveClass('custom-class');
    });
  });

  describe('Variants', () => {
    it('applies primary variant styles', () => {
      render(
        <TestWrapper>
          <Island variant="primary" data-testid="island">Test</Island>
        </TestWrapper>
      );

      const island = screen.getByTestId('island');
      expect(island).toHaveClass('island-variant-primary');
    });

    it('applies secondary variant styles', () => {
      render(
        <TestWrapper>
          <Island variant="secondary" data-testid="island">Test</Island>
        </TestWrapper>
      );

      const island = screen.getByTestId('island');
      expect(island).toHaveClass('island-variant-secondary');
    });

    it('applies accent variant styles', () => {
      render(
        <TestWrapper>
          <Island variant="accent" data-testid="island">Test</Island>
        </TestWrapper>
      );

      const island = screen.getByTestId('island');
      expect(island).toHaveClass('island-variant-accent');
    });

    it('applies danger variant styles', () => {
      render(
        <TestWrapper>
          <Island variant="danger" data-testid="island">Test</Island>
        </TestWrapper>
      );

      const island = screen.getByTestId('island');
      expect(island).toHaveClass('island-variant-danger');
    });
  });

  describe('Elevation System', () => {
    it('applies none elevation', () => {
      render(
        <TestWrapper>
          <Island elevation="none" data-testid="island">Test</Island>
        </TestWrapper>
      );

      const island = screen.getByTestId('island');
      expect(island).toHaveClass('island-elevation-none');
    });

    it('applies low elevation', () => {
      render(
        <TestWrapper>
          <Island elevation="low" data-testid="island">Test</Island>
        </TestWrapper>
      );

      const island = screen.getByTestId('island');
      expect(island).toHaveClass('island-elevation-low');
    });

    it('applies medium elevation (default)', () => {
      render(
        <TestWrapper>
          <Island data-testid="island">Test</Island>
        </TestWrapper>
      );

      const island = screen.getByTestId('island');
      expect(island).toHaveClass('island-elevation-medium');
    });

    it('applies high elevation', () => {
      render(
        <TestWrapper>
          <Island elevation="high" data-testid="island">Test</Island>
        </TestWrapper>
      );

      const island = screen.getByTestId('island');
      expect(island).toHaveClass('island-elevation-high');
    });
  });

  describe('Size System', () => {
    it('applies small size', () => {
      render(
        <TestWrapper>
          <Island size="sm" data-testid="island">Test</Island>
        </TestWrapper>
      );

      const island = screen.getByTestId('island');
      expect(island).toHaveClass('island-size-sm');
    });

    it('applies medium size (default)', () => {
      render(
        <TestWrapper>
          <Island data-testid="island">Test</Island>
        </TestWrapper>
      );

      const island = screen.getByTestId('island');
      expect(island).toHaveClass('island-size-md');
    });

    it('applies large size', () => {
      render(
        <TestWrapper>
          <Island size="lg" data-testid="island">Test</Island>
        </TestWrapper>
      );

      const island = screen.getByTestId('island');
      expect(island).toHaveClass('island-size-lg');
    });

    it('applies extra large size', () => {
      render(
        <TestWrapper>
          <Island size="xl" data-testid="island">Test</Island>
        </TestWrapper>
      );

      const island = screen.getByTestId('island');
      expect(island).toHaveClass('island-size-xl');
    });
  });

  describe('Interactive Behavior', () => {
    it('handles click events when interactive', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <Island interactive onClick={handleClick} data-testid="island">
            Test
          </Island>
        </TestWrapper>
      );

      const island = screen.getByTestId('island');
      expect(island).toHaveClass('interactive-hover');
      expect(island).toHaveAttribute('role', 'button');
      expect(island).toHaveAttribute('tabIndex', '0');

      await user.click(island);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('handles keyboard events when interactive', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <Island interactive onClick={handleClick} data-testid="island">
            Test
          </Island>
        </TestWrapper>
      );

      const island = screen.getByTestId('island');
      island.focus();

      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);

      await user.keyboard(' ');
      expect(handleClick).toHaveBeenCalledTimes(2);
    });

    it('does not handle clicks when not interactive', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <Island onClick={handleClick} data-testid="island">
            Test
          </Island>
        </TestWrapper>
      );

      const island = screen.getByTestId('island');
      expect(island).not.toHaveClass('interactive-hover');
      expect(island).not.toHaveAttribute('role', 'button');

      await user.click(island);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Responsive Props', () => {
    it('applies responsive classes for mobile', () => {
      render(
        <TestWrapper>
          <Island
            responsive={{
              mobile: { size: 'sm' }
            }}
            data-testid="island"
          >
            Test
          </Island>
        </TestWrapper>
      );

      const island = screen.getByTestId('island');
      expect(island.className).toContain('mobile:p-3');
    });

    it('applies responsive classes for tablet', () => {
      render(
        <TestWrapper>
          <Island
            responsive={{
              tablet: { size: 'lg' }
            }}
            data-testid="island"
          >
            Test
          </Island>
        </TestWrapper>
      );

      const island = screen.getByTestId('island');
      expect(island.className).toContain('tablet:p-8');
    });

    it('applies responsive classes for desktop', () => {
      render(
        <TestWrapper>
          <Island
            responsive={{
              desktop: { size: 'xl' }
            }}
            data-testid="island"
          >
            Test
          </Island>
        </TestWrapper>
      );

      const island = screen.getByTestId('island');
      expect(island.className).toContain('desktop:p-12');
    });
  });

  describe('Appearance Animation', () => {
    it('applies appear animation class', () => {
      render(
        <TestWrapper>
          <Island appear data-testid="island">Test</Island>
        </TestWrapper>
      );

      const island = screen.getByTestId('island');
      expect(island).toHaveClass('island-appear');
    });

    it('does not apply appear animation by default', () => {
      render(
        <TestWrapper>
          <Island data-testid="island">Test</Island>
        </TestWrapper>
      );

      const island = screen.getByTestId('island');
      expect(island).not.toHaveClass('island-appear');
    });
  });

  describe('Custom Padding', () => {
    it('applies custom padding when provided', () => {
      render(
        <TestWrapper>
          <Island padding="2rem" data-testid="island">Test</Island>
        </TestWrapper>
      );

      const island = screen.getByTestId('island');
      expect(island).toHaveStyle({ padding: '2rem' });
    });
  });

  describe('Accessibility', () => {
    it('provides proper ARIA attributes for interactive islands', () => {
      render(
        <TestWrapper>
          <Island interactive data-testid="island">Test</Island>
        </TestWrapper>
      );

      const island = screen.getByTestId('island');
      expect(island).toHaveAttribute('role', 'button');
      expect(island).toHaveAttribute('tabIndex', '0');
      expect(island).toHaveAttribute('aria-label', 'Interactive island');
    });

    it('allows custom ARIA label', () => {
      render(
        <TestWrapper>
          <Island interactive aria-label="Custom label" data-testid="island">
            Test
          </Island>
        </TestWrapper>
      );

      const island = screen.getByTestId('island');
      expect(island).toHaveAttribute('aria-label', 'Custom label');
    });

    it('does not add button role when not interactive', () => {
      render(
        <TestWrapper>
          <Island data-testid="island">Test</Island>
        </TestWrapper>
      );

      const island = screen.getByTestId('island');
      expect(island).not.toHaveAttribute('role', 'button');
      expect(island).not.toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Forward Ref', () => {
    it('forwards ref correctly', () => {
      const ref = vi.fn();

      render(
        <TestWrapper>
          <Island ref={ref}>Test</Island>
        </TestWrapper>
      );

      expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
    });
  });
});
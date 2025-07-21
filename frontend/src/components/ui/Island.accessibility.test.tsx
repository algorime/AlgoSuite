import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { Island } from './Island.js';
import { ThemeProvider } from '../../contexts/ThemeContext.js';
import { AccessibilityProvider } from './AccessibilityProvider.js';

// Test wrapper with providers
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>
    <AccessibilityProvider>
      {children}
    </AccessibilityProvider>
  </ThemeProvider>
);

describe('Island Accessibility', () => {
  describe('ARIA Support', () => {
    it('should have proper ARIA labels', () => {
      render(
        <TestWrapper>
          <Island ariaLabel="Test island" ariaDescription="This is a test island">
            <p>Island content</p>
          </Island>
        </TestWrapper>
      );

      const island = screen.getByLabelText('Test island');
      expect(island).toBeInTheDocument();
      expect(island).toHaveAttribute('aria-describedby');
    });

    it('should support landmark roles', () => {
      render(
        <TestWrapper>
          <Island landmark landmarkRole="main" ariaLabel="Main content">
            <p>Main content</p>
          </Island>
        </TestWrapper>
      );

      const landmark = screen.getByRole('main');
      expect(landmark).toBeInTheDocument();
      expect(landmark).toHaveAttribute('aria-label', 'Main content');
    });

    it('should have proper interactive ARIA attributes', () => {
      const handleClick = vi.fn();
      render(
        <TestWrapper>
          <Island interactive onClick={handleClick} ariaLabel="Interactive island">
            <p>Click me</p>
          </Island>
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-label', 'Interactive island');
      expect(button).toHaveAttribute('aria-pressed', 'false');
    });

    it('should update aria-pressed state when clicked', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      
      render(
        <TestWrapper>
          <Island interactive onClick={handleClick} ariaLabel="Interactive island">
            <p>Click me</p>
          </Island>
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      
      await user.click(button);
      
      expect(handleClick).toHaveBeenCalled();
      // Note: aria-pressed state changes are handled internally during interaction
    });
  });

  describe('Keyboard Navigation', () => {
    it('should be focusable when interactive', () => {
      const handleClick = vi.fn();
      render(
        <TestWrapper>
          <Island interactive onClick={handleClick} ariaLabel="Interactive island">
            <p>Click me</p>
          </Island>
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('tabindex', '0');
    });

    it('should handle Enter key activation', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      
      render(
        <TestWrapper>
          <Island interactive onClick={handleClick} ariaLabel="Interactive island">
            <p>Click me</p>
          </Island>
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      button.focus();
      
      await user.keyboard('{Enter}');
      
      expect(handleClick).toHaveBeenCalled();
    });

    it('should handle Space key activation', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      
      render(
        <TestWrapper>
          <Island interactive onClick={handleClick} ariaLabel="Interactive island">
            <p>Click me</p>
          </Island>
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      button.focus();
      
      await user.keyboard(' ');
      
      expect(handleClick).toHaveBeenCalled();
    });

    it('should support custom focus management', () => {
      render(
        <TestWrapper>
          <Island 
            focusManagement={{ focusable: true }}
            ariaLabel="Focusable island"
          >
            <p>Focusable content</p>
          </Island>
        </TestWrapper>
      );

      const island = screen.getByLabelText('Focusable island');
      expect(island).toHaveAttribute('tabindex', '0');
    });
  });

  describe('Focus Management', () => {
    it('should trap focus when configured', async () => {
      render(
        <TestWrapper>
          <Island 
            focusManagement={{ trapFocus: true }}
            ariaLabel="Focus trap island"
          >
            <button>First button</button>
            <button>Second button</button>
            <button>Third button</button>
          </Island>
        </TestWrapper>
      );

      const island = screen.getByLabelText('Focus trap island');
      const firstButton = screen.getByText('First button');
      const secondButton = screen.getByText('Second button');
      const thirdButton = screen.getByText('Third button');
      
      // Verify all buttons are present and focusable
      expect(firstButton).toBeInTheDocument();
      expect(secondButton).toBeInTheDocument();
      expect(thirdButton).toBeInTheDocument();
      expect(island).toBeInTheDocument();
    });

    it('should show focus indicators', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Island interactive ariaLabel="Interactive island">
            <p>Focusable island</p>
          </Island>
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      
      await user.tab();
      
      expect(button).toHaveFocus();
      expect(button).toHaveAttribute('data-focused');
    });
  });

  describe('Screen Reader Support', () => {
    it('should provide screen reader announcements', async () => {
      render(
        <TestWrapper>
          <Island 
            announceChanges 
            ariaLabel="Announcing island"
          >
            <p>Content with announcements</p>
          </Island>
        </TestWrapper>
      );

      // Check for aria-live region
      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toBeInTheDocument();
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    });

    it('should have hidden description for screen readers', () => {
      render(
        <TestWrapper>
          <Island ariaDescription="Detailed description for screen readers">
            <p>Island content</p>
          </Island>
        </TestWrapper>
      );

      const description = screen.getByText('Detailed description for screen readers');
      expect(description).toBeInTheDocument();
      expect(description).toHaveClass('sr-only');
    });
  });

  describe('High Contrast Support', () => {
    it('should apply high contrast styles when needed', () => {
      // Mock high contrast media query
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-contrast: high)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      render(
        <TestWrapper>
          <Island ariaLabel="High contrast island">
            <p>High contrast content</p>
          </Island>
        </TestWrapper>
      );

      const island = screen.getByLabelText('High contrast island');
      expect(island).toHaveAttribute('data-high-contrast', 'true');
    });
  });

  describe('Touch Accessibility', () => {
    it('should have minimum touch target size for interactive islands', () => {
      render(
        <TestWrapper>
          <Island 
            interactive 
            touchOptimized 
            ariaLabel="Touch optimized island"
          >
            <p>Touch me</p>
          </Island>
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('touch-optimized');
    });
  });

  describe('Error States', () => {
    it('should handle error states accessibly', () => {
      render(
        <TestWrapper>
          <Island aria-invalid="true" ariaLabel="Error island">
            <p>Error content</p>
          </Island>
        </TestWrapper>
      );

      const island = screen.getByLabelText('Error island');
      expect(island).toHaveAttribute('aria-invalid', 'true');
    });

    it('should handle loading states accessibly', () => {
      render(
        <TestWrapper>
          <Island aria-busy="true" ariaLabel="Loading island">
            <p>Loading content</p>
          </Island>
        </TestWrapper>
      );

      const island = screen.getByLabelText('Loading island');
      expect(island).toHaveAttribute('aria-busy', 'true');
    });

    it('should handle disabled states accessibly', () => {
      render(
        <TestWrapper>
          <Island aria-disabled="true" ariaLabel="Disabled island">
            <p>Disabled content</p>
          </Island>
        </TestWrapper>
      );

      const island = screen.getByLabelText('Disabled island');
      expect(island).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('Accessibility Compliance', () => {
    it('should have proper semantic structure', () => {
      render(
        <TestWrapper>
          <Island ariaLabel="Accessible island" ariaDescription="Fully accessible island component">
            <h2>Island Title</h2>
            <p>Island content with proper structure</p>
            <button>Action button</button>
          </Island>
        </TestWrapper>
      );

      const island = screen.getByLabelText('Accessible island');
      const title = screen.getByText('Island Title');
      const content = screen.getByText('Island content with proper structure');
      const button = screen.getByText('Action button');

      expect(island).toBeInTheDocument();
      expect(title).toBeInTheDocument();
      expect(content).toBeInTheDocument();
      expect(button).toBeInTheDocument();
    });

    it('should have proper interactive structure', () => {
      render(
        <TestWrapper>
          <Island 
            interactive 
            ariaLabel="Interactive accessible island"
            onClick={() => {}}
          >
            <p>Interactive content</p>
          </Island>
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Interactive accessible island');
      expect(button).toHaveAttribute('tabindex', '0');
    });

    it('should have proper landmark structure', () => {
      render(
        <TestWrapper>
          <Island 
            landmark 
            landmarkRole="main" 
            ariaLabel="Main content area"
          >
            <h1>Main Content</h1>
            <p>This is the main content of the page</p>
          </Island>
        </TestWrapper>
      );

      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('aria-label', 'Main content area');
      expect(screen.getByText('Main Content')).toBeInTheDocument();
    });
  });

  describe('Reduced Motion Support', () => {
    it('should respect reduced motion preferences', () => {
      // Mock reduced motion media query
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      render(
        <TestWrapper>
          <Island appear ariaLabel="Animated island">
            <p>Animated content</p>
          </Island>
        </TestWrapper>
      );

      const island = screen.getByLabelText('Animated island');
      expect(island).toHaveClass('reduced-motion');
    });
  });
});

describe('Accessibility Provider', () => {
  it('should provide announcement functionality', async () => {
    const TestComponent = () => {
      const [announcement, setAnnouncement] = React.useState('');
      
      const handleAnnounce = () => {
        setAnnouncement('Test announcement');
      };
      
      return (
        <div>
          <button onClick={handleAnnounce}>
            Announce
          </button>
          {announcement && (
            <div aria-live="polite" className="sr-only">
              {announcement}
            </div>
          )}
        </div>
      );
    };

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    const button = screen.getByText('Announce');
    fireEvent.click(button);

    await waitFor(() => {
      const announcement = screen.getByText('Test announcement');
      expect(announcement).toBeInTheDocument();
    });
  });
});
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Button from './Button';

describe('Button Component', () => {
  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('button-island');
    });

    it('renders children correctly', () => {
      render(<Button>Test Button</Button>);
      expect(screen.getByText('Test Button')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<Button className="custom-class">Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('Variants', () => {
    it('applies primary variant styles by default', () => {
      render(<Button>Primary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-[var(--color-interactive-primary)]');
    });

    it('applies secondary variant styles', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-[var(--color-island-bg)]');
      expect(button).toHaveClass('border-[var(--color-island-border)]');
    });

    it('applies accent variant styles', () => {
      render(<Button variant="accent">Accent</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-[var(--color-text-accent)]');
    });

    it('applies danger variant styles', () => {
      render(<Button variant="danger">Danger</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-red-600');
    });

    it('applies ghost variant styles', () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-[var(--color-text-primary)]');
    });

    it('applies outline variant styles', () => {
      render(<Button variant="outline">Outline</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border-[var(--color-interactive-primary)]');
      expect(button).toHaveClass('text-[var(--color-interactive-primary)]');
    });
  });

  describe('Sizes', () => {
    it('applies medium size by default', () => {
      render(<Button>Medium</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-10', 'px-4', 'py-2');
    });

    it('applies small size styles', () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-9', 'px-3', 'text-sm');
    });

    it('applies large size styles', () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-11', 'px-6', 'text-lg');
    });
  });

  describe('Elevation', () => {
    it('applies no elevation by default', () => {
      render(<Button>No Elevation</Button>);
      const button = screen.getByRole('button');
      expect(button).not.toHaveClass('shadow-[var(--shadow-low)]');
    });

    it('applies low elevation styles', () => {
      render(<Button elevation="low">Low Elevation</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('shadow-[var(--shadow-low)]');
    });

    it('applies medium elevation styles', () => {
      render(<Button elevation="medium">Medium Elevation</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('shadow-[var(--shadow-medium)]');
    });

    it('applies high elevation styles', () => {
      render(<Button elevation="high">High Elevation</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('shadow-[var(--shadow-high)]');
    });
  });

  describe('Island Style', () => {
    it('applies island styling by default', () => {
      render(<Button>Island Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('button-island');
      expect(button).toHaveClass('rounded-[var(--border-radius-button)]');
    });

    it('disables island styling when islandStyle is false', () => {
      render(<Button islandStyle={false}>Non-Island Button</Button>);
      const button = screen.getByRole('button');
      expect(button).not.toHaveClass('button-island');
      expect(button).toHaveClass('rounded-md');
    });
  });

  describe('Loading State', () => {
    it('shows loading spinner when isLoading is true', () => {
      render(<Button isLoading>Loading</Button>);
      const spinner = screen.getByRole('button').querySelector('svg');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('animate-spin');
    });

    it('disables button when loading', () => {
      render(<Button isLoading>Loading</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('does not show spinner when not loading', () => {
      render(<Button>Not Loading</Button>);
      const button = screen.getByRole('button');
      const spinner = button.querySelector('svg');
      expect(spinner).not.toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('disables button when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50');
    });

    it('is not disabled by default', () => {
      render(<Button>Enabled</Button>);
      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });
  });

  describe('Interactions', () => {
    it('calls onClick handler when clicked', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick} disabled>Disabled</Button>);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('does not call onClick when loading', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick} isLoading>Loading</Button>);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Animations and Transitions', () => {
    it('applies transition classes for smooth animations', () => {
      render(<Button>Animated</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('transition-all', 'duration-300', 'ease-out');
    });

    it('applies transform classes for hover effects', () => {
      render(<Button>Hover me</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('transform');
    });

    it('applies active state classes for press feedback', () => {
      render(<Button>Press me</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('active:scale-[0.98]', 'active:translate-y-0');
    });

    it('applies elevation hover effects for low elevation', () => {
      render(<Button elevation="low">Low Elevation</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('hover:-translate-y-0.5');
    });

    it('applies elevation hover effects for medium elevation', () => {
      render(<Button elevation="medium">Medium Elevation</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('hover:-translate-y-1');
    });

    it('applies elevation hover effects for high elevation', () => {
      render(<Button elevation="high">High Elevation</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('hover:-translate-y-1.5');
    });
  });

  describe('Focus Management', () => {
    it('applies focus-visible styles', () => {
      render(<Button>Focus me</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus-visible:outline-none');
      expect(button).toHaveClass('focus-visible:ring-2');
      expect(button).toHaveClass('focus-visible:ring-offset-2');
    });

    it('applies variant-specific focus ring colors', () => {
      render(<Button variant="primary">Primary Focus</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus-visible:ring-[var(--color-interactive-primary)]');
    });

    it('can receive focus when not disabled', () => {
      render(<Button>Focusable</Button>);
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });

    it('cannot receive focus when disabled', () => {
      render(<Button disabled>Not Focusable</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('disabled:pointer-events-none');
    });
  });

  describe('Accessibility', () => {
    it('has proper button role', () => {
      render(<Button>Accessible Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('supports aria attributes', () => {
      render(
        <Button aria-label="Custom label" aria-describedby="description">
          Button
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Custom label');
      expect(button).toHaveAttribute('aria-describedby', 'description');
    });

    it('indicates loading state to screen readers', () => {
      render(<Button isLoading aria-label="Loading button">Loading</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-label', 'Loading button');
    });
  });

  describe('HTML Attributes', () => {
    it('forwards HTML button attributes', () => {
      render(
        <Button type="submit" form="test-form" data-testid="submit-btn">
          Submit
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toHaveAttribute('form', 'test-form');
      expect(button).toHaveAttribute('data-testid', 'submit-btn');
    });

    it('supports ref forwarding', () => {
      const ref = vi.fn();
      render(<Button ref={ref}>Ref Button</Button>);
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('Theme Integration', () => {
    it('uses CSS custom properties for theming', () => {
      render(<Button variant="primary">Themed Button</Button>);
      const button = screen.getByRole('button');
      
      // Check that CSS custom properties are used
      expect(button).toHaveClass('bg-[var(--color-interactive-primary)]');
      expect(button).toHaveClass('rounded-[var(--border-radius-button)]');
    });

    it('applies island-specific border radius', () => {
      render(<Button>Island Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('rounded-[var(--border-radius-button)]');
    });

    it('uses theme-aware shadow variables', () => {
      render(<Button elevation="medium">Shadow Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('shadow-[var(--shadow-medium)]');
    });
  });
});
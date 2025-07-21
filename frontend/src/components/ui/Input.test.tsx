import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ThemeProvider } from '../../contexts/ThemeContext';
import Input from './Input';

// Mock the useTheme hook
vi.mock('../../hooks/useTheme.js', () => ({
  useTheme: () => ({
    config: {
      colors: {
        background: {
          primary: '#ffffff',
          secondary: '#f8fafc',
        },
        island: {
          background: '#ffffff',
          border: '#e2e8f0',
        },
        text: {
          primary: '#1e293b',
          secondary: '#64748b',
        },
        interactive: {
          primary: '#3b82f6',
          hover: '#2563eb',
        },
      },
      borderRadius: {
        input: '0.375rem',
      },
      shadows: {
        low: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      },
      animations: {
        transitions: {
          hover: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
  }),
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('Input Component', () => {
  it('renders basic input correctly', () => {
    renderWithTheme(<Input placeholder="Enter text" />);
    
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('w-full');
  });

  it('renders with label', () => {
    renderWithTheme(<Input label="Username" placeholder="Enter username" />);
    
    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter username')).toBeInTheDocument();
  });

  it('handles different sizes correctly', () => {
    const { rerender } = renderWithTheme(<Input size="sm" placeholder="Small input" />);
    expect(screen.getByPlaceholderText('Small input')).toHaveClass('h-9');

    rerender(
      <ThemeProvider>
        <Input size="md" placeholder="Medium input" />
      </ThemeProvider>
    );
    expect(screen.getByPlaceholderText('Medium input')).toHaveClass('h-10');

    rerender(
      <ThemeProvider>
        <Input size="lg" placeholder="Large input" />
      </ThemeProvider>
    );
    expect(screen.getByPlaceholderText('Large input')).toHaveClass('h-12');
  });

  it('handles different variants correctly', () => {
    const { rerender } = renderWithTheme(<Input variant="default" placeholder="Default input" />);
    let input = screen.getByPlaceholderText('Default input');
    expect(input).toBeInTheDocument();

    rerender(
      <ThemeProvider>
        <Input variant="filled" placeholder="Filled input" />
      </ThemeProvider>
    );
    input = screen.getByPlaceholderText('Filled input');
    expect(input).toBeInTheDocument();

    rerender(
      <ThemeProvider>
        <Input variant="outline" placeholder="Outline input" />
      </ThemeProvider>
    );
    input = screen.getByPlaceholderText('Outline input');
    expect(input).toBeInTheDocument();
  });

  it('shows error state correctly', () => {
    renderWithTheme(
      <Input 
        error={true} 
        errorMessage="This field is required" 
        placeholder="Error input" 
      />
    );
    
    const input = screen.getByPlaceholderText('Error input');
    expect(input).toHaveClass('border-red-500');
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('shows helper text', () => {
    renderWithTheme(
      <Input 
        helperText="Enter your full name" 
        placeholder="Name input" 
      />
    );
    
    expect(screen.getByText('Enter your full name')).toBeInTheDocument();
  });

  it('handles focus and blur events', async () => {
    const user = userEvent.setup();
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    
    renderWithTheme(
      <Input 
        placeholder="Focus test" 
        onFocus={onFocus}
        onBlur={onBlur}
      />
    );
    
    const input = screen.getByPlaceholderText('Focus test');
    
    await user.click(input);
    expect(onFocus).toHaveBeenCalledTimes(1);
    
    await user.tab();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('handles value changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    
    renderWithTheme(
      <Input 
        placeholder="Type here" 
        onChange={onChange}
      />
    );
    
    const input = screen.getByPlaceholderText('Type here');
    
    await user.type(input, 'Hello World');
    expect(onChange).toHaveBeenCalled();
  });

  it('renders with left and right icons', () => {
    const LeftIcon = () => <span data-testid="left-icon">🔍</span>;
    const RightIcon = () => <span data-testid="right-icon">✓</span>;
    
    renderWithTheme(
      <Input 
        placeholder="Icon input"
        leftIcon={<LeftIcon />}
        rightIcon={<RightIcon />}
      />
    );
    
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    
    const input = screen.getByPlaceholderText('Icon input');
    expect(input).toHaveClass('pl-10', 'pr-10');
  });

  it('handles floating label correctly', async () => {
    const user = userEvent.setup();
    
    renderWithTheme(
      <Input 
        label="Floating Label"
        floatingLabel={true}
        placeholder="Type here"
      />
    );
    
    const input = screen.getByRole('textbox');
    const label = screen.getByText('Floating Label');
    
    // Initially, label should be in placeholder position
    expect(label).toBeInTheDocument();
    
    // When focused or has value, label should move up
    await user.click(input);
    await user.type(input, 'test');
    
    // Label should still be present (moved to top position)
    expect(label).toBeInTheDocument();
  });

  it('handles disabled state', () => {
    renderWithTheme(
      <Input 
        placeholder="Disabled input"
        disabled={true}
      />
    );
    
    const input = screen.getByPlaceholderText('Disabled input');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
  });

  it('applies custom className', () => {
    renderWithTheme(
      <Input 
        placeholder="Custom class"
        className="custom-input-class"
      />
    );
    
    const input = screen.getByPlaceholderText('Custom class');
    expect(input).toHaveClass('custom-input-class');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLInputElement>();
    
    renderWithTheme(
      <Input 
        ref={ref}
        placeholder="Ref test"
      />
    );
    
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current?.placeholder).toBe('Ref test');
  });

  it('handles elevation prop correctly', () => {
    const { rerender } = renderWithTheme(
      <Input 
        placeholder="Elevation test"
        elevation="low"
        islandStyle={true}
      />
    );
    
    let input = screen.getByPlaceholderText('Elevation test');
    expect(input).toBeInTheDocument();

    rerender(
      <ThemeProvider>
        <Input 
          placeholder="Elevation test medium"
          elevation="medium"
          islandStyle={true}
        />
      </ThemeProvider>
    );
    
    input = screen.getByPlaceholderText('Elevation test medium');
    expect(input).toBeInTheDocument();
  });

  it('handles island styling toggle', () => {
    const { rerender } = renderWithTheme(
      <Input 
        placeholder="Island style on"
        islandStyle={true}
      />
    );
    
    let input = screen.getByPlaceholderText('Island style on');
    expect(input).toBeInTheDocument();

    rerender(
      <ThemeProvider>
        <Input 
          placeholder="Island style off"
          islandStyle={false}
        />
      </ThemeProvider>
    );
    
    input = screen.getByPlaceholderText('Island style off');
    expect(input).toBeInTheDocument();
  });

  it('handles accessibility attributes', () => {
    renderWithTheme(
      <Input 
        placeholder="Accessible input"
        aria-label="Custom aria label"
        aria-describedby="helper-text"
      />
    );
    
    const input = screen.getByPlaceholderText('Accessible input');
    expect(input).toHaveAttribute('aria-label', 'Custom aria label');
    expect(input).toHaveAttribute('aria-describedby', 'helper-text');
  });
});
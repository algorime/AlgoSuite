import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ThemeProvider } from '../../contexts/ThemeContext';
import Checkbox from './Checkbox';

// Mock the useTheme hook
vi.mock('../../hooks/useTheme.js', () => ({
  useTheme: () => ({
    config: {
      colors: {
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
        },
      },
      borderRadius: {
        input: '0.375rem',
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

describe('Checkbox Component', () => {
  it('renders basic checkbox correctly', () => {
    renderWithTheme(<Checkbox />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it('renders with label', () => {
    renderWithTheme(<Checkbox label="Accept terms" />);
    
    expect(screen.getByText('Accept terms')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('renders with label and description', () => {
    renderWithTheme(
      <Checkbox 
        label="Newsletter subscription"
        description="Receive weekly updates about our products"
      />
    );
    
    expect(screen.getByText('Newsletter subscription')).toBeInTheDocument();
    expect(screen.getByText('Receive weekly updates about our products')).toBeInTheDocument();
  });

  it('handles different sizes correctly', () => {
    const { rerender } = renderWithTheme(
      <Checkbox label="Small checkbox" size="sm" />
    );
    
    let checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveClass('h-4', 'w-4');

    rerender(
      <ThemeProvider>
        <Checkbox label="Medium checkbox" size="md" />
      </ThemeProvider>
    );
    
    checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveClass('h-5', 'w-5');

    rerender(
      <ThemeProvider>
        <Checkbox label="Large checkbox" size="lg" />
      </ThemeProvider>
    );
    
    checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveClass('h-6', 'w-6');
  });

  it('handles checked state', () => {
    const onChange = vi.fn();
    renderWithTheme(<Checkbox label="Checked checkbox" checked={true} onChange={onChange} />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('handles change events', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    
    renderWithTheme(
      <Checkbox 
        label="Change test"
        onChange={onChange}
      />
    );
    
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('handles focus and blur events', async () => {
    const user = userEvent.setup();
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    
    renderWithTheme(
      <Checkbox 
        label="Focus test"
        onFocus={onFocus}
        onBlur={onBlur}
      />
    );
    
    const checkbox = screen.getByRole('checkbox');
    
    await user.click(checkbox);
    expect(onFocus).toHaveBeenCalledTimes(1);
    
    await user.tab();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('shows error state correctly', () => {
    renderWithTheme(
      <Checkbox 
        label="Error checkbox"
        error={true}
        errorMessage="This field is required"
      />
    );
    
    expect(screen.getByText('Error checkbox')).toHaveClass('text-red-600');
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('handles disabled state', () => {
    renderWithTheme(
      <Checkbox 
        label="Disabled checkbox"
        disabled={true}
      />
    );
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDisabled();
    
    const container = checkbox.closest('label');
    expect(container).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('handles indeterminate state', () => {
    renderWithTheme(
      <Checkbox 
        label="Indeterminate checkbox"
        indeterminate={true}
      />
    );
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    
    // Check if indeterminate icon is rendered
    const container = checkbox.closest('label');
    const indeterminateIcon = container?.querySelector('svg rect');
    expect(indeterminateIcon).toBeInTheDocument();
  });

  it('renders checkmark when checked', () => {
    const onChange = vi.fn();
    renderWithTheme(
      <Checkbox 
        label="Checked with icon"
        checked={true}
        onChange={onChange}
      />
    );
    
    const checkbox = screen.getByRole('checkbox');
    const container = checkbox.closest('label');
    const checkIcon = container?.querySelector('svg path');
    expect(checkIcon).toBeInTheDocument();
  });

  it('handles keyboard interaction', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    
    renderWithTheme(
      <Checkbox 
        label="Keyboard test"
        onChange={onChange}
      />
    );
    
    const checkbox = screen.getByRole('checkbox');
    
    // Focus the checkbox and press space
    await user.click(checkbox);
    await user.keyboard(' ');
    
    expect(onChange).toHaveBeenCalledTimes(2); // Once for click, once for space
  });

  it('handles label click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    
    renderWithTheme(
      <Checkbox 
        label="Label click test"
        onChange={onChange}
      />
    );
    
    const label = screen.getByText('Label click test');
    await user.click(label);
    
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    renderWithTheme(
      <Checkbox 
        label="Custom class"
        className="custom-checkbox-class"
      />
    );
    
    const container = screen.getByRole('checkbox').closest('label');
    expect(container).toHaveClass('custom-checkbox-class');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLInputElement>();
    
    renderWithTheme(
      <Checkbox 
        ref={ref}
        label="Ref test"
      />
    );
    
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current?.type).toBe('checkbox');
  });

  it('handles elevation prop correctly', () => {
    renderWithTheme(
      <Checkbox 
        label="Elevation test"
        elevation="medium"
        islandStyle={true}
      />
    );
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
  });

  it('handles island styling toggle', () => {
    const { rerender } = renderWithTheme(
      <Checkbox 
        label="Island style on"
        islandStyle={true}
      />
    );
    
    let checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();

    rerender(
      <ThemeProvider>
        <Checkbox 
          label="Island style off"
          islandStyle={false}
        />
      </ThemeProvider>
    );
    
    checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
  });

  it('handles accessibility attributes', () => {
    renderWithTheme(
      <Checkbox 
        label="Accessible checkbox"
        aria-describedby="helper-text"
      />
    );
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-describedby', 'helper-text');
  });

  it('handles complex layout with description', () => {
    renderWithTheme(
      <Checkbox 
        label="Privacy Policy"
        description="I agree to the terms and conditions and privacy policy"
        size="lg"
      />
    );
    
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    expect(screen.getByText('I agree to the terms and conditions and privacy policy')).toBeInTheDocument();
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveClass('h-6', 'w-6');
  });

  it('maintains proper spacing with different content', () => {
    renderWithTheme(
      <div>
        <Checkbox label="First option" />
        <Checkbox label="Second option" description="With description" />
        <Checkbox label="Third option" />
      </div>
    );
    
    expect(screen.getByText('First option')).toBeInTheDocument();
    expect(screen.getByText('Second option')).toBeInTheDocument();
    expect(screen.getByText('With description')).toBeInTheDocument();
    expect(screen.getByText('Third option')).toBeInTheDocument();
  });
});
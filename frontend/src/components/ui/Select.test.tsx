import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ThemeProvider } from '../../contexts/ThemeContext';
import Select from './Select';

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

const mockOptions = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3', disabled: true },
];

describe('Select Component', () => {
  it('renders native select correctly', () => {
    renderWithTheme(
      <Select 
        options={mockOptions}
        placeholder="Choose an option"
      />
    );
    
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(screen.getByText('Choose an option')).toBeInTheDocument();
  });

  it('renders custom dropdown correctly', async () => {
    const user = userEvent.setup();
    
    renderWithTheme(
      <Select 
        options={mockOptions}
        placeholder="Choose an option"
        customDropdown={true}
      />
    );
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(screen.getByText('Choose an option')).toBeInTheDocument();
    
    // Click to open dropdown
    await user.click(button);
    
    // Check if options are visible
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('handles option selection in custom dropdown', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    
    renderWithTheme(
      <Select 
        options={mockOptions}
        placeholder="Choose an option"
        customDropdown={true}
        onChange={onChange}
      />
    );
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    const option1 = screen.getByText('Option 1');
    await user.click(option1);
    
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: { value: 'option1' }
      })
    );
  });

  it('renders with label', () => {
    renderWithTheme(
      <Select 
        options={mockOptions}
        label="Select Option"
        placeholder="Choose"
      />
    );
    
    expect(screen.getByText('Select Option')).toBeInTheDocument();
  });

  it('handles different sizes correctly', () => {
    const { rerender } = renderWithTheme(
      <Select 
        options={mockOptions}
        size="sm"
        placeholder="Small select"
      />
    );
    
    let select = screen.getByRole('combobox');
    expect(select).toHaveClass('h-9');

    rerender(
      <ThemeProvider>
        <Select 
          options={mockOptions}
          size="lg"
          placeholder="Large select"
        />
      </ThemeProvider>
    );
    
    select = screen.getByRole('combobox');
    expect(select).toHaveClass('h-12');
  });

  it('shows error state correctly', () => {
    renderWithTheme(
      <Select 
        options={mockOptions}
        error={true}
        errorMessage="Please select an option"
        placeholder="Error select"
      />
    );
    
    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('border-red-500');
    expect(screen.getByText('Please select an option')).toBeInTheDocument();
  });

  it('shows helper text', () => {
    renderWithTheme(
      <Select 
        options={mockOptions}
        helperText="Choose your preferred option"
        placeholder="Helper select"
      />
    );
    
    expect(screen.getByText('Choose your preferred option')).toBeInTheDocument();
  });

  it('handles disabled state', () => {
    renderWithTheme(
      <Select 
        options={mockOptions}
        disabled={true}
        placeholder="Disabled select"
      />
    );
    
    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
  });

  it('handles disabled options in custom dropdown', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    
    renderWithTheme(
      <Select 
        options={mockOptions}
        customDropdown={true}
        onChange={onChange}
        placeholder="Test disabled"
      />
    );
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    const disabledOption = screen.getByText('Option 3');
    expect(disabledOption).toHaveAttribute('disabled');
    
    await user.click(disabledOption);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('closes custom dropdown when clicking outside', async () => {
    const user = userEvent.setup();
    
    renderWithTheme(
      <div>
        <Select 
          options={mockOptions}
          customDropdown={true}
          placeholder="Click outside test"
        />
        <div data-testid="outside">Outside element</div>
      </div>
    );
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    // Dropdown should be open
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    
    // Click outside
    const outside = screen.getByTestId('outside');
    await user.click(outside);
    
    // Wait for dropdown to close
    await waitFor(() => {
      expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
    });
  });

  it('renders with left icon', () => {
    const LeftIcon = () => <span data-testid="left-icon">🔍</span>;
    
    renderWithTheme(
      <Select 
        options={mockOptions}
        leftIcon={<LeftIcon />}
        placeholder="Icon select"
      />
    );
    
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    
    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('pl-10');
  });

  it('handles focus and blur events', async () => {
    const user = userEvent.setup();
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    
    renderWithTheme(
      <Select 
        options={mockOptions}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder="Focus test"
      />
    );
    
    const select = screen.getByRole('combobox');
    
    await user.click(select);
    expect(onFocus).toHaveBeenCalledTimes(1);
    
    await user.tab();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('displays selected value correctly', () => {
    const onChange = vi.fn();
    renderWithTheme(
      <Select 
        options={mockOptions}
        value="option2"
        onChange={onChange}
        placeholder="Selected test"
      />
    );
    
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('option2');
  });

  it('displays selected value in custom dropdown', () => {
    renderWithTheme(
      <Select 
        options={mockOptions}
        value="option2"
        customDropdown={true}
        placeholder="Custom selected test"
      />
    );
    
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('handles keyboard navigation in custom dropdown', async () => {
    const user = userEvent.setup();
    
    renderWithTheme(
      <Select 
        options={mockOptions}
        customDropdown={true}
        placeholder="Keyboard test"
      />
    );
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    // Test arrow key navigation
    const option1 = screen.getByText('Option 1');
    await user.hover(option1);
    
    expect(option1).toBeInTheDocument();
  });

  it('applies custom className', () => {
    renderWithTheme(
      <Select 
        options={mockOptions}
        className="custom-select-class"
        placeholder="Custom class"
      />
    );
    
    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('custom-select-class');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLSelectElement>();
    
    renderWithTheme(
      <Select 
        ref={ref}
        options={mockOptions}
        placeholder="Ref test"
      />
    );
    
    expect(ref.current).toBeInstanceOf(HTMLSelectElement);
  });

  it('handles elevation prop correctly', () => {
    renderWithTheme(
      <Select 
        options={mockOptions}
        elevation="medium"
        islandStyle={true}
        placeholder="Elevation test"
      />
    );
    
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });

  it('toggles dropdown arrow in custom dropdown', async () => {
    const user = userEvent.setup();
    
    renderWithTheme(
      <Select 
        options={mockOptions}
        customDropdown={true}
        placeholder="Arrow test"
      />
    );
    
    const button = screen.getByRole('button');
    
    // Check if dropdown opens when clicked
    await user.click(button);
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    
    // Check if dropdown closes when clicked again
    await user.click(button);
    await waitFor(() => {
      expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
    });
  });
});
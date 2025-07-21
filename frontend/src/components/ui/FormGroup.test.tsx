import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ThemeProvider } from '../../contexts/ThemeContext';
import FormGroup from './FormGroup';
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
        },
      },
      spacing: {
        island: {
          padding: '1.5rem',
        },
      },
      borderRadius: {
        island: '0.75rem',
      },
      shadows: {
        low: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      },
      animations: {
        transitions: {
          elevation: 'box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1)',
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

describe('FormGroup Component', () => {
  it('renders basic form group correctly', () => {
    renderWithTheme(
      <FormGroup>
        <Input placeholder="Test input" />
      </FormGroup>
    );
    
    const input = screen.getByPlaceholderText('Test input');
    expect(input).toBeInTheDocument();
  });

  it('renders with title and description', () => {
    renderWithTheme(
      <FormGroup 
        title="User Information"
        description="Please enter your personal details"
      >
        <Input placeholder="Name" />
        <Input placeholder="Email" />
      </FormGroup>
    );
    
    expect(screen.getByText('User Information')).toBeInTheDocument();
    expect(screen.getByText('Please enter your personal details')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
  });

  it('shows required indicator when required', () => {
    renderWithTheme(
      <FormGroup 
        title="Required Information"
        required={true}
      >
        <Input placeholder="Required field" />
      </FormGroup>
    );
    
    expect(screen.getByText('Required Information')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('handles error state correctly', () => {
    renderWithTheme(
      <FormGroup 
        title="Error Form"
        error={true}
        errorMessage="Please fix the errors below"
      >
        <Input placeholder="Error input" />
      </FormGroup>
    );
    
    expect(screen.getByText('Error Form')).toBeInTheDocument();
    expect(screen.getByText('Please fix the errors below')).toBeInTheDocument();
    
    // Check if error styling is applied
    const title = screen.getByText('Error Form');
    expect(title).toHaveClass('text-red-600');
  });

  it('handles different layout options', () => {
    const { rerender } = renderWithTheme(
      <FormGroup layout="vertical">
        <Input placeholder="Input 1" />
        <Input placeholder="Input 2" />
      </FormGroup>
    );
    
    let container = screen.getByPlaceholderText('Input 1').closest('.form-group-content');
    expect(container).toHaveClass('flex', 'flex-col');

    rerender(
      <ThemeProvider>
        <FormGroup layout="horizontal">
          <Input placeholder="Input 3" />
          <Input placeholder="Input 4" />
        </FormGroup>
      </ThemeProvider>
    );
    
    container = screen.getByPlaceholderText('Input 3').closest('.form-group-content');
    expect(container).toHaveClass('flex', 'flex-wrap');

    rerender(
      <ThemeProvider>
        <FormGroup layout="grid" columns={3}>
          <Input placeholder="Input 5" />
          <Input placeholder="Input 6" />
        </FormGroup>
      </ThemeProvider>
    );
    
    container = screen.getByPlaceholderText('Input 5').closest('.form-group-content');
    expect(container).toHaveClass('grid', 'md:grid-cols-3');
  });

  it('handles different gap sizes', () => {
    const { rerender } = renderWithTheme(
      <FormGroup gap="sm">
        <Input placeholder="Small gap 1" />
        <Input placeholder="Small gap 2" />
      </FormGroup>
    );
    
    let container = screen.getByPlaceholderText('Small gap 1').closest('.form-group-content');
    expect(container).toHaveClass('gap-3');

    rerender(
      <ThemeProvider>
        <FormGroup gap="md">
          <Input placeholder="Medium gap 1" />
          <Input placeholder="Medium gap 2" />
        </FormGroup>
      </ThemeProvider>
    );
    
    container = screen.getByPlaceholderText('Medium gap 1').closest('.form-group-content');
    expect(container).toHaveClass('gap-4');

    rerender(
      <ThemeProvider>
        <FormGroup gap="lg">
          <Input placeholder="Large gap 1" />
          <Input placeholder="Large gap 2" />
        </FormGroup>
      </ThemeProvider>
    );
    
    container = screen.getByPlaceholderText('Large gap 1').closest('.form-group-content');
    expect(container).toHaveClass('gap-6');
  });

  it('handles different variants', () => {
    renderWithTheme(
      <FormGroup variant="secondary">
        <Input placeholder="Secondary variant" />
      </FormGroup>
    );
    
    const input = screen.getByPlaceholderText('Secondary variant');
    expect(input).toBeInTheDocument();
  });

  it('handles different elevation levels', () => {
    renderWithTheme(
      <FormGroup elevation="high">
        <Input placeholder="High elevation" />
      </FormGroup>
    );
    
    const input = screen.getByPlaceholderText('High elevation');
    expect(input).toBeInTheDocument();
  });

  it('handles different sizes', () => {
    renderWithTheme(
      <FormGroup size="lg">
        <Input placeholder="Large form group" />
      </FormGroup>
    );
    
    const input = screen.getByPlaceholderText('Large form group');
    expect(input).toBeInTheDocument();
  });

  it('applies custom className', () => {
    renderWithTheme(
      <FormGroup className="custom-form-group">
        <Input placeholder="Custom class" />
      </FormGroup>
    );
    
    const container = screen.getByPlaceholderText('Custom class').closest('.form-group');
    expect(container).toHaveClass('custom-form-group');
  });

  it('renders complex form structure', () => {
    renderWithTheme(
      <FormGroup 
        title="Contact Information"
        description="Please provide your contact details"
        layout="grid"
        columns={2}
        gap="md"
      >
        <Input label="First Name" placeholder="John" />
        <Input label="Last Name" placeholder="Doe" />
        <Input label="Email" placeholder="john@example.com" />
        <Input label="Phone" placeholder="+1 234 567 8900" />
      </FormGroup>
    );
    
    expect(screen.getByText('Contact Information')).toBeInTheDocument();
    expect(screen.getByText('Please provide your contact details')).toBeInTheDocument();
    expect(screen.getByText('First Name')).toBeInTheDocument();
    expect(screen.getByText('Last Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Phone')).toBeInTheDocument();
  });

  it('handles error message with icon', () => {
    renderWithTheme(
      <FormGroup 
        error={true}
        errorMessage="Form validation failed"
      >
        <Input placeholder="Error test" />
      </FormGroup>
    );
    
    expect(screen.getByText('Form validation failed')).toBeInTheDocument();
    
    // Check if error icon is present
    const errorContainer = screen.getByText('Form validation failed').closest('.form-group-error-message');
    expect(errorContainer).toBeInTheDocument();
    expect(errorContainer?.querySelector('svg')).toBeInTheDocument();
  });

  it('handles multiple children correctly', () => {
    renderWithTheme(
      <FormGroup>
        <Input placeholder="Input 1" />
        <Input placeholder="Input 2" />
        <Input placeholder="Input 3" />
      </FormGroup>
    );
    
    expect(screen.getByPlaceholderText('Input 1')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Input 2')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Input 3')).toBeInTheDocument();
  });

  it('passes through island props correctly', () => {
    renderWithTheme(
      <FormGroup 
        data-testid="form-group-island"
        interactive={true}
      >
        <Input placeholder="Island props test" />
      </FormGroup>
    );
    
    const formGroup = screen.getByTestId('form-group-island');
    expect(formGroup).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Island props test')).toBeInTheDocument();
  });
});
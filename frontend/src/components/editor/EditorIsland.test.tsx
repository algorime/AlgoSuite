import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { ThemeProvider } from '../../contexts/ThemeContext.js';
import EditorIsland from './EditorIsland.js';

// Mock Monaco Editor
vi.mock('@monaco-editor/react', () => ({
  Editor: ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
    <textarea
      data-testid="monaco-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Monaco Editor Mock"
    />
  ),
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('EditorIsland', () => {
  it('renders with default tab', () => {
    renderWithTheme(<EditorIsland />);
    
    expect(screen.getByText('payload.sql')).toBeInTheDocument();
    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
  });

  it('renders quick payload buttons', () => {
    renderWithTheme(<EditorIsland />);
    
    expect(screen.getByText('Basic OR')).toBeInTheDocument();
    expect(screen.getByText('Union Select')).toBeInTheDocument();
    expect(screen.getByText('Time Blind')).toBeInTheDocument();
    expect(screen.getByText('Boolean Blind')).toBeInTheDocument();
  });

  it('renders execute button', () => {
    renderWithTheme(<EditorIsland />);
    
    const executeButton = screen.getByText('Test Payload');
    expect(executeButton).toBeInTheDocument();
  });

  it('can add new tab', () => {
    renderWithTheme(<EditorIsland />);
    
    const addButton = screen.getByTitle('Add new tab');
    fireEvent.click(addButton);
    
    expect(screen.getByText('untitled-2.sql')).toBeInTheDocument();
  });

  it('shows status bar information', () => {
    renderWithTheme(<EditorIsland />);
    
    expect(screen.getByText(/Language: SQL/)).toBeInTheDocument();
    expect(screen.getByText(/Lines:/)).toBeInTheDocument();
    expect(screen.getByText(/Characters:/)).toBeInTheDocument();
    expect(screen.getByText(/Tab: 1 of 1/)).toBeInTheDocument();
  });

  it('calls onExecute when execute button is clicked', () => {
    const mockExecute = vi.fn();
    renderWithTheme(<EditorIsland onExecute={mockExecute} />);
    
    const executeButton = screen.getByText('Test Payload');
    fireEvent.click(executeButton);
    
    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining('-- Basic SQL injection payloads'),
      'sql'
    );
  });

  it('supports custom initial tabs', () => {
    const customTabs = [
      {
        id: 'custom-1',
        name: 'custom.sql',
        language: 'sql',
        content: 'SELECT * FROM users;',
      },
    ];

    renderWithTheme(<EditorIsland initialTabs={customTabs} />);
    
    expect(screen.getByText('custom.sql')).toBeInTheDocument();
  });
});
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ThemeProvider } from '../../contexts/ThemeContext.js';
import FilterIsland from './FilterIsland.js';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('FilterIsland', () => {
  it('renders filter title and reset button', () => {
    renderWithTheme(<FilterIsland />);
    
    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
  });

  it('renders all filter sections', () => {
    renderWithTheme(<FilterIsland />);
    
    expect(screen.getByText('Time Range')).toBeInTheDocument();
    expect(screen.getByText('Severity')).toBeInTheDocument();
    expect(screen.getByText('Vulnerability Type')).toBeInTheDocument();
  });

  it('has correct default values', () => {
    renderWithTheme(<FilterIsland />);
    
    expect(screen.getByDisplayValue('Last 24 Hours')).toBeInTheDocument();
    expect(screen.getByDisplayValue('All Severities')).toBeInTheDocument();
    expect(screen.getByDisplayValue('All Types')).toBeInTheDocument();
  });

  it('calls onFiltersChange when time range changes', () => {
    const mockOnFiltersChange = vi.fn();
    renderWithTheme(<FilterIsland onFiltersChange={mockOnFiltersChange} />);
    
    const timeRangeSelect = screen.getByDisplayValue('Last 24 Hours');
    fireEvent.change(timeRangeSelect, { target: { value: '7d' } });
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      timeRange: '7d',
      severity: 'all',
      type: 'all'
    });
  });

  it('calls onFiltersChange when severity changes', () => {
    const mockOnFiltersChange = vi.fn();
    renderWithTheme(<FilterIsland onFiltersChange={mockOnFiltersChange} />);
    
    const severitySelect = screen.getByDisplayValue('All Severities');
    fireEvent.change(severitySelect, { target: { value: 'high' } });
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      timeRange: '24h',
      severity: 'high',
      type: 'all'
    });
  });

  it('calls onFiltersChange when type changes', () => {
    const mockOnFiltersChange = vi.fn();
    renderWithTheme(<FilterIsland onFiltersChange={mockOnFiltersChange} />);
    
    const typeSelect = screen.getByDisplayValue('All Types');
    fireEvent.change(typeSelect, { target: { value: 'sqli' } });
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      timeRange: '24h',
      severity: 'all',
      type: 'sqli'
    });
  });

  it('resets filters when reset button is clicked', () => {
    const mockOnFiltersChange = vi.fn();
    renderWithTheme(<FilterIsland onFiltersChange={mockOnFiltersChange} />);
    
    // First change a filter
    const severitySelect = screen.getByDisplayValue('All Severities');
    fireEvent.change(severitySelect, { target: { value: 'high' } });
    
    // Then reset
    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);
    
    expect(mockOnFiltersChange).toHaveBeenLastCalledWith({
      timeRange: '24h',
      severity: 'all',
      type: 'all'
    });
  });

  it('contains all time range options', () => {
    renderWithTheme(<FilterIsland />);
    
    const timeRangeSelect = screen.getByDisplayValue('Last 24 Hours');
    
    expect(timeRangeSelect).toContainHTML('<option value="1h">Last Hour</option>');
    expect(timeRangeSelect).toContainHTML('<option value="24h">Last 24 Hours</option>');
    expect(timeRangeSelect).toContainHTML('<option value="7d">Last 7 Days</option>');
    expect(timeRangeSelect).toContainHTML('<option value="30d">Last 30 Days</option>');
  });

  it('contains all severity options', () => {
    renderWithTheme(<FilterIsland />);
    
    const severitySelect = screen.getByDisplayValue('All Severities');
    
    expect(severitySelect).toContainHTML('<option value="all">All Severities</option>');
    expect(severitySelect).toContainHTML('<option value="critical">Critical</option>');
    expect(severitySelect).toContainHTML('<option value="high">High</option>');
    expect(severitySelect).toContainHTML('<option value="medium">Medium</option>');
    expect(severitySelect).toContainHTML('<option value="low">Low</option>');
  });

  it('contains all vulnerability type options', () => {
    renderWithTheme(<FilterIsland />);
    
    const typeSelect = screen.getByDisplayValue('All Types');
    
    expect(typeSelect).toContainHTML('<option value="all">All Types</option>');
    expect(typeSelect).toContainHTML('<option value="sqli">SQL Injection</option>');
    expect(typeSelect).toContainHTML('<option value="xss">XSS</option>');
    expect(typeSelect).toContainHTML('<option value="csrf">CSRF</option>');
  });

  it('applies custom className', () => {
    const { container } = renderWithTheme(<FilterIsland className="test-class" />);
    
    expect(container.querySelector('.test-class')).toBeInTheDocument();
  });
});
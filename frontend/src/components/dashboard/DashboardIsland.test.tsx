import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ThemeProvider } from '../../contexts/ThemeContext.js';
import DashboardIsland from './DashboardIsland.js';

// Mock the chart component to avoid rendering issues in tests
vi.mock('./VulnerabilityTrendsChart.js', () => ({
  default: () => <div data-testid="vulnerability-trends-chart">Mock Chart</div>
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('DashboardIsland', () => {
  it('renders without crashing', () => {
    renderWithTheme(<DashboardIsland />);
    expect(screen.getByText('Vulnerabilities Found')).toBeInTheDocument();
  });

  it('displays all metric islands', () => {
    renderWithTheme(<DashboardIsland />);
    
    expect(screen.getByText('Vulnerabilities Found')).toBeInTheDocument();
    expect(screen.getByText('SQL Injection Points')).toBeInTheDocument();
    expect(screen.getByText('Success Rate')).toBeInTheDocument();
    expect(screen.getByText('Payloads Tested')).toBeInTheDocument();
  });

  it('displays metric values correctly', () => {
    renderWithTheme(<DashboardIsland />);
    
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('67%')).toBeInTheDocument();
    expect(screen.getByText('156')).toBeInTheDocument();
  });

  it('renders filter island with all filter options', () => {
    renderWithTheme(<DashboardIsland />);
    
    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByText('Time Range')).toBeInTheDocument();
    expect(screen.getByText('Severity')).toBeInTheDocument();
    expect(screen.getByText('Vulnerability Type')).toBeInTheDocument();
  });

  it('renders chart islands with correct titles', () => {
    renderWithTheme(<DashboardIsland />);
    
    expect(screen.getByText('Vulnerability Trends')).toBeInTheDocument();
    expect(screen.getByText('Severity Distribution')).toBeInTheDocument();
    expect(screen.getByText('Attack Vector Analysis')).toBeInTheDocument();
  });

  it('renders recent findings island', () => {
    renderWithTheme(<DashboardIsland />);
    
    expect(screen.getByText('Recent Vulnerability Findings')).toBeInTheDocument();
    expect(screen.getAllByText('SQL Injection').length).toBeGreaterThanOrEqual(2); // Appears in multiple places
    expect(screen.getByText('/api/users')).toBeInTheDocument();
  });

  it('handles filter changes', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    renderWithTheme(<DashboardIsland />);
    
    const timeRangeSelect = screen.getByDisplayValue('Last 24 Hours');
    fireEvent.change(timeRangeSelect, { target: { value: '7d' } });
    
    expect(consoleSpy).toHaveBeenCalledWith('Filters changed:', expect.objectContaining({
      timeRange: '7d'
    }));
    
    consoleSpy.mockRestore();
  });

  it('displays chart action buttons', () => {
    renderWithTheme(<DashboardIsland />);
    
    const exportButtons = screen.getAllByText('Export');
    const refreshButtons = screen.getAllByText('Refresh');
    
    expect(exportButtons.length).toBeGreaterThan(0);
    expect(refreshButtons.length).toBeGreaterThan(0);
  });

  it('shows severity indicators in recent findings', () => {
    renderWithTheme(<DashboardIsland />);
    
    // Check that severity indicators appear multiple times (in filter and findings)
    expect(screen.getAllByText('High')).toHaveLength(2); // One in filter, one in findings
    expect(screen.getAllByText('Medium')).toHaveLength(2); // One in filter, one in findings
    expect(screen.getAllByText('Critical')).toHaveLength(2); // One in filter, one in findings
    expect(screen.getAllByText('Low')).toHaveLength(2); // One in filter, one in findings
  });

  it('displays live indicator for recent findings', () => {
    renderWithTheme(<DashboardIsland />);
    
    expect(screen.getByText('Live')).toBeInTheDocument();
  });

  it('shows view all findings button', () => {
    renderWithTheme(<DashboardIsland />);
    
    expect(screen.getByText('View All Findings →')).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    const { container } = renderWithTheme(<DashboardIsland className="test-class" />);
    
    expect(container.querySelector('.dashboard-island-container')).toBeInTheDocument();
    expect(container.querySelector('.test-class')).toBeInTheDocument();
  });
});
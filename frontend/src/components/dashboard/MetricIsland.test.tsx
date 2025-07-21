import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ThemeProvider } from '../../contexts/ThemeContext.js';
import MetricIsland from './MetricIsland.js';
import type { MetricData } from './MetricIsland.js';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('MetricIsland', () => {
  const mockMetric: MetricData = {
    title: 'Test Metric',
    value: '42',
    change: '+5 from last scan',
    trend: 'up'
  };

  it('renders metric data correctly', () => {
    renderWithTheme(<MetricIsland metric={mockMetric} />);
    
    expect(screen.getByText('Test Metric')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('+5 from last scan')).toBeInTheDocument();
  });

  it('displays correct trend icon for up trend', () => {
    renderWithTheme(<MetricIsland metric={{ ...mockMetric, trend: 'up' }} />);
    
    expect(screen.getByText('↗')).toBeInTheDocument();
  });

  it('displays correct trend icon for down trend', () => {
    renderWithTheme(<MetricIsland metric={{ ...mockMetric, trend: 'down' }} />);
    
    expect(screen.getByText('↘')).toBeInTheDocument();
  });

  it('displays correct trend icon for neutral trend', () => {
    renderWithTheme(<MetricIsland metric={{ ...mockMetric, trend: 'neutral' }} />);
    
    expect(screen.getByText('→')).toBeInTheDocument();
  });

  it('displays default icon when no custom icon provided', () => {
    const { container } = renderWithTheme(<MetricIsland metric={mockMetric} />);
    
    const iconContainer = container.querySelector('.bg-purple-100');
    expect(iconContainer).toBeInTheDocument();
  });

  it('displays custom icon when provided', () => {
    const customIcon = <div data-testid="custom-icon">Custom</div>;
    const metricWithIcon = { ...mockMetric, icon: customIcon };
    
    renderWithTheme(<MetricIsland metric={metricWithIcon} />);
    
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = renderWithTheme(
      <MetricIsland metric={mockMetric} className="test-class" />
    );
    
    expect(container.querySelector('.test-class')).toBeInTheDocument();
  });

  it('has correct CSS classes for styling', () => {
    const { container } = renderWithTheme(<MetricIsland metric={mockMetric} />);
    
    expect(container.querySelector('.metric-island')).toBeInTheDocument();
  });
});
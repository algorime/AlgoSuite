import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import StudioIsland from './StudioIsland';
import { ThemeProvider } from '../../contexts/ThemeContext';

// Mock the PayloadApplicator service
vi.mock('../../services/PayloadApplicator', () => ({
  default: {
    applyPayload: vi.fn().mockResolvedValue({
      success: true,
      modified_request: {
        method: 'GET',
        url: 'https://example.com/api/users?id=1',
        headers: {},
        body: ''
      },
      applied_payload: {
        payload: { payload: "' OR 1=1 --", type: 'boolean_blind' },
        injection_point: { parameter: 'id', location: 'url', value: '1', type: 'GET' },
        applied_at: new Date()
      },
      preview: "Applied payload to 'id' parameter"
    })
  }
}));

// Mock the API module
vi.mock('../../lib/api', () => ({
  default: {
    post: vi.fn().mockResolvedValue({
      data: [
        {
          payload: "' OR 1=1 --",
          type: 'boolean_blind',
          risk_level: 'high',
          description: 'A simple boolean-based blind SQL injection payload.',
          source: 'Manual',
          expected_result: 'The query should return true, potentially bypassing authentication or returning all records.'
        }
      ]
    })
  }
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('StudioIsland', () => {
  it('renders without crashing', () => {
    renderWithTheme(<StudioIsland />);
    
    // Check that main components are rendered
    expect(screen.getByText('HTTP Request/Response')).toBeInTheDocument();
    expect(screen.getByText('Payload Suggestor')).toBeInTheDocument();
    // Check that Ready status appears (there might be multiple instances)
    expect(screen.getAllByText('Ready')).toHaveLength(2);
  });

  it('displays initial HTTP request data', () => {
    renderWithTheme(<StudioIsland />);
    
    // Check that the default request URL is displayed
    expect(screen.getByDisplayValue(/https:\/\/example\.com\/api\/users\?id=1/)).toBeInTheDocument();
  });

  it('shows payload suggestions', () => {
    renderWithTheme(<StudioIsland />);
    
    // Check that the sample payload is displayed
    expect(screen.getByText("' OR 1=1 --")).toBeInTheDocument();
    expect(screen.getByText('boolean blind')).toBeInTheDocument();
    expect(screen.getByText('high')).toBeInTheDocument();
  });

  it('displays status information', () => {
    renderWithTheme(<StudioIsland />);
    
    // Check status bar information
    expect(screen.getByText('Payloads: 0')).toBeInTheDocument();
    expect(screen.getByText('Injection Points: 0')).toBeInTheDocument();
    expect(screen.getByText('Applied: 0')).toBeInTheDocument();
    expect(screen.getByText('Saved Payloads (0)')).toBeInTheDocument();
  });

  it('has proper island structure with nested panels', () => {
    renderWithTheme(<StudioIsland />);
    
    // Check that the component has the proper structure
    const studioContainer = screen.getByText('HTTP Request/Response').closest('.island');
    expect(studioContainer).toBeInTheDocument();
    
    const payloadContainer = screen.getByText('Payload Suggestor').closest('.island');
    expect(payloadContainer).toBeInTheDocument();
  });
});
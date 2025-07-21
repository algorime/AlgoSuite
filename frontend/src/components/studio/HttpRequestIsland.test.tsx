import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HttpRequestIsland from './HttpRequestIsland';
import { ThemeProvider } from '../../contexts/ThemeContext';
import type { HttpRequest, HttpResponse } from '../../types';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

const mockHttpRequest: HttpRequest = {
  method: 'GET',
  url: 'https://example.com/api/users?id=1',
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  body: ''
};

const mockHttpResponse: HttpResponse = {
  status_code: 200,
  headers: {
    'Content-Type': 'application/json'
  },
  body: '{"users": [{"id": 1, "name": "John Doe"}]}'
};

describe('HttpRequestIsland', () => {
  const mockOnRequestChange = vi.fn();

  beforeEach(() => {
    mockOnRequestChange.mockClear();
  });

  it('renders HTTP request and response sections', () => {
    renderWithTheme(
      <HttpRequestIsland
        httpRequest={mockHttpRequest}
        httpResponse={mockHttpResponse}
        applicationResult={null}
        onRequestChange={mockOnRequestChange}
      />
    );

    expect(screen.getByText('HTTP Request/Response')).toBeInTheDocument();
    expect(screen.getByText('Request')).toBeInTheDocument();
    expect(screen.getByText('Response')).toBeInTheDocument();
  });

  it('displays HTTP method selector', () => {
    renderWithTheme(
      <HttpRequestIsland
        httpRequest={mockHttpRequest}
        httpResponse={mockHttpResponse}
        applicationResult={null}
        onRequestChange={mockOnRequestChange}
      />
    );

    const methodSelect = screen.getByDisplayValue('GET');
    expect(methodSelect).toBeInTheDocument();
    
    // Test method change
    fireEvent.change(methodSelect, { target: { value: 'POST' } });
    expect(mockOnRequestChange).toHaveBeenCalledWith('method', 'POST');
  });

  it('shows request content in textarea', () => {
    renderWithTheme(
      <HttpRequestIsland
        httpRequest={mockHttpRequest}
        httpResponse={mockHttpResponse}
        applicationResult={null}
        onRequestChange={mockOnRequestChange}
      />
    );

    const textarea = screen.getByPlaceholderText('HTTP request will appear here...');
    expect(textarea).toBeInTheDocument();
    // Check that the textarea contains the expected HTTP request format
    const textareaValue = (textarea as HTMLTextAreaElement).value;
    expect(textareaValue).toContain('GET https://example.com/api/users?id=1 HTTP/1.1');
    expect(textareaValue).toContain('Content-Type: application/json');
    expect(textareaValue).toContain('User-Agent: Mozilla/5.0');
  });

  it('displays response content', () => {
    renderWithTheme(
      <HttpRequestIsland
        httpRequest={mockHttpRequest}
        httpResponse={mockHttpResponse}
        applicationResult={null}
        onRequestChange={mockOnRequestChange}
      />
    );

    expect(screen.getByText(/HTTP\/1\.1 200 OK/)).toBeInTheDocument();
    expect(screen.getByText(/{"users": \[{"id": 1, "name": "John Doe"}\]}/)).toBeInTheDocument();
  });

  it('shows application result when payload is applied', () => {
    const applicationResult = {
      success: true,
      modified_request: mockHttpRequest,
      applied_payload: {
        payload: { payload: "' OR 1=1 --", type: 'boolean_blind', risk_level: 'high' as const, description: 'Test payload' },
        injection_point: { parameter: 'id', location: 'url' as const, value: '1', type: 'GET' },
        applied_at: new Date()
      },
      preview: "Applied payload to 'id' parameter"
    };

    renderWithTheme(
      <HttpRequestIsland
        httpRequest={mockHttpRequest}
        httpResponse={mockHttpResponse}
        applicationResult={applicationResult}
        onRequestChange={mockOnRequestChange}
      />
    );

    expect(screen.getByText("✓ Applied: Applied payload to 'id' parameter")).toBeInTheDocument();
  });

  it('has proper island styling and structure', () => {
    renderWithTheme(
      <HttpRequestIsland
        httpRequest={mockHttpRequest}
        httpResponse={mockHttpResponse}
        applicationResult={null}
        onRequestChange={mockOnRequestChange}
      />
    );

    const islandContainer = screen.getByText('HTTP Request/Response').closest('.island');
    expect(islandContainer).toBeInTheDocument();
    expect(islandContainer).toHaveClass('island-variant-secondary');
    expect(islandContainer).toHaveClass('island-elevation-medium');
  });
});
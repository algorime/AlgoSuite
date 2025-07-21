import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import StatusIsland from './StatusIsland';
import { ThemeProvider } from '../../contexts/ThemeContext';
import type { PayloadSuggestion } from '../../types';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

const mockPayloadSuggestions: PayloadSuggestion[] = [
  {
    payload: "' OR 1=1 --",
    type: 'boolean_blind',
    risk_level: 'high',
    description: 'Test payload 1'
  },
  {
    payload: "' UNION SELECT 1,2,3 --",
    type: 'union_based',
    risk_level: 'medium',
    description: 'Test payload 2'
  }
];

const mockSavedPayloads: PayloadSuggestion[] = [
  {
    payload: "' OR 1=1 --",
    type: 'boolean_blind',
    risk_level: 'high',
    description: 'Saved payload'
  }
];

describe('StatusIsland', () => {
  const mockOnOpenSavedPayloads = vi.fn();

  beforeEach(() => {
    mockOnOpenSavedPayloads.mockClear();
  });

  it('renders status information correctly', () => {
    renderWithTheme(
      <StatusIsland
        payloadSuggestions={mockPayloadSuggestions}
        analysisResult={null}
        appliedPayloads={['payload1', 'payload2']}
        applicationResult={null}
        savedPayloads={mockSavedPayloads}
        onOpenSavedPayloads={mockOnOpenSavedPayloads}
      />
    );

    expect(screen.getByText('Ready')).toBeInTheDocument();
    expect(screen.getByText('Payloads: 2')).toBeInTheDocument();
    expect(screen.getByText('Injection Points: 0')).toBeInTheDocument();
    expect(screen.getByText('Applied: 2')).toBeInTheDocument();
    expect(screen.getByText('Saved Payloads (1)')).toBeInTheDocument();
  });

  it('shows injection points count when analysis result is available', () => {
    const analysisResult = {
      injection_points: [
        { parameter: 'id', location: 'url' as const, value: '1', type: 'GET' },
        { parameter: 'name', location: 'body' as const, value: 'test', type: 'POST' }
      ],
      suggested_payloads: [],
      risk_assessment: 'High risk'
    };

    renderWithTheme(
      <StatusIsland
        payloadSuggestions={mockPayloadSuggestions}
        analysisResult={analysisResult}
        appliedPayloads={[]}
        applicationResult={null}
        savedPayloads={mockSavedPayloads}
        onOpenSavedPayloads={mockOnOpenSavedPayloads}
      />
    );

    expect(screen.getByText('Injection Points: 2')).toBeInTheDocument();
  });

  it('displays last applied payload information', () => {
    const applicationResult = {
      success: true,
      modified_request: {
        method: 'GET',
        url: 'https://example.com',
        headers: {},
        body: ''
      },
      applied_payload: {
        payload: { payload: "' OR 1=1 --", type: 'boolean_blind', risk_level: 'high' as const, description: 'Test' },
        injection_point: { parameter: 'id', location: 'url' as const, value: '1', type: 'GET' },
        applied_at: new Date()
      },
      preview: "Applied payload to 'id' parameter"
    };

    renderWithTheme(
      <StatusIsland
        payloadSuggestions={mockPayloadSuggestions}
        analysisResult={null}
        appliedPayloads={[]}
        applicationResult={applicationResult}
        savedPayloads={mockSavedPayloads}
        onOpenSavedPayloads={mockOnOpenSavedPayloads}
      />
    );

    expect(screen.getByText('Last applied: boolean_blind')).toBeInTheDocument();
  });

  it('shows default message when no payload is applied', () => {
    renderWithTheme(
      <StatusIsland
        payloadSuggestions={mockPayloadSuggestions}
        analysisResult={null}
        appliedPayloads={[]}
        applicationResult={null}
        savedPayloads={mockSavedPayloads}
        onOpenSavedPayloads={mockOnOpenSavedPayloads}
      />
    );

    expect(screen.getByText('No payload applied')).toBeInTheDocument();
  });

  it('calls onOpenSavedPayloads when saved payloads button is clicked', () => {
    renderWithTheme(
      <StatusIsland
        payloadSuggestions={mockPayloadSuggestions}
        analysisResult={null}
        appliedPayloads={[]}
        applicationResult={null}
        savedPayloads={mockSavedPayloads}
        onOpenSavedPayloads={mockOnOpenSavedPayloads}
      />
    );

    const savedPayloadsButton = screen.getByText('Saved Payloads (1)');
    fireEvent.click(savedPayloadsButton);

    expect(mockOnOpenSavedPayloads).toHaveBeenCalledTimes(1);
  });

  it('has proper island styling and positioning', () => {
    renderWithTheme(
      <StatusIsland
        payloadSuggestions={mockPayloadSuggestions}
        analysisResult={null}
        appliedPayloads={[]}
        applicationResult={null}
        savedPayloads={mockSavedPayloads}
        onOpenSavedPayloads={mockOnOpenSavedPayloads}
      />
    );

    const islandContainer = screen.getByText('Ready').closest('.island');
    expect(islandContainer).toBeInTheDocument();
    expect(islandContainer).toHaveClass('island-variant-secondary');
    expect(islandContainer).toHaveClass('island-elevation-low');
    expect(islandContainer).toHaveClass('fixed');
    expect(islandContainer).toHaveClass('bottom-4');
  });
});
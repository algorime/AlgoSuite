import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContentIsland } from './ContentIsland';
import { ThemeProvider } from '../../contexts/ThemeContext';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('ContentIsland', () => {
  it('renders children correctly', () => {
    renderWithTheme(
      <ContentIsland contentType="chat">
        <div>Test Content</div>
      </ContentIsland>
    );
    
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies correct content type class', () => {
    const { container } = renderWithTheme(
      <ContentIsland contentType="dashboard">
        <div>Dashboard Content</div>
      </ContentIsland>
    );
    
    const contentIsland = container.querySelector('.content-island-dashboard');
    expect(contentIsland).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    renderWithTheme(
      <ContentIsland contentType="editor" title="Test Title">
        <div>Editor Content</div>
      </ContentIsland>
    );
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders header content when provided', () => {
    renderWithTheme(
      <ContentIsland 
        contentType="studio" 
        headerContent={<span>Header Action</span>}
      >
        <div>Studio Content</div>
      </ContentIsland>
    );
    
    expect(screen.getByText('Header Action')).toBeInTheDocument();
  });

  it('shows loading skeleton when isLoading is true', () => {
    const { container } = renderWithTheme(
      <ContentIsland contentType="chat" isLoading={true}>
        <div>Chat Content</div>
      </ContentIsland>
    );
    
    const loadingElement = container.querySelector('.animate-pulse');
    expect(loadingElement).toBeInTheDocument();
  });

  it('applies fill height class when fillHeight is true', () => {
    const { container } = renderWithTheme(
      <ContentIsland contentType="chat" fillHeight={true}>
        <div>Chat Content</div>
      </ContentIsland>
    );
    
    const fillHeightElement = container.querySelector('.content-island-fill-height');
    expect(fillHeightElement).toBeInTheDocument();
  });
});
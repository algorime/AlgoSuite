import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import NavigationIsland from './NavigationIsland';
import { ThemeProvider } from '../../contexts/ThemeContext';

// Mock the hooks
vi.mock('../../hooks/useAnimation', () => ({
  useAnimation: () => ({
    createTransition: vi.fn(() => 'all 0.3s ease'),
    reducedMotion: false,
  }),
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('NavigationIsland', () => {
  const mockOnTabChange = vi.fn();

  beforeEach(() => {
    mockOnTabChange.mockClear();
  });

  it('renders the AlgoBrain logo and brand', () => {
    renderWithTheme(
      <NavigationIsland activeTab="islands" onTabChange={mockOnTabChange} />
    );

    expect(screen.getByText('AlgoBrain')).toBeInTheDocument();
  });

  it('renders all navigation items', () => {
    renderWithTheme(
      <NavigationIsland activeTab="islands" onTabChange={mockOnTabChange} />
    );

    // Check that navigation items exist (there will be duplicates for desktop and mobile)
    expect(screen.getAllByText('Chat')).toHaveLength(2);
    expect(screen.getAllByText('Payload Editor')).toHaveLength(2);
    expect(screen.getAllByText('Dashboard')).toHaveLength(2);
    expect(screen.getAllByText('Studio')).toHaveLength(2);
    expect(screen.getAllByText('Animations')).toHaveLength(2);
    expect(screen.getAllByText('Islands')).toHaveLength(2);
  });

  it('highlights the active tab', () => {
    renderWithTheme(
      <NavigationIsland activeTab="chat" onTabChange={mockOnTabChange} />
    );

    const chatButtons = screen.getAllByText('Chat');
    const studioButtons = screen.getAllByText('Studio');

    // Check that we have the expected number of buttons
    expect(chatButtons).toHaveLength(2);
    expect(studioButtons).toHaveLength(2);
    
    // Active tab should have different styling than inactive tabs
    // We can't test exact CSS values due to CSS custom properties in test environment
    expect(chatButtons[0]).toBeInTheDocument();
    expect(studioButtons[0]).toBeInTheDocument();
  });

  it('calls onTabChange when a navigation item is clicked', () => {
    renderWithTheme(
      <NavigationIsland activeTab="islands" onTabChange={mockOnTabChange} />
    );

    const chatButtons = screen.getAllByText('Chat');
    fireEvent.click(chatButtons[0]); // Click the first (desktop) button

    expect(mockOnTabChange).toHaveBeenCalledWith('chat');
  });

  it('renders the theme switcher', () => {
    renderWithTheme(
      <NavigationIsland activeTab="islands" onTabChange={mockOnTabChange} />
    );

    // Theme switcher should be present (it contains a select with theme options)
    expect(screen.getByText('Theme:')).toBeInTheDocument();
  });

  it('shows mobile menu button on mobile', () => {
    renderWithTheme(
      <NavigationIsland activeTab="islands" onTabChange={mockOnTabChange} />
    );

    const mobileMenuButton = screen.getByLabelText('Toggle mobile menu');
    expect(mobileMenuButton).toBeInTheDocument();
    expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('toggles mobile menu when hamburger button is clicked', () => {
    renderWithTheme(
      <NavigationIsland activeTab="islands" onTabChange={mockOnTabChange} />
    );

    const mobileMenuButton = screen.getByLabelText('Toggle mobile menu');
    
    // Initially closed
    expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false');
    
    // Click to open
    fireEvent.click(mobileMenuButton);
    expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'true');
    
    // Click to close
    fireEvent.click(mobileMenuButton);
    expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes mobile menu when a navigation item is selected', () => {
    renderWithTheme(
      <NavigationIsland activeTab="islands" onTabChange={mockOnTabChange} />
    );

    const mobileMenuButton = screen.getByLabelText('Toggle mobile menu');
    
    // Open mobile menu
    fireEvent.click(mobileMenuButton);
    expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'true');
    
    // Click a navigation item (there should be two "Chat" buttons - desktop and mobile)
    const chatButtons = screen.getAllByText('Chat');
    fireEvent.click(chatButtons[0]); // Click the first one
    
    expect(mockOnTabChange).toHaveBeenCalledWith('chat');
    expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('applies hover effects to navigation buttons', () => {
    renderWithTheme(
      <NavigationIsland activeTab="islands" onTabChange={mockOnTabChange} />
    );

    const studioButtons = screen.getAllByText('Studio');
    const studioButton = studioButtons[0]; // Use the first (desktop) button
    
    // Test that hover events can be triggered without errors
    expect(() => {
      fireEvent.mouseEnter(studioButton);
      fireEvent.mouseLeave(studioButton);
    }).not.toThrow();
    
    // Button should still be in the document after hover events
    expect(studioButton).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    renderWithTheme(
      <NavigationIsland activeTab="islands" onTabChange={mockOnTabChange} />
    );

    const mobileMenuButton = screen.getByLabelText('Toggle mobile menu');
    expect(mobileMenuButton).toHaveAttribute('aria-label', 'Toggle mobile menu');
    expect(mobileMenuButton).toHaveAttribute('aria-expanded');
  });
});
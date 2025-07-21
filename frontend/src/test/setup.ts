import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock scrollIntoView for DOM elements
Element.prototype.scrollIntoView = vi.fn();

// Mock HTMLElement.scrollIntoView specifically
Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
  configurable: true,
  value: vi.fn(),
});

// Mock CSS custom properties for tests
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: (prop: string) => {
      const mockValues: Record<string, string> = {
        '--color-island-bg': '#ffffff',
        '--color-island-border': '#e2e8f0',
        '--shadow-low': '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        '--shadow-medium': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        '--shadow-high': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        '--border-radius-island': '0.75rem',
        '--spacing-island-padding': '1.5rem',
        '--transition-duration-normal': '300ms',
        '--transition-easing': 'cubic-bezier(0.4, 0, 0.2, 1)',
      };
      return mockValues[prop] || '';
    },
  }),
});

// Mock matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
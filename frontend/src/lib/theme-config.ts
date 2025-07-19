import type { ThemeConfig } from '../types/theme.js';

export const lightThemeConfig: Omit<ThemeConfig, 'mode'> = {
  colors: {
    background: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      gradient: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
    },
    island: {
      background: '#ffffff',
      border: '#e2e8f0',
      shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
      accent: '#3b82f6',
    },
    interactive: {
      primary: '#3b82f6',
      secondary: '#64748b',
      hover: '#2563eb',
      active: '#1d4ed8',
    },
  },
  spacing: {
    island: {
      padding: '1.5rem',
      margin: '1rem',
      gap: '1rem',
    },
  },
  borderRadius: {
    island: '0.75rem', // 12px - more appropriate for islands
    button: '0.5rem',
    input: '0.375rem',
  },
  shadows: {
    low: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    high: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    transitions: {
      island: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
      theme: 'background-color 500ms cubic-bezier(0.4, 0, 0.2, 1), border-color 500ms cubic-bezier(0.4, 0, 0.2, 1), color 500ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 500ms cubic-bezier(0.4, 0, 0.2, 1)',
      hover: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
      elevation: 'box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1), transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
};

export const darkThemeConfig: Omit<ThemeConfig, 'mode'> = {
  colors: {
    background: {
      primary: '#18191B',
      secondary: '#252629',
      gradient: 'linear-gradient(135deg, #18191B 0%, #252629 100%)',
    },
    island: {
      background: '#252629',
      border: '#323438',
      shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
    },
    text: {
      primary: '#F8F8F9',
      secondary: '#898E94',
      accent: '#2A7DEB',
    },
    interactive: {
      primary: '#2A7DEB',
      secondary: '#6E747B',
      hover: '#4B8DEC',
      active: '#71A3EF',
    },
  },
  spacing: {
    island: {
      padding: '1.5rem',
      margin: '1rem',
      gap: '1rem',
    },
  },
  borderRadius: {
    island: '0.75rem', // 12px - more appropriate for islands
    button: '0.5rem',
    input: '0.375rem',
  },
  shadows: {
    low: '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)',
    medium: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
    high: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
  },
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    transitions: {
      island: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
      theme: 'background-color 500ms cubic-bezier(0.4, 0, 0.2, 1), border-color 500ms cubic-bezier(0.4, 0, 0.2, 1), color 500ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 500ms cubic-bezier(0.4, 0, 0.2, 1)',
      hover: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
      elevation: 'box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1), transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
};

export const getThemeConfig = (mode: 'light' | 'dark'): ThemeConfig => ({
  mode,
  ...(mode === 'light' ? lightThemeConfig : darkThemeConfig),
});
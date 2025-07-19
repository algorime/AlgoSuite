import type { ThemeMode } from '../types/theme.js';

const THEME_STORAGE_KEY = 'algobrain-theme';

export const getStoredTheme = (): ThemeMode => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      return stored as ThemeMode;
    }
  } catch (error) {
    // localStorage not available, try sessionStorage
    try {
      const stored = sessionStorage.getItem(THEME_STORAGE_KEY);
      if (stored && ['light', 'dark', 'system'].includes(stored)) {
        return stored as ThemeMode;
      }
    } catch (sessionError) {
      // Both storage methods failed, return default
      console.warn('Theme storage not available, using system default');
    }
  }
  return 'system';
};

export const setStoredTheme = (theme: ThemeMode): void => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    // localStorage not available, try sessionStorage
    try {
      sessionStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (sessionError) {
      console.warn('Theme storage not available, theme preference will not persist');
    }
  }
};

export const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'dark'; // Default fallback
};

export const resolveTheme = (theme: ThemeMode): 'light' | 'dark' => {
  if (theme === 'system') {
    return getSystemTheme();
  }
  return theme;
};

export const applyThemeToDocument = (resolvedTheme: 'light' | 'dark'): void => {
  const root = document.documentElement;
  
  // Remove existing theme classes
  root.classList.remove('light', 'dark');
  
  // Add current theme class
  root.classList.add(resolvedTheme);
  
  // Update data attribute for CSS selectors
  root.setAttribute('data-theme', resolvedTheme);
};
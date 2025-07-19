import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { ThemeMode, ThemeContextType } from '../types/theme.js';
import { getThemeConfig } from '../lib/theme-config.js';
import { 
  getStoredTheme, 
  setStoredTheme, 
  resolveTheme, 
  applyThemeToDocument,
  getSystemTheme 
} from '../lib/theme-utils.js';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => getStoredTheme());
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => 
    resolveTheme(getStoredTheme())
  );

  const setTheme = (newTheme: ThemeMode) => {
    // Add theme switching animation class
    const root = document.documentElement;
    root.classList.add('theme-switching');
    
    setThemeState(newTheme);
    setStoredTheme(newTheme);
    const resolved = resolveTheme(newTheme);
    setResolvedTheme(resolved);
    applyThemeToDocument(resolved);
    
    // Remove animation class after transition completes
    setTimeout(() => {
      root.classList.remove('theme-switching');
    }, 500); // Match the slow transition duration
  };

  // Listen for system theme changes when using 'system' mode
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const newResolvedTheme = e.matches ? 'dark' : 'light';
      setResolvedTheme(newResolvedTheme);
      applyThemeToDocument(newResolvedTheme);
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [theme]);

  // Apply theme on mount and when resolved theme changes
  useEffect(() => {
    applyThemeToDocument(resolvedTheme);
  }, [resolvedTheme]);

  // Initialize CSS custom properties
  useEffect(() => {
    const config = getThemeConfig(resolvedTheme);
    const root = document.documentElement;

    // Apply CSS custom properties
    root.style.setProperty('--color-bg-primary', config.colors.background.primary);
    root.style.setProperty('--color-bg-secondary', config.colors.background.secondary);
    root.style.setProperty('--color-bg-gradient', config.colors.background.gradient);
    
    root.style.setProperty('--color-island-bg', config.colors.island.background);
    root.style.setProperty('--color-island-border', config.colors.island.border);
    root.style.setProperty('--color-island-shadow', config.colors.island.shadow);
    
    root.style.setProperty('--color-text-primary', config.colors.text.primary);
    root.style.setProperty('--color-text-secondary', config.colors.text.secondary);
    root.style.setProperty('--color-text-accent', config.colors.text.accent);
    
    root.style.setProperty('--color-interactive-primary', config.colors.interactive.primary);
    root.style.setProperty('--color-interactive-secondary', config.colors.interactive.secondary);
    root.style.setProperty('--color-interactive-hover', config.colors.interactive.hover);
    root.style.setProperty('--color-interactive-active', config.colors.interactive.active);
    
    root.style.setProperty('--spacing-island-padding', config.spacing.island.padding);
    root.style.setProperty('--spacing-island-margin', config.spacing.island.margin);
    root.style.setProperty('--spacing-island-gap', config.spacing.island.gap);
    
    root.style.setProperty('--border-radius-island', config.borderRadius.island);
    root.style.setProperty('--border-radius-button', config.borderRadius.button);
    root.style.setProperty('--border-radius-input', config.borderRadius.input);
    
    root.style.setProperty('--shadow-low', config.shadows.low);
    root.style.setProperty('--shadow-medium', config.shadows.medium);
    root.style.setProperty('--shadow-high', config.shadows.high);
    
    // Animation properties
    root.style.setProperty('--transition-duration-fast', config.animations.duration.fast);
    root.style.setProperty('--transition-duration-normal', config.animations.duration.normal);
    root.style.setProperty('--transition-duration-slow', config.animations.duration.slow);
    
    root.style.setProperty('--transition-easing', config.animations.easing.ease);
    root.style.setProperty('--transition-easing-in', config.animations.easing.easeIn);
    root.style.setProperty('--transition-easing-out', config.animations.easing.easeOut);
    root.style.setProperty('--transition-easing-in-out', config.animations.easing.easeInOut);
    
    root.style.setProperty('--transition-island', config.animations.transitions.island);
    root.style.setProperty('--transition-theme', config.animations.transitions.theme);
    root.style.setProperty('--transition-hover', config.animations.transitions.hover);
    root.style.setProperty('--transition-elevation', config.animations.transitions.elevation);
  }, [resolvedTheme]);

  const contextValue: ThemeContextType = {
    theme,
    resolvedTheme,
    setTheme,
    config: getThemeConfig(resolvedTheme),
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
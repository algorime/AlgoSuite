import React, { useState } from 'react';
import { useTheme } from '../../hooks/useTheme.js';
import { useAnimation } from '../../hooks/useAnimation.js';
import type { ThemeMode } from '../../types/theme.js';

const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { createTransition, reducedMotion } = useAnimation();
  const [isChanging, setIsChanging] = useState(false);

  const handleThemeChange = (newTheme: ThemeMode) => {
    if (newTheme === theme) return;
    
    setIsChanging(true);
    setTheme(newTheme);
    
    // Reset changing state after animation completes
    setTimeout(() => {
      setIsChanging(false);
    }, reducedMotion ? 0 : 500);
  };

  const selectStyles = {
    backgroundColor: 'var(--color-island-bg)',
    borderColor: 'var(--color-island-border)',
    color: 'var(--color-text-primary)',
    borderRadius: 'var(--border-radius-button)',
    transition: createTransition(['background-color', 'border-color', 'color', 'transform'], 'normal'),
    transform: isChanging && !reducedMotion ? 'scale(1.05)' : 'scale(1)',
  };

  return (
    <div className="flex items-center space-x-2">
      <span 
        className="text-sm font-medium" 
        style={{ 
          color: 'var(--color-text-secondary)',
          transition: createTransition(['color'], 'normal'),
        }}
      >
        Theme:
      </span>
      <select
        value={theme}
        onChange={(e) => handleThemeChange(e.target.value as ThemeMode)}
        className="px-3 py-1 text-sm rounded border interactive-hover"
        style={selectStyles}
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
    </div>
  );
};

export default ThemeSwitcher;
import React, { useState, useEffect } from 'react';
import { useIslandAnimation } from '../../hooks/useAnimation.js';
import type { ElevationLevel } from '../../types/animation.js';

interface AnimatedIslandProps {
  children: React.ReactNode;
  elevation?: ElevationLevel;
  variant?: 'primary' | 'secondary' | 'accent' | 'danger';
  appear?: boolean;
  className?: string;
  onClick?: () => void;
}

export const AnimatedIsland: React.FC<AnimatedIslandProps> = ({
  children,
  elevation = 'medium',
  variant = 'primary',
  appear = true,
  className = '',
  onClick,
}) => {
  const [isVisible, setIsVisible] = useState(!appear);
  const [isHovered, setIsHovered] = useState(false);
  const { getElevationStyles, getAppearanceStyles, getThemeTransitionStyles } = useIslandAnimation(elevation);

  useEffect(() => {
    if (appear) {
      // Small delay to ensure smooth appearance animation
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    }
  }, [appear]);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  const elevationStyles = getElevationStyles(elevation, isHovered);
  const appearanceStyles = getAppearanceStyles(isVisible);
  const themeStyles = getThemeTransitionStyles();

  const variantClasses = {
    primary: 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700',
    secondary: 'bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-600',
    accent: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800',
    danger: 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800',
  };

  return (
    <div
      className={`
        island
        ${variantClasses[variant]}
        ${className}
      `.trim()}
      style={{
        ...elevationStyles,
        ...appearanceStyles,
        ...themeStyles,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
};
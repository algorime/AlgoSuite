import type { ElevationLevel } from '../types/animation.js';

export const getElevationClasses = (level: ElevationLevel, isHovered: boolean = false): string => {
  const baseClasses = 'transform-gpu transition-all duration-300 ease-out';
  
  const elevationMap = {
    none: '',
    low: isHovered 
      ? 'shadow-md -translate-y-0.5' 
      : 'shadow-sm',
    medium: isHovered 
      ? 'shadow-lg -translate-y-1' 
      : 'shadow-md',
    high: isHovered 
      ? 'shadow-xl -translate-y-1.5' 
      : 'shadow-lg',
  };

  return `${baseClasses} ${elevationMap[level]}`.trim();
};

export const getAppearanceClasses = (isVisible: boolean): string => {
  return isVisible 
    ? 'opacity-100 translate-y-0 scale-100 transition-all duration-300 ease-out'
    : 'opacity-0 translate-y-5 scale-95 transition-all duration-300 ease-out';
};

export const getThemeTransitionClasses = (): string => {
  return 'transition-colors duration-500 ease-in-out';
};

export const getHoverClasses = (): string => {
  return 'transition-all duration-150 ease-out hover:scale-[1.02] active:scale-[0.98]';
};

export const getReducedMotionClasses = (): string => {
  return 'motion-reduce:transition-none motion-reduce:transform-none';
};

export const combineAnimationClasses = (...classes: string[]): string => {
  return classes.filter(Boolean).join(' ');
};
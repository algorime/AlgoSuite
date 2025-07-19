import { useState, useEffect, useCallback } from 'react';
import { getAnimationConfig, buildTransition } from '../lib/animation-config.js';
import type { AnimationConfig, ElevationLevel } from '../types/animation.js';

export const useAnimation = () => {
  const [config, setConfig] = useState<AnimationConfig>(getAnimationConfig());

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = () => {
      setConfig(getAnimationConfig());
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const createTransition = useCallback((
    properties: string[],
    duration: keyof AnimationConfig['duration'] = 'normal',
    easing: keyof AnimationConfig['easing'] = 'ease'
  ) => {
    return buildTransition(properties, duration, easing, config.reducedMotion);
  }, [config.reducedMotion]);

  return {
    config,
    createTransition,
    reducedMotion: config.reducedMotion,
  };
};

export const useIslandAnimation = (elevation: ElevationLevel = 'low') => {
  const { config, createTransition } = useAnimation();
  
  const getElevationStyles = useCallback((level: ElevationLevel, isHovered: boolean = false) => {
    const baseTransform = 'translateZ(0)'; // Force hardware acceleration
    
    if (config.reducedMotion) {
      return {
        transform: baseTransform,
        transition: 'none',
      };
    }

    const elevationMap = {
      none: { transform: baseTransform, boxShadow: 'none' },
      low: { 
        transform: isHovered ? 'translateY(-2px) translateZ(0)' : baseTransform,
        boxShadow: isHovered 
          ? '0 4px 12px -2px rgba(0, 0, 0, 0.15), 0 2px 6px -1px rgba(0, 0, 0, 0.1)'
          : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
      },
      medium: { 
        transform: isHovered ? 'translateY(-4px) translateZ(0)' : baseTransform,
        boxShadow: isHovered 
          ? '0 8px 25px -5px rgba(0, 0, 0, 0.2), 0 4px 10px -2px rgba(0, 0, 0, 0.15)'
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      },
      high: { 
        transform: isHovered ? 'translateY(-6px) translateZ(0)' : baseTransform,
        boxShadow: isHovered 
          ? '0 20px 40px -12px rgba(0, 0, 0, 0.25), 0 8px 16px -4px rgba(0, 0, 0, 0.2)'
          : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
      },
    };

    return {
      ...elevationMap[level],
      transition: createTransition(['transform', 'box-shadow'], 'normal', 'easeOut'),
    };
  }, [config.reducedMotion, createTransition]);

  const getAppearanceStyles = useCallback((isVisible: boolean) => {
    if (config.reducedMotion) {
      return {
        opacity: isVisible ? 1 : 0,
        transition: 'none',
      };
    }

    return {
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
      transition: createTransition(['opacity', 'transform'], 'normal', 'easeOut'),
    };
  }, [config.reducedMotion, createTransition]);

  const getThemeTransitionStyles = useCallback(() => {
    if (config.reducedMotion) {
      return { transition: 'none' };
    }

    return {
      transition: createTransition([
        'background-color',
        'border-color',
        'color',
        'box-shadow'
      ], 'slow', 'ease'),
    };
  }, [config.reducedMotion, createTransition]);

  return {
    getElevationStyles,
    getAppearanceStyles,
    getThemeTransitionStyles,
    reducedMotion: config.reducedMotion,
  };
};
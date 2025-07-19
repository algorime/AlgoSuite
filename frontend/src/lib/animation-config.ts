import type { AnimationConfig } from '../types/animation.js';

export const animationConfig: AnimationConfig = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  transitions: {
    island: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    theme: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)',
    hover: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    elevation: 'box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1), transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
  reducedMotion: false, // Will be set dynamically based on user preference
};

export const getAnimationConfig = (): AnimationConfig => {
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  return {
    ...animationConfig,
    reducedMotion: prefersReducedMotion,
  };
};

export const getTransitionDuration = (duration: keyof AnimationConfig['duration'], reducedMotion: boolean = false): number => {
  if (reducedMotion) return 0;
  return animationConfig.duration[duration];
};

export const getTransitionEasing = (easing: keyof AnimationConfig['easing']): string => {
  return animationConfig.easing[easing];
};

export const buildTransition = (
  properties: string[],
  duration: keyof AnimationConfig['duration'] = 'normal',
  easing: keyof AnimationConfig['easing'] = 'ease',
  reducedMotion: boolean = false
): string => {
  if (reducedMotion) return 'none';
  
  const durationMs = getTransitionDuration(duration, reducedMotion);
  const easingValue = getTransitionEasing(easing);
  
  return properties
    .map(prop => `${prop} ${durationMs}ms ${easingValue}`)
    .join(', ');
};
import { useState, useEffect } from 'react';
import { useTheme } from './useTheme.js';

export type BreakpointKey = 'mobile' | 'tablet' | 'desktop' | 'wide';
export type ContainerQueryKey = 'small' | 'medium' | 'large' | 'xlarge';

export interface ResponsiveState {
  breakpoint: BreakpointKey;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWide: boolean;
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  isTouchDevice: boolean;
  prefersReducedMotion: boolean;
  prefersHighContrast: boolean;
}

export interface ContainerQueryState {
  size: ContainerQueryKey;
  width: number;
  height: number;
}

/**
 * Hook for responsive design utilities
 * Provides current breakpoint, device capabilities, and responsive utilities
 */
export const useResponsive = (): ResponsiveState => {
  const { config } = useTheme();
  
  const [state, setState] = useState<ResponsiveState>(() => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const height = typeof window !== 'undefined' ? window.innerHeight : 768;
    
    return {
      breakpoint: getBreakpoint(width, config.breakpoints),
      isMobile: width < parseInt(config.breakpoints.mobile),
      isTablet: width >= parseInt(config.breakpoints.mobile) && width < parseInt(config.breakpoints.desktop),
      isDesktop: width >= parseInt(config.breakpoints.desktop) && width < parseInt(config.breakpoints.wide),
      isWide: width >= parseInt(config.breakpoints.wide),
      width,
      height,
      orientation: width > height ? 'landscape' : 'portrait',
      isTouchDevice: typeof window !== 'undefined' && 'ontouchstart' in window,
      prefersReducedMotion: typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      prefersHighContrast: typeof window !== 'undefined' && window.matchMedia('(prefers-contrast: high)').matches,
    };
  });

  useEffect(() => {
    const updateState = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setState({
        breakpoint: getBreakpoint(width, config.breakpoints),
        isMobile: width < parseInt(config.breakpoints.mobile),
        isTablet: width >= parseInt(config.breakpoints.mobile) && width < parseInt(config.breakpoints.desktop),
        isDesktop: width >= parseInt(config.breakpoints.desktop) && width < parseInt(config.breakpoints.wide),
        isWide: width >= parseInt(config.breakpoints.wide),
        width,
        height,
        orientation: width > height ? 'landscape' : 'portrait',
        isTouchDevice: 'ontouchstart' in window,
        prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        prefersHighContrast: window.matchMedia('(prefers-contrast: high)').matches,
      });
    };

    const handleResize = () => {
      updateState();
    };

    const handleOrientationChange = () => {
      // Small delay to ensure dimensions are updated after orientation change
      setTimeout(updateState, 100);
    };

    // Media query listeners for accessibility preferences
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');

    const handleReducedMotionChange = () => updateState();
    const handleHighContrastChange = () => updateState();

    // Add event listeners
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);
    highContrastQuery.addEventListener('change', handleHighContrastChange);

    // Initial update
    updateState();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
      highContrastQuery.removeEventListener('change', handleHighContrastChange);
    };
  }, [config.breakpoints]);

  return state;
};

/**
 * Hook for container queries
 * Monitors the size of a specific container element
 */
export const useContainerQuery = (containerRef: React.RefObject<HTMLElement> | null): ContainerQueryState => {
  const { config } = useTheme();
  
  const [state, setState] = useState<ContainerQueryState>(() => ({
    size: 'medium',
    width: 0,
    height: 0,
  }));

  useEffect(() => {
    if (!containerRef) return;
    const container = containerRef.current;
    if (!container) return;

    const updateState = () => {
      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      
      setState({
        size: getContainerSize(width, config.breakpoints.containerQueries),
        width,
        height,
      });
    };

    // Use ResizeObserver for container queries
    const resizeObserver = new ResizeObserver(() => {
      updateState();
    });

    resizeObserver.observe(container);
    updateState(); // Initial measurement

    return () => {
      resizeObserver.disconnect();
    };
  }, [config.breakpoints.containerQueries]);

  return state;
};

/**
 * Utility function to determine current breakpoint
 */
function getBreakpoint(width: number, breakpoints: any): BreakpointKey {
  if (width < parseInt(breakpoints.mobile)) return 'mobile';
  if (width < parseInt(breakpoints.desktop)) return 'tablet';
  if (width < parseInt(breakpoints.wide)) return 'desktop';
  return 'wide';
}

/**
 * Utility function to determine container size
 */
function getContainerSize(width: number, containerQueries: any): ContainerQueryKey {
  if (width < parseInt(containerQueries.small)) return 'small';
  if (width < parseInt(containerQueries.medium)) return 'small';
  if (width < parseInt(containerQueries.large)) return 'medium';
  if (width < parseInt(containerQueries.xlarge)) return 'large';
  return 'xlarge';
}

/**
 * Utility function to get responsive spacing
 */
export const getResponsiveSpacing = (
  breakpoint: BreakpointKey,
  spacing: any
): { padding: string; margin: string; gap: string } => {
  switch (breakpoint) {
    case 'mobile':
      return spacing.responsive.mobile;
    case 'tablet':
      return spacing.responsive.tablet;
    case 'desktop':
    case 'wide':
      return spacing.responsive.desktop;
    default:
      return spacing.island;
  }
};

/**
 * Utility function to check if device supports hover
 */
export const supportsHover = (): boolean => {
  return typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;
};

/**
 * Utility function to check if device supports pointer fine
 */
export const supportsPointerFine = (): boolean => {
  return typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches;
};
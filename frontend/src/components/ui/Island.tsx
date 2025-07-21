import React, { forwardRef, useRef, useEffect, useCallback, useState } from 'react';
import { useTheme } from '../../hooks/useTheme.js';
import { useResponsive, useContainerQuery, getResponsiveSpacing } from '../../hooks/useResponsive.js';

export type IslandVariant = 'primary' | 'secondary' | 'accent' | 'danger';
export type IslandElevation = 'none' | 'low' | 'medium' | 'high';
export type IslandSize = 'sm' | 'md' | 'lg' | 'xl';
export type IslandLayout = 'default' | 'compact' | 'spacious' | 'minimal';

export interface ResponsiveIslandProps {
  /** Size for this breakpoint */
  size?: IslandSize;
  /** Custom padding for this breakpoint */
  padding?: string;
  /** Layout variant for this breakpoint */
  layout?: IslandLayout;
  /** Elevation for this breakpoint */
  elevation?: IslandElevation;
  /** Whether to hide the island at this breakpoint */
  hidden?: boolean;
  /** Custom margin for this breakpoint */
  margin?: string;
  /** Custom gap for this breakpoint */
  gap?: string;
}

export interface IslandProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual variant of the island */
  variant?: IslandVariant;
  /** Shadow elevation level */
  elevation?: IslandElevation;
  /** Size preset for padding and spacing */
  size?: IslandSize;
  /** Layout variant affecting internal spacing and arrangement */
  layout?: IslandLayout;
  /** Whether the island should appear with animation */
  appear?: boolean;
  /** Whether the island is interactive (clickable) */
  interactive?: boolean;
  /** Custom padding override */
  padding?: string;
  /** Custom margin override */
  margin?: string;
  /** Whether to enable container queries for this island */
  enableContainerQueries?: boolean;
  /** Whether to optimize for touch interactions */
  touchOptimized?: boolean;
  /** Responsive props for different screen sizes */
  responsive?: {
    mobile?: ResponsiveIslandProps;
    tablet?: ResponsiveIslandProps;
    desktop?: ResponsiveIslandProps;
    wide?: ResponsiveIslandProps;
  };
  /** Accessibility label for the island */
  ariaLabel?: string;
  /** Accessibility description for the island */
  ariaDescription?: string;
  /** Whether the island is a landmark region */
  landmark?: boolean;
  /** Landmark role if this is a landmark */
  landmarkRole?: 'main' | 'navigation' | 'banner' | 'contentinfo' | 'complementary' | 'region';
  /** Whether to announce state changes to screen readers */
  announceChanges?: boolean;
  /** Custom focus management */
  focusManagement?: {
    /** Whether this island should be focusable */
    focusable?: boolean;
    /** Whether to trap focus within this island */
    trapFocus?: boolean;
    /** Whether to restore focus when island is closed/hidden */
    restoreFocus?: boolean;
  };
  children: React.ReactNode;
}

const Island = forwardRef<HTMLDivElement, IslandProps>(({
  variant = 'primary',
  elevation = 'medium',
  size = 'md',
  layout = 'default',
  appear = false,
  interactive = false,
  padding,
  margin,
  enableContainerQueries = false,
  touchOptimized = false,
  responsive,
  ariaLabel,
  ariaDescription,
  landmark = false,
  landmarkRole,
  announceChanges = false,
  focusManagement,
  className = '',
  children,
  onClick,
  onKeyDown,
  ...props
}, ref) => {
  const { config, resolvedTheme } = useTheme();
  const responsiveState = useResponsive();
  const containerRef = useRef<HTMLDivElement>(null);
  const containerQuery = useContainerQuery(enableContainerQueries ? (containerRef as React.RefObject<HTMLElement>) : null);
  
  // Accessibility state management
  const [isPressed, setIsPressed] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [announceText, setAnnounceText] = useState<string>('');
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const descriptionId = useRef(`island-desc-${Math.random().toString(36).substr(2, 9)}`);
  
  // Focus trap management
  const focusableElementsRef = useRef<HTMLElement[]>([]);
  const firstFocusableRef = useRef<HTMLElement | null>(null);
  const lastFocusableRef = useRef<HTMLElement | null>(null);

  // Accessibility utilities
  const getFocusableElements = useCallback((container: HTMLElement): HTMLElement[] => {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
      'details summary',
      'audio[controls]',
      'video[controls]'
    ].join(', ');
    
    return Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];
  }, []);

  const updateFocusableElements = useCallback(() => {
    const container = enableContainerQueries ? containerRef.current : (ref as React.RefObject<HTMLDivElement>)?.current;
    if (!container) return;

    const elements = getFocusableElements(container);
    focusableElementsRef.current = elements;
    firstFocusableRef.current = elements[0] || null;
    lastFocusableRef.current = elements[elements.length - 1] || null;
  }, [getFocusableElements, enableContainerQueries, ref]);

  const announceToScreenReader = useCallback((message: string) => {
    if (!announceChanges) return;
    
    setAnnounceText(message);
    // Clear the announcement after a short delay to allow screen readers to read it
    setTimeout(() => setAnnounceText(''), 1000);
  }, [announceChanges]);

  const handleFocus = useCallback((event: React.FocusEvent<HTMLDivElement>) => {
    setIsFocused(true);
    
    if (focusManagement?.restoreFocus && !previousFocusRef.current) {
      previousFocusRef.current = event.relatedTarget as HTMLElement;
    }
    
    props.onFocus?.(event);
  }, [focusManagement?.restoreFocus, props]);

  const handleBlur = useCallback((event: React.FocusEvent<HTMLDivElement>) => {
    setIsFocused(false);
    props.onBlur?.(event);
  }, [props]);

  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (interactive) {
      setIsPressed(true);
    }
    props.onMouseDown?.(event);
  }, [interactive, props]);

  const handleMouseUp = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (interactive) {
      setIsPressed(false);
    }
    props.onMouseUp?.(event);
  }, [interactive, props]);

  const handleKeyDownWithAccessibility = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    // Handle focus trapping
    if (focusManagement?.trapFocus && (event.key === 'Tab')) {
      const isShiftTab = event.shiftKey;
      const activeElement = document.activeElement as HTMLElement;
      
      if (isShiftTab && activeElement === firstFocusableRef.current) {
        event.preventDefault();
        lastFocusableRef.current?.focus();
      } else if (!isShiftTab && activeElement === lastFocusableRef.current) {
        event.preventDefault();
        firstFocusableRef.current?.focus();
      }
    }

    // Handle interactive islands
    if (interactive) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setIsPressed(true);
        onClick?.(event as any);
        
        // Announce action to screen readers
        announceToScreenReader(`${ariaLabel || 'Island'} activated`);
        
        // Reset pressed state
        setTimeout(() => setIsPressed(false), 150);
      }
    }

    onKeyDown?.(event);
  }, [
    focusManagement?.trapFocus,
    interactive,
    onClick,
    onKeyDown,
    ariaLabel,
    announceToScreenReader
  ]);

  // Theme change announcements
  useEffect(() => {
    if (announceChanges) {
      announceToScreenReader(`Theme changed to ${resolvedTheme} mode`);
    }
  }, [resolvedTheme, announceChanges, announceToScreenReader]);

  // Update focusable elements when children change
  useEffect(() => {
    if (focusManagement?.trapFocus) {
      updateFocusableElements();
      
      // Set up mutation observer to watch for DOM changes
      const container = enableContainerQueries ? containerRef.current : (ref as React.RefObject<HTMLDivElement>)?.current;
      if (!container) return;

      const observer = new MutationObserver(() => {
        updateFocusableElements();
      });

      observer.observe(container, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['disabled', 'tabindex', 'href']
      });

      return () => observer.disconnect();
    }
  }, [focusManagement?.trapFocus, updateFocusableElements, enableContainerQueries, ref]);

  // Cleanup focus restoration
  useEffect(() => {
    return () => {
      if (focusManagement?.restoreFocus && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [focusManagement?.restoreFocus]);

  // Get current responsive props based on breakpoint
  const getCurrentResponsiveProps = (): ResponsiveIslandProps => {
    if (!responsive) return {};
    
    const { breakpoint } = responsiveState;
    return responsive[breakpoint] || {};
  };

  const currentResponsiveProps = getCurrentResponsiveProps();

  // Apply responsive overrides
  const finalVariant = variant;
  const finalElevation = currentResponsiveProps.elevation || elevation;
  const finalSize = currentResponsiveProps.size || size;
  const finalLayout = currentResponsiveProps.layout || layout;
  const finalPadding = currentResponsiveProps.padding || padding;
  const finalMargin = currentResponsiveProps.margin || margin;

  // Check if island should be hidden at current breakpoint
  if (currentResponsiveProps.hidden) {
    return null;
  }



  // Handle touch interactions for mobile devices
  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchOptimized && responsiveState.isTouchDevice) {
      // Add touch feedback
      event.currentTarget.style.transform = 'scale(0.98) translateZ(0)';
    }
    props.onTouchStart?.(event);
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchOptimized && responsiveState.isTouchDevice) {
      // Remove touch feedback
      event.currentTarget.style.transform = '';
    }
    props.onTouchEnd?.(event);
  };

  // Generate variant-specific styles
  const getVariantStyles = (): React.CSSProperties => {
    const { colors } = config;
    
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.island.background,
          borderColor: colors.island.border,
          color: colors.text.primary,
        };
      case 'secondary':
        return {
          backgroundColor: colors.background.secondary,
          borderColor: colors.island.border,
          color: colors.text.secondary,
        };
      case 'accent':
        return {
          backgroundColor: colors.interactive.primary + '10', // 10% opacity
          borderColor: colors.interactive.primary + '30', // 30% opacity
          color: colors.text.primary,
        };
      case 'danger':
        return {
          backgroundColor: '#fef2f2', // red-50 equivalent
          borderColor: '#fecaca', // red-200 equivalent
          color: '#991b1b', // red-800 equivalent
        };
      default:
        return {
          backgroundColor: colors.island.background,
          borderColor: colors.island.border,
          color: colors.text.primary,
        };
    }
  };

  // Generate elevation-specific styles with responsive considerations
  const getElevationStyles = (): React.CSSProperties => {
    const { shadows } = config;
    
    // Reduce elevation on touch devices for better performance
    const adjustedElevation = responsiveState.isTouchDevice && finalElevation === 'high' ? 'medium' : finalElevation;
    
    switch (adjustedElevation) {
      case 'none':
        return { boxShadow: 'none' };
      case 'low':
        return { boxShadow: shadows.low };
      case 'medium':
        return { boxShadow: shadows.medium };
      case 'high':
        return { boxShadow: shadows.high };
      default:
        return { boxShadow: shadows.medium };
    }
  };

  // Generate size and layout-specific styles with responsive spacing
  const getSizeAndLayoutStyles = (): React.CSSProperties => {
    const responsiveSpacing = getResponsiveSpacing(responsiveState.breakpoint, config.spacing);
    
    // Use custom padding if provided, otherwise use responsive spacing
    let paddingValue = finalPadding;
    if (!paddingValue) {
      switch (finalSize) {
        case 'sm':
          paddingValue = responsiveState.isMobile ? '0.5rem' : '0.75rem';
          break;
        case 'md':
          paddingValue = responsiveSpacing.padding;
          break;
        case 'lg':
          paddingValue = responsiveState.isMobile ? '1.5rem' : '2rem';
          break;
        case 'xl':
          paddingValue = responsiveState.isMobile ? '2rem' : '3rem';
          break;
        default:
          paddingValue = responsiveSpacing.padding;
      }
    }

    // Apply layout-specific adjustments
    const layoutAdjustments = getLayoutStyles(finalLayout, responsiveState);
    
    return {
      padding: paddingValue,
      margin: finalMargin || responsiveSpacing.margin,
      ...layoutAdjustments,
    };
  };

  // Generate layout-specific styles
  const getLayoutStyles = (layout: IslandLayout, responsive: any): React.CSSProperties => {
    const baseGap = getResponsiveSpacing(responsive.breakpoint, config.spacing).gap;
    
    switch (layout) {
      case 'compact':
        return {
          gap: responsive.isMobile ? '0.5rem' : '0.75rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
        };
      case 'spacious':
        return {
          gap: responsive.isMobile ? '1rem' : '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
        };
      case 'minimal':
        return {
          gap: '0.25rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
        };
      case 'default':
      default:
        return {
          gap: baseGap,
        };
    }
  };

  // Generate responsive styles
  const getResponsiveClasses = (): string => {
    if (!responsive) return '';

    let classes = '';
    
    if (responsive.mobile) {
      if (responsive.mobile.size) {
        const mobileSize = responsive.mobile.size;
        classes += ` mobile:${mobileSize === 'sm' ? 'p-3' : mobileSize === 'lg' ? 'p-8' : mobileSize === 'xl' ? 'p-12' : 'p-6'}`;
      }
    }
    
    if (responsive.tablet) {
      if (responsive.tablet.size) {
        const tabletSize = responsive.tablet.size;
        classes += ` tablet:${tabletSize === 'sm' ? 'p-3' : tabletSize === 'lg' ? 'p-8' : tabletSize === 'xl' ? 'p-12' : 'p-6'}`;
      }
    }
    
    if (responsive.desktop) {
      if (responsive.desktop.size) {
        const desktopSize = responsive.desktop.size;
        classes += ` desktop:${desktopSize === 'sm' ? 'p-3' : desktopSize === 'lg' ? 'p-8' : desktopSize === 'xl' ? 'p-12' : 'p-6'}`;
      }
    }

    return classes;
  };

  // Combine all styles
  const combinedStyles: React.CSSProperties = {
    borderRadius: config.borderRadius.island,
    border: '1px solid',
    transition: config.animations.transitions.elevation,
    transform: 'translateZ(0)', // Force hardware acceleration
    ...getVariantStyles(),
    ...getElevationStyles(),
    ...getSizeAndLayoutStyles(),
  };

  // Generate CSS classes
  const cssClasses = [
    'island',
    `island-variant-${finalVariant}`,
    `island-elevation-${finalElevation}`,
    `island-size-${finalSize}`,
    `island-layout-${finalLayout}`,
    interactive ? 'interactive-hover' : '',
    appear ? 'island-appear' : '',
    touchOptimized ? 'touch-optimized' : '',
    responsiveState.isTouchDevice ? 'touch-device' : '',
    responsiveState.prefersReducedMotion ? 'reduced-motion' : '',
    enableContainerQueries ? 'container-queries' : '',
    getResponsiveClasses(),
    className,
  ].filter(Boolean).join(' ');

  // Determine accessibility attributes
  const getAccessibilityAttributes = () => {
    const attributes: Record<string, any> = {};
    
    // Basic ARIA attributes
    if (ariaLabel) {
      attributes['aria-label'] = ariaLabel;
    }
    
    if (ariaDescription) {
      attributes['aria-describedby'] = descriptionId.current;
    }
    
    // Landmark roles
    if (landmark && landmarkRole) {
      attributes.role = landmarkRole;
    } else if (interactive) {
      attributes.role = 'button';
    } else if (props.role) {
      attributes.role = props.role;
    }
    
    // Focus management
    const shouldBeFocusable = interactive || focusManagement?.focusable;
    if (shouldBeFocusable) {
      attributes.tabIndex = props.tabIndex ?? 0;
    } else if (props.tabIndex !== undefined) {
      attributes.tabIndex = props.tabIndex;
    }
    
    // Interactive states
    if (interactive) {
      attributes['aria-pressed'] = isPressed;
      attributes['data-interactive'] = true;
    }
    
    // Focus state
    if (isFocused) {
      attributes['data-focused'] = true;
    }
    
    // High contrast support
    if (responsiveState.prefersHighContrast) {
      attributes['data-high-contrast'] = true;
    }
    
    return attributes;
  };

  return (
    <>
      <div
        ref={enableContainerQueries ? containerRef : ref}
        className={cssClasses}
        style={combinedStyles}
        onClick={interactive ? onClick : undefined}
        onKeyDown={handleKeyDownWithAccessibility}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={touchOptimized ? handleTouchStart : props.onTouchStart}
        onTouchEnd={touchOptimized ? handleTouchEnd : props.onTouchEnd}
        data-breakpoint={responsiveState.breakpoint}
        data-container-size={enableContainerQueries ? containerQuery.size : undefined}
        data-theme={resolvedTheme}
        {...getAccessibilityAttributes()}
        {...props}
      >
        {children}
      </div>
      
      {/* Hidden description for screen readers */}
      {ariaDescription && (
        <div
          id={descriptionId.current}
          className="sr-only"
          aria-hidden="true"
        >
          {ariaDescription}
        </div>
      )}
      
      {/* Screen reader announcements */}
      {announceText && (
        <div
          className="sr-only"
          aria-live="polite"
          aria-atomic="true"
        >
          {announceText}
        </div>
      )}
    </>
  );
});

Island.displayName = 'Island';

export { Island };
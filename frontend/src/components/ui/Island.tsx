import React, { forwardRef } from 'react';
import { useTheme } from '../../hooks/useTheme.js';

export type IslandVariant = 'primary' | 'secondary' | 'accent' | 'danger';
export type IslandElevation = 'none' | 'low' | 'medium' | 'high';
export type IslandSize = 'sm' | 'md' | 'lg' | 'xl';

export interface IslandProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual variant of the island */
  variant?: IslandVariant;
  /** Shadow elevation level */
  elevation?: IslandElevation;
  /** Size preset for padding and spacing */
  size?: IslandSize;
  /** Whether the island should appear with animation */
  appear?: boolean;
  /** Whether the island is interactive (clickable) */
  interactive?: boolean;
  /** Custom padding override */
  padding?: string;
  /** Responsive props for different screen sizes */
  responsive?: {
    mobile?: Partial<Pick<IslandProps, 'size' | 'padding'>>;
    tablet?: Partial<Pick<IslandProps, 'size' | 'padding'>>;
    desktop?: Partial<Pick<IslandProps, 'size' | 'padding'>>;
  };
  children: React.ReactNode;
}

const Island = forwardRef<HTMLDivElement, IslandProps>(({
  variant = 'primary',
  elevation = 'medium',
  size = 'md',
  appear = false,
  interactive = false,
  padding,
  responsive,
  className = '',
  children,
  onClick,
  onKeyDown,
  ...props
}, ref) => {
  const { config } = useTheme();

  // Handle keyboard interaction for interactive islands
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (interactive && onClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick(event as any);
    }
    onKeyDown?.(event);
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

  // Generate elevation-specific styles
  const getElevationStyles = (): React.CSSProperties => {
    const { shadows } = config;
    
    switch (elevation) {
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

  // Generate size-specific styles
  const getSizeStyles = (): React.CSSProperties => {
    if (padding) {
      return { padding };
    }

    switch (size) {
      case 'sm':
        return { padding: '0.75rem' };
      case 'md':
        return { padding: config.spacing.island.padding };
      case 'lg':
        return { padding: '2rem' };
      case 'xl':
        return { padding: '3rem' };
      default:
        return { padding: config.spacing.island.padding };
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
    ...getSizeStyles(),
  };

  // Generate CSS classes
  const cssClasses = [
    'island',
    `island-variant-${variant}`,
    `island-elevation-${elevation}`,
    `island-size-${size}`,
    interactive ? 'interactive-hover' : '',
    appear ? 'island-appear' : '',
    getResponsiveClasses(),
    className,
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={ref}
      className={cssClasses}
      style={combinedStyles}
      onClick={interactive ? onClick : undefined}
      onKeyDown={interactive ? handleKeyDown : onKeyDown}
      role={interactive ? 'button' : props.role}
      tabIndex={interactive ? 0 : props.tabIndex}
      aria-label={interactive && !props['aria-label'] ? 'Interactive island' : props['aria-label']}
      {...props}
    >
      {children}
    </div>
  );
});

Island.displayName = 'Island';

export { Island };
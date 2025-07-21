import React, { forwardRef } from 'react';
import { useTheme } from '../../hooks/useTheme.js';

export type IslandContainerLayout = 'default' | 'grid' | 'flex' | 'masonry';
export type IslandContainerSpacing = 'tight' | 'normal' | 'loose' | 'custom';

export interface IslandContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Layout system to use for positioning islands */
  layout?: IslandContainerLayout;
  /** Spacing between islands */
  spacing?: IslandContainerSpacing;
  /** Custom spacing value when spacing is 'custom' */
  customSpacing?: string;
  /** Maximum width of the container */
  maxWidth?: string;
  /** Whether to center the container */
  centered?: boolean;
  /** Whether to apply the gradient background */
  gradient?: boolean;
  /** Custom gradient override */
  customGradient?: string;
  /** Responsive grid configuration */
  grid?: {
    columns?: {
      mobile?: number;
      tablet?: number;
      desktop?: number;
    };
    gap?: {
      mobile?: string;
      tablet?: string;
      desktop?: string;
    };
  };
  /** Padding configuration */
  padding?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  };
  children: React.ReactNode;
}

const IslandContainer = forwardRef<HTMLDivElement, IslandContainerProps>(({
  layout = 'default',
  spacing = 'normal',
  customSpacing,
  maxWidth = '100%',
  centered = false,
  gradient = true,
  customGradient,
  grid,
  padding,
  className = '',
  children,
  style,
  ...props
}, ref) => {
  const { config } = useTheme();

  // Generate spacing styles
  const getSpacingValue = (): string => {
    if (spacing === 'custom' && customSpacing) {
      return customSpacing;
    }

    switch (spacing) {
      case 'tight':
        return '0.5rem';
      case 'normal':
        return config.spacing.island.gap;
      case 'loose':
        return '2rem';
      default:
        return config.spacing.island.gap;
    }
  };

  // Generate layout-specific styles
  const getLayoutStyles = (): React.CSSProperties => {
    const spacingValue = getSpacingValue();

    switch (layout) {
      case 'grid':
        return {
          display: 'grid',
          gap: spacingValue,
          gridTemplateColumns: grid?.columns?.desktop 
            ? `repeat(${grid.columns.desktop}, 1fr)` 
            : 'repeat(auto-fit, minmax(300px, 1fr))',
        };
      case 'flex':
        return {
          display: 'flex',
          flexWrap: 'wrap',
          gap: spacingValue,
        };
      case 'masonry':
        return {
          display: 'grid',
          gap: spacingValue,
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gridAutoRows: 'masonry', // Future CSS feature, fallback to grid
        };
      default:
        return {
          display: 'block',
        };
    }
  };

  // Generate responsive grid classes
  const getResponsiveGridClasses = (): string => {
    if (!grid || layout !== 'grid') return '';

    let classes = '';
    
    if (grid.columns?.mobile) {
      classes += ` mobile:grid-cols-${grid.columns.mobile}`;
    }
    
    if (grid.columns?.tablet) {
      classes += ` tablet:grid-cols-${grid.columns.tablet}`;
    }
    
    if (grid.columns?.desktop) {
      classes += ` desktop:grid-cols-${grid.columns.desktop}`;
    }

    return classes;
  };

  // Generate responsive padding classes
  const getResponsivePaddingClasses = (): string => {
    if (!padding) return '';

    let classes = '';
    
    if (padding.mobile) {
      classes += ` mobile:p-[${padding.mobile}]`;
    }
    
    if (padding.tablet) {
      classes += ` tablet:p-[${padding.tablet}]`;
    }
    
    if (padding.desktop) {
      classes += ` desktop:p-[${padding.desktop}]`;
    }

    return classes;
  };

  // Generate background styles
  const getBackgroundStyles = (): React.CSSProperties => {
    if (!gradient) {
      return {
        backgroundColor: config.colors.background.primary,
      };
    }

    return {
      background: customGradient || config.colors.background.gradient,
    };
  };

  // Combine all styles
  const combinedStyles: React.CSSProperties = {
    minHeight: '100vh',
    width: '100%',
    maxWidth,
    margin: centered ? '0 auto' : '0',
    padding: padding ? undefined : config.spacing.island.margin,
    transition: config.animations.transitions.theme,
    ...getBackgroundStyles(),
    ...getLayoutStyles(),
    ...style,
  };

  // Generate CSS classes
  const cssClasses = [
    'island-container',
    `island-container-layout-${layout}`,
    `island-container-spacing-${spacing}`,
    centered ? 'island-container-centered' : '',
    gradient ? 'island-container-gradient' : '',
    getResponsiveGridClasses(),
    getResponsivePaddingClasses(),
    className,
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={ref}
      className={cssClasses}
      style={combinedStyles}
      {...props}
    >
      {children}
    </div>
  );
});

IslandContainer.displayName = 'IslandContainer';

export { IslandContainer };
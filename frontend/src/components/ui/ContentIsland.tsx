import React, { forwardRef } from 'react';
import { Island, type IslandProps } from './Island.js';
import { useAnimation } from '../../hooks/useAnimation.js';
import './ContentIsland.css';

export type ContentType = 'chat' | 'editor' | 'dashboard' | 'studio';

export interface ContentIslandProps extends Omit<IslandProps, 'variant'> {
  /** Type of content being displayed */
  contentType: ContentType;
  /** Whether to show loading skeleton */
  isLoading?: boolean;
  /** Custom title for the content island */
  title?: string;
  /** Whether the content should fill available height */
  fillHeight?: boolean;
  /** Custom header content */
  headerContent?: React.ReactNode;
  /** Whether to show content transitions */
  showTransitions?: boolean;
}

const ContentIsland = forwardRef<HTMLDivElement, ContentIslandProps>(({
  contentType,
  isLoading = false,
  title,
  fillHeight = false,
  headerContent,
  showTransitions = true,
  children,
  className = '',
  ...islandProps
}, ref) => {
  const { reducedMotion } = useAnimation();

  // Get content-specific styling
  const getContentVariant = (): IslandProps['variant'] => {
    switch (contentType) {
      case 'chat':
        return 'primary';
      case 'editor':
        return 'secondary';
      case 'dashboard':
        return 'accent';
      case 'studio':
        return 'primary';
      default:
        return 'primary';
    }
  };

  // Get content-specific elevation
  const getContentElevation = (): IslandProps['elevation'] => {
    switch (contentType) {
      case 'studio':
        return 'high';
      case 'dashboard':
        return 'medium';
      default:
        return 'low';
    }
  };

  // Generate loading skeleton
  const renderLoadingSkeleton = () => {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
        </div>
        <div className="h-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
      </div>
    );
  };

  // Generate content-specific styles
  const getContentStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      transition: showTransitions ? 'all var(--transition-duration-normal) var(--transition-easing)' : undefined,
    };

    if (fillHeight) {
      baseStyles.height = '100%';
      baseStyles.display = 'flex';
      baseStyles.flexDirection = 'column';
    }

    return baseStyles;
  };

  // Generate CSS classes
  const contentClasses = [
    'content-island',
    `content-island-${contentType}`,
    fillHeight ? 'content-island-fill-height' : '',
    isLoading ? 'content-island-loading' : '',
    showTransitions && !reducedMotion ? 'content-island-transitioning' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <Island
      ref={ref}
      variant={getContentVariant()}
      elevation={getContentElevation()}
      size="lg"
      appear={showTransitions}
      className={contentClasses}
      style={getContentStyles()}
      {...islandProps}
    >
      {/* Header */}
      {(title || headerContent) && (
        <div className="content-island-header mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {title && (
              <h2 
                className="text-2xl font-bold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {title}
              </h2>
            )}
            {headerContent && (
              <div className="content-island-header-actions">
                {headerContent}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className={`content-island-body ${fillHeight ? 'flex-1 flex flex-col' : ''}`}>
        {isLoading ? renderLoadingSkeleton() : children}
      </div>
    </Island>
  );
});

ContentIsland.displayName = 'ContentIsland';

export { ContentIsland };
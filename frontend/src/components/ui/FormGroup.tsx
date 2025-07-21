import React from 'react';
import { Island } from './Island.js';
import type { IslandProps } from './Island.js';

export interface FormGroupProps extends Omit<IslandProps, 'children'> {
  /** Title for the form group */
  title?: string;
  /** Description for the form group */
  description?: string;
  /** Whether the form group is required */
  required?: boolean;
  /** Whether the form group has an error state */
  error?: boolean;
  /** Error message to display */
  errorMessage?: string;
  /** Layout direction for form fields */
  layout?: 'vertical' | 'horizontal' | 'grid';
  /** Number of columns for grid layout */
  columns?: 2 | 3 | 4;
  /** Gap between form fields */
  gap?: 'sm' | 'md' | 'lg';
  /** Children form elements */
  children: React.ReactNode;
}

const FormGroup: React.FC<FormGroupProps> = ({
  title,
  description,
  required = false,
  error = false,
  errorMessage,
  layout = 'vertical',
  columns = 2,
  gap = 'md',
  children,
  variant = 'primary',
  elevation = 'low',
  size = 'md',
  className = '',
  ...islandProps
}) => {
  // Generate layout classes
  const getLayoutClasses = (): string => {
    const gapClasses = {
      sm: 'gap-3',
      md: 'gap-4',
      lg: 'gap-6',
    };

    switch (layout) {
      case 'horizontal':
        return `flex flex-wrap items-start ${gapClasses[gap]}`;
      case 'grid':
        return `grid grid-cols-1 md:grid-cols-${columns} ${gapClasses[gap]}`;
      default:
        return `flex flex-col ${gapClasses[gap]}`;
    }
  };

  const containerClasses = [
    'form-group',
    error ? 'form-group-error' : '',
    className,
  ].filter(Boolean).join(' ');

  const titleClasses = [
    'text-lg font-semibold mb-2',
    error ? 'text-red-600' : 'text-[var(--color-text-primary)]',
  ].join(' ');

  const descriptionClasses = [
    'text-sm mb-4',
    error ? 'text-red-500' : 'text-[var(--color-text-secondary)]',
  ].join(' ');

  return (
    <Island
      variant={error ? 'danger' : variant}
      elevation={elevation}
      size={size}
      className={containerClasses}
      {...islandProps}
    >
      {/* Header */}
      {(title || description) && (
        <div className="form-group-header mb-4">
          {title && (
            <h3 className={titleClasses}>
              {title}
              {required && (
                <span className="text-red-500 ml-1" aria-label="required">
                  *
                </span>
              )}
            </h3>
          )}
          {description && (
            <p className={descriptionClasses}>
              {description}
            </p>
          )}
        </div>
      )}

      {/* Form Fields */}
      <div className={`form-group-content ${getLayoutClasses()}`}>
        {children}
      </div>

      {/* Error Message */}
      {error && errorMessage && (
        <div className="form-group-error-message mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-start">
            <svg
              className="h-5 w-5 text-red-400 mt-0.5 mr-2 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="text-sm text-red-700">
              {errorMessage}
            </div>
          </div>
        </div>
      )}
    </Island>
  );
};

export default FormGroup;
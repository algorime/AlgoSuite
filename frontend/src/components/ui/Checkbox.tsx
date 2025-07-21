import React, { forwardRef, useState } from 'react';
import { useTheme } from '../../hooks/useTheme.js';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Label for the checkbox */
  label?: string;
  /** Description text below the label */
  description?: string;
  /** Size of the checkbox */
  size?: 'sm' | 'md' | 'lg';
  /** Whether the checkbox has an error state */
  error?: boolean;
  /** Error message to display */
  errorMessage?: string;
  /** Whether the checkbox should have island styling */
  islandStyle?: boolean;
  /** Custom elevation for floating effect */
  elevation?: 'none' | 'low' | 'medium';
  /** Whether the checkbox is indeterminate */
  indeterminate?: boolean;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  label,
  description,
  size = 'md',
  error = false,
  errorMessage,
  islandStyle = true,
  elevation = 'none',
  indeterminate = false,
  className = '',
  checked,
  onChange,
  onFocus,
  onBlur,
  disabled,
  ...props
}, ref) => {
  const { config } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  // Generate size styles
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          checkbox: 'h-4 w-4',
          label: 'text-sm',
          description: 'text-xs',
        };
      case 'lg':
        return {
          checkbox: 'h-6 w-6',
          label: 'text-lg',
          description: 'text-base',
        };
      default:
        return {
          checkbox: 'h-5 w-5',
          label: 'text-base',
          description: 'text-sm',
        };
    }
  };

  const sizeStyles = getSizeStyles();

  // Generate checkbox styles
  const getCheckboxStyles = (): React.CSSProperties => {
    const { colors } = config;
    
    const baseStyles = {
      borderRadius: config.borderRadius.input,
      border: '2px solid',
      transition: config.animations.transitions.hover,
    };

    if (checked || indeterminate) {
      return {
        ...baseStyles,
        backgroundColor: error ? '#ef4444' : colors.interactive.primary,
        borderColor: error ? '#ef4444' : colors.interactive.primary,
        color: 'white',
      };
    }

    return {
      ...baseStyles,
      backgroundColor: colors.island.background,
      borderColor: error ? '#ef4444' : colors.island.border,
    };
  };

  // Generate focus styles
  const getFocusStyles = (): React.CSSProperties => {
    const { colors } = config;
    
    if (isFocused) {
      return {
        boxShadow: error 
          ? `0 0 0 3px rgba(239, 68, 68, 0.2)` 
          : `0 0 0 3px ${colors.interactive.primary}30`,
      };
    }
    
    return {};
  };

  // Generate elevation styles
  const getElevationStyles = (): React.CSSProperties => {
    if (!islandStyle || elevation === 'none') return {};
    
    const { shadows } = config;
    
    if (!shadows) return {};
    
    switch (elevation) {
      case 'low':
        return { 
          boxShadow: isFocused ? (shadows.medium || shadows.low) : shadows.low,
        };
      case 'medium':
        return { 
          boxShadow: isFocused ? (shadows.high || shadows.medium) : shadows.medium,
        };
      default:
        return {};
    }
  };

  // Combine all styles
  const checkboxStyles: React.CSSProperties = {
    ...getCheckboxStyles(),
    ...getFocusStyles(),
    ...getElevationStyles(),
  };

  const containerClasses = [
    'flex items-start',
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    className,
  ].filter(Boolean).join(' ');

  const checkboxClasses = [
    sizeStyles.checkbox,
    'flex-shrink-0',
    'appearance-none',
    'cursor-pointer',
    'focus-visible:outline-none',
    'disabled:cursor-not-allowed',
    'transition-all duration-200 ease-out',
    'flex items-center justify-center',
  ].filter(Boolean).join(' ');

  const labelClasses = [
    'ml-3 font-medium cursor-pointer',
    sizeStyles.label,
    error ? 'text-red-600' : 'text-[var(--color-text-primary)]',
    disabled ? 'cursor-not-allowed' : '',
  ].filter(Boolean).join(' ');

  const descriptionClasses = [
    'ml-3 mt-1',
    sizeStyles.description,
    error ? 'text-red-500' : 'text-[var(--color-text-secondary)]',
  ].filter(Boolean).join(' ');

  return (
    <div>
      <label className={containerClasses}>
        <input
          ref={ref}
          type="checkbox"
          className={checkboxClasses}
          style={checkboxStyles}
          checked={checked}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          {...props}
        />
        
        {/* Custom checkmark */}
        {(checked || indeterminate) && (
          <div className="absolute pointer-events-none">
            {indeterminate ? (
              <svg
                className={`${sizeStyles.checkbox} text-white`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <rect x="4" y="9" width="12" height="2" rx="1" />
              </svg>
            ) : (
              <svg
                className={`${sizeStyles.checkbox} text-white`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </div>
        )}
        
        {(label || description) && (
          <div className="flex-1">
            {label && (
              <div className={labelClasses}>
                {label}
              </div>
            )}
            {description && (
              <div className={descriptionClasses}>
                {description}
              </div>
            )}
          </div>
        )}
      </label>
      
      {error && errorMessage && (
        <div className="mt-2 text-sm text-red-600">
          {errorMessage}
        </div>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;
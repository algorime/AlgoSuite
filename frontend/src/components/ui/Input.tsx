import React, { forwardRef, useState } from 'react';
import { useTheme } from '../../hooks/useTheme.js';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Visual variant of the input */
  variant?: 'default' | 'filled' | 'outline' | 'ghost';
  /** Size of the input */
  size?: 'sm' | 'md' | 'lg';
  /** Whether the input has an error state */
  error?: boolean;
  /** Error message to display */
  errorMessage?: string;
  /** Helper text to display below the input */
  helperText?: string;
  /** Label for the input */
  label?: string;
  /** Whether the label should float */
  floatingLabel?: boolean;
  /** Icon to display on the left side */
  leftIcon?: React.ReactNode;
  /** Icon to display on the right side */
  rightIcon?: React.ReactNode;
  /** Whether the input should have island styling */
  islandStyle?: boolean;
  /** Custom elevation for floating effect */
  elevation?: 'none' | 'low' | 'medium';
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  variant = 'default',
  size = 'md',
  error = false,
  errorMessage,
  helperText,
  label,
  floatingLabel = false,
  leftIcon,
  rightIcon,
  islandStyle = true,
  elevation = 'low',
  className = '',
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
  disabled,
  ...props
}, ref) => {
  const { config } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(Boolean(value));

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(Boolean(e.target.value));
    onChange?.(e);
  };

  // Generate variant-specific styles
  const getVariantStyles = (): React.CSSProperties => {
    const { colors } = config;
    
    switch (variant) {
      case 'filled':
        return {
          backgroundColor: colors.background.secondary,
          borderColor: 'transparent',
          color: colors.text.primary,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: colors.island.border,
          color: colors.text.primary,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          color: colors.text.primary,
        };
      default:
        return {
          backgroundColor: colors.island.background,
          borderColor: colors.island.border,
          color: colors.text.primary,
        };
    }
  };

  // Generate focus styles
  const getFocusStyles = (): React.CSSProperties => {
    const { colors } = config;
    
    if (isFocused) {
      return {
        borderColor: error ? '#ef4444' : colors.interactive.primary,
        boxShadow: error 
          ? `0 0 0 3px rgba(239, 68, 68, 0.1)` 
          : `0 0 0 3px ${colors.interactive.primary}20`,
        transform: elevation !== 'none' ? 'translateY(-1px)' : undefined,
      };
    }
    
    return {};
  };

  // Generate elevation styles
  const getElevationStyles = (): React.CSSProperties => {
    if (!islandStyle || elevation === 'none') return {};
    
    const { shadows } = config;
    
    switch (elevation) {
      case 'low':
        return { 
          boxShadow: isFocused ? shadows.medium : shadows.low,
        };
      case 'medium':
        return { 
          boxShadow: isFocused ? shadows.high : shadows.medium,
        };
      default:
        return { boxShadow: shadows.low };
    }
  };

  // Generate size styles
  const getSizeStyles = (): string => {
    switch (size) {
      case 'sm':
        return 'h-9 px-3 text-sm';
      case 'lg':
        return 'h-12 px-4 text-lg';
      default:
        return 'h-10 px-4 text-base';
    }
  };

  // Combine all styles
  const inputStyles: React.CSSProperties = {
    borderRadius: config.borderRadius.input,
    border: '1px solid',
    transition: config.animations.transitions.hover,
    ...getVariantStyles(),
    ...getFocusStyles(),
    ...getElevationStyles(),
  };

  // Generate CSS classes
  const inputClasses = [
    'w-full',
    'font-medium',
    'placeholder:text-[var(--color-text-secondary)]',
    'focus-visible:outline-none',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'transition-all duration-300 ease-out',
    getSizeStyles(),
    leftIcon ? 'pl-10' : '',
    rightIcon ? 'pr-10' : '',
    error ? 'border-red-500' : '',
    className,
  ].filter(Boolean).join(' ');

  const containerClasses = [
    'relative',
    'w-full',
  ].join(' ');

  const labelClasses = [
    'block',
    'text-sm',
    'font-medium',
    'mb-2',
    floatingLabel ? 'absolute left-3 transition-all duration-200 pointer-events-none' : '',
    floatingLabel && (isFocused || hasValue) ? '-top-2 text-xs bg-[var(--color-island-bg)] px-1' : '',
    floatingLabel && !isFocused && !hasValue ? 'top-2.5 text-[var(--color-text-secondary)]' : '',
    error ? 'text-red-600' : 'text-[var(--color-text-primary)]',
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {label && !floatingLabel && (
        <label className={labelClasses}>
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-text-secondary)]">
            {leftIcon}
          </div>
        )}
        
        {label && floatingLabel && (
          <label className={labelClasses}>
            {label}
          </label>
        )}
        
        <input
          ref={ref}
          className={inputClasses}
          style={inputStyles}
          placeholder={floatingLabel ? undefined : placeholder}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--color-text-secondary)]">
            {rightIcon}
          </div>
        )}
      </div>
      
      {(errorMessage || helperText) && (
        <div className={`mt-2 text-sm ${error ? 'text-red-600' : 'text-[var(--color-text-secondary)]'}`}>
          {error ? errorMessage : helperText}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
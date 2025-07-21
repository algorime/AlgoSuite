import React, { forwardRef, useState } from 'react';
import { useTheme } from '../../hooks/useTheme.js';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Visual variant of the textarea */
  variant?: 'default' | 'filled' | 'outline' | 'ghost';
  /** Size of the textarea */
  size?: 'sm' | 'md' | 'lg';
  /** Whether the textarea has an error state */
  error?: boolean;
  /** Error message to display */
  errorMessage?: string;
  /** Helper text to display below the textarea */
  helperText?: string;
  /** Label for the textarea */
  label?: string;
  /** Whether the textarea should have island styling */
  islandStyle?: boolean;
  /** Custom elevation for floating effect */
  elevation?: 'none' | 'low' | 'medium';
  /** Whether to show character count */
  showCharCount?: boolean;
  /** Maximum character count */
  maxLength?: number;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  variant = 'default',
  size = 'md',
  error = false,
  errorMessage,
  helperText,
  label,
  islandStyle = true,
  elevation = 'low',
  showCharCount = false,
  maxLength,
  className = '',
  value,
  onChange,
  onFocus,
  onBlur,
  disabled,
  ...props
}, ref) => {
  const { config } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const charCount = typeof value === 'string' ? value.length : 0;

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(false);
    onBlur?.(e);
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
        return 'min-h-[80px] px-3 py-2 text-sm';
      case 'lg':
        return 'min-h-[120px] px-4 py-3 text-lg';
      default:
        return 'min-h-[100px] px-4 py-3 text-base';
    }
  };

  // Combine all styles
  const textareaStyles: React.CSSProperties = {
    borderRadius: config.borderRadius.input,
    border: '1px solid',
    transition: config.animations.transitions.hover,
    resize: 'vertical',
    ...getVariantStyles(),
    ...getFocusStyles(),
    ...getElevationStyles(),
  };

  // Generate CSS classes
  const textareaClasses = [
    'w-full',
    'font-medium',
    'placeholder:text-[var(--color-text-secondary)]',
    'focus-visible:outline-none',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'transition-all duration-300 ease-out',
    getSizeStyles(),
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
    error ? 'text-red-600' : 'text-[var(--color-text-primary)]',
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {label && (
        <label className={labelClasses}>
          {label}
        </label>
      )}
      
      <textarea
        ref={ref}
        className={textareaClasses}
        style={textareaStyles}
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        maxLength={maxLength}
        {...props}
      />
      
      <div className="flex justify-between items-center mt-2">
        <div className={`text-sm ${error ? 'text-red-600' : 'text-[var(--color-text-secondary)]'}`}>
          {error ? errorMessage : helperText}
        </div>
        
        {showCharCount && (
          <div className={`text-sm ${
            maxLength && charCount > maxLength ? 'text-red-600' : 'text-[var(--color-text-secondary)]'
          }`}>
            {charCount}{maxLength ? `/${maxLength}` : ''}
          </div>
        )}
      </div>
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
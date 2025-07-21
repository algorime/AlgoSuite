import React, { forwardRef, useState, useRef, useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme.js';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Options for the select */
  options: SelectOption[];
  /** Visual variant of the select */
  variant?: 'default' | 'filled' | 'outline' | 'ghost';
  /** Size of the select */
  size?: 'sm' | 'md' | 'lg';
  /** Whether the select has an error state */
  error?: boolean;
  /** Error message to display */
  errorMessage?: string;
  /** Helper text to display below the select */
  helperText?: string;
  /** Label for the select */
  label?: string;
  /** Whether the select should have island styling */
  islandStyle?: boolean;
  /** Custom elevation for floating effect */
  elevation?: 'none' | 'low' | 'medium';
  /** Icon to display on the left side */
  leftIcon?: React.ReactNode;
  /** Whether to use custom dropdown instead of native select */
  customDropdown?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  options,
  variant = 'default',
  size = 'md',
  error = false,
  errorMessage,
  helperText,
  label,
  islandStyle = true,
  elevation = 'low',
  leftIcon,
  customDropdown = false,
  className = '',
  value,
  onChange,
  onFocus,
  onBlur,
  disabled,
  placeholder,
  ...props
}, ref) => {
  const { config } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleFocus = (e: React.FocusEvent<HTMLSelectElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (customDropdown && isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [customDropdown, isOpen]);

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
    
    if (isFocused || isOpen) {
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
          boxShadow: (isFocused || isOpen) ? shadows.medium : shadows.low,
        };
      case 'medium':
        return { 
          boxShadow: (isFocused || isOpen) ? shadows.high : shadows.medium,
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
  const selectStyles: React.CSSProperties = {
    borderRadius: config.borderRadius.input,
    border: '1px solid',
    transition: config.animations.transitions.hover,
    ...getVariantStyles(),
    ...getFocusStyles(),
    ...getElevationStyles(),
  };

  // Generate CSS classes
  const selectClasses = [
    'w-full',
    'font-medium',
    'focus-visible:outline-none',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'transition-all duration-300 ease-out',
    'appearance-none',
    'cursor-pointer',
    getSizeStyles(),
    leftIcon ? 'pl-10' : '',
    'pr-10', // Always add right padding for dropdown arrow
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

  const selectedOption = options.find(option => option.value === value);

  if (customDropdown) {
    return (
      <div className={containerClasses} ref={dropdownRef}>
        {label && (
          <label className={labelClasses}>
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-text-secondary)] z-10">
              {leftIcon}
            </div>
          )}
          
          <button
            type="button"
            className={selectClasses}
            style={selectStyles}
            onClick={() => setIsOpen(!isOpen)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            aria-expanded={isOpen}
            aria-haspopup="listbox"
          >
            <span className="block truncate text-left">
              {selectedOption ? selectedOption.label : placeholder || 'Select an option'}
            </span>
          </button>
          
          {/* Dropdown Arrow */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg
              className={`h-4 w-4 text-[var(--color-text-secondary)] transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          {/* Custom Dropdown */}
          {isOpen && (
            <div
              className="absolute z-50 w-full mt-1 bg-[var(--color-island-bg)] border border-[var(--color-island-border)] shadow-[var(--shadow-medium)] max-h-60 overflow-auto"
              style={{
                borderRadius: config.borderRadius.input,
              }}
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`w-full px-4 py-2 text-left hover:bg-[var(--color-bg-secondary)] focus:bg-[var(--color-bg-secondary)] focus:outline-none transition-colors duration-150 ${
                    option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  } ${
                    option.value === value ? 'bg-[var(--color-interactive-primary)] text-white' : 'text-[var(--color-text-primary)]'
                  }`}
                  onClick={() => {
                    if (!option.disabled) {
                      const syntheticEvent = {
                        target: { value: option.value },
                      } as React.ChangeEvent<HTMLSelectElement>;
                      onChange?.(syntheticEvent);
                      setIsOpen(false);
                    }
                  }}
                  disabled={option.disabled}
                >
                  {option.label}
                </button>
              ))}
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
  }

  // Native select fallback
  return (
    <div className={containerClasses}>
      {label && (
        <label className={labelClasses}>
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-text-secondary)] z-10">
            {leftIcon}
          </div>
        )}
        
        <select
          ref={ref}
          className={selectClasses}
          style={selectStyles}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Dropdown Arrow */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg
            className="h-4 w-4 text-[var(--color-text-secondary)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {(errorMessage || helperText) && (
        <div className={`mt-2 text-sm ${error ? 'text-red-600' : 'text-[var(--color-text-secondary)]'}`}>
          {error ? errorMessage : helperText}
        </div>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
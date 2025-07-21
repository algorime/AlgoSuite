import React, { forwardRef, useState } from 'react';
import { useTheme } from '../../hooks/useTheme.js';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Label for the radio */
  label?: string;
  /** Description text below the label */
  description?: string;
  /** Size of the radio */
  size?: 'sm' | 'md' | 'lg';
  /** Whether the radio has an error state */
  error?: boolean;
  /** Error message to display */
  errorMessage?: string;
  /** Whether the radio should have island styling */
  islandStyle?: boolean;
  /** Custom elevation for floating effect */
  elevation?: 'none' | 'low' | 'medium';
}

export interface RadioGroupProps {
  /** Options for the radio group */
  options: RadioOption[];
  /** Current selected value */
  value?: string;
  /** Change handler */
  onChange?: (value: string) => void;
  /** Name for the radio group */
  name: string;
  /** Label for the radio group */
  label?: string;
  /** Description for the radio group */
  description?: string;
  /** Size of the radios */
  size?: 'sm' | 'md' | 'lg';
  /** Whether the radio group has an error state */
  error?: boolean;
  /** Error message to display */
  errorMessage?: string;
  /** Whether the radios should have island styling */
  islandStyle?: boolean;
  /** Custom elevation for floating effect */
  elevation?: 'none' | 'low' | 'medium';
  /** Layout direction */
  layout?: 'vertical' | 'horizontal';
  /** Whether the radio group is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(({
  label,
  description,
  size = 'md',
  error = false,
  errorMessage,
  islandStyle = true,
  elevation = 'none',
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
          radio: 'h-4 w-4',
          dot: 'h-2 w-2',
          label: 'text-sm',
          description: 'text-xs',
        };
      case 'lg':
        return {
          radio: 'h-6 w-6',
          dot: 'h-3 w-3',
          label: 'text-lg',
          description: 'text-base',
        };
      default:
        return {
          radio: 'h-5 w-5',
          dot: 'h-2.5 w-2.5',
          label: 'text-base',
          description: 'text-sm',
        };
    }
  };

  const sizeStyles = getSizeStyles();

  // Generate radio styles
  const getRadioStyles = (): React.CSSProperties => {
    const { colors } = config;
    
    return {
      borderRadius: '50%',
      border: '2px solid',
      borderColor: error ? '#ef4444' : (checked ? colors.interactive.primary : colors.island.border),
      backgroundColor: colors.island.background,
      transition: config.animations.transitions.hover,
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
        return {};
    }
  };

  // Combine all styles
  const radioStyles: React.CSSProperties = {
    ...getRadioStyles(),
    ...getFocusStyles(),
    ...getElevationStyles(),
  };

  const containerClasses = [
    'flex items-start',
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    className,
  ].filter(Boolean).join(' ');

  const radioClasses = [
    sizeStyles.radio,
    'flex-shrink-0',
    'appearance-none',
    'cursor-pointer',
    'focus-visible:outline-none',
    'disabled:cursor-not-allowed',
    'transition-all duration-200 ease-out',
    'flex items-center justify-center',
    'relative',
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
          type="radio"
          className={radioClasses}
          style={radioStyles}
          checked={checked}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          {...props}
        />
        
        {/* Custom radio dot */}
        {checked && (
          <div 
            className={`absolute ${sizeStyles.dot} rounded-full pointer-events-none`}
            style={{
              backgroundColor: error ? '#ef4444' : config.colors.interactive.primary,
            }}
          />
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

Radio.displayName = 'Radio';

const RadioGroup: React.FC<RadioGroupProps> = ({
  options,
  value,
  onChange,
  name,
  label,
  description,
  size = 'md',
  error = false,
  errorMessage,
  islandStyle = true,
  elevation = 'none',
  layout = 'vertical',
  disabled = false,
  className = '',
}) => {
  const handleChange = (optionValue: string) => {
    if (!disabled) {
      onChange?.(optionValue);
    }
  };

  const containerClasses = [
    'radio-group',
    layout === 'horizontal' ? 'flex flex-wrap gap-6' : 'space-y-3',
    className,
  ].filter(Boolean).join(' ');

  const labelClasses = [
    'block text-sm font-medium mb-3',
    error ? 'text-red-600' : 'text-[var(--color-text-primary)]',
  ].join(' ');

  const descriptionClasses = [
    'text-sm mb-4',
    error ? 'text-red-500' : 'text-[var(--color-text-secondary)]',
  ].join(' ');

  return (
    <div className="radio-group-container">
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
      
      <div className={containerClasses}>
        {options.map((option) => (
          <Radio
            key={option.value}
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => handleChange(option.value)}
            label={option.label}
            description={option.description}
            size={size}
            error={error}
            islandStyle={islandStyle}
            elevation={elevation}
            disabled={disabled || option.disabled}
          />
        ))}
      </div>
      
      {error && errorMessage && (
        <div className="mt-3 text-sm text-red-600">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export { Radio, RadioGroup };
export default Radio;
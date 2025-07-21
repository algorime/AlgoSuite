import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'accent' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  elevation?: 'none' | 'low' | 'medium' | 'high';
  isLoading?: boolean;
  islandStyle?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  elevation = 'none',
  isLoading = false,
  islandStyle = true,
  className = '',
  disabled,
  ...props
}, ref) => {
  // Base classes with Islands UI styling
  const baseClasses = [
    'inline-flex items-center justify-center font-medium',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'transform transition-all duration-300 ease-out',
    islandStyle ? 'button-island' : '',
  ].filter(Boolean).join(' ');

  // Island-specific border radius using CSS custom properties
  const borderRadiusClass = islandStyle ? 'rounded-[var(--border-radius-button)]' : 'rounded-md';

  // Variant classes updated for Islands UI theme system
  const variantClasses = {
    primary: [
      'bg-[var(--color-interactive-primary)] text-white',
      'hover:bg-[var(--color-interactive-hover)]',
      'active:bg-[var(--color-interactive-active)]',
      'focus-visible:ring-[var(--color-interactive-primary)]',
    ].join(' '),
    secondary: [
      'bg-[var(--color-island-bg)] text-[var(--color-text-primary)]',
      'border border-[var(--color-island-border)]',
      'hover:bg-[var(--color-bg-secondary)]',
      'focus-visible:ring-[var(--color-interactive-secondary)]',
    ].join(' '),
    accent: [
      'bg-[var(--color-text-accent)] text-white',
      'hover:opacity-90',
      'focus-visible:ring-[var(--color-text-accent)]',
    ].join(' '),
    danger: [
      'bg-red-600 text-white',
      'hover:bg-red-700',
      'active:bg-red-800',
      'focus-visible:ring-red-500',
    ].join(' '),
    ghost: [
      'text-[var(--color-text-primary)]',
      'hover:bg-[var(--color-bg-secondary)]',
      'focus-visible:ring-[var(--color-interactive-secondary)]',
    ].join(' '),
    outline: [
      'border border-[var(--color-interactive-primary)] text-[var(--color-interactive-primary)]',
      'hover:bg-[var(--color-interactive-primary)] hover:text-white',
      'focus-visible:ring-[var(--color-interactive-primary)]',
    ].join(' '),
  };

  // Size classes with proper spacing
  const sizeClasses = {
    sm: 'h-9 px-3 text-sm gap-1.5',
    md: 'h-10 px-4 py-2 gap-2',
    lg: 'h-11 px-6 text-lg gap-2.5',
  };

  // Elevation classes for floating button effects
  const elevationClasses = {
    none: '',
    low: [
      'shadow-[var(--shadow-low)]',
      'hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.15),0_2px_6px_-1px_rgba(0,0,0,0.1)]',
      'hover:-translate-y-0.5',
    ].join(' '),
    medium: [
      'shadow-[var(--shadow-medium)]',
      'hover:shadow-[0_8px_25px_-5px_rgba(0,0,0,0.2),0_4px_10px_-2px_rgba(0,0,0,0.15)]',
      'hover:-translate-y-1',
    ].join(' '),
    high: [
      'shadow-[var(--shadow-high)]',
      'hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.25),0_8px_16px_-4px_rgba(0,0,0,0.2)]',
      'hover:-translate-y-1.5',
    ].join(' '),
  };

  // Active state classes
  const activeClasses = 'active:scale-[0.98] active:translate-y-0';

  const classes = [
    baseClasses,
    borderRadiusClass,
    variantClasses[variant],
    sizeClasses[size],
    elevationClasses[elevation],
    activeClasses,
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      ref={ref}
      className={classes}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
import React from 'react';

interface LiquidGlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const LiquidGlassButton: React.FC<LiquidGlassButtonProps> = ({
  children,
  variant = 'primary',
  size = 'sm',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const sizeStyles =
    size === 'sm'
      ? 'px-4 py-2 rounded-xl text-xs gap-1.5'
      : size === 'lg'
      ? 'px-6 py-3 rounded-2xl text-sm gap-2.5'
      : 'px-5 py-2.5 rounded-xl text-xs sm:text-sm gap-2';

  const baseStyles =
    'relative inline-flex items-center justify-center font-medium tracking-tight whitespace-nowrap transition-all duration-200 select-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  let variantStyles = '';

  if (variant === 'primary') {
    variantStyles =
      'bg-black text-white dark:bg-white dark:text-black backdrop-blur-md shadow-xs hover:bg-neutral-800 dark:hover:bg-neutral-100 hover:shadow-sm active:scale-[0.98] border border-black dark:border-white';
  } else if (variant === 'secondary') {
    variantStyles =
      'bg-white/90 text-black dark:bg-[#202024]/90 dark:text-white backdrop-blur-md shadow-2xs hover:bg-white dark:hover:bg-[#28282E] hover:shadow-xs active:scale-[0.98] border border-gray-200/90 dark:border-neutral-700';
  } else {
    variantStyles = 'bg-transparent text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 active:scale-[0.98]';
  }

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <svg
            className="animate-spin h-4 w-4 text-current"
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
              strokeWidth="3"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="font-normal text-xs tracking-wide">Procesando...</span>
        </span>
      ) : (
        <>
          {icon && <span className="text-current">{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </button>
  );
};

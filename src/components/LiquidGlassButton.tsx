import React from 'react';

interface LiquidGlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const LiquidGlassButton: React.FC<LiquidGlassButtonProps> = ({
  children,
  variant = 'primary',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'relative inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full text-sm font-medium tracking-tight transition-all duration-300 select-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  let variantStyles = '';

  if (variant === 'primary') {
    // Exact spec: rounded-full, bg-black/90, backdrop-blur-md, shadow-[0_8px_30px_rgb(0,0,0,0.12)]
    variantStyles =
      'bg-black/90 text-white dark:bg-white dark:text-black backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.15)] hover:bg-black dark:hover:bg-neutral-100 hover:shadow-[0_12px_36px_rgb(0,0,0,0.2)] hover:scale-[1.01] active:scale-[0.98] border border-white/10 dark:border-black/10';
  } else if (variant === 'secondary') {
    variantStyles =
      'bg-white/80 text-black dark:bg-[#202024]/90 dark:text-white backdrop-blur-md shadow-[0_4px_20px_rgb(0,0,0,0.06)] hover:bg-white dark:hover:bg-[#28282E] hover:shadow-[0_8px_24px_rgb(0,0,0,0.1)] hover:scale-[1.01] active:scale-[0.98] border border-gray-200/80 dark:border-neutral-700';
  } else {
    variantStyles = 'bg-transparent text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 active:scale-[0.98]';
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${className}`}
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

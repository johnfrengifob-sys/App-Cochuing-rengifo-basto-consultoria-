import React from 'react';
import brandLogoImg from '../assets/images/regenerated_image_1788288733292.png';

interface BrandLogoProps {
  variant?: 'auto' | 'dark' | 'light';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'hero';
  layout?: 'full' | 'compact' | 'horizontal' | 'mark-only' | 'hero';
  showAddress?: boolean;
  showContact?: boolean;
  className?: string;
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'auto',
  size = 'md',
  layout = 'full',
  showAddress = false,
  showContact = false,
  className = '',
  onClick,
}) => {
  // Variant color classes
  const textPrimary =
    variant === 'light'
      ? 'text-black'
      : variant === 'dark'
      ? 'text-white'
      : 'text-black dark:text-white';

  const textSecondary =
    variant === 'light'
      ? 'text-neutral-600'
      : variant === 'dark'
      ? 'text-neutral-400'
      : 'text-neutral-600 dark:text-neutral-400';

  const strokeColor =
    variant === 'light'
      ? '#000000'
      : variant === 'dark'
      ? '#ffffff'
      : 'currentColor';

  // Image height mapping for clean horizontal and block layouts
  const imgHeightMap: Record<string, string> = {
    xs: 'h-6 sm:h-7',
    sm: 'h-8 sm:h-9',
    md: 'h-11 sm:h-12',
    lg: 'h-14 sm:h-16',
    xl: 'h-20 sm:h-24',
    '2xl': 'h-28 sm:h-32',
    hero: 'h-24 sm:h-28',
  };

  // Hero display mode (Full transparent brand lockup centered and crisp)
  if (layout === 'hero') {
    return (
      <div
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onClick={onClick}
        onKeyDown={
          onClick
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClick();
                }
              }
            : undefined
        }
        className={`inline-flex flex-col items-center justify-center select-none ${className} ${
          onClick
            ? 'cursor-pointer hover:opacity-85 active:scale-[0.99] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white rounded-xl'
            : ''
        }`}
        title="Ir al panel principal • Rengifo Basto Consultoría Ontológica"
      >
        <div className="relative flex items-center justify-center w-full max-w-[360px] sm:max-w-[420px] px-2 py-1">
          <img
            src={brandLogoImg}
            alt="Rengifo Basto Consultoría Ontológica"
            referrerPolicy="no-referrer"
            className="w-full h-auto object-contain mix-blend-multiply dark:invert dark:brightness-200 transition-all duration-300 select-none pointer-events-none drop-shadow-xs"
          />
        </div>
      </div>
    );
  }

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={`inline-flex flex-col select-none ${className} ${
        onClick
          ? 'cursor-pointer hover:opacity-85 active:scale-[0.99] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white rounded-xl p-0.5'
          : ''
      }`}
      title={onClick ? "Ir al panel principal • Rengifo Basto Consultoría Ontológica" : "Rengifo Basto Consultoría Ontológica"}
    >
      <div className="flex items-center">
        <img
          src={brandLogoImg}
          alt="Rengifo Basto Consultoría Ontológica"
          referrerPolicy="no-referrer"
          className={`${imgHeightMap[size] || 'h-9 sm:h-10'} w-auto object-contain mix-blend-multiply dark:invert dark:brightness-200 transition-all duration-300 select-none pointer-events-none drop-shadow-xs`}
        />
      </div>

      {/* Optional Corporate Details / Address & Contact */}
      {(showAddress || showContact) && (
        <div
          className={`mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-light ${textSecondary}`}
        >
          {showAddress && (
            <span className="flex items-center gap-1">
              <span>Crr 20bis # 65a-22</span>
            </span>
          )}
          {showAddress && showContact && (
            <span className="opacity-40">•</span>
          )}
          {showContact && (
            <a
              href="https://wa.me/573234642257"
              target="_blank"
              rel="noreferrer"
              className="hover:underline flex items-center gap-1 font-medium text-black dark:text-white"
            >
              <span>Cel: 3234642257</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
};


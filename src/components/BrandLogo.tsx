import React from 'react';

interface BrandLogoProps {
  variant?: 'auto' | 'dark' | 'light';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  layout?: 'full' | 'compact' | 'horizontal' | 'mark-only';
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

  // Size configurations
  const scaleMap = {
    xs: 'h-6 text-xs',
    sm: 'h-8 text-sm',
    md: 'h-10 text-base',
    lg: 'h-14 text-lg',
    xl: 'h-20 text-xl',
    '2xl': 'h-28 text-2xl',
  };

  if (layout === 'mark-only') {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center justify-center ${textPrimary} ${className} ${
          onClick ? 'cursor-pointer' : ''
        }`}
        title="Rengifo Basto Consultoría Ontológica"
      >
        <svg
          viewBox="0 0 100 120"
          className="w-auto h-full max-h-12 overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Elegant Calligraphic Flourish Monogram 'R' */}
          <path
            d="M 28 55 C 22 40, 24 22, 38 12 C 48 5, 64 6, 74 15 C 84 25, 84 40, 75 52 C 67 62, 54 66, 42 68 C 30 70, 18 78, 12 90 C 6 102, 8 116, 20 122 C 32 126, 48 120, 62 108 C 70 101, 78 90, 84 78"
            stroke={strokeColor}
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 44 14 C 44 26, 43 45, 42 66 C 41 84, 40 102, 39 116"
            stroke={strokeColor}
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path
            d="M 42 65 C 50 65, 62 67, 72 82 C 78 92, 82 105, 88 118"
            stroke={strokeColor}
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <circle cx="38" cy="12" r="1.5" fill={strokeColor} />
          <circle cx="88" cy="118" r="1.2" fill={strokeColor} />
        </svg>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`inline-flex flex-col select-none ${className} ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-center gap-2.5">
        {/* Calligraphic R + Serif Wordmark Lockup */}
        <div className="relative flex items-center">
          <svg
            viewBox="0 0 280 110"
            className={`${scaleMap[size] || 'h-10'} w-auto overflow-visible`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Calligraphic Flourish Signature 'R' */}
            <g className={textPrimary}>
              {/* Main loop and ascender */}
              <path
                d="M 28 48 C 20 34, 22 18, 35 10 C 44 4, 58 4, 66 12 C 75 20, 75 34, 67 44 C 60 52, 48 56, 38 58 C 26 60, 16 68, 11 78 C 5 88, 7 100, 16 105 C 27 109, 42 103, 54 93 C 62 87, 70 76, 76 66"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Vertical core stem with natural thick-thin calligraphy */}
              <path
                d="M 38 12 C 38 24, 37 42, 36 60 C 35 76, 34 92, 33 104"
                stroke="currentColor"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
              {/* Lower right leg flourish */}
              <path
                d="M 37 57 C 45 57, 54 60, 62 72 C 68 81, 72 92, 78 103"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              {/* Terminal accents */}
              <circle cx="35" cy="10" r="1.3" fill="currentColor" />
              <circle cx="78" cy="103" r="1" fill="currentColor" />

              {/* Serif Lettering: "engifo Basto" */}
              <text
                x="82"
                y="58"
                fill="currentColor"
                style={{
                  fontFamily:
                    '"Playfair Display", "Bodoni Moda", "Didot", "Cormorant Garamond", Georgia, serif',
                  fontSize: '34px',
                  fontWeight: 400,
                  letterSpacing: '-0.02em',
                }}
              >
                engifo Basto
              </text>

              {/* Subtitle: "Consultoría Ontológica" */}
              <text
                x="84"
                y="84"
                fill="currentColor"
                style={{
                  fontFamily:
                    '"Playfair Display", "Bodoni Moda", "Didot", "Cormorant Garamond", Georgia, serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  letterSpacing: '0.04em',
                }}
              >
                Consultoría Ontológica
              </text>

              {/* Underline beneath "Consultoría Ontológica" matching the official brand mark */}
              <line
                x1="84"
                y1="89"
                x2="228"
                y2="89"
                stroke="currentColor"
                strokeWidth="0.75"
                strokeOpacity="0.8"
              />
            </g>
          </svg>
        </div>
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

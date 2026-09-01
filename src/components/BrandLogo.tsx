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

  // Size configurations
  const scaleMap: Record<string, string> = {
    xs: 'h-6 text-xs',
    sm: 'h-8 text-sm',
    md: 'h-11 text-base',
    lg: 'h-16 text-lg',
    xl: 'h-24 text-xl',
    '2xl': 'h-32 text-2xl',
    hero: 'h-24 sm:h-28 text-3xl',
  };

  // Dedicated Mark Only (The signature calligraphic flourish R)
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
          viewBox="0 0 160 180"
          className="w-auto h-full max-h-16 overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Authentic Calligraphic 'R' Flourish */}
          <path
            d="M 52 82 C 38 58, 42 32, 64 18 C 80 8, 106 10, 122 24 C 138 38, 138 60, 124 78 C 110 92, 88 98, 68 102 C 48 106, 28 118, 18 136 C 8 154, 12 174, 30 182 C 50 188, 76 178, 98 160 C 112 148, 126 132, 136 114"
            stroke={strokeColor}
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 72 20 C 72 40, 70 68, 68 100 C 66 126, 64 152, 62 172"
            stroke={strokeColor}
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M 68 98 C 80 98, 98 102, 114 124 C 124 138, 130 156, 140 174"
            stroke={strokeColor}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="64" cy="18" r="2.2" fill={strokeColor} />
          <circle cx="140" cy="174" r="1.8" fill={strokeColor} />
        </svg>
      </div>
    );
  }

  // Hero display mode (Full transparent brand lockup centered and crisp)
  if (layout === 'hero') {
    return (
      <div
        onClick={onClick}
        className={`inline-flex flex-col items-center justify-center select-none ${className} ${
          onClick ? 'cursor-pointer' : ''
        }`}
        title="Rengifo Basto Consultoría Ontológica"
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
      onClick={onClick}
      className={`inline-flex flex-col select-none ${className} ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Calligraphic R + Serif Wordmark Lockup */}
        <div className="relative flex items-center">
          <svg
            viewBox="0 0 580 240"
            className={`${scaleMap[size] || 'h-11'} w-auto overflow-visible`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Calligraphic Flourish Signature 'R' */}
            <g className={textPrimary}>
              {/* 1. Upper Left Loop & Top Crest of 'R' */}
              <path
                d="M 120 118 C 95 116, 60 102, 54 76 C 48 50, 72 32, 102 24 C 132 16, 168 22, 192 34"
                stroke="currentColor"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* 2. Main Slanted Spine and Grand Lower-Left Flourish Loop */}
              <path
                d="M 192 34 C 182 62, 166 106, 144 150 C 130 178, 108 206, 78 206 C 50 206, 32 184, 32 152 C 32 118, 62 86, 102 68 C 120 60, 138 58, 154 62"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* 3. Upper Right Bowl of 'R' */}
              <path
                d="M 192 34 C 218 36, 246 48, 246 76 C 246 102, 220 118, 172 118"
                stroke="currentColor"
                strokeWidth="3.8"
                strokeLinecap="round"
              />

              {/* 4. Lower Right Flourish Leg Swooping Underneath Text */}
              <path
                d="M 172 118 C 184 136, 204 172, 222 196 C 238 216, 258 226, 282 224 C 304 222, 322 208, 336 186 C 342 176, 346 166, 348 158"
                stroke="currentColor"
                strokeWidth="3.4"
                strokeLinecap="round"
              />

              {/* 5. Terminal Finial Accents */}
              <circle cx="54" cy="76" r="1.8" fill="currentColor" />
              <circle cx="348" cy="158" r="1.8" fill="currentColor" />

              {/* 6. Primary Wordmark: "engifo Basto" */}
              <text
                x="208"
                y="114"
                fill="currentColor"
                style={{
                  fontFamily:
                    '"Playfair Display", "Didot", "Bodoni Moda", "Cormorant Garamond", Georgia, serif',
                  fontSize: '56px',
                  fontWeight: 400,
                  letterSpacing: '-0.015em',
                }}
              >
                engifo Basto
              </text>

              {/* 7. Subtitle: "Consultoría Ontológica" */}
              <text
                x="212"
                y="156"
                fill="currentColor"
                style={{
                  fontFamily:
                    '"Playfair Display", "Didot", "Bodoni Moda", "Cormorant Garamond", Georgia, serif',
                  fontSize: '24px',
                  fontWeight: 400,
                  letterSpacing: '0.025em',
                }}
              >
                Consultoría Ontológica
              </text>

              {/* 8. Dedicated Underline for "Consultoría Ontológica" */}
              <line
                x1="212"
                y1="166"
                x2="466"
                y2="166"
                stroke="currentColor"
                strokeWidth="1.2"
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


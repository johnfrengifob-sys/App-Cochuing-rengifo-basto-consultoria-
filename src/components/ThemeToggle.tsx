import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { ThemeManager, ThemeMode } from '../services/theme';

interface ThemeToggleProps {
  variant?: 'button' | 'pill' | 'minimal';
  showLabel?: boolean;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'button',
  showLabel = false,
  className = '',
}) => {
  const [theme, setTheme] = useState<ThemeMode>(() => ThemeManager.getTheme());

  useEffect(() => {
    // Initial sync
    ThemeManager.init();

    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ theme: ThemeMode }>;
      if (customEvent.detail && customEvent.detail.theme) {
        setTheme(customEvent.detail.theme);
      } else {
        setTheme(ThemeManager.getTheme());
      }
    };

    window.addEventListener('rbc-theme-changed', handleThemeChange);
    return () => {
      window.removeEventListener('rbc-theme-changed', handleThemeChange);
    };
  }, []);

  const handleToggle = () => {
    const next = ThemeManager.toggleTheme();
    setTheme(next);
  };

  const isDark = theme === 'dark';

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={handleToggle}
        title={isDark ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all duration-200 cursor-pointer select-none ${
          isDark
            ? 'bg-[#1E1E22] border-neutral-700/80 text-neutral-200 hover:bg-[#28282D] hover:border-neutral-600 shadow-xs'
            : 'bg-[#F9F9F9] border-gray-200/90 text-gray-700 hover:bg-gray-100 hover:text-black shadow-xs'
        } ${className}`}
      >
        <div className="relative w-4 h-4 flex items-center justify-center">
          {isDark ? (
            <Moon className="w-3.5 h-3.5 text-amber-300 stroke-[1.75]" />
          ) : (
            <Sun className="w-3.5 h-3.5 text-amber-500 stroke-[1.75]" />
          )}
        </div>
        {showLabel && (
          <span className="text-[11px] font-medium tracking-tight">
            {isDark ? 'Modo Oscuro' : 'Modo Claro'}
          </span>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={isDark ? 'Activar Modo Claro' : 'Activar Modo Oscuro'}
      title={isDark ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
      className={`relative p-2 sm:p-2.5 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center group ${
        isDark
          ? 'bg-[#1E1E22] text-amber-300 border border-neutral-700 hover:bg-[#2A2A30] hover:text-amber-200 hover:border-neutral-600 shadow-sm'
          : 'bg-[#F9F9F9] text-gray-600 border border-gray-200/80 hover:bg-white hover:text-black hover:border-gray-300 shadow-xs'
      } ${className}`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 stroke-[1.75] transition-transform duration-300 rotate-0 hover:rotate-45" />
        ) : (
          <Moon className="w-4 h-4 text-gray-600 group-hover:text-black stroke-[1.75] transition-transform duration-300 -rotate-12 hover:rotate-0" />
        )}
      </div>
      {showLabel && (
        <span className="ml-2 text-xs font-medium">
          {isDark ? 'Claro' : 'Oscuro'}
        </span>
      )}
    </button>
  );
};

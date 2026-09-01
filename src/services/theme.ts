export type ThemeMode = 'light' | 'dark';

const THEME_STORAGE_KEY = 'rbc_app_theme_v1';

export class ThemeManager {
  static getTheme(): ThemeMode {
    if (typeof window === 'undefined') return 'light';
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'dark' || stored === 'light') return stored;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch {
      // fallback
    }
    return 'light';
  }

  static applyTheme(theme: ThemeMode): void {
    if (typeof window === 'undefined') return;
    try {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
        root.style.colorScheme = 'light';
      }
      localStorage.setItem(THEME_STORAGE_KEY, theme);
      window.dispatchEvent(new CustomEvent('rbc-theme-changed', { detail: { theme } }));
    } catch {
      // ignore
    }
  }

  static toggleTheme(): ThemeMode {
    const current = this.getTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    this.applyTheme(next);
    return next;
  }

  static init(): ThemeMode {
    const initialTheme = this.getTheme();
    this.applyTheme(initialTheme);
    return initialTheme;
  }
}

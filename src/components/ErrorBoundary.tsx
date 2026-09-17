import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Shield } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
    const isChunkError =
      error?.message?.includes('Failed to fetch dynamically imported module') ||
      error?.message?.includes('Importing a module script failed') ||
      error?.name === 'ChunkLoadError';

    if (isChunkError && !sessionStorage.getItem('chunk_error_reloaded')) {
      sessionStorage.setItem('chunk_error_reloaded', 'true');
      window.location.reload();
    }
  }

  private handleReset = () => {
    sessionStorage.removeItem('chunk_error_reloaded');
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleClearCacheAndReset = () => {
    try {
      // Clear corrupt local state if any, keeping essential admin/theme
      const theme = localStorage.getItem('theme');
      sessionStorage.clear();
      // Keep only theme
      localStorage.clear();
      if (theme) localStorage.setItem('theme', theme);
    } catch {}
    window.location.href = '/?view=registro';
  };

  private handleGoToPortal = () => {
    window.location.href = '/?view=registro';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gray-50 dark:bg-[#0E0E11] text-gray-900 dark:text-neutral-100 font-sans">
          <div className="w-full max-w-lg rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#16161A] p-6 sm:p-8 shadow-xl text-center space-y-6">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                <Shield className="w-3.5 h-3.5" />
                <span>Rengifo Basto Consultoría Ontológica</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Recuperación del Sistema
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
                Se detectó una discrepancia al inicializar la sesión en este navegador. Puedes reintentar la carga o ingresar directamente al portal público de inscripción.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Recargar Aplicación</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoToPortal}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-800 text-xs font-medium transition-colors cursor-pointer"
              >
                <Home className="w-3.5 h-3.5 text-blue-500" />
                <span>Ir al Portal Público</span>
              </button>
            </div>

            <div className="pt-2 border-t border-gray-100 dark:border-neutral-800/80">
              <button
                type="button"
                onClick={this.handleClearCacheAndReset}
                className="text-[11px] text-gray-400 dark:text-neutral-500 hover:text-gray-600 dark:hover:text-neutral-300 transition-colors underline cursor-pointer"
              >
                Limpiar datos temporales locales e inicializar de nuevo
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

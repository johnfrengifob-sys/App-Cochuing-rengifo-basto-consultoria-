import { lazy, ComponentType, LazyExoticComponent } from 'react';

/**
 * Robust wrapper for React.lazy that automatically retries dynamic imports
 * if a transient network error, server restart, or Vite compilation delay causes a chunk load failure.
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
): LazyExoticComponent<T> {
  return lazy(async () => {
    try {
      return await factory();
    } catch (initialError) {
      console.warn('Dynamic import failed, retrying in 400ms...', initialError);
      try {
        await new Promise((resolve) => setTimeout(resolve, 400));
        return await factory();
      } catch (secondError) {
        console.warn('Second dynamic import failed, retrying in 900ms...', secondError);
        try {
          await new Promise((resolve) => setTimeout(resolve, 900));
          return await factory();
        } catch (finalError) {
          console.error('Dynamic import permanently failed:', finalError);

          // If this is a chunk or module load error and page hasn't reloaded recently, auto-reload cleanly
          const isChunkError =
            finalError instanceof Error &&
            (finalError.message.includes('Failed to fetch dynamically imported module') ||
              finalError.message.includes('Importing a module script failed') ||
              finalError.name === 'ChunkLoadError');

          if (typeof window !== 'undefined' && isChunkError) {
            const lastReload = Number(sessionStorage.getItem('chunk_retry_reload_ts') || '0');
            const now = Date.now();
            if (now - lastReload > 12000) {
              sessionStorage.setItem('chunk_retry_reload_ts', String(now));
              window.location.reload();
            }
          }

          throw finalError;
        }
      }
    }
  });
}

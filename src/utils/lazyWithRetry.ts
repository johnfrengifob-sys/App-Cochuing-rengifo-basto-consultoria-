import { lazy, ComponentType, LazyExoticComponent } from 'react';

/**
 * Robust wrapper for React.lazy that automatically retries dynamic imports
 * if a transient network error or server restart causes a chunk load failure.
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
): LazyExoticComponent<T> {
  return lazy(async () => {
    try {
      return await factory();
    } catch (initialError) {
      console.warn('Dynamic import failed, retrying...', initialError);
      try {
        await new Promise((resolve) => setTimeout(resolve, 350));
        return await factory();
      } catch (secondError) {
        console.warn('Second dynamic import failed, doing final retry...', secondError);
        try {
          await new Promise((resolve) => setTimeout(resolve, 700));
          return await factory();
        } catch (finalError) {
          console.error('Dynamic import permanently failed:', finalError);
          throw finalError;
        }
      }
    }
  });
}

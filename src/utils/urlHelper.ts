/**
 * Utility to resolve canonical public shareable URLs in Google AI Studio environment
 * Automatically converts internal developer URLs ('ais-dev-') to public shared URLs ('ais-pre-')
 * so that links work across any browser, incognito session, or mobile device without authentication errors.
 */

export function getPublicShareableOrigin(): string {
  if (typeof window === 'undefined') return '';
  const origin = window.location.origin || '';
  
  // Convert Google AI Studio private dev container domain to public shareable domain
  if (origin.includes('ais-dev-')) {
    return origin.replace('ais-dev-', 'ais-pre-');
  }
  
  return origin;
}

/**
 * Returns the universal public registration portal URL
 */
export function getPublicPortalUrl(customView = 'registro'): string {
  const publicOrigin = getPublicShareableOrigin();
  return `${publicOrigin}/?view=${customView}`;
}

/**
 * Checks if the current session is running inside the private AI Studio dev container
 */
export function isAiStudioDevEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.hostname.includes('ais-dev-');
}

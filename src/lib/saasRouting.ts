/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { sanitizeHandle } from './saasProfiles';

const RESERVED_PATHS = [
  '',
  '/',
  '/index.html',
  '/landing',
  '/home',
  '/login',
  '/signup',
  '/setup',
  '/dashboard',
  '/api',
];

/**
 * Extract handle from window.location (supports /@bipinyadav, /bipinyadav, ?user=bipinyadav, #bipinyadav)
 */
export function getHandleFromCurrentUrl(): string | null {
  if (typeof window === 'undefined') return null;

  const url = new URL(window.location.href);

  // 1. Check Query parameter ?user=bipinyadav or ?handle=bipinyadav
  const queryParam = url.searchParams.get('user') || url.searchParams.get('handle');
  if (queryParam) {
    const clean = sanitizeHandle(queryParam);
    if (clean) return clean;
  }

  // 2. Check Hash e.g. #@bipinyadav or #bipinyadav
  if (url.hash) {
    const hashContent = url.hash.replace(/^#\/?/, '');
    if (hashContent) {
      const clean = sanitizeHandle(hashContent);
      if (clean) return clean;
    }
  }

  // 3. Check Pathname e.g. /@bipinyadav or /bipinyadav
  const pathname = url.pathname.toLowerCase();
  if (!RESERVED_PATHS.includes(pathname)) {
    // Extract first segment
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 0) {
      const firstSegment = segments[0];
      const clean = sanitizeHandle(firstSegment);
      if (clean && clean.length >= 2) {
        return clean;
      }
    }
  }

  return null;
}

/**
 * Update browser URL dynamically without page reloads
 */
export function navigateToProfileHandle(handle: string | null) {
  if (typeof window === 'undefined') return;

  const currentUrl = new URL(window.location.href);

  if (!handle) {
    // Go to Landing Page Home
    window.history.pushState({}, '', '/');
  } else {
    const clean = sanitizeHandle(handle);
    // Use /@clean for clean routing
    const targetPath = `/@${clean}`;
    window.history.pushState({}, '', targetPath);
  }

  // Dispatch popstate event so listeners re-render
  window.dispatchEvent(new Event('popstate'));
}

/**
 * Get full shareable public profile URL for a handle
 */
export function getShareableProfileUrl(handle: string): string {
  const clean = sanitizeHandle(handle);
  if (typeof window === 'undefined') return `https://foto.app/@${clean}`;
  return `${window.location.origin}/@${clean}`;
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GalleryConfig } from '../types/gallery';

const CONFIG_STORAGE_KEY = 'foto_gallery_custom_config';

// Default profile photo for Bipin Yadav (stylish Apple aesthetic avatar with BY monogram)
export const DEFAULT_AVATAR_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%230071E3"/><stop offset="100%" stop-color="%23003B73"/></linearGradient></defs><rect width="200" height="200" rx="100" fill="url(%23bg)"/><text x="100" y="118" font-family="-apple-system,BlinkMacSystemFont,SF Pro Display,sans-serif" font-size="72" font-weight="700" fill="%23FFFFFF" text-anchor="middle">BY</text></svg>`;

const DEFAULT_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const DEFAULT_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export function getInitialConfig(): GalleryConfig {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  // Check localStorage for customizations from setup wizard
  try {
    const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const url = parsed.supabaseUrl || envUrl;
      const key = parsed.supabaseAnonKey || envKey;
      return {
        supabaseUrl: url,
        supabaseAnonKey: key,
        galleryName: parsed.galleryName || import.meta.env.VITE_GALLERY_NAME || "Bipin's Personal Gallery",
        ownerName: parsed.ownerName || import.meta.env.VITE_OWNER_NAME || 'Bipin Yadav',
        profilePhotoUrl: parsed.profilePhotoUrl || import.meta.env.VITE_PROFILE_PHOTO_URL || DEFAULT_AVATAR_SVG,
        viewerEmail: parsed.viewerEmail || 'viewer@bipinyadav.com',
        adminEmail: parsed.adminEmail || 'bipinonlyforfun@gmail.com',
        viewerPassword: parsed.viewerPassword || import.meta.env.VITE_VIEWER_PASSWORD || 'viewer123',
        adminPassword: parsed.adminPassword || import.meta.env.VITE_ADMIN_PASSWORD || 'admin123',
        isCustomConfigured: true,
      };
    }
  } catch (e) {
    console.warn('Could not read config from storage', e);
  }

  return {
    supabaseUrl: envUrl,
    supabaseAnonKey: envKey,
    galleryName: import.meta.env.VITE_GALLERY_NAME || "Bipin's Personal Gallery",
    ownerName: import.meta.env.VITE_OWNER_NAME || 'Bipin Yadav',
    profilePhotoUrl: import.meta.env.VITE_PROFILE_PHOTO_URL || DEFAULT_AVATAR_SVG,
    viewerEmail: 'viewer@bipinyadav.com',
    adminEmail: 'bipinonlyforfun@gmail.com',
    viewerPassword: import.meta.env.VITE_VIEWER_PASSWORD || 'viewer123',
    adminPassword: import.meta.env.VITE_ADMIN_PASSWORD || 'admin123',
    isCustomConfigured: true,
  };
}

export function saveCustomConfig(newConfig: Partial<GalleryConfig>): GalleryConfig {
  const current = getInitialConfig();
  const updated: GalleryConfig = {
    ...current,
    ...newConfig,
    isCustomConfigured: Boolean(newConfig.supabaseUrl && newConfig.supabaseAnonKey),
  };

  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save gallery configuration', e);
  }

  return updated;
}

export function resetToDefaultConfig(): GalleryConfig {
  try {
    localStorage.removeItem(CONFIG_STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear config', e);
  }
  return getInitialConfig();
}

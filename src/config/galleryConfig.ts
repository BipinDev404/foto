/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GalleryConfig } from '../types/gallery';

const CONFIG_STORAGE_KEY = 'foto_gallery_custom_config';

// Default default profile photo (warm aesthetic Apple-style SVG portrait)
export const DEFAULT_AVATAR_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23E5E5EA"/><stop offset="100%" stop-color="%23C7C7CC"/></linearGradient><linearGradient id="p" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%2348484A"/><stop offset="100%" stop-color="%231C1C1E"/></linearGradient></defs><rect width="200" height="200" rx="100" fill="url(%23g)"/><circle cx="100" cy="80" r="38" fill="url(%23p)"/><path d="M42 178 C52 135 74 125 100 125 C126 125 148 135 158 178 Z" fill="url(%23p)"/></svg>`;

const DEFAULT_SUPABASE_URL = 'https://xgicdovcamnzuwdjvwfl.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnaWNkb3ZjYW1uenV3ZGp2d2ZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4MTgzODQsImV4cCI6MjEwNzM5NDM4NH0.QKkGwsKqPQ-e9IgE4NR9K9EEmPu4WTgvU1MMul_MsDw';

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
        galleryName: parsed.galleryName || import.meta.env.VITE_GALLERY_NAME || 'foto',
        ownerName: parsed.ownerName || import.meta.env.VITE_OWNER_NAME || 'Elena Rostova',
        profilePhotoUrl: parsed.profilePhotoUrl || import.meta.env.VITE_PROFILE_PHOTO_URL || DEFAULT_AVATAR_SVG,
        viewerEmail: parsed.viewerEmail || 'viewer@foto.gallery',
        adminEmail: parsed.adminEmail || 'admin@foto.gallery',
        viewerPassword: parsed.viewerPassword || import.meta.env.VITE_VIEWER_PASSWORD || 'viewer123',
        adminPassword: parsed.adminPassword || import.meta.env.VITE_ADMIN_PASSWORD || 'admin123',
        isCustomConfigured: Boolean(url && key),
      };
    }
  } catch (e) {
    console.warn('Could not read config from storage', e);
  }

  return {
    supabaseUrl: envUrl,
    supabaseAnonKey: envKey,
    galleryName: import.meta.env.VITE_GALLERY_NAME || 'foto',
    ownerName: import.meta.env.VITE_OWNER_NAME || 'Elena Rostova',
    profilePhotoUrl: import.meta.env.VITE_PROFILE_PHOTO_URL || DEFAULT_AVATAR_SVG,
    viewerEmail: 'viewer@foto.gallery',
    adminEmail: 'admin@foto.gallery',
    viewerPassword: import.meta.env.VITE_VIEWER_PASSWORD || 'viewer123',
    adminPassword: import.meta.env.VITE_ADMIN_PASSWORD || 'admin123',
    isCustomConfigured: Boolean(envUrl && envKey),
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

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProfile } from '../types/gallery';
import { DEFAULT_AVATAR_SVG } from '../config/galleryConfig';

const PROFILES_STORAGE_KEY = 'foto_saas_user_profiles';

export const FEATURED_PROFILES: UserProfile[] = [
  {
    handle: 'bipinyadav',
    displayName: 'Bipin Yadav',
    tagline: 'Visual Storyteller & Creative Director',
    bio: 'Creating cinematic visual stories, high-fashion editorials, and architectural portraits. Available worldwide.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80',
    accentColor: '#0071E3',
    location: 'Kathmandu / New York',
    instagram: 'bipinyadav',
    twitter: 'bipinyadav',
    website: 'https://foto-bipin.vercel.app',
    email: 'bipin@foto.gallery',
    adminPassword: 'passcode123',
    viewerPassword: 'viewer123',
    isVerified: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    stats: { views: 14200, photosCount: 24, albumsCount: 3 },
  },
  {
    handle: 'alexvogue',
    displayName: 'Alex Vogue',
    tagline: 'Editorial & Runway Photography',
    bio: 'Capturing the raw kinetic energy of haute couture, Paris fashion week, and urban street style.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80',
    accentColor: '#FF2D55',
    location: 'Paris & Tokyo',
    instagram: 'alexvogue.photo',
    website: 'https://alexvogue.com',
    email: 'alex@vogue.gallery',
    adminPassword: 'passcode123',
    isVerified: true,
    createdAt: '2026-01-10T00:00:00.000Z',
    stats: { views: 8900, photosCount: 18, albumsCount: 2 },
  },
  {
    handle: 'natureprints',
    displayName: 'Nature & Wildlife Fine Art',
    tagline: 'Conservation & Wilderness Photography',
    bio: 'Documenting the earth’s last untamed wild spaces. Museum-grade acrylic and fine art paper prints.',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1600&q=80',
    accentColor: '#30B0C7',
    location: 'Pacific Northwest',
    instagram: 'wildlife.prints',
    email: 'contact@natureprints.org',
    adminPassword: 'passcode123',
    isVerified: true,
    createdAt: '2026-01-15T00:00:00.000Z',
    stats: { views: 6500, photosCount: 15, albumsCount: 2 },
  },
  {
    handle: 'weddingpro',
    displayName: 'Elena Rostova Weddings',
    tagline: 'Fine Art Destination Wedding Photographer',
    bio: 'Documenting timeless, romantic love stories across the Amalfi Coast, Tuscany, and Santorini.',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80',
    accentColor: '#AF52DE',
    location: 'Amalfi Coast & San Francisco',
    instagram: 'elenarostovaweddings',
    adminPassword: 'passcode123',
    isVerified: true,
    createdAt: '2026-02-01T00:00:00.000Z',
    stats: { views: 11200, photosCount: 20, albumsCount: 3 },
  },
];

/**
 * Clean & sanitize user handle (e.g., lowercase, alphanumeric + underscores)
 */
export function sanitizeHandle(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^@/, '')
    .replace(/[^a-z0-9_-]/g, '');
}

/**
 * Load all SaaS user profiles from local storage combined with defaults
 */
export function getAllProfiles(): UserProfile[] {
  try {
    const raw = localStorage.getItem(PROFILES_STORAGE_KEY);
    if (raw) {
      const customProfiles: UserProfile[] = JSON.parse(raw);
      // Merge custom profiles with featured profiles, avoiding duplicates
      const map = new Map<string, UserProfile>();
      for (const p of FEATURED_PROFILES) {
        map.set(p.handle.toLowerCase(), p);
      }
      for (const p of customProfiles) {
        map.set(p.handle.toLowerCase(), p);
      }
      return Array.from(map.values());
    }
  } catch (e) {
    console.warn('Failed to load custom profiles from storage:', e);
  }

  return FEATURED_PROFILES;
}

/**
 * Find a profile by handle
 */
export function getProfileByHandle(handle: string): UserProfile | null {
  const clean = sanitizeHandle(handle);
  if (!clean) return null;
  const all = getAllProfiles();
  return all.find((p) => p.handle.toLowerCase() === clean) || null;
}

/**
 * Save or update a profile in local storage
 */
export function saveProfile(profile: UserProfile): UserProfile {
  const cleanHandle = sanitizeHandle(profile.handle);
  const normalized: UserProfile = {
    ...profile,
    handle: cleanHandle,
    displayName: profile.displayName || cleanHandle,
    avatarUrl: profile.avatarUrl || DEFAULT_AVATAR_SVG,
    createdAt: profile.createdAt || new Date().toISOString(),
  };

  const all = getAllProfiles();
  const index = all.findIndex((p) => p.handle.toLowerCase() === cleanHandle);
  if (index >= 0) {
    all[index] = { ...all[index], ...normalized };
  } else {
    all.push(normalized);
  }

  // Save custom list
  try {
    const customOnly = all.filter(
      (p) => !FEATURED_PROFILES.some((f) => f.handle === p.handle)
    );
    localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(all));
  } catch (e) {
    console.error('Failed to save profile to local storage:', e);
  }

  return normalized;
}

/**
 * Create a new user profile easily for onboarding wizard
 */
export function createNewProfile(
  handle: string,
  displayName: string,
  tagline?: string,
  passcode?: string,
  avatarUrl?: string
): UserProfile {
  const clean = sanitizeHandle(handle) || `user_${Date.now().toString().slice(-4)}`;
  const newProfile: UserProfile = {
    handle: clean,
    displayName: displayName || clean,
    tagline: tagline || 'Photography Portfolio',
    bio: 'Welcome to my photography portfolio on Foto SaaS.',
    avatarUrl: avatarUrl || DEFAULT_AVATAR_SVG,
    coverUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80',
    accentColor: '#0071E3',
    adminPassword: passcode || 'passcode123',
    viewerPassword: '',
    isVerified: false,
    createdAt: new Date().toISOString(),
    stats: { views: 1, photosCount: 0, albumsCount: 0 },
  };

  return saveProfile(newProfile);
}

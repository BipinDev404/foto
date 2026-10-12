/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'viewer' | 'admin';

export interface UserProfile {
  handle: string; // e.g. 'bipinyadav'
  displayName: string; // e.g. 'Bipin Yadav'
  tagline: string; // e.g. 'Creative Director & High Fashion Photographer'
  bio: string;
  avatarUrl: string;
  coverUrl?: string;
  accentColor?: string; // e.g. '#0071E3'
  location?: string;
  instagram?: string;
  twitter?: string;
  website?: string;
  email?: string;
  adminPassword?: string;
  viewerPassword?: string;
  isVerified?: boolean;
  createdAt: string;
  stats?: {
    views?: number;
    photosCount?: number;
    albumsCount?: number;
  };
}

export interface Folder {
  id: string;
  name: string;
  cover_url?: string | null;
  cover_thumbnail_url?: string | null;
  position: number;
  item_count?: number;
  created_at: string;
  updated_at?: string;
  profile_handle?: string; // multi-tenant ownership
}

export interface MediaItem {
  id: string;
  folder_id: string;
  name: string;
  type: 'image' | 'video';
  storage_path: string;
  thumbnail_path?: string | null;
  // Resolved temporary signed URLs
  url?: string;
  thumbnail_url?: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number; // seconds for videos
  position: number;
  created_at: string;
  profile_handle?: string; // multi-tenant ownership
  exif?: {
    camera?: string;
    lens?: string;
    focalLength?: string;
    aperture?: string;
    shutterSpeed?: string;
    iso?: string;
    dateTaken?: string;
  };
}

export interface GalleryConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  galleryName: string;
  ownerName: string;
  profilePhotoUrl: string;
  viewerEmail: string;
  adminEmail: string;
  // Local fallback passwords if not configured in remote auth
  viewerPassword?: string;
  adminPassword?: string;
  isCustomConfigured: boolean;
}

export interface UploadProgressItem {
  id: string;
  name: string;
  type: 'image' | 'video';
  size: number;
  progress: number; // 0 to 100
  status: 'resizing' | 'uploading' | 'completed' | 'error';
  errorMessage?: string;
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Folder, MediaItem } from '../types/gallery';

// High quality resilient aesthetic photos for default folders
export const INITIAL_DEMO_FOLDERS: Folder[] = [
  {
    id: 'folder-1',
    name: 'Moments & Travel',
    cover_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=85',
    cover_thumbnail_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=75',
    position: 0,
    item_count: 5,
    created_at: '2026-09-10T10:00:00Z',
  },
  {
    id: 'folder-2',
    name: 'Architecture & Minimal',
    cover_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=85',
    cover_thumbnail_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=75',
    position: 1,
    item_count: 4,
    created_at: '2026-09-12T14:30:00Z',
  },
  {
    id: 'folder-3',
    name: 'Portraits & Film',
    cover_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85',
    cover_thumbnail_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=75',
    position: 2,
    item_count: 3,
    created_at: '2026-09-15T09:15:00Z',
  },
];

export const INITIAL_DEMO_MEDIA: MediaItem[] = [
  // Folder 1: Moments & Travel
  {
    id: 'media-1-1',
    folder_id: 'folder-1',
    name: 'Misty Alpine Lake.jpg',
    type: 'image',
    storage_path: 'demo/lake.jpg',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1800&q=85',
    thumbnail_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=500&q=75',
    size: 2450000,
    width: 2000,
    height: 1333,
    position: 0,
    created_at: '2026-09-10T10:15:00Z',
  },
  {
    id: 'media-1-2',
    folder_id: 'folder-1',
    name: 'Pacific Coast Highway.jpg',
    type: 'image',
    storage_path: 'demo/highway.jpg',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=85',
    thumbnail_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=500&q=75',
    size: 3120000,
    width: 2000,
    height: 1333,
    position: 1,
    created_at: '2026-09-10T11:20:00Z',
  },
  {
    id: 'media-1-3',
    folder_id: 'folder-1',
    name: 'Glacial Morning Drift.mp4',
    type: 'video',
    storage_path: 'demo/river.mp4',
    // Public sample mp4
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=500&q=75',
    size: 15400000,
    width: 1920,
    height: 1080,
    duration: 15,
    position: 2,
    created_at: '2026-09-10T14:45:00Z',
  },
  {
    id: 'media-1-4',
    folder_id: 'folder-1',
    name: 'Kyoto Golden Pavilion.jpg',
    type: 'image',
    storage_path: 'demo/kyoto.jpg',
    url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1800&q=85',
    thumbnail_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=500&q=75',
    size: 2890000,
    width: 2000,
    height: 1500,
    position: 3,
    created_at: '2026-09-11T08:00:00Z',
  },
  {
    id: 'media-1-5',
    folder_id: 'folder-1',
    name: 'Dolomites Autumn Peaks.jpg',
    type: 'image',
    storage_path: 'demo/dolomites.jpg',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1800&q=85',
    thumbnail_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=500&q=75',
    size: 2100000,
    width: 2000,
    height: 1333,
    position: 4,
    created_at: '2026-09-11T12:30:00Z',
  },

  // Folder 2: Architecture & Minimal
  {
    id: 'media-2-1',
    folder_id: 'folder-2',
    name: 'Glass Facade Reflections.jpg',
    type: 'image',
    storage_path: 'demo/facade.jpg',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1800&q=85',
    thumbnail_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=500&q=75',
    size: 2900000,
    width: 2000,
    height: 1333,
    position: 0,
    created_at: '2026-09-12T14:40:00Z',
  },
  {
    id: 'media-2-2',
    folder_id: 'folder-2',
    name: 'Spiral Concrete Stairwell.jpg',
    type: 'image',
    storage_path: 'demo/stairs.jpg',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1800&q=85',
    thumbnail_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=500&q=75',
    size: 2200000,
    width: 2000,
    height: 1333,
    position: 1,
    created_at: '2026-09-12T15:10:00Z',
  },
  {
    id: 'media-2-3',
    folder_id: 'folder-2',
    name: 'Modernist Gallery Pavilion.mp4',
    type: 'video',
    storage_path: 'demo/pavilion.mp4',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=500&q=75',
    size: 14200000,
    width: 1920,
    height: 1080,
    duration: 15,
    position: 2,
    created_at: '2026-09-13T09:00:00Z',
  },
  {
    id: 'media-2-4',
    folder_id: 'folder-2',
    name: 'Tokyo Monolithic Shadows.jpg',
    type: 'image',
    storage_path: 'demo/shadows.jpg',
    url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=1800&q=85',
    thumbnail_url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=500&q=75',
    size: 1950000,
    width: 2000,
    height: 1333,
    position: 3,
    created_at: '2026-09-13T11:45:00Z',
  },

  // Folder 3: Portraits & Film
  {
    id: 'media-3-1',
    folder_id: 'folder-3',
    name: 'Studio Natural Light 35mm.jpg',
    type: 'image',
    storage_path: 'demo/portrait_studio.jpg',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1800&q=85',
    thumbnail_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=75',
    size: 3400000,
    width: 2000,
    height: 2500,
    position: 0,
    created_at: '2026-09-15T09:20:00Z',
  },
  {
    id: 'media-3-2',
    folder_id: 'folder-3',
    name: 'Leica Street Monochrome.jpg',
    type: 'image',
    storage_path: 'demo/portrait_mono.jpg',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1800&q=85',
    thumbnail_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=75',
    size: 2600000,
    width: 2000,
    height: 2000,
    position: 1,
    created_at: '2026-09-15T11:00:00Z',
  },
  {
    id: 'media-3-3',
    folder_id: 'folder-3',
    name: 'Golden Hour Silhouette.jpg',
    type: 'image',
    storage_path: 'demo/silhouette.jpg',
    url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=1800&q=85',
    thumbnail_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=500&q=75',
    size: 2150000,
    width: 2000,
    height: 1333,
    position: 2,
    created_at: '2026-09-15T16:10:00Z',
  },
];

const LOCAL_FOLDERS_KEY = 'foto_demo_folders_data';
const LOCAL_MEDIA_KEY = 'foto_demo_media_data';

export function getStoredDemoFolders(): Folder[] {
  try {
    const raw = localStorage.getItem(LOCAL_FOLDERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn(e);
  }
  return INITIAL_DEMO_FOLDERS;
}

export function saveStoredDemoFolders(folders: Folder[]): void {
  try {
    localStorage.setItem(LOCAL_FOLDERS_KEY, JSON.stringify(folders));
  } catch (e) {
    console.error(e);
  }
}

export function getStoredDemoMedia(): MediaItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_MEDIA_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn(e);
  }
  return INITIAL_DEMO_MEDIA;
}

export function saveStoredDemoMedia(media: MediaItem[]): void {
  try {
    localStorage.setItem(LOCAL_MEDIA_KEY, JSON.stringify(media));
  } catch (e) {
    console.error(e);
  }
}


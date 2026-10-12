/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Folder, MediaItem } from '../types/gallery';
import {
  INITIAL_DEMO_FOLDERS,
  INITIAL_DEMO_MEDIA,
  getStoredDemoFolders,
  saveStoredDemoFolders,
  getStoredDemoMedia,
  saveStoredDemoMedia,
} from './demoData';

const DB_NAME = 'foto_gallery_storage_db';
const DB_VERSION = 1;
const FOLDERS_STORE = 'folders';
const MEDIA_STORE = 'media_items';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(FOLDERS_STORE)) {
        db.createObjectStore(FOLDERS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(MEDIA_STORE)) {
        db.createObjectStore(MEDIA_STORE, { keyPath: 'id' });
      }
    };
  });
}

/**
 * Load all folders from IndexedDB and localStorage (merged and deduplicated)
 */
export async function getPersistentFolders(): Promise<Folder[]> {
  const local = getStoredDemoFolders();
  try {
    const db = await openDatabase();
    const tx = db.transaction(FOLDERS_STORE, 'readonly');
    const store = tx.objectStore(FOLDERS_STORE);
    const idbFolders = await new Promise<Folder[]>((resolve) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });

    if (idbFolders && idbFolders.length > 0) {
      // Merge IDB folders with localStorage folders
      const map = new Map<string, Folder>();
      for (const f of local) map.set(f.id, f);
      for (const f of idbFolders) map.set(f.id, f);
      const merged = Array.from(map.values());
      merged.sort((a, b) => a.position - b.position);
      return merged;
    }
  } catch (e) {
    console.warn('IDB read folders fallback to localStorage', e);
  }

  return local && local.length > 0 ? local : INITIAL_DEMO_FOLDERS;
}

/**
 * Persist folders to both IndexedDB and localStorage
 */
export async function savePersistentFolders(folders: Folder[]): Promise<void> {
  saveStoredDemoFolders(folders);
  try {
    const db = await openDatabase();
    const tx = db.transaction(FOLDERS_STORE, 'readwrite');
    const store = tx.objectStore(FOLDERS_STORE);
    store.clear();
    for (const f of folders) {
      store.put(f);
    }
  } catch (e) {
    console.warn('IDB write folders error', e);
  }
}

/**
 * Load all media items from IndexedDB and localStorage
 */
export async function getPersistentMedia(): Promise<MediaItem[]> {
  const local = getStoredDemoMedia();
  try {
    const db = await openDatabase();
    const tx = db.transaction(MEDIA_STORE, 'readonly');
    const store = tx.objectStore(MEDIA_STORE);
    const idbMedia = await new Promise<MediaItem[]>((resolve) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });

    if (idbMedia && idbMedia.length > 0) {
      const map = new Map<string, MediaItem>();
      for (const m of local) map.set(m.id, m);
      for (const m of idbMedia) map.set(m.id, m);
      const merged = Array.from(map.values());
      merged.sort((a, b) => a.position - b.position);
      return merged;
    }
  } catch (e) {
    console.warn('IDB read media fallback to localStorage', e);
  }

  return local && local.length > 0 ? local : INITIAL_DEMO_MEDIA;
}

/**
 * Persist media items to both IndexedDB and localStorage
 */
export async function savePersistentMedia(media: MediaItem[]): Promise<void> {
  saveStoredDemoMedia(media);
  try {
    const db = await openDatabase();
    const tx = db.transaction(MEDIA_STORE, 'readwrite');
    const store = tx.objectStore(MEDIA_STORE);
    store.clear();
    for (const m of media) {
      store.put(m);
    }
  } catch (e) {
    console.warn('IDB write media error', e);
  }
}

/**
 * Converts a Blob to a persistent Data URL (base64)
 */
export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

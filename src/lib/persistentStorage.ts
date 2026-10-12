/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Folder, MediaItem } from '../types/gallery';
import { INITIAL_DEMO_FOLDERS, INITIAL_DEMO_MEDIA } from './demoData';

const DB_NAME = 'foto_gallery_db';
const DB_VERSION = 1;
const FOLDERS_STORE = 'folders';
const MEDIA_STORE = 'media';
const BLOBS_STORE = 'blobs'; // Stores binary File / Blob data for persistent offline/local media

// Fallback keys in localStorage for lightweight metadata
const LOCAL_FOLDERS_KEY = 'foto_demo_folders_data';
const LOCAL_MEDIA_KEY = 'foto_demo_media_data';

let dbPromise: Promise<IDBDatabase> | null = null;

function getIDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(FOLDERS_STORE)) {
        db.createObjectStore(FOLDERS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(MEDIA_STORE)) {
        const mediaStore = db.createObjectStore(MEDIA_STORE, { keyPath: 'id' });
        mediaStore.createIndex('folder_id', 'folder_id', { unique: false });
      }
      if (!db.objectStoreNames.contains(BLOBS_STORE)) {
        db.createObjectStore(BLOBS_STORE, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });

  return dbPromise;
}

// Convert Blob / File to base64 Data URL for persistent storage if needed
export function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Save binary blob to IndexedDB
 */
export async function savePersistentBlob(id: string, blob: Blob): Promise<void> {
  try {
    const db = await getIDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(BLOBS_STORE, 'readwrite');
      const store = tx.objectStore(BLOBS_STORE);
      store.put({ id, blob, updatedAt: Date.now() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Could not save blob to IndexedDB, fallback memory:', err);
  }
}

/**
 * Retrieve binary blob from IndexedDB as an object URL
 */
export async function getPersistentBlobUrl(id: string): Promise<string | null> {
  try {
    const db = await getIDB();
    const result = await new Promise<{ id: string; blob: Blob } | undefined>((resolve, reject) => {
      const tx = db.transaction(BLOBS_STORE, 'readonly');
      const store = tx.objectStore(BLOBS_STORE);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    if (result && result.blob) {
      return URL.createObjectURL(result.blob);
    }
  } catch (err) {
    console.warn('Could not read blob from IndexedDB:', err);
  }
  return null;
}

/**
 * Load all folders from IndexedDB (with fallback to localStorage & defaults)
 */
export async function loadPersistentFolders(): Promise<Folder[]> {
  try {
    const db = await getIDB();
    const stored = await new Promise<Folder[]>((resolve, reject) => {
      const tx = db.transaction(FOLDERS_STORE, 'readonly');
      const store = tx.objectStore(FOLDERS_STORE);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });

    if (stored && stored.length > 0) {
      // Re-hydrate any blob cover URLs if needed
      const hydrated = await Promise.all(
        stored.map(async (f) => {
          if (f.cover_url && f.cover_url.startsWith('blob-ref:')) {
            const blobId = f.cover_url.replace('blob-ref:', '');
            const realUrl = await getPersistentBlobUrl(blobId);
            return { ...f, cover_url: realUrl || f.cover_url };
          }
          return f;
        })
      );
      // Keep localStorage synchronized
      try {
        localStorage.setItem(LOCAL_FOLDERS_KEY, JSON.stringify(hydrated));
      } catch {
        // ignore
      }
      return hydrated;
    }
  } catch (e) {
    console.warn('IndexedDB folder load error, using localStorage:', e);
  }

  // Fallback to localStorage
  try {
    const raw = localStorage.getItem(LOCAL_FOLDERS_KEY);
    if (raw) {
      const parsed: Folder[] = JSON.parse(raw);
      if (parsed.length > 0) {
        // Also persist to IndexedDB
        savePersistentFolders(parsed).catch(console.warn);
        return parsed;
      }
    }
  } catch (e) {
    console.warn(e);
  }

  // Default initial folders
  const defaults = [...INITIAL_DEMO_FOLDERS];
  savePersistentFolders(defaults).catch(console.warn);
  return defaults;
}

/**
 * Save all folders to both IndexedDB and localStorage
 */
export async function savePersistentFolders(folders: Folder[]): Promise<void> {
  // Sync to localStorage
  try {
    localStorage.setItem(LOCAL_FOLDERS_KEY, JSON.stringify(folders));
  } catch (e) {
    console.error('localStorage folders save error:', e);
  }

  // Sync to IndexedDB
  try {
    const db = await getIDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(FOLDERS_STORE, 'readwrite');
      const store = tx.objectStore(FOLDERS_STORE);
      store.clear();
      for (const folder of folders) {
        store.put(folder);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.warn('IndexedDB folders save error:', e);
  }
}

/**
 * Load all media items for all folders from IndexedDB (with fallback to localStorage & defaults)
 */
export async function loadPersistentMedia(): Promise<MediaItem[]> {
  try {
    const db = await getIDB();
    const stored = await new Promise<MediaItem[]>((resolve, reject) => {
      const tx = db.transaction(MEDIA_STORE, 'readonly');
      const store = tx.objectStore(MEDIA_STORE);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });

    if (stored && stored.length > 0) {
      // Re-hydrate persistent blob URLs
      const hydrated = await Promise.all(
        stored.map(async (m) => {
          let url = m.url;
          let thumbUrl = m.thumbnail_url;

          if (m.storage_path && m.storage_path.startsWith('blob-ref:')) {
            const blobId = m.storage_path.replace('blob-ref:', '');
            const realBlobUrl = await getPersistentBlobUrl(blobId);
            if (realBlobUrl) {
              url = realBlobUrl;
            }
          }

          if (m.thumbnail_path && m.thumbnail_path.startsWith('blob-ref:')) {
            const thumbBlobId = m.thumbnail_path.replace('blob-ref:', '');
            const realThumbUrl = await getPersistentBlobUrl(thumbBlobId);
            if (realThumbUrl) {
              thumbUrl = realThumbUrl;
            }
          }

          return {
            ...m,
            url: url || m.url,
            thumbnail_url: thumbUrl || m.thumbnail_url || url,
          };
        })
      );

      return hydrated;
    }
  } catch (e) {
    console.warn('IndexedDB media load error, using localStorage:', e);
  }

  // Fallback to localStorage
  try {
    const raw = localStorage.getItem(LOCAL_MEDIA_KEY);
    if (raw) {
      const parsed: MediaItem[] = JSON.parse(raw);
      if (parsed.length > 0) {
        savePersistentMedia(parsed).catch(console.warn);
        return parsed;
      }
    }
  } catch (e) {
    console.warn(e);
  }

  // Default initial media items
  const defaults = [...INITIAL_DEMO_MEDIA];
  savePersistentMedia(defaults).catch(console.warn);
  return defaults;
}

/**
 * Save all media items to IndexedDB and localStorage
 */
export async function savePersistentMedia(media: MediaItem[]): Promise<void> {
  // Save clean metadata to localStorage (strip massive data URLs if needed)
  try {
    const cleanForLocal = media.map((m) => {
      // If url is a huge data: URL, we still keep it or let IndexedDB store it
      return m;
    });
    localStorage.setItem(LOCAL_MEDIA_KEY, JSON.stringify(cleanForLocal));
  } catch (e) {
    console.warn('localStorage media quota exceeded or error:', e);
  }

  // Save to IndexedDB (which handles unlimited gigabytes of Blob and items)
  try {
    const db = await getIDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(MEDIA_STORE, 'readwrite');
      const store = tx.objectStore(MEDIA_STORE);
      store.clear();
      for (const item of media) {
        store.put(item);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.warn('IndexedDB media save error:', e);
  }
}

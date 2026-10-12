/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  writeBatch,
  getDocs,
} from 'firebase/firestore';
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { db, storage } from './firebase';
import { GalleryConfig, Folder, MediaItem } from '../types/gallery';
import { INITIAL_DEMO_FOLDERS, INITIAL_DEMO_MEDIA } from './demoData';
import { DEFAULT_AVATAR_SVG } from '../config/galleryConfig';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
  };
  console.warn('Firestore Operation Notice: ', JSON.stringify(errInfo));
}

// Default initial config for Bipin Yadav
export const DEFAULT_BIPIN_CONFIG: GalleryConfig = {
  supabaseUrl: '',
  supabaseAnonKey: '',
  galleryName: "Bipin's Personal Gallery",
  ownerName: 'Bipin Yadav',
  profilePhotoUrl: DEFAULT_AVATAR_SVG,
  viewerEmail: 'viewer@bipinyadav.com',
  adminEmail: 'bipinonlyforfun@gmail.com',
  viewerPassword: 'viewer123',
  adminPassword: 'admin123',
  isCustomConfigured: true,
};

/**
 * Real-time subscription to global GalleryConfig settings
 */
export function subscribeToGalleryConfig(callback: (config: GalleryConfig) => void): () => void {
  const docRef = doc(db, 'settings', 'config');

  const unsubscribe = onSnapshot(
    docRef,
    async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        callback({
          supabaseUrl: data.supabaseUrl || '',
          supabaseAnonKey: data.supabaseAnonKey || '',
          galleryName: data.galleryName || "Bipin's Personal Gallery",
          ownerName: data.ownerName || 'Bipin Yadav',
          profilePhotoUrl: data.profilePhotoUrl || DEFAULT_AVATAR_SVG,
          viewerEmail: data.viewerEmail || 'viewer@bipinyadav.com',
          adminEmail: data.adminEmail || 'bipinonlyforfun@gmail.com',
          viewerPassword: data.viewerPassword || 'viewer123',
          adminPassword: data.adminPassword || 'admin123',
          isCustomConfigured: true,
        });
      } else {
        // Seed default config document if missing
        try {
          await setDoc(docRef, {
            ...DEFAULT_BIPIN_CONFIG,
            updatedAt: new Date().toISOString(),
          });
          callback(DEFAULT_BIPIN_CONFIG);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, 'settings/config');
          callback(DEFAULT_BIPIN_CONFIG);
        }
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, 'settings/config');
      callback(DEFAULT_BIPIN_CONFIG);
    }
  );

  return unsubscribe;
}

/**
 * Save updated config / profile picture globally across all devices
 */
export async function updateCloudGalleryConfig(updated: Partial<GalleryConfig>): Promise<void> {
  const docRef = doc(db, 'settings', 'config');
  try {
    await setDoc(
      docRef,
      {
        ...updated,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'settings/config');
  }
}

/**
 * Real-time subscription to Folders collection
 */
export function subscribeToFolders(callback: (folders: Folder[]) => void): () => void {
  const colRef = collection(db, 'folders');
  const q = query(colRef, orderBy('position', 'asc'));

  const unsubscribe = onSnapshot(
    q,
    async (snapshot) => {
      if (!snapshot.empty) {
        const folders: Folder[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            name: data.name || 'Untitled Album',
            cover_url: data.cover_url || undefined,
            position: typeof data.position === 'number' ? data.position : 0,
            item_count: typeof data.item_count === 'number' ? data.item_count : 0,
            created_at: data.created_at || new Date().toISOString(),
          };
        });
        callback(folders);
      } else {
        // Seed initial demo folders in Firestore if empty
        try {
          const batch = writeBatch(db);
          INITIAL_DEMO_FOLDERS.forEach((f) => {
            const fRef = doc(db, 'folders', f.id);
            batch.set(fRef, {
              name: f.name,
              cover_url: f.cover_url || '',
              position: f.position,
              item_count: f.item_count || 0,
              created_at: f.created_at || new Date().toISOString(),
            });
          });
          await batch.commit();

          // Also seed initial media items
          const mediaBatch = writeBatch(db);
          INITIAL_DEMO_MEDIA.forEach((m) => {
            const mRef = doc(db, 'media_items', m.id);
            mediaBatch.set(mRef, {
              folder_id: m.folder_id,
              name: m.name,
              type: m.type,
              url: m.url,
              thumbnail_url: m.thumbnail_url || m.url,
              storage_path: m.storage_path || '',
              size: m.size || 0,
              width: m.width || 1920,
              height: m.height || 1080,
              duration: m.duration || 0,
              position: m.position || 0,
              created_at: m.created_at || new Date().toISOString(),
            });
          });
          await mediaBatch.commit();
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, 'folders');
          callback(INITIAL_DEMO_FOLDERS);
        }
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, 'folders');
      callback(INITIAL_DEMO_FOLDERS);
    }
  );

  return unsubscribe;
}

/**
 * Real-time subscription to Media Items for a given folder
 */
export function subscribeToFolderMedia(
  folderId: string,
  callback: (items: MediaItem[]) => void
): () => void {
  const colRef = collection(db, 'media_items');
  const q = query(colRef, where('folder_id', '==', folderId), orderBy('position', 'asc'));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const items: MediaItem[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          folder_id: data.folder_id,
          name: data.name || 'File',
          type: data.type === 'video' ? 'video' : 'image',
          storage_path: data.storage_path || '',
          thumbnail_path: data.thumbnail_path || '',
          url: data.url || '',
          thumbnail_url: data.thumbnail_url || data.url || '',
          size: data.size || 0,
          width: data.width,
          height: data.height,
          duration: data.duration,
          position: typeof data.position === 'number' ? data.position : 0,
          created_at: data.created_at || new Date().toISOString(),
        };
      });
      callback(items);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, `media_items/${folderId}`);
    }
  );

  return unsubscribe;
}

/**
 * Create a new Folder globally
 */
export async function createCloudFolder(name: string, position: number): Promise<Folder | null> {
  const folderId = `folder_${Date.now()}`;
  const fRef = doc(db, 'folders', folderId);
  const newFolder: Folder = {
    id: folderId,
    name: name.trim(),
    position,
    item_count: 0,
    created_at: new Date().toISOString(),
  };

  try {
    await setDoc(fRef, {
      name: newFolder.name,
      position: newFolder.position,
      item_count: 0,
      created_at: newFolder.created_at,
    });
    return newFolder;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `folders/${folderId}`);
    return null;
  }
}

/**
 * Rename Folder globally
 */
export async function renameCloudFolder(folderId: string, newName: string): Promise<void> {
  const fRef = doc(db, 'folders', folderId);
  try {
    await updateDoc(fRef, { name: newName.trim() });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `folders/${folderId}`);
  }
}

/**
 * Delete Folder & associated media items globally
 */
export async function deleteCloudFolder(folderId: string): Promise<void> {
  try {
    // Delete folder doc
    await deleteDoc(doc(db, 'folders', folderId));

    // Query and delete associated media items
    const colRef = collection(db, 'media_items');
    const q = query(colRef, where('folder_id', '==', folderId));
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    snapshot.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `folders/${folderId}`);
  }
}

/**
 * Reorder folders globally
 */
export async function reorderCloudFolders(folders: Folder[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    folders.forEach((f, idx) => {
      const ref = doc(db, 'folders', f.id);
      batch.update(ref, { position: idx });
    });
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, 'folders');
  }
}

/**
 * Set Cover image for a Folder globally
 */
export async function setCloudFolderCover(folderId: string, coverUrl: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'folders', folderId), { cover_url: coverUrl });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `folders/${folderId}`);
  }
}

/**
 * Reorder media items within folder globally
 */
export async function reorderCloudMediaItems(items: MediaItem[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    items.forEach((m, idx) => {
      const ref = doc(db, 'media_items', m.id);
      batch.update(ref, { position: idx });
    });
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, 'media_items');
  }
}

/**
 * Delete media items globally
 */
export async function deleteCloudMediaItems(itemIds: string[], folderId?: string | null): Promise<void> {
  try {
    const batch = writeBatch(db);
    itemIds.forEach((id) => {
      batch.delete(doc(db, 'media_items', id));
    });
    await batch.commit();

    // Decrement folder item_count if provided
    if (folderId) {
      const folderDoc = await getDoc(doc(db, 'folders', folderId));
      if (folderDoc.exists()) {
        const currentCount = folderDoc.data().item_count || 0;
        await updateDoc(doc(db, 'folders', folderId), {
          item_count: Math.max(0, currentCount - itemIds.length),
        });
      }
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, 'media_items');
  }
}

/**
 * Move media items to another folder globally
 */
export async function moveCloudMediaItems(
  itemIds: string[],
  targetFolderId: string,
  sourceFolderId?: string | null
): Promise<void> {
  try {
    const batch = writeBatch(db);
    itemIds.forEach((id) => {
      batch.update(doc(db, 'media_items', id), { folder_id: targetFolderId });
    });
    await batch.commit();

    // Update counts
    if (sourceFolderId) {
      const srcDoc = await getDoc(doc(db, 'folders', sourceFolderId));
      if (srcDoc.exists()) {
        await updateDoc(doc(db, 'folders', sourceFolderId), {
          item_count: Math.max(0, (srcDoc.data().item_count || 0) - itemIds.length),
        });
      }
    }
    const targetDoc = await getDoc(doc(db, 'folders', targetFolderId));
    if (targetDoc.exists()) {
      await updateDoc(doc(db, 'folders', targetFolderId), {
        item_count: (targetDoc.data().item_count || 0) + itemIds.length,
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, 'media_items');
  }
}

/**
 * Upload binary file/blob to Firebase Storage and add to Firestore collection
 */
export async function uploadMediaToCloudStorage(
  fileBlob: Blob | File,
  thumbBlob: Blob | null,
  fileName: string,
  targetFolderId: string,
  meta: { type: 'image' | 'video'; width?: number; height?: number; duration?: number; position: number }
): Promise<MediaItem | null> {
  const timestamp = Date.now();
  const cleanName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const mediaId = `media_${timestamp}_${Math.random().toString(36).substr(2, 6)}`;

  let downloadUrl = '';
  let thumbDownloadUrl = '';

  try {
    // 1. Upload to Firebase Storage
    const fileRef = storageRef(storage, `gallery_uploads/${targetFolderId}/${timestamp}_${cleanName}`);
    await uploadBytes(fileRef, fileBlob);
    downloadUrl = await getDownloadURL(fileRef);

    if (thumbBlob) {
      const thumbRef = storageRef(storage, `gallery_uploads/${targetFolderId}/thumbs/${timestamp}_thumb_${cleanName}`);
      await uploadBytes(thumbRef, thumbBlob);
      thumbDownloadUrl = await getDownloadURL(thumbRef);
    } else {
      thumbDownloadUrl = downloadUrl;
    }
  } catch (storageErr) {
    console.warn('Firebase Storage direct upload notice, falling back to data URL:', storageErr);
    // Fallback: Convert Blob to Data URL if storage bucket has restrictions
    const reader = new FileReader();
    downloadUrl = await new Promise<string>((resolve) => {
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(fileBlob);
    });
    if (thumbBlob) {
      const thumbReader = new FileReader();
      thumbDownloadUrl = await new Promise<string>((resolve) => {
        thumbReader.onload = () => resolve(thumbReader.result as string);
        thumbReader.readAsDataURL(thumbBlob);
      });
    } else {
      thumbDownloadUrl = downloadUrl;
    }
  }

  // 2. Add document to Firestore
  const newMediaDoc: MediaItem = {
    id: mediaId,
    folder_id: targetFolderId,
    name: fileName,
    type: meta.type,
    storage_path: `gallery_uploads/${targetFolderId}/${timestamp}_${cleanName}`,
    thumbnail_path: `gallery_uploads/${targetFolderId}/thumbs/${timestamp}_thumb_${cleanName}`,
    url: downloadUrl,
    thumbnail_url: thumbDownloadUrl,
    size: fileBlob.size,
    width: meta.width,
    height: meta.height,
    duration: meta.duration,
    position: meta.position,
    created_at: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'media_items', mediaId), newMediaDoc);

    // Update folder item count and cover if missing
    const folderDoc = await getDoc(doc(db, 'folders', targetFolderId));
    if (folderDoc.exists()) {
      const currentCover = folderDoc.data().cover_url;
      const currentCount = folderDoc.data().item_count || 0;
      await updateDoc(doc(db, 'folders', targetFolderId), {
        item_count: currentCount + 1,
        ...(!currentCover ? { cover_url: thumbDownloadUrl || downloadUrl } : {}),
      });
    }

    return newMediaDoc;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `media_items/${mediaId}`);
    return null;
  }
}

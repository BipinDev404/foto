/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { Folder, MediaItem, GalleryConfig, UploadProgressItem } from '../types/gallery';
import {
  subscribeToFolders,
  subscribeToFolderMedia,
  createCloudFolder,
  renameCloudFolder,
  deleteCloudFolder,
  reorderCloudFolders,
  setCloudFolderCover,
  reorderCloudMediaItems,
  deleteCloudMediaItems,
  moveCloudMediaItems,
  uploadMediaToCloudStorage,
} from '../lib/firebaseSync';
import { processImageBeforeUpload, processVideoBeforeUpload } from '../lib/imageProcessor';

export function useGallery(config: GalleryConfig, isLoggedIn: boolean, _isAuthDemo = false) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isLoadingFolders, setIsLoadingFolders] = useState(true);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Upload tracking state
  const [uploadQueue, setUploadQueue] = useState<UploadProgressItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Active folder object
  const currentFolder = useMemo(() => {
    return folders.find((f) => f.id === selectedFolderId) || null;
  }, [folders, selectedFolderId]);

  // Subscribe to Folders in Realtime across all devices via Firestore
  useEffect(() => {
    if (!isLoggedIn) return;

    setIsLoadingFolders(true);
    const unsubscribe = subscribeToFolders((cloudFolders) => {
      setFolders(cloudFolders);
      setIsLoadingFolders(false);
    });

    return () => unsubscribe();
  }, [isLoggedIn]);

  // Subscribe to Media Items for selected folder in Realtime across all devices
  useEffect(() => {
    if (!isLoggedIn || !selectedFolderId) {
      setMediaItems([]);
      setIsLoadingMedia(false);
      return;
    }

    setIsLoadingMedia(true);
    const unsubscribe = subscribeToFolderMedia(selectedFolderId, (items) => {
      setMediaItems(items);
      setIsLoadingMedia(false);
    });

    return () => unsubscribe();
  }, [isLoggedIn, selectedFolderId]);

  // Search filter
  const filteredFolders = useMemo(() => {
    if (!searchQuery.trim()) return folders;
    const q = searchQuery.toLowerCase().trim();
    return folders.filter((f) => f.name.toLowerCase().includes(q));
  }, [folders, searchQuery]);

  const filteredMedia = useMemo(() => {
    if (!searchQuery.trim()) return mediaItems;
    const q = searchQuery.toLowerCase().trim();
    return mediaItems.filter((m) => m.name.toLowerCase().includes(q));
  }, [mediaItems, searchQuery]);

  // Folder Actions synced with Cloud
  const createFolder = async (name: string): Promise<Folder | null> => {
    const trimmed = name.trim();
    if (!trimmed) return null;
    const newPosition = folders.length;
    return await createCloudFolder(trimmed, newPosition);
  };

  const renameFolder = async (folderId: string, newName: string) => {
    if (!newName.trim()) return;
    await renameCloudFolder(folderId, newName);
  };

  const deleteFolder = async (folderId: string) => {
    await deleteCloudFolder(folderId);
    if (selectedFolderId === folderId) {
      setSelectedFolderId(null);
    }
  };

  const reorderFolders = async (reordered: Folder[]) => {
    setFolders(reordered);
    await reorderCloudFolders(reordered);
  };

  const setFolderCover = async (folderId: string, coverUrl: string) => {
    await setCloudFolderCover(folderId, coverUrl);
  };

  // Media Actions synced with Cloud
  const reorderMediaItems = async (reordered: MediaItem[]) => {
    setMediaItems(reordered);
    await reorderCloudMediaItems(reordered);
  };

  const deleteMediaItems = async (itemIds: string[]) => {
    if (!itemIds.length) return;
    await deleteCloudMediaItems(itemIds, selectedFolderId);
  };

  const moveMediaItems = async (itemIds: string[], targetFolderId: string) => {
    if (!itemIds.length || !targetFolderId || targetFolderId === selectedFolderId) return;
    await moveCloudMediaItems(itemIds, targetFolderId, selectedFolderId);
  };

  // Upload handler with client processing & Cloud Storage sync
  const uploadFiles = async (files: File[], targetFolderId: string) => {
    if (!files.length || !targetFolderId) return;

    setIsUploading(true);
    const initialQueue: UploadProgressItem[] = files.map((f, i) => ({
      id: `upload-${Date.now()}-${i}`,
      name: f.name,
      type: f.type.startsWith('video') ? 'video' : 'image',
      size: f.size,
      progress: 5,
      status: 'resizing',
    }));

    setUploadQueue(initialQueue);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const queueItem = initialQueue[i];

      try {
        // Step 1: Client-side processing
        let processedBlob: Blob | File = file;
        let thumbBlob: Blob | null = null;
        let width: number | undefined;
        let height: number | undefined;
        let duration: number | undefined;

        if (file.type.startsWith('video')) {
          const res = await processVideoBeforeUpload(file);
          processedBlob = res.file;
          thumbBlob = res.thumbnailFile;
          width = res.width;
          height = res.height;
          duration = res.duration;
        } else {
          const res = await processImageBeforeUpload(file);
          processedBlob = res.file;
          thumbBlob = res.thumbnailFile;
          width = res.width;
          height = res.height;
        }

        setUploadQueue((prev) =>
          prev.map((item) =>
            item.id === queueItem.id ? { ...item, progress: 40, status: 'uploading' } : item
          )
        );

        // Upload to Cloud Storage & Firestore in real time
        const resultItem = await uploadMediaToCloudStorage(
          processedBlob,
          thumbBlob,
          file.name,
          targetFolderId,
          {
            type: file.type.startsWith('video') ? 'video' : 'image',
            width,
            height,
            duration,
            position: mediaItems.length + i,
          }
        );

        setUploadQueue((prev) =>
          prev.map((item) =>
            item.id === queueItem.id ? { ...item, progress: 100, status: 'completed' } : item
          )
        );
      } catch (err: any) {
        console.warn('Error during cloud upload of file:', file.name, err?.message || err);
        setUploadQueue((prev) =>
          prev.map((item) =>
            item.id === queueItem.id
              ? { ...item, status: 'error', errorMessage: err?.message || 'Upload failed' }
              : item
          )
        );
      }
    }

    setTimeout(() => {
      setIsUploading(false);
      setUploadQueue([]);
    }, 1500);
  };

  return {
    folders: filteredFolders,
    allFolders: folders,
    mediaItems: filteredMedia,
    currentFolder,
    selectedFolderId,
    setSelectedFolderId,
    isLoadingFolders,
    isLoadingMedia,
    searchQuery,
    setSearchQuery,
    isDemoMode: false,
    uploadQueue,
    isUploading,
    createFolder,
    renameFolder,
    deleteFolder,
    reorderFolders,
    setFolderCover,
    reorderMediaItems,
    deleteMediaItems,
    moveMediaItems,
    uploadFiles,
    refreshFolders: () => {},
  };
}

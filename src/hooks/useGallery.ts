/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Folder, MediaItem, GalleryConfig, UploadProgressItem } from '../types/gallery';
import { getSupabaseClient, getSignedMediaUrl } from '../lib/supabase';
import {
  getStoredDemoFolders,
  saveStoredDemoFolders,
  getStoredDemoMedia,
  saveStoredDemoMedia,
} from '../lib/demoData';
import { processImageBeforeUpload, processVideoBeforeUpload } from '../lib/imageProcessor';

export function useGallery(config: GalleryConfig, isLoggedIn: boolean) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isLoadingFolders, setIsLoadingFolders] = useState(true);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Upload tracking state
  const [uploadQueue, setUploadQueue] = useState<UploadProgressItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Active folder object
  const currentFolder = useMemo(() => {
    return folders.find((f) => f.id === selectedFolderId) || null;
  }, [folders, selectedFolderId]);

  // Load Folders
  const loadFolders = useCallback(async () => {
    setIsLoadingFolders(true);
    const client = getSupabaseClient(config);

    if (client) {
      try {
        const { data, error } = await client
          .from('folders')
          .select('*, media_items(count)')
          .order('position', { ascending: true });

        if (error) {
          throw error;
        }

        if (data) {
          const mapped: Folder[] = await Promise.all(
            data.map(async (row) => {
              let coverUrl = row.cover_url;
              if (coverUrl && !coverUrl.startsWith('http') && !coverUrl.startsWith('data:')) {
                coverUrl = await getSignedMediaUrl(coverUrl, config);
              }
              const count = row.media_items?.[0]?.count || 0;
              return {
                id: row.id,
                name: row.name,
                cover_url: coverUrl,
                position: row.position,
                item_count: count,
                created_at: row.created_at,
              };
            })
          );

          setFolders(mapped);
          setIsDemoMode(false);
          setIsLoadingFolders(false);
          return;
        }
      } catch (err) {
        console.warn('Could not query Supabase folders, falling back to local/demo data:', err);
      }
    }

    // Fallback: Local / Demo Folders
    const demoFolders = getStoredDemoFolders();
    const demoMedia = getStoredDemoMedia();
    const foldersWithCount = demoFolders.map((f) => ({
      ...f,
      item_count: demoMedia.filter((m) => m.folder_id === f.id).length,
    }));

    setFolders(foldersWithCount);
    setIsDemoMode(true);
    setIsLoadingFolders(false);
  }, [config]);

  // Load Media Items for Selected Folder
  const loadMediaForFolder = useCallback(
    async (folderId: string) => {
      setIsLoadingMedia(true);
      const client = getSupabaseClient(config);

      if (client && !isDemoMode) {
        try {
          const { data, error } = await client
            .from('media_items')
            .select('*')
            .eq('folder_id', folderId)
            .order('position', { ascending: true });

          if (error) throw error;

          if (data) {
            // Resolve private signed URLs
            const resolved: MediaItem[] = await Promise.all(
              data.map(async (item) => {
                const signedUrl = await getSignedMediaUrl(item.storage_path, config);
                const signedThumbUrl = item.thumbnail_path
                  ? await getSignedMediaUrl(item.thumbnail_path, config)
                  : signedUrl;

                return {
                  ...item,
                  url: signedUrl || undefined,
                  thumbnail_url: signedThumbUrl || undefined,
                };
              })
            );

            setMediaItems(resolved);
            setIsLoadingMedia(false);
            return;
          }
        } catch (err) {
          console.warn('Could not load Supabase media items, checking demo data:', err);
        }
      }

      // Demo/Local media
      const allDemo = getStoredDemoMedia();
      const filtered = allDemo.filter((m) => m.folder_id === folderId);
      // Sort by position
      filtered.sort((a, b) => a.position - b.position);
      setMediaItems(filtered);
      setIsLoadingMedia(false);
    },
    [config, isDemoMode]
  );

  useEffect(() => {
    if (isLoggedIn) {
      loadFolders();
    }
  }, [isLoggedIn, loadFolders]);

  useEffect(() => {
    if (selectedFolderId) {
      loadMediaForFolder(selectedFolderId);
    } else {
      setMediaItems([]);
    }
  }, [selectedFolderId, loadMediaForFolder]);

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

  // Folder Actions
  const createFolder = async (name: string): Promise<Folder | null> => {
    const trimmed = name.trim();
    if (!trimmed) return null;

    const newPosition = folders.length;
    const client = getSupabaseClient(config);

    if (client && !isDemoMode) {
      try {
        const { data, error } = await client
          .from('folders')
          .insert([{ name: trimmed, position: newPosition }])
          .select()
          .single();

        if (error) throw error;
        if (data) {
          const newFolder: Folder = {
            id: data.id,
            name: data.name,
            position: data.position,
            item_count: 0,
            created_at: data.created_at,
          };
          setFolders((prev) => [...prev, newFolder]);
          return newFolder;
        }
      } catch (err) {
        console.error('Error creating folder in Supabase:', err);
      }
    }

    // Local / Demo creation
    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name: trimmed,
      position: newPosition,
      item_count: 0,
      created_at: new Date().toISOString(),
    };
    const updated = [...folders, newFolder];
    setFolders(updated);
    saveStoredDemoFolders(updated);
    return newFolder;
  };

  const renameFolder = async (folderId: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;

    const client = getSupabaseClient(config);
    if (client && !isDemoMode) {
      try {
        await client.from('folders').update({ name: trimmed }).eq('id', folderId);
      } catch (e) {
        console.error(e);
      }
    }

    setFolders((prev) =>
      prev.map((f) => (f.id === folderId ? { ...f, name: trimmed } : f))
    );

    if (isDemoMode) {
      const demo = getStoredDemoFolders().map((f) =>
        f.id === folderId ? { ...f, name: trimmed } : f
      );
      saveStoredDemoFolders(demo);
    }
  };

  const deleteFolder = async (folderId: string) => {
    const client = getSupabaseClient(config);
    if (client && !isDemoMode) {
      try {
        await client.from('folders').delete().eq('id', folderId);
      } catch (e) {
        console.error(e);
      }
    }

    setFolders((prev) => prev.filter((f) => f.id !== folderId));
    if (selectedFolderId === folderId) {
      setSelectedFolderId(null);
    }

    if (isDemoMode) {
      const demoF = getStoredDemoFolders().filter((f) => f.id !== folderId);
      saveStoredDemoFolders(demoF);
      const demoM = getStoredDemoMedia().filter((m) => m.folder_id !== folderId);
      saveStoredDemoMedia(demoM);
    }
  };

  const reorderFolders = async (reordered: Folder[]) => {
    const updatedWithPos = reordered.map((f, idx) => ({ ...f, position: idx }));
    setFolders(updatedWithPos);

    const client = getSupabaseClient(config);
    if (client && !isDemoMode) {
      try {
        for (const f of updatedWithPos) {
          await client.from('folders').update({ position: f.position }).eq('id', f.id);
        }
      } catch (e) {
        console.error('Reorder folders error', e);
      }
    }

    if (isDemoMode) {
      saveStoredDemoFolders(updatedWithPos);
    }
  };

  const setFolderCover = async (folderId: string, coverUrl: string) => {
    const client = getSupabaseClient(config);
    if (client && !isDemoMode) {
      try {
        await client.from('folders').update({ cover_url: coverUrl }).eq('id', folderId);
      } catch (e) {
        console.error('Error setting cover image', e);
      }
    }

    setFolders((prev) =>
      prev.map((f) => (f.id === folderId ? { ...f, cover_url: coverUrl } : f))
    );

    if (isDemoMode) {
      const demo = getStoredDemoFolders().map((f) =>
        f.id === folderId ? { ...f, cover_url: coverUrl } : f
      );
      saveStoredDemoFolders(demo);
    }
  };

  // Media Actions
  const reorderMediaItems = async (reordered: MediaItem[]) => {
    const updatedWithPos = reordered.map((m, idx) => ({ ...m, position: idx }));
    setMediaItems(updatedWithPos);

    const client = getSupabaseClient(config);
    if (client && !isDemoMode) {
      try {
        for (const m of updatedWithPos) {
          await client.from('media_items').update({ position: m.position }).eq('id', m.id);
        }
      } catch (e) {
        console.error('Reorder media error', e);
      }
    }

    if (isDemoMode) {
      const allDemo = getStoredDemoMedia();
      const otherFolderMedia = allDemo.filter((m) => m.folder_id !== selectedFolderId);
      saveStoredDemoMedia([...otherFolderMedia, ...updatedWithPos]);
    }
  };

  const deleteMediaItems = async (itemIds: string[]) => {
    if (!itemIds.length) return;

    const client = getSupabaseClient(config);
    if (client && !isDemoMode) {
      try {
        // Delete records
        await client.from('media_items').delete().in('id', itemIds);
      } catch (e) {
        console.error('Delete items error', e);
      }
    }

    setMediaItems((prev) => prev.filter((m) => !itemIds.includes(m.id)));
    setFolders((prev) =>
      prev.map((f) =>
        f.id === selectedFolderId
          ? { ...f, item_count: Math.max(0, (f.item_count || 0) - itemIds.length) }
          : f
      )
    );

    if (isDemoMode) {
      const demo = getStoredDemoMedia().filter((m) => !itemIds.includes(m.id));
      saveStoredDemoMedia(demo);
    }
  };

  const moveMediaItems = async (itemIds: string[], targetFolderId: string) => {
    if (!itemIds.length || !targetFolderId || targetFolderId === selectedFolderId) return;

    const client = getSupabaseClient(config);
    if (client && !isDemoMode) {
      try {
        await client
          .from('media_items')
          .update({ folder_id: targetFolderId })
          .in('id', itemIds);
      } catch (e) {
        console.error('Move items error', e);
      }
    }

    setMediaItems((prev) => prev.filter((m) => !itemIds.includes(m.id)));
    // Update folder counts
    setFolders((prev) =>
      prev.map((f) => {
        if (f.id === selectedFolderId) {
          return { ...f, item_count: Math.max(0, (f.item_count || 0) - itemIds.length) };
        }
        if (f.id === targetFolderId) {
          return { ...f, item_count: (f.item_count || 0) + itemIds.length };
        }
        return f;
      })
    );

    if (isDemoMode) {
      const demo = getStoredDemoMedia().map((m) =>
        itemIds.includes(m.id) ? { ...m, folder_id: targetFolderId } : m
      );
      saveStoredDemoMedia(demo);
    }
  };

  // Upload handler with client-side canvas resizing (2000px max, 0.85 quality, 400px thumb)
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
    const client = getSupabaseClient(config);

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

        // Update progress status to uploading
        setUploadQueue((prev) =>
          prev.map((item) =>
            item.id === queueItem.id ? { ...item, progress: 40, status: 'uploading' } : item
          )
        );

        const timestamp = Date.now();
        const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const mainPath = `${targetFolderId}/${timestamp}_${cleanName}`;
        const thumbPath = `${targetFolderId}/thumbs/${timestamp}_thumb_${cleanName}.jpg`;

        if (client && !isDemoMode) {
          // Upload main file to private storage bucket 'foto-media'
          const { error: uploadErr } = await client.storage
            .from('foto-media')
            .upload(mainPath, processedBlob, {
              cacheControl: '3600',
              upsert: false,
              contentType: file.type || 'image/jpeg',
            });

          if (uploadErr) throw uploadErr;

          // Upload thumbnail
          if (thumbBlob) {
            await client.storage.from('foto-media').upload(thumbPath, thumbBlob, {
              cacheControl: '3600',
              upsert: false,
              contentType: 'image/jpeg',
            });
          }

          setUploadQueue((prev) =>
            prev.map((item) =>
              item.id === queueItem.id ? { ...item, progress: 85 } : item
            )
          );

          // Insert media record in database
          const { data: insertedItem, error: dbErr } = await client
            .from('media_items')
            .insert([
              {
                folder_id: targetFolderId,
                name: file.name,
                type: file.type.startsWith('video') ? 'video' : 'image',
                storage_path: mainPath,
                thumbnail_path: thumbPath,
                size: processedBlob.size,
                width,
                height,
                duration,
                position: mediaItems.length + i,
              },
            ])
            .select()
            .single();

          if (dbErr) throw dbErr;

          // Obtain signed URL for display
          const signedUrl = await getSignedMediaUrl(mainPath, config);
          const signedThumbUrl = await getSignedMediaUrl(thumbPath, config);

          if (insertedItem && selectedFolderId === targetFolderId) {
            setMediaItems((prev) => [
              ...prev,
              {
                ...insertedItem,
                url: signedUrl || undefined,
                thumbnail_url: signedThumbUrl || undefined,
              },
            ]);
          }
        } else {
          // Local/Demo storage using ObjectURLs
          const localUrl = URL.createObjectURL(processedBlob);
          const localThumbUrl = thumbBlob ? URL.createObjectURL(thumbBlob) : localUrl;

          const newMediaItem: MediaItem = {
            id: `media-${Date.now()}-${i}`,
            folder_id: targetFolderId,
            name: file.name,
            type: file.type.startsWith('video') ? 'video' : 'image',
            storage_path: localUrl,
            url: localUrl,
            thumbnail_url: localThumbUrl,
            size: processedBlob.size,
            width,
            height,
            duration,
            position: mediaItems.length + i,
            created_at: new Date().toISOString(),
          };

          if (selectedFolderId === targetFolderId) {
            setMediaItems((prev) => [...prev, newMediaItem]);
          }

          const currentDemoMedia = getStoredDemoMedia();
          saveStoredDemoMedia([...currentDemoMedia, newMediaItem]);
        }

        // Set folder cover if folder currently has no cover
        const targetFolder = folders.find((f) => f.id === targetFolderId);
        if (targetFolder && !targetFolder.cover_url) {
          const coverPath = client && !isDemoMode ? mainPath : URL.createObjectURL(processedBlob);
          setFolderCover(targetFolderId, coverPath);
        }

        // Update count
        setFolders((prev) =>
          prev.map((f) =>
            f.id === targetFolderId
              ? { ...f, item_count: (f.item_count || 0) + 1 }
              : f
          )
        );

        setUploadQueue((prev) =>
          prev.map((item) =>
            item.id === queueItem.id ? { ...item, progress: 100, status: 'completed' } : item
          )
        );
      } catch (err: any) {
        console.error('Error during upload of file', file.name, err);
        setUploadQueue((prev) =>
          prev.map((item) =>
            item.id === queueItem.id
              ? { ...item, status: 'error', errorMessage: err.message || 'Upload failed' }
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
    isDemoMode,
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
    refreshFolders: loadFolders,
  };
}

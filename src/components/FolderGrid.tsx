/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Folder as FolderIcon,
  MoreVertical,
  Edit2,
  Trash2,
  GripVertical,
  Plus,
  ImageIcon,
} from 'lucide-react';
import { Folder, UserRole } from '../types/gallery';

interface FolderGridProps {
  folders: Folder[];
  role: UserRole;
  onSelectFolder: (folderId: string) => void;
  onRenameFolder: (folderId: string, newName: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onReorderFolders: (reordered: Folder[]) => void;
  onCreateFolderClick: () => void;
}

export const FolderGrid: React.FC<FolderGridProps> = ({
  folders,
  role,
  onSelectFolder,
  onRenameFolder,
  onDeleteFolder,
  onReorderFolders,
  onCreateFolderClick,
}) => {
  const [activeMenuFolderId, setActiveMenuFolderId] = useState<string | null>(null);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [deletingFolder, setDeletingFolder] = useState<Folder | null>(null);

  // Drag-and-drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const isAdmin = role === 'admin';

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (!isAdmin) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    if (!isAdmin || draggedIndex === null) return;
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    if (!isAdmin || draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    e.preventDefault();
    const updated = [...folders];
    const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, moved);
    onReorderFolders(updated);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const startRename = (folder: Folder) => {
    setEditingFolderId(folder.id);
    setEditingName(folder.name);
    setActiveMenuFolderId(null);
  };

  const submitRename = (folderId: string) => {
    if (editingName.trim()) {
      onRenameFolder(folderId, editingName.trim());
    }
    setEditingFolderId(null);
  };

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
            Albums
          </h2>
          <p className="text-sm text-[#6E6E73] dark:text-[#86868B] mt-0.5">
            {folders.length} {folders.length === 1 ? 'collection' : 'collections'}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={onCreateFolderClick}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#0071E3] dark:text-[#2997FF] hover:opacity-80 transition-opacity px-3 py-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Album</span>
          </button>
        )}
      </div>

      {/* Grid of Large Rounded Cards */}
      {folders.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-black/10 dark:border-white/10 p-8">
          <div className="w-12 h-12 rounded-full bg-black/[0.04] dark:bg-white/[0.06] flex items-center justify-center text-[#6E6E73] mb-3">
            <FolderIcon className="w-6 h-6 stroke-1" />
          </div>
          <h3 className="text-base font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mb-1">
            No albums found
          </h3>
          <p className="text-xs text-[#6E6E73] dark:text-[#86868B] max-w-xs mb-4">
            {isAdmin
              ? 'Create your first album to begin organizing your private photos and videos.'
              : 'There are no visible albums in the gallery yet.'}
          </p>
          {isAdmin && (
            <button
              onClick={onCreateFolderClick}
              className="text-xs font-semibold px-4 py-2 rounded-full bg-[#1D1D1F] dark:bg-[#F5F5F7] text-white dark:text-[#1D1D1F] hover:opacity-90 transition-opacity"
            >
              Create Album
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {folders.map((folder, index) => {
            const isDragging = draggedIndex === index;
            const isDragOver = dragOverIndex === index;

            return (
              <div
                key={folder.id}
                draggable={isAdmin && !editingFolderId}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                className={`group relative rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_12px_32px_rgba(0,0,0,0.3)] transition-all duration-300 overflow-hidden flex flex-col ${
                  isDragging ? 'opacity-40 scale-95' : ''
                } ${isDragOver ? 'ring-2 ring-[#0071E3]' : ''}`}
              >
                {/* Cover Image Container */}
                <div
                  onClick={() => onSelectFolder(folder.id)}
                  className="aspect-[4/3] w-full overflow-hidden bg-black/[0.03] dark:bg-white/[0.04] relative cursor-pointer"
                >
                  {folder.cover_url ? (
                    <img
                      src={folder.cover_url}
                      alt={folder.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#6E6E73] dark:text-[#86868B]">
                      <ImageIcon className="w-10 h-10 stroke-1 mb-2 opacity-50" />
                      <span className="text-xs font-normal">Empty Album</span>
                    </div>
                  )}

                  {/* Gradient Scrim for subtle contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Drag Grip Handle for Admin */}
                  {isAdmin && (
                    <div
                      title="Drag to reorder"
                      className="absolute top-3 left-3 p-1.5 rounded-full bg-black/40 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
                    >
                      <GripVertical className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                {/* Card Info Content */}
                <div className="p-4 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    {editingFolderId === folder.id ? (
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') submitRename(folder.id);
                            if (e.key === 'Escape') setEditingFolderId(null);
                          }}
                          autoFocus
                          className="w-full px-2 py-1 text-sm bg-black/[0.05] dark:bg-white/[0.08] rounded-md text-[#1D1D1F] dark:text-[#F5F5F7] outline-none ring-1 ring-[#0071E3]"
                        />
                        <button
                          onClick={() => submitRename(folder.id)}
                          className="px-2 py-1 text-xs bg-[#0071E3] text-white rounded-md font-medium"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => onSelectFolder(folder.id)}
                        className="text-left w-full block group/btn"
                      >
                        <h3 className="text-base font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] truncate group-hover/btn:text-[#0071E3] dark:group-hover/btn:text-[#2997FF] transition-colors">
                          {folder.name}
                        </h3>
                        <p className="text-xs text-[#6E6E73] dark:text-[#86868B] mt-0.5">
                          {folder.item_count || 0} {folder.item_count === 1 ? 'item' : 'items'}
                        </p>
                      </button>
                    )}
                  </div>

                  {/* Admin 3-dots Menu */}
                  {isAdmin && (
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuFolderId(
                            activeMenuFolderId === folder.id ? null : folder.id
                          );
                        }}
                        className="p-1.5 rounded-full text-[#6E6E73] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors"
                        title="Album options"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuFolderId === folder.id && (
                        <div
                          className="absolute right-0 bottom-full mb-1 w-36 rounded-xl bg-white/95 dark:bg-[#2C2C2E]/95 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.12] shadow-xl py-1 z-20 animate-in fade-in zoom-in-95 duration-150"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => startRename(folder)}
                            className="w-full px-3 py-2 text-left text-xs text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] flex items-center gap-2"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Rename</span>
                          </button>
                          <button
                            onClick={() => {
                              setActiveMenuFolderId(null);
                              setDeletingFolder(folder);
                            }}
                            className="w-full px-3 py-2 text-left text-xs text-[#FF3B30] dark:text-[#FF453A] hover:bg-red-500/10 flex items-center gap-2"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Album</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingFolder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/[0.08] dark:border-white/[0.12] p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
              Delete &quot;{deletingFolder.name}&quot;?
            </h3>
            <p className="text-xs text-[#6E6E73] dark:text-[#86868B] leading-relaxed">
              This will permanently delete this album and all items within it. This action cannot be
              undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingFolder(null)}
                className="px-4 py-2 text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] rounded-full hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteFolder(deletingFolder.id);
                  setDeletingFolder(null);
                }}
                className="px-4 py-2 text-xs font-medium text-white bg-[#FF3B30] hover:bg-[#FF3B30]/90 rounded-full transition-colors"
              >
                Delete Album
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

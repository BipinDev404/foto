/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Play, Check, ImageIcon } from 'lucide-react';
import { MediaItem, UserRole } from '../types/gallery';

interface MediaGridProps {
  mediaItems: MediaItem[];
  role: UserRole;
  isSelectMode: boolean;
  selectedItemIds: string[];
  onToggleSelectItem: (id: string) => void;
  onOpenViewer: (itemIndex: number) => void;
  onReorderMedia: (reordered: MediaItem[]) => void;
}

export const MediaGrid: React.FC<MediaGridProps> = ({
  mediaItems,
  role,
  isSelectMode,
  selectedItemIds,
  onToggleSelectItem,
  onOpenViewer,
  onReorderMedia,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const isAdmin = role === 'admin';

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (!isAdmin || isSelectMode) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    if (!isAdmin || isSelectMode || draggedIndex === null) return;
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    if (!isAdmin || isSelectMode || draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    e.preventDefault();
    const updated = [...mediaItems];
    const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, moved);
    onReorderMedia(updated);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  if (mediaItems.length === 0) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 rounded-full bg-black/[0.04] dark:bg-white/[0.06] flex items-center justify-center text-[#6E6E73] dark:text-[#86868B] mb-3">
          <ImageIcon className="w-6 h-6 stroke-1" />
        </div>
        <h3 className="text-base font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mb-1">
          No media yet
        </h3>
        <p className="text-xs text-[#6E6E73] dark:text-[#86868B] max-w-xs">
          {isAdmin
            ? 'Tap the floating "+" button below to upload your high-resolution photos and videos.'
            : 'This album does not have any photos or videos yet.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-2.5">
      {mediaItems.map((item, index) => {
        const isSelected = selectedItemIds.includes(item.id);
        const isDragging = draggedIndex === index;
        const isDragOver = dragOverIndex === index;

        return (
          <div
            key={item.id}
            draggable={isAdmin && !isSelectMode}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onClick={() => {
              if (isSelectMode) {
                onToggleSelectItem(item.id);
              } else {
                onOpenViewer(index);
              }
            }}
            className={`group relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-black/[0.04] dark:bg-white/[0.04] cursor-pointer select-none transition-all duration-200 ${
              isDragging ? 'opacity-30 scale-95' : ''
            } ${isDragOver ? 'ring-2 ring-[#0071E3]' : ''} ${
              isSelected ? 'ring-2 sm:ring-4 ring-[#0071E3] scale-[0.98]' : 'hover:opacity-95'
            }`}
          >
            {/* Thumbnail Image */}
            <img
              src={item.thumbnail_url || item.url}
              alt={item.name}
              referrerPolicy="no-referrer"
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />

            {/* Video Indicator */}
            {item.type === 'video' && (
              <div className="absolute bottom-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-medium tracking-tight">
                <Play className="w-2.5 h-2.5 fill-white" />
                {item.duration ? <span>{Math.round(item.duration)}s</span> : null}
              </div>
            )}

            {/* Selection Checkmark Overlay */}
            {isSelectMode && (
              <div
                className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-[#0071E3] text-white shadow-md'
                    : 'bg-black/30 backdrop-blur-md border border-white/60 text-transparent'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            )}

            {/* Subtle Hover Gradient for Touch/Mouse */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
          </div>
        );
      })}
    </div>
  );
};

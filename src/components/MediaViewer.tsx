/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Info,
  ZoomIn,
  ZoomOut,
  Trash2,
  Bookmark,
  Share2,
} from 'lucide-react';
import { MediaItem, UserRole } from '../types/gallery';

interface MediaViewerProps {
  items: MediaItem[];
  initialIndex: number;
  isOpen: boolean;
  role: UserRole;
  onClose: () => void;
  onDeleteCurrentItem?: (id: string) => void;
  onSetAsFolderCover?: (url: string) => void;
}

export const MediaViewer: React.FC<MediaViewerProps> = ({
  items,
  initialIndex,
  isOpen,
  role,
  onClose,
  onDeleteCurrentItem,
  onSetAsFolderCover,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [showInfo, setShowInfo] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Touch gesture state
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchCurrentX = useRef<number>(0);
  const touchCurrentY = useRef<number>(0);
  const initialDistance = useRef<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setScale(1);
    setShowInfo(false);
  }, [initialIndex, isOpen]);

  const currentItem = items[currentIndex];

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setScale(1);
    }
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setScale(1);
    }
  }, [currentIndex, items.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'i') setShowInfo((prev) => !prev);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handlePrev, handleNext]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      touchCurrentX.current = e.touches[0].clientX;
      touchCurrentY.current = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
      // Pinch to zoom start
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      initialDistance.current = Math.hypot(dx, dy);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchCurrentX.current = e.touches[0].clientX;
      touchCurrentY.current = e.touches[0].clientY;
    } else if (e.touches.length === 2 && initialDistance.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDist = Math.hypot(dx, dy);
      const ratio = currentDist / initialDistance.current;
      setScale((prev) => Math.max(1, Math.min(3, prev * (ratio > 1 ? 1.02 : 0.98))));
    }
  };

  const handleTouchEnd = () => {
    initialDistance.current = null;
    const deltaX = touchCurrentX.current - touchStartX.current;
    const deltaY = touchCurrentY.current - touchStartY.current;

    // Check for swipe down to close
    if (deltaY > 120 && Math.abs(deltaX) < 80 && scale === 1) {
      onClose();
      return;
    }

    // Check for horizontal swipe (only if not zoomed in)
    if (scale === 1 && Math.abs(deltaX) > 60 && Math.abs(deltaY) < 100) {
      if (deltaX > 0) {
        handlePrev();
      } else {
        handleNext();
      }
    }
  };

  const handleDoubleTap = () => {
    setScale((prev) => (prev > 1 ? 1 : 2));
  };

  if (!isOpen || !currentItem) return null;

  const isAdmin = role === 'admin';

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black/95 text-white flex flex-col justify-between overflow-hidden select-none animate-in fade-in duration-200"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Floating Glass Header Bar */}
      <div className="absolute top-0 inset-x-0 z-20 h-16 px-4 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        {/* Index counter */}
        <div className="text-xs font-medium text-white/70 tracking-tight">
          {currentIndex + 1} of {items.length}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {currentItem.type === 'image' && (
            <>
              <button
                onClick={() => setScale((s) => Math.max(1, s - 0.5))}
                disabled={scale <= 1}
                className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setScale((s) => Math.min(3, s + 0.5))}
                disabled={scale >= 3}
                className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Info Drawer Toggle */}
          <button
            onClick={() => setShowInfo((prev) => !prev)}
            className={`p-2 rounded-full transition-colors ${
              showInfo ? 'bg-white/20 text-white' : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
            title="Inspect Details"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Admin: Set as Folder Cover */}
          {isAdmin && onSetAsFolderCover && (
            <button
              onClick={() => onSetAsFolderCover(currentItem.url || currentItem.thumbnail_url || '')}
              className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              title="Set as Album Cover"
            >
              <Bookmark className="w-4 h-4" />
            </button>
          )}

          {/* Admin: Delete item */}
          {isAdmin && onDeleteCurrentItem && (
            <button
              onClick={() => {
                if (window.confirm('Delete this item permanently?')) {
                  onDeleteCurrentItem(currentItem.id);
                  if (items.length <= 1) {
                    onClose();
                  } else {
                    handleNext();
                  }
                }
              }}
              className="p-2 rounded-full text-white/80 hover:text-[#FF453A] hover:bg-white/10 transition-colors"
              title="Delete item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors ml-1"
            title="Close viewer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Media Center Display */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center p-2 sm:p-6 overflow-hidden">
        {/* Left Arrow Navigation */}
        {currentIndex > 0 && (
          <button
            onClick={handlePrev}
            className="absolute left-4 z-20 p-3 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition-all hidden sm:flex items-center justify-center"
            title="Previous item"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Right Arrow Navigation */}
        {currentIndex < items.length - 1 && (
          <button
            onClick={handleNext}
            className="absolute right-4 z-20 p-3 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition-all hidden sm:flex items-center justify-center"
            title="Next item"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Current Image or Video element */}
        <div
          className="w-full h-full flex items-center justify-center transition-transform duration-150"
          style={{ transform: `scale(${scale})` }}
          onDoubleClick={handleDoubleTap}
        >
          {currentItem.type === 'video' ? (
            <video
              key={currentItem.id}
              src={currentItem.url}
              poster={currentItem.thumbnail_url}
              controls
              autoPlay
              playsInline
              className="max-w-full max-h-full rounded-lg shadow-2xl object-contain outline-none"
            />
          ) : (
            <img
              key={currentItem.id}
              src={currentItem.url || currentItem.thumbnail_url}
              alt={currentItem.name}
              referrerPolicy="no-referrer"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl pointer-events-auto"
            />
          )}
        </div>
      </div>

      {/* Slide-out / Bottom Metadata Info Panel */}
      {showInfo && (
        <div className="absolute bottom-4 right-4 z-30 w-80 rounded-2xl bg-black/80 backdrop-blur-2xl border border-white/10 p-4 text-xs space-y-2.5 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="font-semibold text-white truncate max-w-[200px]">
              {currentItem.name}
            </span>
            <button
              onClick={() => setShowInfo(false)}
              className="text-white/60 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-white/70">
            <div>
              <span className="text-white/40 block">Type</span>
              <span className="capitalize">{currentItem.type}</span>
            </div>
            <div>
              <span className="text-white/40 block">Size</span>
              <span>
                {currentItem.size ? `${(currentItem.size / (1024 * 1024)).toFixed(2)} MB` : '—'}
              </span>
            </div>
            {currentItem.width && currentItem.height && (
              <div>
                <span className="text-white/40 block">Dimensions</span>
                <span>
                  {currentItem.width} × {currentItem.height}
                </span>
              </div>
            )}
            {currentItem.duration && (
              <div>
                <span className="text-white/40 block">Duration</span>
                <span>{Math.round(currentItem.duration)} seconds</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  AlertTriangle,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Film,
  Image as ImageIcon,
} from 'lucide-react';
import { Folder, UploadProgressItem } from '../types/gallery';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  folders: Folder[];
  activeFolderId: string | null;
  onUpload: (files: File[], folderId: string) => Promise<void>;
  uploadQueue: UploadProgressItem[];
  isUploading: boolean;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  folders,
  activeFolderId,
  onUpload,
  uploadQueue,
  isUploading,
}) => {
  const [selectedFolderId, setSelectedFolderId] = useState<string>(
    activeFolderId || (folders[0]?.id ?? '')
  );
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [videoWarnings, setVideoWarnings] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync destination folder when modal opens or active folder changes
  useEffect(() => {
    if (isOpen) {
      if (activeFolderId) {
        setSelectedFolderId(activeFolderId);
      } else if (!selectedFolderId || !folders.some((f) => f.id === selectedFolderId)) {
        if (folders.length > 0) {
          setSelectedFolderId(folders[0].id);
        }
      }
    }
  }, [isOpen, activeFolderId, folders, selectedFolderId]);

  // Auto-close modal after successful upload completion
  useEffect(() => {
    if (uploadQueue.length > 0 && !isUploading) {
      const allDone = uploadQueue.every((q) => q.status === 'completed');
      if (allDone) {
        const timer = setTimeout(() => {
          onClose();
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [uploadQueue, isUploading, onClose]);

  if (!isOpen) return null;

  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const incoming = Array.from(files);

    // Identify videos > 50MB
    const largeVideos = incoming.filter(
      (f) => f.type.startsWith('video') && f.size > 50 * 1024 * 1024
    );

    setVideoWarnings(largeVideos);
    setStagedFiles((prev) => [...prev, ...incoming]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleStartUpload = async () => {
    const targetId = selectedFolderId || activeFolderId || folders[0]?.id;
    if (stagedFiles.length === 0 || !targetId) return;
    await onUpload(stagedFiles, targetId);
    setStagedFiles([]);
    setVideoWarnings([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#1C1C1E] border border-black/[0.08] dark:border-white/[0.12] p-6 shadow-2xl space-y-5 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-1 border-b border-black/[0.05] dark:border-white/[0.08]">
          <div>
            <h3 className="text-lg font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
              Upload Photos & Videos
            </h3>
            <p className="text-xs text-[#6E6E73] dark:text-[#86868B] mt-0.5">
              Client-side 2000px optimization & instant thumbnail generation
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-1.5 rounded-full text-[#6E6E73] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Album Selector */}
        <div>
          <label className="block text-xs font-medium text-[#6E6E73] dark:text-[#86868B] mb-1.5">
            Destination Album
          </label>
          {folders.length === 0 ? (
            <p className="text-xs text-[#FF3B30] dark:text-[#FF453A] p-2 bg-red-500/10 rounded-xl">
              No albums created yet. Please create an album before uploading.
            </p>
          ) : (
            <select
              value={selectedFolderId || folders[0]?.id || ''}
              onChange={(e) => setSelectedFolderId(e.target.value)}
              disabled={isUploading}
              className="w-full px-3 py-2 text-xs rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] text-[#1D1D1F] dark:text-[#F5F5F7] outline-none focus:ring-2 focus:ring-[#0071E3]"
            >
              {folders.map((f) => (
                <option key={f.id} value={f.id} className="dark:bg-[#1C1C1E]">
                  {f.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Drag and Drop Dropzone */}
        {!isUploading && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              handleFilesSelected(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              isDragOver
                ? 'border-[#0071E3] bg-[#0071E3]/5'
                : 'border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 bg-black/[0.02] dark:bg-white/[0.02]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => handleFilesSelected(e.target.files)}
            />
            <div className="w-10 h-10 rounded-full bg-[#0071E3]/10 text-[#0071E3] dark:text-[#2997FF] flex items-center justify-center mb-2">
              <Upload className="w-5 h-5 stroke-[2]" />
            </div>
            <p className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
              Choose files or drag and drop
            </p>
            <p className="text-[11px] text-[#6E6E73] dark:text-[#86868B] mt-1">
              Supports JPEG, PNG, WEBP, HEIC, MP4, MOV
            </p>
          </div>
        )}

        {/* Video 50MB Warning Banner */}
        {videoWarnings.length > 0 && !isUploading && (
          <div className="p-3 rounded-xl bg-[#FF9500]/10 border border-[#FF9500]/20 flex items-start gap-2.5 text-xs text-[#FF9500] dark:text-[#FF9F0A]">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold">
                Large Video Detected ({videoWarnings.length}{' '}
                {videoWarnings.length === 1 ? 'file' : 'files'} &gt; 50 MB)
              </p>
              <p className="text-[11px] opacity-90 leading-relaxed">
                Videos over 50 MB may take longer to stream. We recommend compressing with Handbrake
                or photos compressor for smoother playback.
              </p>
            </div>
          </div>
        )}

        {/* Active Upload Progress Queue with Circular Rings */}
        {uploadQueue.length > 0 && (
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-48">
            {uploadQueue.map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {item.type === 'video' ? (
                    <Film className="w-4 h-4 text-[#0071E3] shrink-0" />
                  ) : (
                    <ImageIcon className="w-4 h-4 text-[#0071E3] shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-[#1D1D1F] dark:text-[#F5F5F7] truncate">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-[#6E6E73] dark:text-[#86868B]">
                      {item.status === 'resizing' && 'Optimizing (2000px canvas)...'}
                      {item.status === 'uploading' && `Uploading (${item.progress}%)...`}
                      {item.status === 'completed' && 'Completed'}
                      {item.status === 'error' && (item.errorMessage || 'Failed')}
                    </p>
                  </div>
                </div>

                {/* Progress Ring */}
                <div className="w-7 h-7 relative flex items-center justify-center shrink-0 ml-2">
                  {item.status === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-[#34C759]" />
                  ) : item.status === 'error' ? (
                    <AlertCircle className="w-5 h-5 text-[#FF3B30]" />
                  ) : (
                    <svg className="w-6 h-6 transform -rotate-90">
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        fill="transparent"
                        className="text-black/10 dark:text-white/15"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        fill="transparent"
                        strokeDasharray={56.5}
                        strokeDashoffset={56.5 - (56.5 * item.progress) / 100}
                        className="text-[#0071E3] dark:text-[#2997FF] transition-all duration-300"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Staged file list preview */}
        {stagedFiles.length > 0 && !isUploading && (
          <div className="flex-1 overflow-y-auto max-h-36 space-y-1.5 pr-1">
            <div className="flex justify-between items-center text-xs text-[#6E6E73] dark:text-[#86868B]">
              <span>{stagedFiles.length} files selected</span>
              <button
                onClick={() => setStagedFiles([])}
                className="text-xs hover:text-[#FF3B30] transition-colors"
              >
                Clear all
              </button>
            </div>
            {stagedFiles.map((f, i) => (
              <div
                key={i}
                className="text-xs text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center justify-between p-1.5 rounded-lg bg-black/[0.02] dark:bg-white/[0.03]"
              >
                <span className="truncate max-w-[280px]">{f.name}</span>
                <span className="text-[10px] text-[#6E6E73] ml-2 shrink-0">
                  {(f.size / (1024 * 1024)).toFixed(1)} MB
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/[0.05] dark:border-white/[0.08]">
          <button
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] rounded-full hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={handleStartUpload}
            disabled={stagedFiles.length === 0 || isUploading}
            className="px-5 py-2 text-xs font-semibold text-white bg-[#0071E3] hover:bg-[#0071E3]/90 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Uploading...' : `Upload ${stagedFiles.length} Items`}
          </button>
        </div>
      </div>
    </div>
  );
};

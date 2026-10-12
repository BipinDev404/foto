/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Trash2, FolderInput, X, CheckSquare } from 'lucide-react';
import { Folder } from '../types/gallery';

interface BatchActionsBarProps {
  selectedCount: number;
  totalCount: number;
  folders: Folder[];
  currentFolderId: string | null;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onDeleteSelected: () => void;
  onMoveSelected: (targetFolderId: string) => void;
}

export const BatchActionsBar: React.FC<BatchActionsBarProps> = ({
  selectedCount,
  totalCount,
  folders,
  currentFolderId,
  onSelectAll,
  onClearSelection,
  onDeleteSelected,
  onMoveSelected,
}) => {
  const [isMoveOpen, setIsMoveOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  const otherFolders = folders.filter((f) => f.id !== currentFolderId);

  return (
    <>
      <div className="fixed bottom-6 inset-x-4 max-w-lg mx-auto z-40 rounded-full frosted-glass border border-black/[0.08] dark:border-white/[0.12] shadow-2xl px-4 py-2.5 flex items-center justify-between gap-3 animate-in slide-in-from-bottom-5 duration-200">
        <div className="flex items-center gap-2">
          <button
            onClick={onClearSelection}
            className="p-1.5 rounded-full text-[#6E6E73] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors"
            title="Deselect all"
          >
            <X className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
            {selectedCount} selected
          </span>
          {selectedCount < totalCount && (
            <button
              onClick={onSelectAll}
              className="text-[11px] text-[#0071E3] dark:text-[#2997FF] hover:underline ml-1"
            >
              Select all
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Move to another folder */}
          {otherFolders.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setIsMoveOpen((prev) => !prev)}
                disabled={selectedCount === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-black/[0.04] dark:bg-white/[0.06] text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] disabled:opacity-40 transition-colors"
              >
                <FolderInput className="w-3.5 h-3.5" />
                <span>Move</span>
              </button>

              {isMoveOpen && (
                <div className="absolute right-0 bottom-full mb-2 w-44 rounded-2xl bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.12] shadow-xl p-1.5 space-y-0.5 z-50">
                  <span className="text-[10px] uppercase font-semibold text-[#6E6E73] px-2 py-1 block">
                    Move to Album
                  </span>
                  {otherFolders.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => {
                        onMoveSelected(f.id);
                        setIsMoveOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] truncate"
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Delete Button */}
          <button
            onClick={() => setIsConfirmDeleteOpen(true)}
            disabled={selectedCount === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#FF3B30]/10 text-[#FF3B30] dark:text-[#FF453A] hover:bg-[#FF3B30]/20 disabled:opacity-40 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Confirmation Dialog for Batch Deletion */}
      {isConfirmDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/[0.08] dark:border-white/[0.12] p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
              Delete {selectedCount} {selectedCount === 1 ? 'item' : 'items'}?
            </h3>
            <p className="text-xs text-[#6E6E73] dark:text-[#86868B] leading-relaxed">
              These files will be permanently removed from your private gallery. This cannot be
              undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsConfirmDeleteOpen(false)}
                className="px-4 py-2 text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] rounded-full hover:bg-black/[0.05] dark:hover:bg-white/[0.08]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteSelected();
                  setIsConfirmDeleteOpen(false);
                }}
                className="px-4 py-2 text-xs font-medium text-white bg-[#FF3B30] hover:bg-[#FF3B30]/90 rounded-full"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

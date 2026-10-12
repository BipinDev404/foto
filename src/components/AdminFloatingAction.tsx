/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Upload, FolderPlus, CheckSquare, X } from 'lucide-react';

interface AdminFloatingActionProps {
  onOpenUpload: () => void;
  onOpenNewFolder: () => void;
  onToggleSelectMode: () => void;
  isSelectMode: boolean;
  hasActiveFolder: boolean;
}

export const AdminFloatingAction: React.FC<AdminFloatingActionProps> = ({
  onOpenUpload,
  onOpenNewFolder,
  onToggleSelectMode,
  isSelectMode,
  hasActiveFolder,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Expanded Sheet Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-xs z-30"
            onClick={() => setIsOpen(false)}
          />

          {/* Action Popover */}
          <div className="absolute bottom-16 right-0 z-40 w-56 rounded-2xl bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.12] shadow-2xl p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
            {hasActiveFolder && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenUpload();
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-[#0071E3]/10 dark:bg-[#2997FF]/15 flex items-center justify-center text-[#0071E3] dark:text-[#2997FF]">
                  <Upload className="w-4 h-4" />
                </div>
                <span>Upload Media</span>
              </button>
            )}

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenNewFolder();
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-black/[0.05] dark:bg-white/[0.08] flex items-center justify-center text-[#1D1D1F] dark:text-[#F5F5F7]">
                <FolderPlus className="w-4 h-4" />
              </div>
              <span>New Album</span>
            </button>

            {hasActiveFolder && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onToggleSelectMode();
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-black/[0.05] dark:bg-white/[0.08] flex items-center justify-center text-[#1D1D1F] dark:text-[#F5F5F7]">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <span>{isSelectMode ? 'Exit Select Mode' : 'Select Items'}</span>
              </button>
            )}
          </div>
        </>
      )}

      {/* Floating "+" Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Admin action menu"
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 relative z-40 cursor-pointer ${
          isOpen
            ? 'bg-[#1D1D1F] dark:bg-[#F5F5F7] text-white dark:text-[#1D1D1F] rotate-45'
            : 'bg-[#0071E3] hover:bg-[#0071E3]/90 text-white hover:scale-105 active:scale-95'
        }`}
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>
    </div>
  );
};

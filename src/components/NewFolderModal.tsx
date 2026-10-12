/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, FolderPlus } from 'lucide-react';

interface NewFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => Promise<any>;
}

export const NewFolderModal: React.FC<NewFolderModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [folderName, setFolderName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = folderName.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    await onCreate(trimmed);
    setIsSubmitting(false);
    setFolderName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#1C1C1E] border border-black/[0.08] dark:border-white/[0.12] p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center">
              <FolderPlus className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
              New Album
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#6E6E73] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#6E6E73] dark:text-[#86868B] mb-1">
              Album Title
            </label>
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="e.g. Summer in Tokyo"
              autoFocus
              className="w-full px-3.5 py-2.5 text-xs bg-black/[0.04] dark:bg-white/[0.06] rounded-xl border border-black/[0.08] dark:border-white/[0.12] text-[#1D1D1F] dark:text-[#F5F5F7] outline-none focus:ring-2 focus:ring-[#0071E3]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] rounded-full hover:bg-black/[0.05] dark:hover:bg-white/[0.08]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!folderName.trim() || isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#0071E3] hover:bg-[#0071E3]/90 rounded-full transition-colors disabled:opacity-40"
            >
              {isSubmitting ? 'Creating...' : 'Create Album'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

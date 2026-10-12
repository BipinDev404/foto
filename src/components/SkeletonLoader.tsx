/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export const FolderSkeletonGrid: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl overflow-hidden bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-sm animate-pulse"
        >
          <div className="aspect-[4/3] w-full bg-black/[0.06] dark:bg-white/[0.08]" />
          <div className="p-4 space-y-2">
            <div className="h-4 bg-black/[0.08] dark:bg-white/[0.1] rounded w-2/3" />
            <div className="h-3 bg-black/[0.04] dark:bg-white/[0.05] rounded w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const MediaSkeletonGrid: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="aspect-square rounded-xl bg-black/[0.06] dark:bg-white/[0.08] animate-pulse"
        />
      ))}
    </div>
  );
};

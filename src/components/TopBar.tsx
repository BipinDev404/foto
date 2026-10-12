/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ChevronLeft,
  Search,
  X,
  LogOut,
  Moon,
  Sun,
  ShieldCheck,
  Eye,
  Sliders,
} from 'lucide-react';
import { Folder, UserRole } from '../types/gallery';

interface TopBarProps {
  galleryName: string;
  currentFolder: Folder | null;
  onNavigateHome: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  role: UserRole;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onLogout: () => void;
  onOpenSetupWizard: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  galleryName,
  currentFolder,
  onNavigateHome,
  searchQuery,
  onSearchChange,
  role,
  isDarkMode,
  onToggleDarkMode,
  onLogout,
  onOpenSetupWizard,
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 w-full frosted-glass border-b border-black/[0.06] dark:border-white/[0.08] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Left: Brand title or Breadcrumb with Back button */}
        <div className="flex items-center gap-2 min-w-0">
          {currentFolder ? (
            <div className="flex items-center gap-1.5 min-w-0">
              <button
                onClick={onNavigateHome}
                className="flex items-center gap-1 text-sm font-medium text-[#0071E3] dark:text-[#2997FF] hover:opacity-80 transition-opacity p-1 -ml-1 rounded-lg shrink-0 cursor-pointer"
                title="Back to all folders"
              >
                <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">Home</span>
              </button>
              <span className="text-black/30 dark:text-white/30 text-xs shrink-0 select-none">/</span>
              <h1 className="text-sm sm:text-base font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] truncate max-w-[200px] sm:max-w-md">
                {currentFolder.name}
              </h1>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
                {galleryName}
              </span>
              {/* Role Indicator */}
              <div className="flex items-center gap-1 text-[11px] font-medium text-[#6E6E73] dark:text-[#86868B] px-2 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06]">
                {role === 'admin' ? (
                  <>
                    <ShieldCheck className="w-3 h-3 text-[#0071E3] dark:text-[#2997FF]" />
                    <span>Admin</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3 h-3 text-[#6E6E73] dark:text-[#86868B]" />
                    <span>Viewer</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Zone: Search, Dark Mode, Setup Wizard, Logout */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Search Trigger or Inline Input */}
          {isSearchOpen ? (
            <div className="relative flex items-center animate-in fade-in zoom-in-95 duration-150">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={currentFolder ? 'Filter media...' : 'Search folders...'}
                autoFocus
                className="w-36 sm:w-56 h-8 pl-8 pr-7 text-xs bg-black/[0.05] dark:bg-white/[0.08] text-[#1D1D1F] dark:text-[#F5F5F7] placeholder-[#6E6E73] rounded-full focus:outline-none focus:ring-1 focus:ring-[#0071E3]"
              />
              <Search className="w-3.5 h-3.5 text-[#6E6E73] absolute left-2.5 pointer-events-none" />
              <button
                onClick={() => {
                  setIsSearchOpen(false);
                  onSearchChange('');
                }}
                className="absolute right-2 text-[#6E6E73] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] p-0.5"
                title="Close search"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 rounded-full text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          {/* Setup / Settings shortcut */}
          <button
            onClick={onOpenSetupWizard}
            className="p-2 rounded-full text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors"
            title="Setup & Configuration Wizard"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Theme switcher */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-full text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Logout button */}
          <button
            onClick={onLogout}
            className="p-2 rounded-full text-[#6E6E73] dark:text-[#86868B] hover:text-[#FF3B30] dark:hover:text-[#FF453A] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

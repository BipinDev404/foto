/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { getInitialConfig, saveCustomConfig } from './config/galleryConfig';
import { GalleryConfig } from './types/gallery';
import { useAuth } from './hooks/useAuth';
import { useGallery } from './hooks/useGallery';
import { LoginScreen } from './components/LoginScreen';
import { TopBar } from './components/TopBar';
import { FolderGrid } from './components/FolderGrid';
import { MediaGrid } from './components/MediaGrid';
import { MediaViewer } from './components/MediaViewer';
import { AdminFloatingAction } from './components/AdminFloatingAction';
import { UploadModal } from './components/UploadModal';
import { NewFolderModal } from './components/NewFolderModal';
import { BatchActionsBar } from './components/BatchActionsBar';
import { SetupWizard } from './components/SetupWizard';
import { FolderSkeletonGrid, MediaSkeletonGrid } from './components/SkeletonLoader';
import { Sparkles, Sliders } from 'lucide-react';

export default function App() {
  const [config, setConfig] = useState<GalleryConfig>(() => getInitialConfig());

  // Dark mode (defaults to system preference)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Auth Hook
  const {
    role,
    isAdmin,
    isLoggedIn,
    isAuthDemo,
    isAuthenticating,
    errorMessage,
    lockoutRemaining,
    shakeTrigger,
    login,
    logout,
  } = useAuth(config);

  // Gallery Hook
  const {
    folders,
    allFolders,
    mediaItems,
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
  } = useGallery(config, isLoggedIn, isAuthDemo);

  // Modals and Selection state
  const [isSetupWizardOpen, setIsSetupWizardOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [viewerItemIndex, setViewerItemIndex] = useState<number | null>(null);

  // Multi-select state
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  const handleToggleSelectItem = (id: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedItemIds(mediaItems.map((m) => m.id));
  };

  const handleClearSelection = () => {
    setSelectedItemIds([]);
    setIsSelectMode(false);
  };

  const handleDeleteBatch = () => {
    deleteMediaItems(selectedItemIds);
    handleClearSelection();
  };

  const handleMoveBatch = (targetFolderId: string) => {
    moveMediaItems(selectedItemIds, targetFolderId);
    handleClearSelection();
  };

  const handleSaveConfig = (updated: Partial<GalleryConfig>) => {
    const saved = saveCustomConfig(updated);
    setConfig(saved);
  };

  // If user is not logged in, show the Apple-style Login Screen
  if (!isLoggedIn || !role) {
    return (
      <>
        <LoginScreen
          config={config}
          onLogin={login}
          isAuthenticating={isAuthenticating}
          errorMessage={errorMessage}
          lockoutRemaining={lockoutRemaining}
          shakeTrigger={shakeTrigger}
          onOpenSetupWizard={() => setIsSetupWizardOpen(true)}
        />
        <SetupWizard
          isOpen={isSetupWizardOpen}
          onClose={() => setIsSetupWizardOpen(false)}
          config={config}
          onSaveConfig={handleSaveConfig}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-black text-[#1D1D1F] dark:text-[#F5F5F7] transition-colors duration-200 flex flex-col">
      {/* Top Bar with Frosted Glass */}
      <TopBar
        galleryName={config.galleryName}
        currentFolder={currentFolder}
        onNavigateHome={() => {
          setSelectedFolderId(null);
          setIsSelectMode(false);
          setSelectedItemIds([]);
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        role={role}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
        onLogout={logout}
        onOpenSetupWizard={() => setIsSetupWizardOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Subtle Template Demo Notification banner when using default config */}
        {isDemoMode && !config.isCustomConfigured && (
          <div className="rounded-2xl bg-white/70 dark:bg-[#1C1C1E]/70 border border-black/[0.06] dark:border-white/[0.08] p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5 text-xs text-[#6E6E73] dark:text-[#86868B]">
              <Sparkles className="w-4 h-4 text-[#0071E3] shrink-0" />
              <span>
                <strong>Template Preview Mode:</strong> You are browsing with sample media. All features
                (uploading, reordering, deleting) are active! Connect your private Supabase project anytime.
              </span>
            </div>
            <button
              onClick={() => setIsSetupWizardOpen(true)}
              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#0071E3]/10 text-[#0071E3] dark:text-[#2997FF] hover:bg-[#0071E3]/20 transition-colors self-start sm:self-auto shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Setup Wizard</span>
            </button>
          </div>
        )}

        {/* View Mode: Home Folder Grid vs Album Media Grid */}
        {!selectedFolderId ? (
          isLoadingFolders ? (
            <FolderSkeletonGrid count={3} />
          ) : (
            <FolderGrid
              folders={folders}
              role={role}
              onSelectFolder={(id) => setSelectedFolderId(id)}
              onRenameFolder={renameFolder}
              onDeleteFolder={deleteFolder}
              onReorderFolders={reorderFolders}
              onCreateFolderClick={() => setIsNewFolderModalOpen(true)}
            />
          )
        ) : (
          <div className="space-y-4">
            {/* Folder Header Toolbar */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
                  {currentFolder?.name}
                </h2>
                <p className="text-xs text-[#6E6E73] dark:text-[#86868B] mt-0.5">
                  {mediaItems.length} {mediaItems.length === 1 ? 'item' : 'items'}
                </p>
              </div>

              {isAdmin && mediaItems.length > 0 && (
                <button
                  onClick={() => {
                    setIsSelectMode((prev) => !prev);
                    setSelectedItemIds([]);
                  }}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                    isSelectMode
                      ? 'bg-[#0071E3] text-white'
                      : 'bg-black/[0.04] dark:bg-white/[0.06] text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-black/[0.08]'
                  }`}
                >
                  {isSelectMode ? 'Done' : 'Select'}
                </button>
              )}
            </div>

            {/* Media Items Grid */}
            {isLoadingMedia ? (
              <MediaSkeletonGrid count={8} />
            ) : (
              <MediaGrid
                mediaItems={mediaItems}
                role={role}
                isSelectMode={isSelectMode}
                selectedItemIds={selectedItemIds}
                onToggleSelectItem={handleToggleSelectItem}
                onOpenViewer={(index) => setViewerItemIndex(index)}
                onReorderMedia={reorderMediaItems}
              />
            )}
          </div>
        )}
      </main>

      {/* Floating Action Button for Admin */}
      {isAdmin && (
        <AdminFloatingAction
          onOpenUpload={() => setIsUploadModalOpen(true)}
          onOpenNewFolder={() => setIsNewFolderModalOpen(true)}
          onToggleSelectMode={() => {
            setIsSelectMode((prev) => !prev);
            setSelectedItemIds([]);
          }}
          isSelectMode={isSelectMode}
          hasActiveFolder={selectedFolderId !== null}
        />
      )}

      {/* Batch Actions Floating Bar */}
      {isSelectMode && selectedItemIds.length > 0 && (
        <BatchActionsBar
          selectedCount={selectedItemIds.length}
          totalCount={mediaItems.length}
          folders={allFolders}
          currentFolderId={selectedFolderId}
          onSelectAll={handleSelectAll}
          onClearSelection={handleClearSelection}
          onDeleteSelected={handleDeleteBatch}
          onMoveSelected={handleMoveBatch}
        />
      )}

      {/* Full Screen Apple Media Viewer */}
      <MediaViewer
        items={mediaItems}
        initialIndex={viewerItemIndex ?? 0}
        isOpen={viewerItemIndex !== null}
        role={role}
        onClose={() => setViewerItemIndex(null)}
        onDeleteCurrentItem={(id) => {
          deleteMediaItems([id]);
        }}
        onSetAsFolderCover={(url) => {
          if (selectedFolderId) {
            setFolderCover(selectedFolderId, url);
          }
        }}
      />

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        folders={allFolders}
        activeFolderId={selectedFolderId}
        onUpload={async (files, targetId) => {
          await uploadFiles(files, targetId);
          setSelectedFolderId(targetId);
        }}
        uploadQueue={uploadQueue}
        isUploading={isUploading}
      />

      {/* New Folder Modal */}
      <NewFolderModal
        isOpen={isNewFolderModalOpen}
        onClose={() => setIsNewFolderModalOpen(false)}
        onCreate={async (name) => {
          const created = await createFolder(name);
          if (created) {
            setSelectedFolderId(created.id);
          }
        }}
      />

      {/* Setup Wizard */}
      <SetupWizard
        isOpen={isSetupWizardOpen}
        onClose={() => setIsSetupWizardOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
      />
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowRight, Lock, KeyRound, Sparkles } from 'lucide-react';
import { GalleryConfig } from '../types/gallery';

interface LoginScreenProps {
  config: GalleryConfig;
  onLogin: (password: string) => Promise<boolean>;
  isAuthenticating: boolean;
  errorMessage: string | null;
  lockoutRemaining: number;
  shakeTrigger: number;
  onOpenSetupWizard: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  config,
  onLogin,
  isAuthenticating,
  errorMessage,
  lockoutRemaining,
  shakeTrigger,
  onOpenSetupWizard,
}) => {
  const [password, setPassword] = useState('');
  const [showDemoHint, setShowDemoHint] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || isAuthenticating || lockoutRemaining > 0) return;
    const success = await onLogin(password);
    if (!success) {
      setPassword('');
    }
  };

  const isLockedOut = lockoutRemaining > 0;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-between px-6 py-10 bg-[#F5F5F7] dark:bg-black transition-colors duration-300">
      {/* Top subtle branding / space */}
      <div className="w-full flex justify-end max-w-md">
        <button
          onClick={() => setShowDemoHint((prev) => !prev)}
          className="text-xs text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
          title="Demo Passwords & Info"
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Passcode Info</span>
        </button>
      </div>

      {/* Main Centered Apple Login Block */}
      <div className="w-full max-w-sm flex flex-col items-center text-center my-auto">
        {/* Large Round Profile Photo (120px) */}
        <div className="relative mb-6 group">
          <div className="w-[120px] h-[120px] rounded-full overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.05)] border-2 border-white dark:border-[#2C2C2E] bg-white dark:bg-[#1C1C1E] transition-transform duration-300 group-hover:scale-[1.02]">
            <img
              src={config.profilePhotoUrl}
              alt={config.ownerName}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Resilient fallback to default SVG
                (e.target as HTMLImageElement).src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" fill="%23E5E5EA"/><circle cx="60" cy="48" r="22" fill="%238E8E93"/><path d="M24 106 C30 80 44 74 60 74 C76 74 90 80 96 106 Z" fill="%238E8E93"/></svg>`;
              }}
            />
          </div>
        </div>

        {/* Gallery Owner Name */}
        <h1 className="text-2xl font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] mb-1">
          {config.ownerName}
        </h1>
        <p className="text-sm font-normal text-[#6E6E73] dark:text-[#86868B] mb-8">
          {config.galleryName}
        </p>

        {/* Password Form with Apple Pill Style */}
        <form
          onSubmit={handleSubmit}
          className={`w-full max-w-[280px] relative transition-transform ${
            shakeTrigger > 0 ? 'animate-shake' : ''
          }`}
          key={shakeTrigger}
        >
          <div className="relative flex items-center">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLockedOut || isAuthenticating}
              placeholder={isLockedOut ? `Try again in ${lockoutRemaining}s` : 'Enter password'}
              autoFocus
              className="w-full h-11 pl-4 pr-12 text-sm bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-[#F5F5F7] placeholder-[#6E6E73]/60 dark:placeholder-[#86868B]/60 rounded-full border border-black/[0.08] dark:border-white/[0.12] shadow-[0_2px_12px_rgba(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-[#0071E3] dark:focus:ring-[#2997FF] focus:border-transparent transition-all disabled:opacity-50"
            />

            {/* Small round arrow button inside pill */}
            <button
              type="submit"
              disabled={!password || isAuthenticating || isLockedOut}
              aria-label="Unlock gallery"
              className="absolute right-1.5 w-8 h-8 rounded-full flex items-center justify-center bg-[#1D1D1F] dark:bg-[#F5F5F7] text-white dark:text-[#1D1D1F] hover:bg-black dark:hover:bg-white disabled:opacity-20 disabled:hover:bg-[#1D1D1F] dark:disabled:hover:bg-[#F5F5F7] transition-all cursor-pointer disabled:cursor-not-allowed active:scale-95 shadow-sm"
            >
              {isAuthenticating ? (
                <div className="w-3.5 h-3.5 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              )}
            </button>
          </div>

          {/* Error Message or Lockout Notice */}
          {errorMessage && (
            <p className="mt-3 text-xs text-[#FF3B30] dark:text-[#FF453A] font-medium tracking-tight">
              {errorMessage}
            </p>
          )}

          {isLockedOut && (
            <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-[#FF9500] dark:text-[#FF9F0A]">
              <Lock className="w-3.5 h-3.5" />
              <span>Lockout active ({lockoutRemaining}s remaining)</span>
            </div>
          )}
        </form>

        {/* Demo Passwords Popover */}
        {showDemoHint && (
          <div className="mt-6 p-4 rounded-2xl bg-white/90 dark:bg-[#1C1C1E]/90 border border-black/[0.06] dark:border-white/[0.08] shadow-lg max-w-[300px] text-left text-xs animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-1.5 font-medium text-[#1D1D1F] dark:text-[#F5F5F7] mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#0071E3]" />
              <span>Single-Field Passwords</span>
            </div>
            <p className="text-[#6E6E73] dark:text-[#86868B] mb-2 leading-relaxed">
              Use either password in the single field above:
            </p>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => setPassword(config.viewerPassword || 'viewer123')}
                className="w-full text-left p-2 rounded-lg bg-black/[0.03] dark:bg-white/[0.04] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition-colors"
              >
                <div className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                  Viewer Mode (Read-only)
                </div>
                <div className="text-[11px] text-[#6E6E73] dark:text-[#86868B] font-mono">
                  Password: {config.viewerPassword || 'viewer123'}
                </div>
              </button>
              <button
                type="button"
                onClick={() => setPassword(config.adminPassword || 'admin123')}
                className="w-full text-left p-2 rounded-lg bg-black/[0.03] dark:bg-white/[0.04] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition-colors"
              >
                <div className="font-semibold text-[#0071E3] dark:text-[#2997FF]">
                  Admin Mode (Full Control)
                </div>
                <div className="text-[11px] text-[#6E6E73] dark:text-[#86868B] font-mono">
                  Password: {config.adminPassword || 'admin123'}
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Link: "Make your own gallery" */}
      <div className="w-full max-w-sm text-center">
        <button
          onClick={onOpenSetupWizard}
          className="text-xs text-[#6E6E73] dark:text-[#86868B] hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors underline-offset-4 hover:underline cursor-pointer"
        >
          Make your own gallery
        </button>
      </div>
    </div>
  );
};

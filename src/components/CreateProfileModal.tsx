/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types/gallery';
import { createNewProfile, sanitizeHandle, getProfileByHandle } from '../lib/saasProfiles';
import { Sparkles, X, Check, Lock, Camera, ArrowRight, UserCheck } from 'lucide-react';

interface CreateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialHandle?: string;
  onProfileCreated: (newProfile: UserProfile) => void;
}

export const CreateProfileModal: React.FC<CreateProfileModalProps> = ({
  isOpen,
  onClose,
  initialHandle = '',
  onProfileCreated,
}) => {
  const [handle, setHandle] = useState(initialHandle);
  const [displayName, setDisplayName] = useState('');
  const [tagline, setTagline] = useState('Visual Storyteller & Photographer');
  const [passcode, setPasscode] = useState('passcode123');
  const [isTaken, setIsTaken] = useState(false);
  const [isCreated, setIsCreated] = useState(false);

  useEffect(() => {
    if (initialHandle) {
      setHandle(initialHandle);
      if (!displayName) {
        setDisplayName(
          initialHandle.charAt(0).toUpperCase() + initialHandle.slice(1)
        );
      }
    }
  }, [initialHandle]);

  if (!isOpen) return null;

  const cleanHandle = sanitizeHandle(handle);

  const handleHandleChange = (val: string) => {
    setHandle(val);
    const cleaned = sanitizeHandle(val);
    if (cleaned) {
      const existing = getProfileByHandle(cleaned);
      setIsTaken(Boolean(existing));
    } else {
      setIsTaken(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cleanHandle) return;

    if (isTaken) {
      // If taken, switch to existing profile!
      const existing = getProfileByHandle(cleanHandle);
      if (existing) {
        onProfileCreated(existing);
        onClose();
        return;
      }
    }

    const created = createNewProfile(
      cleanHandle,
      displayName || cleanHandle,
      tagline,
      passcode
    );

    setIsCreated(true);
    setTimeout(() => {
      setIsCreated(false);
      onProfileCreated(created);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-black/5 dark:border-white/10 flex items-center justify-between bg-gradient-to-r from-[#0071E3]/5 to-transparent">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-[#0071E3] text-white flex items-center justify-center font-bold">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1D1D1F] dark:text-white">
                Create Your Photography Portfolio
              </h2>
              <p className="text-xs text-[#6E6E73] dark:text-[#86868B]">
                Foto SaaS Multi-Tenant Platform
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[#6E6E73] dark:text-[#86868B]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          {/* Claim Handle Input */}
          <div>
            <label className="block font-semibold text-[#1D1D1F] dark:text-white mb-1">
              Choose Unique Handle / URL
            </label>
            <div className="flex items-center px-3 py-2.5 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 font-mono text-sm">
              <span className="text-[#0071E3] font-bold">foto.app/@</span>
              <input
                type="text"
                value={handle}
                onChange={(e) => handleHandleChange(e.target.value)}
                placeholder="bipinyadav"
                required
                className="bg-transparent border-none focus:outline-none focus:ring-0 text-[#1D1D1F] dark:text-white w-full ml-1 font-semibold"
              />
            </div>
            {cleanHandle && (
              <p className={`text-[11px] mt-1 font-medium ${isTaken ? 'text-amber-500' : 'text-emerald-500'}`}>
                {isTaken
                  ? `Handle @${cleanHandle} already exists. Submitting will open this existing profile.`
                  : `✓ Shareable URL will be foto.app/@${cleanHandle}`}
              </p>
            )}
          </div>

          {/* Full Name */}
          <div>
            <label className="block font-semibold text-[#1D1D1F] dark:text-white mb-1">
              Photographer or Studio Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Bipin Yadav Studio"
              required
              className="w-full px-3.5 py-2.5 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
            />
          </div>

          {/* Tagline */}
          <div>
            <label className="block font-semibold text-[#1D1D1F] dark:text-white mb-1">
              Tagline / Specialty
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="High Fashion, Portraits & Landscapes"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
            />
          </div>

          {/* Admin Passcode */}
          <div>
            <label className="block font-semibold text-[#1D1D1F] dark:text-white mb-1">
              Owner Management Passcode
            </label>
            <div className="relative">
              <input
                type="text"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                required
                className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071E3] font-mono text-xs"
              />
              <Lock className="w-4 h-4 text-[#6E6E73] absolute left-3 top-3" />
            </div>
            <p className="text-[11px] text-[#6E6E73] dark:text-[#86868B] mt-1">
              Use this passcode when logging in to manage albums and upload new photos.
            </p>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-full font-semibold text-xs text-[#6E6E73] hover:bg-black/5 dark:hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!cleanHandle}
              className={`px-6 py-2.5 rounded-full font-semibold text-xs text-white shadow-md transition-all flex items-center space-x-2 ${
                isCreated
                  ? 'bg-emerald-600'
                  : 'bg-[#0071E3] hover:bg-[#0077ED] disabled:opacity-50'
              }`}
            >
              {isCreated ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Portfolio Ready!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Launch Portfolio</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile } from '../types/gallery';
import { sanitizeHandle, saveProfile } from '../lib/saasProfiles';
import { X, Check, Camera, Sparkles, Lock, Link, User, Image } from 'lucide-react';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onProfileUpdated: (updated: UserProfile) => void;
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onProfileUpdated,
}) => {
  const [handle, setHandle] = useState(profile.handle);
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [tagline, setTagline] = useState(profile.tagline);
  const [bio, setBio] = useState(profile.bio || '');
  const [location, setLocation] = useState(profile.location || '');
  const [instagram, setInstagram] = useState(profile.instagram || '');
  const [website, setWebsite] = useState(profile.website || '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [coverUrl, setCoverUrl] = useState(profile.coverUrl || '');
  const [adminPassword, setAdminPassword] = useState(profile.adminPassword || 'passcode123');
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanHandle = sanitizeHandle(handle) || profile.handle;

    const updated: UserProfile = {
      ...profile,
      handle: cleanHandle,
      displayName: displayName.trim() || cleanHandle,
      tagline: tagline.trim(),
      bio: bio.trim(),
      location: location.trim(),
      instagram: instagram.trim().replace(/^@/, ''),
      website: website.trim(),
      avatarUrl: avatarUrl.trim() || profile.avatarUrl,
      coverUrl: coverUrl.trim() || profile.coverUrl,
      adminPassword: adminPassword.trim() || profile.adminPassword,
    };

    const saved = saveProfile(updated);
    onProfileUpdated(saved);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-[#0071E3]" />
            <h2 className="text-lg font-bold text-[#1D1D1F] dark:text-white">
              Edit Creator Profile Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[#6E6E73] dark:text-[#86868B]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs sm:text-sm">
          {/* Handle & Display Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#1D1D1F] dark:text-white mb-1">
                Custom Handle URL
              </label>
              <div className="flex items-center px-3 py-2 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/5 dark:border-white/10 font-mono text-xs">
                <span className="text-[#0071E3] font-semibold">foto.app/@</span>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  required
                  className="bg-transparent border-none focus:outline-none focus:ring-0 text-[#1D1D1F] dark:text-white w-full ml-1"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#1D1D1F] dark:text-white mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/5 dark:border-white/10 text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
              />
            </div>
          </div>

          {/* Tagline */}
          <div>
            <label className="block font-semibold text-[#1D1D1F] dark:text-white mb-1">
              Tagline / Title
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Visual Storyteller & High Fashion Photographer"
              className="w-full px-3 py-2 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/5 dark:border-white/10 text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block font-semibold text-[#1D1D1F] dark:text-white mb-1">
              Bio Description
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell clients and viewers about your vision, location, and specialties..."
              className="w-full px-3 py-2 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/5 dark:border-white/10 text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
            />
          </div>

          {/* Location & Social */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-[#1D1D1F] dark:text-white mb-1">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="NYC / Kathmandu"
                className="w-full px-3 py-2 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/5 dark:border-white/10 text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1D1D1F] dark:text-white mb-1">
                Instagram Username
              </label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="bipinyadav"
                className="w-full px-3 py-2 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/5 dark:border-white/10 text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1D1D1F] dark:text-white mb-1">
                Website
              </label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://foto-bipin.vercel.app"
                className="w-full px-3 py-2 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/5 dark:border-white/10 text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
              />
            </div>
          </div>

          {/* Avatar & Cover URLs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#1D1D1F] dark:text-white mb-1">
                Avatar Image URL
              </label>
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/5 dark:border-white/10 text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1D1D1F] dark:text-white mb-1">
                Header Cover Image URL
              </label>
              <input
                type="text"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/5 dark:border-white/10 text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
              />
            </div>
          </div>

          {/* Admin Passcode */}
          <div>
            <label className="block font-semibold text-[#1D1D1F] dark:text-white mb-1">
              Admin Owner Passcode
            </label>
            <div className="relative">
              <input
                type="text"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/5 dark:border-white/10 text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071E3] font-mono"
              />
              <Lock className="w-4 h-4 text-[#6E6E73] absolute left-3 top-2.5" />
            </div>
            <p className="text-[11px] text-[#6E6E73] dark:text-[#86868B] mt-1">
              Passcode required to upload, edit, or delete photos in this profile.
            </p>
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full font-semibold text-xs text-[#6E6E73] hover:bg-black/5 dark:hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-6 py-2 rounded-full font-semibold text-xs text-white shadow-md transition-all flex items-center space-x-1.5 ${
                isSaved ? 'bg-emerald-600' : 'bg-[#0071E3] hover:bg-[#0077ED]'
              }`}
            >
              {isSaved ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              <span>{isSaved ? 'Saved!' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

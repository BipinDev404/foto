/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types/gallery';
import { getShareableProfileUrl } from '../lib/saasRouting';
import {
  Share2,
  CheckCircle2,
  MapPin,
  Globe,
  Instagram,
  Twitter,
  LogIn,
  LogOut,
  Settings,
  Camera,
  Layers,
  Sparkles,
  Check,
  ArrowLeft,
  Lock,
} from 'lucide-react';

interface ProfileHeaderProps {
  profile: UserProfile;
  role: UserRole | null;
  isLoggedIn: boolean;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenProfileSettings: () => void;
  onGoToLanding: () => void;
  photosCount: number;
  albumsCount: number;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  role,
  isLoggedIn,
  onOpenLogin,
  onLogout,
  onOpenProfileSettings,
  onGoToLanding,
  photosCount,
  albumsCount,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyShareUrl = () => {
    const url = getShareableProfileUrl(profile.handle);
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const isAdmin = role === 'admin' && isLoggedIn;

  return (
    <div className="relative w-full bg-white dark:bg-zinc-950 border-b border-black/5 dark:border-white/10 transition-colors">
      {/* SaaS Global Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between text-xs text-[#6E6E73] dark:text-[#86868B] border-b border-black/[0.04] dark:border-white/[0.06]">
        <button
          onClick={onGoToLanding}
          className="inline-flex items-center space-x-1 hover:text-[#1D1D1F] dark:hover:text-white transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Foto SaaS Home</span>
        </button>

        <div className="flex items-center space-x-3">
          <span className="font-mono text-[#0071E3] dark:text-[#2997FF] bg-[#0071E3]/10 px-2 py-0.5 rounded-full font-semibold">
            foto.app/@{profile.handle}
          </span>
          {isLoggedIn ? (
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                Admin Mode Active
              </span>
              <button
                onClick={onLogout}
                className="hover:text-red-500 transition-colors flex items-center space-x-1 font-medium"
              >
                <LogOut className="w-3 h-3" />
                <span>Exit</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="hover:text-[#0071E3] transition-colors flex items-center space-x-1 font-medium"
            >
              <Lock className="w-3 h-3" />
              <span>Owner Passcode</span>
            </button>
          )}
        </div>
      </div>

      {/* Hero Cover Banner */}
      <div className="relative h-44 sm:h-60 w-full overflow-hidden bg-zinc-200 dark:bg-zinc-800">
        {profile.coverUrl ? (
          <img
            src={profile.coverUrl}
            alt={profile.displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background: `linear-gradient(135deg, ${profile.accentColor || '#0071E3'}, #1D1D1F)`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      {/* Profile Info Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 gap-4">
          {/* Avatar & Main Titles */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end space-y-3 sm:space-y-0 sm:space-x-5 text-center sm:text-left">
            <div className="relative group">
              <img
                src={profile.avatarUrl}
                alt={profile.displayName}
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-white dark:border-zinc-950 object-cover shadow-xl bg-white"
              />
              {profile.isVerified && (
                <span className="absolute bottom-2 right-2 p-1.5 rounded-full bg-[#0071E3] text-white shadow-md" title="Verified Creator">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-white">
                  {profile.displayName}
                </h1>
                <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-[#6E6E73] dark:text-[#86868B]">
                  @{profile.handle}
                </span>
              </div>

              <p className="text-sm font-semibold text-[#0071E3] dark:text-[#2997FF]">
                {profile.tagline}
              </p>

              {profile.bio && (
                <p className="text-xs sm:text-sm text-[#6E6E73] dark:text-[#86868B] max-w-xl line-clamp-2">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-center sm:justify-end space-x-2 pt-2 sm:pt-0">
            <button
              onClick={handleCopyShareUrl}
              className={`px-4 py-2 rounded-full text-xs font-semibold shadow-sm transition-all flex items-center space-x-1.5 ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#0071E3] hover:bg-[#0077ED] text-white'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Link Copied!' : 'Share Portfolio'}</span>
            </button>

            {isAdmin && (
              <button
                onClick={onOpenProfileSettings}
                className="px-3.5 py-2 rounded-full text-xs font-semibold bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] text-[#1D1D1F] dark:text-white transition-colors flex items-center space-x-1.5"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats & Metadata Strip */}
        <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/5 flex flex-wrap items-center justify-between text-xs text-[#6E6E73] dark:text-[#86868B] gap-4">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-1.5 font-medium">
              <Layers className="w-4 h-4 text-[#0071E3]" />
              <span className="font-bold text-[#1D1D1F] dark:text-white">{albumsCount}</span>
              <span>Albums</span>
            </div>
            <div className="flex items-center space-x-1.5 font-medium">
              <Camera className="w-4 h-4 text-[#AF52DE]" />
              <span className="font-bold text-[#1D1D1F] dark:text-white">{photosCount}</span>
              <span>Photos</span>
            </div>
            {profile.location && (
              <div className="hidden sm:flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{profile.location}</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#0071E3] transition-colors flex items-center space-x-1"
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Website</span>
              </a>
            )}
            {profile.instagram && (
              <a
                href={`https://instagram.com/${profile.instagram}`}
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#FF2D55] transition-colors flex items-center space-x-1"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">@{profile.instagram}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

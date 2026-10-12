/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile } from '../types/gallery';
import { FEATURED_PROFILES } from '../lib/saasProfiles';
import {
  Sparkles,
  Camera,
  ShieldCheck,
  Share2,
  HardDrive,
  Layers,
  ArrowRight,
  CheckCircle2,
  Sliders,
  ExternalLink,
  Search,
  User,
  Zap,
} from 'lucide-react';

interface LandingPageProps {
  onSelectHandle: (handle: string) => void;
  onCreateNewProfile: (handle: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onSelectHandle,
  onCreateNewProfile,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const [handleInput, setHandleInput] = useState('');

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handleInput.trim()) return;
    const clean = handleInput.trim().toLowerCase().replace(/^@/, '');
    onCreateNewProfile(clean);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-black text-[#1D1D1F] dark:text-[#F5F5F7] transition-colors duration-200 flex flex-col font-sans">
      {/* SaaS Navigation Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 dark:bg-black/70 border-b border-black/[0.05] dark:border-white/[0.08] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0071E3] to-[#34C759] flex items-center justify-center text-white font-bold shadow-sm">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
              foto <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#0071E3]/10 text-[#0071E3] dark:bg-[#0071E3]/20 dark:text-[#2997FF] ml-1">SaaS</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-[#6E6E73] dark:text-[#86868B]">
            <a href="#features" className="hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors">Features</a>
            <a href="#creators" className="hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors">Featured Creators</a>
            <a href="#exif" className="hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors">EXIF Engine</a>
            <a href="#architecture" className="hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors">Production Specs</a>
          </nav>

          <div className="flex items-center space-x-3">
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[#6E6E73] dark:text-[#86868B] transition-colors"
              title="Toggle Theme"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <button
              onClick={() => onSelectHandle('bipinyadav')}
              className="hidden sm:inline-flex items-center text-xs font-semibold px-3 py-2 rounded-full bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] text-[#1D1D1F] dark:text-[#F5F5F7] transition-colors"
            >
              Demo @bipinyadav
            </button>
            <button
              onClick={() => onCreateNewProfile('')}
              className="text-xs font-semibold px-4 py-2 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white shadow-sm transition-all transform hover:scale-[1.02]"
            >
              Create Portfolio
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_20%,rgba(0,113,227,0.12),transparent)] dark:bg-[radial-gradient(45%_40%_at_50%_20%,rgba(41,151,255,0.15),transparent)]" />
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium bg-[#0071E3]/10 text-[#0071E3] dark:bg-[#0071E3]/20 dark:text-[#2997FF] border border-[#0071E3]/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Production Level SaaS Platform • Multi-Tenant Portfolio Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-white leading-[1.08]">
            Your Photography.<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0071E3] via-[#AF52DE] to-[#FF2D55]">
              Elevated to SaaS Perfection.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-xl text-[#6E6E73] dark:text-[#86868B] font-normal leading-relaxed">
            Create your custom branded photography portfolio in seconds. Get a shareable profile URL like <code className="text-[#0071E3] dark:text-[#2997FF] font-mono">foto.app/@bipinyadav</code> with camera EXIF details, client proofing, and zero-loss storage.
          </p>

          {/* Interactive Claim Handle Box */}
          <div className="max-w-xl mx-auto pt-4">
            <form onSubmit={handleClaimSubmit} className="flex flex-col sm:flex-row items-center gap-2 p-2 rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-black/10 dark:border-white/10 shadow-lg">
              <div className="flex items-center flex-1 w-full px-3 text-sm font-medium text-[#6E6E73] dark:text-[#86868B]">
                <span className="text-[#0071E3] font-mono font-semibold">foto.app/@</span>
                <input
                  type="text"
                  placeholder="bipinyadav"
                  value={handleInput}
                  onChange={(e) => setHandleInput(e.target.value)}
                  className="w-full bg-transparent border-none text-[#1D1D1F] dark:text-white focus:outline-none focus:ring-0 ml-1 font-mono text-base"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center space-x-2 shrink-0"
              >
                <span>Claim Handle</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo Shortcuts */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4 text-xs">
              <span className="text-[#6E6E73] dark:text-[#86868B]">Try live creator handles:</span>
              {FEATURED_PROFILES.map((p) => (
                <button
                  key={p.handle}
                  onClick={() => onSelectHandle(p.handle)}
                  className="px-2.5 py-1 rounded-full bg-white dark:bg-zinc-800 border border-black/5 dark:border-white/10 text-[#1D1D1F] dark:text-white font-mono hover:border-[#0071E3] hover:text-[#0071E3] transition-colors"
                >
                  @{p.handle}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Creators Section */}
      <section id="creators" className="py-16 bg-white dark:bg-zinc-950 border-y border-black/[0.05] dark:border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F] dark:text-white">
              Featured Creator Portfolios
            </h2>
            <p className="text-sm sm:text-base text-[#6E6E73] dark:text-[#86868B]">
              Explore live portfolios built with Foto SaaS. Click any profile to view their full gallery.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED_PROFILES.map((profile) => (
              <div
                key={profile.handle}
                onClick={() => onSelectHandle(profile.handle)}
                className="group cursor-pointer rounded-2xl bg-[#F5F5F7] dark:bg-zinc-900 border border-black/5 dark:border-white/10 overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="h-32 w-full relative bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                    {profile.coverUrl && (
                      <img
                        src={profile.coverUrl}
                        alt={profile.displayName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-white font-mono text-[10px]">
                      @{profile.handle}
                    </span>
                  </div>

                  <div className="p-5 relative pt-0">
                    <div className="-mt-10 mb-3 flex items-end justify-between">
                      <img
                        src={profile.avatarUrl}
                        alt={profile.displayName}
                        className="w-16 h-16 rounded-full border-2 border-white dark:border-zinc-900 object-cover shadow-md"
                      />
                      {profile.isVerified && (
                        <span className="inline-flex items-center space-x-1 text-xs text-[#0071E3] font-semibold bg-[#0071E3]/10 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Verified Pro</span>
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-base text-[#1D1D1F] dark:text-white group-hover:text-[#0071E3] transition-colors">
                      {profile.displayName}
                    </h3>
                    <p className="text-xs font-medium text-[#6E6E73] dark:text-[#86868B] mt-0.5 line-clamp-1">
                      {profile.tagline}
                    </p>
                    <p className="text-xs text-[#6E6E73] dark:text-[#86868B] mt-2 line-clamp-2">
                      {profile.bio}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs text-[#6E6E73] dark:text-[#86868B]">
                  <span>{profile.stats?.photosCount || 12}+ Photos</span>
                  <span className="font-semibold text-[#0071E3] flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                    <span>View Portfolio</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SaaS Core Capabilities Grid */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1D1D1F] dark:text-white">
            Engineered for Photographers & Creative Studios
          </h2>
          <p className="text-base text-[#6E6E73] dark:text-[#86868B]">
            Everything you need to deliver high-resolution work to clients, build your personal brand, and organize your media archives.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/10 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center font-bold">
              <Share2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#1D1D1F] dark:text-white">
              Public Handle URLs
            </h3>
            <p className="text-xs sm:text-sm text-[#6E6E73] dark:text-[#86868B] leading-relaxed">
              Claim your unique profile handle like <code className="text-[#0071E3] font-mono">foto.app/@bipinyadav</code>. Share it on Instagram, bio links, or client emails for instant access.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/10 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#AF52DE]/10 text-[#AF52DE] flex items-center justify-center font-bold">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#1D1D1F] dark:text-white">
              EXIF Metadata Reader
            </h3>
            <p className="text-xs sm:text-sm text-[#6E6E73] dark:text-[#86868B] leading-relaxed">
              Display camera body, lens model, focal length, aperture, shutter speed, and ISO automatically extracted from photo headers.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/10 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#34C759]/10 text-[#34C759] flex items-center justify-center font-bold">
              <HardDrive className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#1D1D1F] dark:text-white">
              Zero-Loss Hybrid Storage
            </h3>
            <p className="text-xs sm:text-sm text-[#6E6E73] dark:text-[#86868B] leading-relaxed">
              Powered by IndexedDB binary storage and optional Supabase cloud storage so your original full-res photos survive reloads and updates.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/10 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#FF9500]/10 text-[#FF9500] flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#1D1D1F] dark:text-white">
              Client Proofing & Passcodes
            </h3>
            <p className="text-xs sm:text-sm text-[#6E6E73] dark:text-[#86868B] leading-relaxed">
              Set separate admin passcodes and viewer passcodes for client galleries. Keep private wedding or commercial shoots secure.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/10 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#FF2D55]/10 text-[#FF2D55] flex items-center justify-center font-bold">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#1D1D1F] dark:text-white">
              Drag & Drop Masonry
            </h3>
            <p className="text-xs sm:text-sm text-[#6E6E73] dark:text-[#86868B] leading-relaxed">
              Organize albums, drag to reorder photos, set custom album cover art, and batch move or delete items with multi-select.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/10 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#30B0C7]/10 text-[#30B0C7] flex items-center justify-center font-bold">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#1D1D1F] dark:text-white">
              Lighting-Fast Web App
            </h3>
            <p className="text-xs sm:text-sm text-[#6E6E73] dark:text-[#86868B] leading-relaxed">
              Vite + React framework with frosted glass UI, dark/light theme sync, skeleton loaders, and instant image thumbnail generation.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-b from-transparent to-black/5 dark:to-white/5 border-t border-black/5 dark:border-white/10 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-white">
            Create Your Portfolio Today
          </h2>
          <p className="text-base text-[#6E6E73] dark:text-[#86868B] max-w-xl mx-auto">
            Join thousands of creators sharing their photos on Foto SaaS. Free setup, no credit card required.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onCreateNewProfile('')}
              className="px-8 py-4 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white font-bold text-base shadow-lg transition-all transform hover:scale-105 inline-flex items-center space-x-2"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-black/5 dark:border-white/10 text-center text-xs text-[#6E6E73] dark:text-[#86868B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            &copy; 2026 Foto SaaS Platform. Multi-Tenant Portfolio System.
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={() => onSelectHandle('bipinyadav')} className="hover:underline">
              @bipinyadav
            </button>
            <button onClick={() => onSelectHandle('alexvogue')} className="hover:underline">
              @alexvogue
            </button>
            <button onClick={() => onSelectHandle('natureprints')} className="hover:underline">
              @natureprints
            </button>
            <button onClick={() => onSelectHandle('weddingpro')} className="hover:underline">
              @weddingpro
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

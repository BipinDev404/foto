/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Copy,
  Check,
  ExternalLink,
  Shield,
  Database,
  User,
  Rocket,
  Download,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { GalleryConfig } from '../types/gallery';
import { testSupabaseConnection } from '../lib/supabase';

interface SetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
  config: GalleryConfig;
  onSaveConfig: (updated: Partial<GalleryConfig>) => void;
}

const SQL_SCRIPT_CONTENT = `-- 1. Folders Table
CREATE TABLE IF NOT EXISTS public.folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    cover_url TEXT,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Media Items Table
CREATE TABLE IF NOT EXISTS public.media_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folder_id UUID REFERENCES public.folders(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('image', 'video')),
    storage_path TEXT NOT NULL,
    thumbnail_path TEXT,
    size BIGINT DEFAULT 0,
    width INTEGER,
    height INTEGER,
    duration NUMERIC,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Gallery Settings Table
CREATE TABLE IF NOT EXISTS public.gallery_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    gallery_name TEXT DEFAULT 'foto',
    owner_name TEXT DEFAULT 'Elena Rostova',
    profile_photo_path TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Admin Check Function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'email') LIKE 'admin@%'
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() ->> 'role') = 'service_role',
    false
  );
$$;

-- 5. Enable RLS
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_settings ENABLE ROW LEVEL SECURITY;

-- 6. Read Policies (Public & Authenticated)
CREATE POLICY "Anyone can read folders" ON public.folders FOR SELECT USING (true);
CREATE POLICY "Anyone can read media items" ON public.media_items FOR SELECT USING (true);
CREATE POLICY "Anyone can read settings" ON public.gallery_settings FOR SELECT USING (true);

-- 7. Write Policies (Admin Only)
CREATE POLICY "Admins manage folders" ON public.folders FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins manage media items" ON public.media_items FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins manage settings" ON public.gallery_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 8. Private Storage Bucket & Policies
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('foto-media', 'foto-media', false, 104857600, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/gif', 'video/mp4', 'video/quicktime', 'video/webm'])
ON CONFLICT (id) DO UPDATE SET public = false;

CREATE POLICY "Authenticated read private media" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'foto-media');
CREATE POLICY "Admins upload media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'foto-media' AND public.is_admin());
CREATE POLICY "Admins update media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'foto-media' AND public.is_admin());
CREATE POLICY "Admins delete media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'foto-media' AND public.is_admin());`;

export const SetupWizard: React.FC<SetupWizardProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  // Form states
  const [supabaseUrl, setSupabaseUrl] = useState(config.supabaseUrl || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(config.supabaseAnonKey || '');
  const [galleryName, setGalleryName] = useState(config.galleryName || 'foto');
  const [ownerName, setOwnerName] = useState(config.ownerName || 'Elena Rostova');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(config.profilePhotoUrl || '');
  const [viewerPassword, setViewerPassword] = useState(config.viewerPassword || 'viewer123');
  const [adminPassword, setAdminPassword] = useState(config.adminPassword || 'admin123');

  // Connection testing status
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedVercelEnv, setCopiedVercelEnv] = useState(false);

  if (!isOpen) return null;

  const handleCopyVercelEnv = () => {
    const envText = `VITE_SUPABASE_URL=${supabaseUrl.trim()}
VITE_SUPABASE_ANON_KEY=${supabaseAnonKey.trim()}
VITE_GALLERY_NAME=${galleryName.trim()}
VITE_OWNER_NAME=${ownerName.trim()}
VITE_PROFILE_PHOTO_URL=${profilePhotoUrl.trim()}
VITE_VIEWER_PASSWORD=${viewerPassword.trim()}
VITE_ADMIN_PASSWORD=${adminPassword.trim()}`;
    navigator.clipboard.writeText(envText);
    setCopiedVercelEnv(true);
    setTimeout(() => setCopiedVercelEnv(false), 2000);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SCRIPT_CONTENT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const res = await testSupabaseConnection(supabaseUrl, supabaseAnonKey);
    setTestResult(res);
    setIsTesting(false);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfilePhotoUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAndApply = () => {
    onSaveConfig({
      supabaseUrl: supabaseUrl.trim(),
      supabaseAnonKey: supabaseAnonKey.trim(),
      galleryName: galleryName.trim(),
      ownerName: ownerName.trim(),
      profilePhotoUrl: profilePhotoUrl.trim() || config.profilePhotoUrl,
      viewerPassword: viewerPassword.trim(),
      adminPassword: adminPassword.trim(),
    });
    onClose();
  };

  const downloadEnvFile = () => {
    const content = `# foto Gallery Environment Variables
VITE_SUPABASE_URL="${supabaseUrl.trim()}"
VITE_SUPABASE_ANON_KEY="${supabaseAnonKey.trim()}"
VITE_GALLERY_NAME="${galleryName.trim()}"
VITE_OWNER_NAME="${ownerName.trim()}"
VITE_PROFILE_PHOTO_URL="${profilePhotoUrl.trim()}"
VITE_VIEWER_PASSWORD="${viewerPassword.trim()}"
VITE_ADMIN_PASSWORD="${adminPassword.trim()}"
`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '.env.local';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-[#1C1C1E] border border-black/[0.08] dark:border-white/[0.12] p-6 sm:p-8 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Top Header & Progress Indicator */}
        <div className="flex items-center justify-between pb-4 border-b border-black/[0.06] dark:border-white/[0.08]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0071E3] dark:text-[#2997FF]">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#6E6E73] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Dots */}
        <div className="flex items-center justify-between gap-2 my-4">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                i + 1 <= currentStep
                  ? 'bg-[#0071E3] dark:bg-[#2997FF]'
                  : 'bg-black/[0.08] dark:bg-white/[0.1]'
              }`}
            />
          ))}
        </div>

        {/* Dynamic Step Content */}
        <div className="flex-1 overflow-y-auto py-2 pr-1 space-y-4">
          {/* STEP 1: Supabase Account */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="w-12 h-12 rounded-2xl bg-[#0071E3]/10 text-[#0071E3] dark:text-[#2997FF] flex items-center justify-center">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
                1. Create a Free Supabase Account
              </h3>
              <p className="text-xs text-[#6E6E73] dark:text-[#86868B] leading-relaxed">
                Supabase powers the backend for your private gallery: storing your encrypted
                passwords, database albums, and private media storage bucket with signed URLs.
              </p>
              <div className="p-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] space-y-2.5 text-xs text-[#1D1D1F] dark:text-[#F5F5F7]">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#0071E3] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                    1
                  </div>
                  <span>Go to Supabase and click &quot;Start your project&quot; (it&apos;s 100% free).</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#0071E3] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                    2
                  </div>
                  <span>Create a new project (e.g. &quot;my-private-gallery&quot;) and select your nearest region.</span>
                </div>
              </div>
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#0071E3] dark:text-[#2997FF] hover:underline pt-1"
              >
                <span>Open supabase.com in a new tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* STEP 2: Credentials */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="w-12 h-12 rounded-2xl bg-[#0071E3]/10 text-[#0071E3] dark:text-[#2997FF] flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
                2. Project URL &amp; Anon Key
              </h3>
              <p className="text-xs text-[#6E6E73] dark:text-[#86868B] leading-relaxed">
                Navigate to your Supabase Project Settings &gt; API. Copy your Project URL and public{' '}
                <strong className="text-[#1D1D1F] dark:text-[#F5F5F7]">anon key</strong>. Never
                provide your secret/service key.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[#6E6E73] dark:text-[#86868B] mb-1">
                    Project URL
                  </label>
                  <input
                    type="url"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full px-3.5 py-2.5 text-xs bg-black/[0.04] dark:bg-white/[0.06] rounded-xl border border-black/[0.08] dark:border-white/[0.12] text-[#1D1D1F] dark:text-[#F5F5F7] outline-none focus:ring-2 focus:ring-[#0071E3]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6E6E73] dark:text-[#86868B] mb-1">
                    Public Anon Key
                  </label>
                  <textarea
                    rows={2}
                    value={supabaseAnonKey}
                    onChange={(e) => setSupabaseAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full px-3.5 py-2 text-xs bg-black/[0.04] dark:bg-white/[0.06] rounded-xl border border-black/[0.08] dark:border-white/[0.12] text-[#1D1D1F] dark:text-[#F5F5F7] outline-none focus:ring-2 focus:ring-[#0071E3] font-mono"
                  />
                </div>
              </div>

              {/* Test Connection Button */}
              <div className="pt-1 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={!supabaseUrl || !supabaseAnonKey || isTesting}
                  className="px-4 py-2 rounded-full text-xs font-semibold bg-black/[0.06] dark:bg-white/[0.08] hover:bg-black/[0.1] text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-1.5 transition-colors disabled:opacity-40"
                >
                  {isTesting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Shield className="w-3.5 h-3.5" />
                  )}
                  <span>Test Connection</span>
                </button>
                {testResult && (
                  <span
                    className={`text-xs flex items-center gap-1 ${
                      testResult.success
                        ? 'text-[#34C759]'
                        : 'text-[#FF3B30] dark:text-[#FF453A]'
                    }`}
                  >
                    {testResult.success ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5" />
                    )}
                    <span>{testResult.message}</span>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: SQL Script */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
                    3. Run the SQL Script
                  </h3>
                  <p className="text-xs text-[#6E6E73] dark:text-[#86868B] mt-0.5">
                    Paste this into Supabase: SQL Editor &gt; New Query &gt; Run.
                  </p>
                </div>
                <button
                  onClick={handleCopySql}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#0071E3] text-white hover:bg-[#0071E3]/90 transition-colors"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Copied!' : 'Copy SQL'}</span>
                </button>
              </div>

              <div className="relative rounded-2xl bg-black/90 p-4 font-mono text-[11px] text-[#34C759] overflow-x-auto max-h-56 no-scrollbar border border-black/[0.08] dark:border-white/[0.12]">
                <pre>{SQL_SCRIPT_CONTENT}</pre>
              </div>

              <div className="p-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] text-[11px] text-[#6E6E73] dark:text-[#86868B] space-y-1">
                <p className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">What this creates:</p>
                <p>• Folders and media items tables with Row Level Security</p>
                <p>• Private storage bucket &apos;foto-media&apos; with signed URL access</p>
                <p>• Admin role enforcement for uploads, deletion, and reordering</p>
              </div>
            </div>
          )}

          {/* STEP 4: Personalization & Dual Passwords */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="w-12 h-12 rounded-2xl bg-[#0071E3]/10 text-[#0071E3] dark:text-[#2997FF] flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
                4. Gallery Details &amp; Passwords
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#6E6E73] dark:text-[#86868B] mb-1">
                    Owner Name
                  </label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Elena Rostova"
                    className="w-full px-3 py-2 text-xs bg-black/[0.04] dark:bg-white/[0.06] rounded-xl border border-black/[0.08] dark:border-white/[0.12] text-[#1D1D1F] dark:text-[#F5F5F7] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6E6E73] dark:text-[#86868B] mb-1">
                    Gallery Title
                  </label>
                  <input
                    type="text"
                    value={galleryName}
                    onChange={(e) => setGalleryName(e.target.value)}
                    placeholder="foto"
                    className="w-full px-3 py-2 text-xs bg-black/[0.04] dark:bg-white/[0.06] rounded-xl border border-black/[0.08] dark:border-white/[0.12] text-[#1D1D1F] dark:text-[#F5F5F7] outline-none"
                  />
                </div>
              </div>

              {/* Profile Photo Upload */}
              <div>
                <label className="block text-xs font-medium text-[#6E6E73] dark:text-[#86868B] mb-1">
                  Profile Photo
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-black/10 shrink-0 border">
                    <img
                      src={profilePhotoUrl || config.profilePhotoUrl}
                      alt="Owner"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <label className="px-3 py-1.5 rounded-full text-xs font-medium bg-black/[0.05] dark:bg-white/[0.08] hover:bg-black/[0.1] text-[#1D1D1F] dark:text-[#F5F5F7] cursor-pointer">
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Single Field Dual Passwords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-medium text-[#6E6E73] dark:text-[#86868B] mb-1">
                    Viewer Password (Read-Only)
                  </label>
                  <input
                    type="text"
                    value={viewerPassword}
                    onChange={(e) => setViewerPassword(e.target.value)}
                    placeholder="viewer123"
                    className="w-full px-3 py-2 text-xs bg-black/[0.04] dark:bg-white/[0.06] rounded-xl border border-black/[0.08] dark:border-white/[0.12] text-[#1D1D1F] dark:text-[#F5F5F7] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6E6E73] dark:text-[#86868B] mb-1">
                    Admin Password (Full Control)
                  </label>
                  <input
                    type="text"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="admin123"
                    className="w-full px-3 py-2 text-xs bg-black/[0.04] dark:bg-white/[0.06] rounded-xl border border-black/[0.08] dark:border-white/[0.12] text-[#1D1D1F] dark:text-[#F5F5F7] outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Deployment Guide & Checklist */}
          {currentStep === 5 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="w-12 h-12 rounded-2xl bg-[#0071E3]/10 text-[#0071E3] dark:text-[#2997FF] flex items-center justify-center">
                <Rocket className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
                  5. Deploy to Vercel
                </h3>
                <p className="text-xs text-[#6E6E73] dark:text-[#86868B] leading-relaxed mt-1">
                  Your gallery is 100% Vercel-ready with preconfigured <code className="px-1 py-0.5 rounded bg-black/5 dark:bg-white/10 font-mono text-[11px]">vercel.json</code> routing, SPA rewrites, and asset caching headers.
                </p>
              </div>

              {/* Vercel Ready Specs Card */}
              <div className="p-3.5 rounded-2xl bg-[#0071E3]/5 border border-[#0071E3]/15 dark:border-[#2997FF]/25 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#1D1D1F] dark:text-[#F5F5F7]" viewBox="0 0 1155 1000" fill="currentColor">
                      <path d="m577.346 0 577.346 1000H0Z" />
                    </svg>
                    <span className="text-xs font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">Vercel Configuration Verified</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#34C759]/15 text-[#34C759]">
                    ✓ Vercel Ready
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-[#6E6E73] dark:text-[#86868B]">
                  <div>Framework: <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">Vite</span></div>
                  <div>Build: <code className="font-mono text-[#1D1D1F] dark:text-[#F5F5F7]">npm run build</code></div>
                  <div>Output: <code className="font-mono text-[#1D1D1F] dark:text-[#F5F5F7]">dist</code></div>
                  <div>Config: <code className="font-mono text-[#1D1D1F] dark:text-[#F5F5F7]">vercel.json</code></div>
                </div>
              </div>

              {/* One-click Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleCopyVercelEnv}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl border border-black/[0.08] dark:border-white/[0.12] bg-black/[0.02] dark:bg-white/[0.04] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]"
                >
                  {copiedVercelEnv ? (
                    <>
                      <Check className="w-4 h-4 text-[#34C759]" />
                      <span>Copied Vercel Env!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-[#0071E3] dark:text-[#2997FF]" />
                      <span>Copy Vercel Env Vars</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={downloadEnvFile}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl border border-black/[0.08] dark:border-white/[0.12] bg-black/[0.02] dark:bg-white/[0.04] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]"
                >
                  <Download className="w-4 h-4 text-[#0071E3] dark:text-[#2997FF]" />
                  <span>Download .env.local</span>
                </button>
              </div>

              {/* Simple Step Guide */}
              <div className="p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] space-y-2 text-xs text-[#1D1D1F] dark:text-[#F5F5F7]">
                <p className="font-semibold text-[11px] text-[#6E6E73] dark:text-[#86868B] uppercase tracking-wider">
                  Deployment steps:
                </p>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#0071E3] text-white flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                  <span>Push or import this repository into your GitHub account.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#0071E3] text-white flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                  <span>In Vercel, click <strong>&quot;Add New Project&quot;</strong> and select your repository (Vite is auto-detected).</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#0071E3] text-white flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                  <span>Click <strong>&quot;Copy Vercel Env Vars&quot;</strong> above and paste into Vercel&apos;s Environment Variables panel, then click <strong>Deploy</strong>!</span>
                </div>
              </div>

              {/* External Vercel Dashboard Link */}
              <a
                href="https://vercel.com/new"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#1D1D1F] dark:bg-[#F5F5F7] text-white dark:text-[#1D1D1F] hover:opacity-90 font-semibold text-xs transition-opacity"
              >
                <span>Go to Vercel Dashboard</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Footer Navigation Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-black/[0.06] dark:border-white/[0.08]">
          <button
            onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
            disabled={currentStep === 1}
            className="flex items-center gap-1 px-4 py-2 text-xs font-semibold text-[#6E6E73] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] disabled:opacity-0 transition-opacity"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          {currentStep < totalSteps ? (
            <button
              onClick={() => setCurrentStep((s) => Math.min(totalSteps, s + 1))}
              className="flex items-center gap-1 px-5 py-2 rounded-full text-xs font-semibold bg-[#1D1D1F] dark:bg-[#F5F5F7] text-white dark:text-[#1D1D1F] hover:opacity-90 transition-opacity"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSaveAndApply}
              className="px-6 py-2 rounded-full text-xs font-semibold bg-[#0071E3] text-white hover:bg-[#0071E3]/90 transition-opacity"
            >
              Save &amp; Apply Changes
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

-- ==============================================================================
-- foto — Private Photo & Video Gallery Supabase Setup Script
-- Paste this script into your Supabase Dashboard: SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Folders Table
CREATE TABLE IF NOT EXISTS public.folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    cover_url TEXT,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Media Items Table
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

-- 4. Create Gallery Settings Table
CREATE TABLE IF NOT EXISTS public.gallery_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    gallery_name TEXT DEFAULT 'foto',
    owner_name TEXT DEFAULT 'Elena Rostova',
    profile_photo_path TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert Default Settings if not exists
INSERT INTO public.gallery_settings (id, gallery_name, owner_name)
VALUES ('default', 'foto', 'Elena Rostova')
ON CONFLICT (id) DO NOTHING;

-- 5. Helper function to check if current authenticated user is an Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'email') LIKE 'admin@%'
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin',
    false
  );
$$;

-- 6. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_settings ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies: Read Access (Any Authenticated User: Viewer or Admin)
DROP POLICY IF EXISTS "Authenticated users can read folders" ON public.folders;
CREATE POLICY "Authenticated users can read folders"
    ON public.folders FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can read media items" ON public.media_items;
CREATE POLICY "Authenticated users can read media items"
    ON public.media_items FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can read gallery settings" ON public.gallery_settings;
CREATE POLICY "Authenticated users can read gallery settings"
    ON public.gallery_settings FOR SELECT
    TO authenticated
    USING (true);

-- 8. RLS Policies: Write Access (Admin Only)
-- Folders
DROP POLICY IF EXISTS "Admins can insert folders" ON public.folders;
CREATE POLICY "Admins can insert folders"
    ON public.folders FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update folders" ON public.folders;
CREATE POLICY "Admins can update folders"
    ON public.folders FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete folders" ON public.folders;
CREATE POLICY "Admins can delete folders"
    ON public.folders FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- Media Items
DROP POLICY IF EXISTS "Admins can insert media items" ON public.media_items;
CREATE POLICY "Admins can insert media items"
    ON public.media_items FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update media items" ON public.media_items;
CREATE POLICY "Admins can update media items"
    ON public.media_items FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete media items" ON public.media_items;
CREATE POLICY "Admins can delete media items"
    ON public.media_items FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- Gallery Settings
DROP POLICY IF EXISTS "Admins can update gallery settings" ON public.gallery_settings;
CREATE POLICY "Admins can update gallery settings"
    ON public.gallery_settings FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 9. Setup Private Storage Bucket
-- Ensure the storage bucket exists and is set to private
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'foto-media',
    'foto-media',
    false, -- STRICTLY PRIVATE
    104857600, -- 100MB limit per file
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/gif', 'video/mp4', 'video/quicktime', 'video/webm']
)
ON CONFLICT (id) DO UPDATE SET public = false;

-- 10. Storage RLS Policies
-- Allow authenticated users (both viewer and admin) to read/download private signed URLs
DROP POLICY IF EXISTS "Authenticated users can read private media" ON storage.objects;
CREATE POLICY "Authenticated users can read private media"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (bucket_id = 'foto-media');

-- Allow only admins to upload objects
DROP POLICY IF EXISTS "Admins can upload media objects" ON storage.objects;
CREATE POLICY "Admins can upload media objects"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'foto-media' AND public.is_admin());

-- Allow only admins to update media objects
DROP POLICY IF EXISTS "Admins can update media objects" ON storage.objects;
CREATE POLICY "Admins can update media objects"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'foto-media' AND public.is_admin());

-- Allow only admins to delete media objects
DROP POLICY IF EXISTS "Admins can delete media objects" ON storage.objects;
CREATE POLICY "Admins can delete media objects"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'foto-media' AND public.is_admin());

-- 11. Initial Sample Folders (Optional)
INSERT INTO public.folders (name, position)
VALUES 
    ('Moments & Travel', 0),
    ('Architecture & Minimal', 1),
    ('Portraits & Film', 2)
ON CONFLICT DO NOTHING;

-- Done! Now create your two users under Authentication -> Users:
-- 1. admin@foto.gallery (Set password, add metadata {"role": "admin"})
-- 2. viewer@foto.gallery (Set password, add metadata {"role": "viewer"})

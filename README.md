# foto — Private Photo & Video Gallery

A private photo and video gallery web app with an Apple-inspired design aesthetic, built with React, Tailwind CSS, and Supabase.

Designed as an open, reusable template that anyone can deploy for personal or private portfolio use.

---

## Highlights

- **Apple-Inspired Design System**: Clean typography, frosted glass headers, smooth fluid spring animations, tactile cards, system dark/light mode.
- **Dual-Password Single Field Sign-In**:
  - **Viewer Password**: Read-only access to browse all albums, view photos, play videos, zoom, and inspect metadata.
  - **Admin Password**: Full control (upload with client-side 2000px resizing and 400px thumbnail generation, create/rename/delete folders, drag-and-drop reorder, batch delete & move, set cover images).
- **Hardened Security**:
  - No client-side password checking; authenticates via real Supabase Auth accounts.
  - Row Level Security (RLS) ensures authenticated users can read, but only the admin role can write or delete.
  - **Private Storage Bucket**: Media files are strictly private; served exclusively through short-lived signed URLs.
  - Rate limiting & brute force lockout (5 failed attempts trigger a 1-minute lockout timer).
- **Built-in Setup Wizard**: Step-by-step in-app onboarding with SQL copier, live connection test, configuration generator, and deployment checklist.

---

## Quick Setup Guide

### 1. Create a Free Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up for a free account.
2. Click **New Project**, choose a project name (e.g. `my-foto-gallery`), set a database password, and select your nearest region.

### 2. Run the SQL Script
1. In your Supabase dashboard, open the **SQL Editor** from the left navigation.
2. Click **New query**.
3. Copy the entire contents of [`setup.sql`](./setup.sql) and paste it into the editor.
4. Click **Run**. This automatically creates:
   - `folders`, `media_items`, and `gallery_settings` tables
   - Row Level Security policies
   - `foto-media` private storage bucket with strict read/write policies
   - Helper security function `is_admin()`

### 3. Create the Viewer and Admin Accounts
In your Supabase dashboard, navigate to **Authentication** > **Users** > **Add User** > **Create user**:
- **Admin User**:
  - Email: `admin@foto.gallery` (or any email starting with `admin@`)
  - Password: Your chosen secret admin password
  - Auto Confirm User: Checked
  - User Metadata: `{"role": "admin"}`
- **Viewer User**:
  - Email: `viewer@foto.gallery` (or any email starting with `viewer@`)
  - Password: Your chosen viewer password
  - Auto Confirm User: Checked
  - User Metadata: `{"role": "viewer"}`

### 4. Configure Environment Variables
Copy `.env.example` to `.env` (or configure in Vercel / Cloudflare Pages settings):

```env
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-public-api-key"

VITE_GALLERY_NAME="foto"
VITE_OWNER_NAME="Elena Rostova"
VITE_PROFILE_PHOTO_URL=""

# Passwords configured in Supabase Auth (or test fallback)
VITE_VIEWER_PASSWORD="viewer123"
VITE_ADMIN_PASSWORD="admin123"
```

*Note: You can also use the in-app **"Make your own gallery"** wizard right inside the app to test your credentials and configure your gallery directly!*

---

## Free 1-Click Deployment

### Deploy on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/foto-gallery&env=VITE_SUPABASE_URL,VITE_SUPABASE_ANON_KEY,VITE_GALLERY_NAME,VITE_OWNER_NAME,VITE_PROFILE_PHOTO_URL,VITE_VIEWER_PASSWORD,VITE_ADMIN_PASSWORD&envDescription=Enter%20your%20Supabase%20credentials%20and%20gallery%20passwords&project-name=foto-gallery)

This project is fully configured for Vercel out of the box via [`vercel.json`](./vercel.json):
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **SPA Rewrites**: All routes rewrite cleanly to `/index.html`
- **Caching**: Static assets in `/assets` configured with immutable 1-year cache headers

#### Option A: Deploy via Vercel Dashboard
1. Push this repository to GitHub, GitLab, or Bitbucket.
2. In [Vercel](https://vercel.com), click **Add New Project** and import your repository.
3. Vercel automatically selects the **Vite** framework preset with `npm run build` and `dist`.
4. Under **Environment Variables**, paste the following keys:
   ```env
   VITE_SUPABASE_URL="https://your-project-id.supabase.co"
   VITE_SUPABASE_ANON_KEY="your-anon-public-api-key"
   VITE_GALLERY_NAME="foto"
   VITE_OWNER_NAME="Elena Rostova"
   VITE_PROFILE_PHOTO_URL=""
   VITE_VIEWER_PASSWORD="viewer123"
   VITE_ADMIN_PASSWORD="admin123"
   ```
5. Click **Deploy**. Your gallery will be live with free global CDN and HTTPS!

#### Option B: Deploy via Vercel CLI
If you prefer deploying directly from your terminal:
```bash
# 1. Install the Vercel CLI
npm i -g vercel

# 2. Deploy to preview
vercel

# 3. Deploy to production
vercel --prod
```

### Deploy on Cloudflare Pages
1. In the Cloudflare Dashboard, go to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
2. Build command: `npm run build`
3. Build output directory: `dist`
4. Add the `VITE_*` environment variables in Settings > Environment Variables.
5. Deploy!

---

## License
MIT

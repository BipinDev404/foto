/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { GalleryConfig, UserRole } from '../types/gallery';

let supabaseInstance: SupabaseClient | null = null;
let currentConfigKey = '';

export function getSupabaseClient(config: GalleryConfig): SupabaseClient | null {
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    return null;
  }

  // Validate URL format
  try {
    new URL(config.supabaseUrl);
  } catch {
    return null;
  }

  const key = `${config.supabaseUrl}_${config.supabaseAnonKey}`;
  if (!supabaseInstance || currentConfigKey !== key) {
    currentConfigKey = key;
    supabaseInstance = createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    });
  }

  return supabaseInstance;
}

export interface AuthResult {
  success: boolean;
  role?: UserRole;
  error?: string;
  isDemo?: boolean;
}

export interface SupabaseSessionInfo {
  hasSession: boolean;
  isAdmin: boolean;
  email?: string;
}

/**
 * Checks if the Supabase client currently has an active session and if that user is an admin.
 */
export async function getActiveSupabaseSession(
  client: SupabaseClient | null
): Promise<SupabaseSessionInfo> {
  if (!client) {
    return { hasSession: false, isAdmin: false };
  }

  try {
    const { data, error } = await client.auth.getSession();
    if (error || !data.session?.user) {
      return { hasSession: false, isAdmin: false };
    }

    const user = data.session.user;
    const email = user.email || '';
    const metadataRole = user.user_metadata?.role || user.app_metadata?.role;
    const isAdmin = email.startsWith('admin@') || metadataRole === 'admin';

    return {
      hasSession: true,
      isAdmin,
      email,
    };
  } catch (e) {
    console.warn('Error reading active Supabase session', e);
    return { hasSession: false, isAdmin: false };
  }
}

/**
 * Single-field login: tries Admin account first, then Viewer account.
 * If credentials are not yet linked to live Supabase, smoothly checks demo template credentials.
 */
export async function authenticateWithSinglePassword(
  password: string,
  config: GalleryConfig
): Promise<AuthResult> {
  const client = getSupabaseClient(config);
  const trimmed = password.trim();

  if (client) {
    try {
      // 1. Try Admin Account
      const { data: adminData, error: adminErr } = await client.auth.signInWithPassword({
        email: config.adminEmail,
        password: password,
      });

      if (!adminErr && adminData.session) {
        return { success: true, role: 'admin', isDemo: false };
      }

      // 2. Try Viewer Account
      const { data: viewerData, error: viewerErr } = await client.auth.signInWithPassword({
        email: config.viewerEmail,
        password: password,
      });

      if (!viewerErr && viewerData.session) {
        return { success: true, role: 'viewer', isDemo: false };
      }

      // 3. If admin account does not exist yet but matches config password, attempt signup with admin role
      if (trimmed === config.adminPassword) {
        try {
          const { data: signUpData, error: signUpErr } = await client.auth.signUp({
            email: config.adminEmail,
            password: password,
            options: {
              data: { role: 'admin' },
            },
          });
          if (!signUpErr && signUpData.session) {
            return { success: true, role: 'admin', isDemo: false };
          }
        } catch {
          // ignore signup fallback
        }
      }
    } catch (err) {
      console.warn('Supabase auth network check failed, testing fallback credentials', err);
    }
  }

  // Fallback demo/template authentication check if not configured or demo mode
  // Note: Since there is no active authenticated session in Supabase Auth, isDemo MUST be true
  // to prevent unauthenticated operations from triggering RLS error 42501 in Supabase.
  if (config.adminPassword && trimmed === config.adminPassword) {
    return { success: true, role: 'admin', isDemo: true };
  }

  if (config.viewerPassword && trimmed === config.viewerPassword) {
    return { success: true, role: 'viewer', isDemo: true };
  }

  return { success: false, error: 'Incorrect password' };
}

/**
 * Sign out of Supabase and clear session
 */
export async function signOutUser(config: GalleryConfig): Promise<void> {
  const client = getSupabaseClient(config);
  clearSignedUrlCache();
  if (client) {
    try {
      await client.auth.signOut();
    } catch (e) {
      console.warn('Sign out error', e);
    }
  }
}

// In-memory signed URL cache with expiration timestamps
interface CachedUrl {
  url: string;
  expiresAt: number;
}
const signedUrlCache = new Map<string, CachedUrl>();

export function clearSignedUrlCache(): void {
  signedUrlCache.clear();
}

/**
 * Gets a short-lived signed URL (3600s) for a private storage asset.
 * Uses a memory cache so repeated views don't hit the network constantly.
 */
export async function getSignedMediaUrl(
  path: string,
  config: GalleryConfig
): Promise<string | null> {
  if (!path) return null;

  // If path is already a direct data: or blob: or https: URL (e.g. demo mode)
  if (path.startsWith('data:') || path.startsWith('blob:') || path.startsWith('http')) {
    return path;
  }

  const client = getSupabaseClient(config);
  if (!client) {
    return path;
  }

  const now = Date.now();
  const cached = signedUrlCache.get(path);
  // Re-use if valid for at least 5 more minutes
  if (cached && cached.expiresAt > now + 300 * 1000) {
    return cached.url;
  }

  try {
    const { data, error } = await client.storage
      .from('foto-media')
      .createSignedUrl(path, 3600);

    if (error || !data?.signedUrl) {
      console.warn('Error fetching signed URL for', path, error);
      return null;
    }

    signedUrlCache.set(path, {
      url: data.signedUrl,
      expiresAt: now + 3600 * 1000,
    });

    return data.signedUrl;
  } catch (err) {
    console.error('Exception fetching signed URL', err);
    return null;
  }
}

/**
 * Quick connection check for Setup Wizard
 */
export async function testSupabaseConnection(
  url: string,
  anonKey: string
): Promise<{ success: boolean; message: string }> {
  try {
    if (!url || !anonKey) {
      return { success: false, message: 'URL and Anon Key are required.' };
    }
    new URL(url);
    const client = createClient(url, anonKey);
    // Ping public table or auth
    const { error } = await client.from('folders').select('count', { count: 'exact', head: true });
    
    if (error && error.code !== 'PGRST116') {
      // If table doesn't exist yet, it's still reachable
      if (error.message?.includes('relation "public.folders" does not exist')) {
        return {
          success: true,
          message: 'Connected to Supabase! (Tables need to be created using the SQL script).',
        };
      }
      return { success: false, message: error.message || 'Connection failed' };
    }

    return { success: true, message: 'Connection successful!' };
  } catch (e: any) {
    return { success: false, message: e.message || 'Invalid URL or network error.' };
  }
}

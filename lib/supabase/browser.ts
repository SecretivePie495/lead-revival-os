"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

/** True when the browser bundle has Supabase public env (same vars as Vercel / .env.local). */
export function hasSupabaseBrowserEnv(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url?.trim() && anonKey?.trim());
}

/**
 * Singleton browser client, or null if env is missing (avoid 500 on portal login in local dev).
 */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (!hasSupabaseBrowserEnv()) return null;
  if (!browserClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim();
    browserClient = createBrowserClient(url, anonKey);
  }
  return browserClient;
}

/** @deprecated Prefer getSupabaseBrowserClient() so callers can handle missing env. */
export function createSupabaseBrowserClient(): SupabaseClient {
  const client = getSupabaseBrowserClient();
  if (!client) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY (add to .env.local and restart dev)."
    );
  }
  return client;
}

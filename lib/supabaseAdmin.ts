/**
 * Supabase Admin client and magic link generation.
 * Server-only: import only from API routes or other server-side code.
 * Never import this module from client components.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getEnv(name: string): string {
  const value =
    name === "NEXT_PUBLIC_SUPABASE_URL"
      ? SUPABASE_URL
      : name === "SUPABASE_SERVICE_ROLE_KEY"
        ? SUPABASE_SERVICE_ROLE_KEY
        : process.env[name];
  if (!value || String(value).trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

let adminClient: SupabaseClient | null = null;

/**
 * Returns a Supabase client using the service role key.
 * Use only on the server (API routes, server components, server actions).
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (!adminClient) {
    const url = getEnv("NEXT_PUBLIC_SUPABASE_URL");
    const key = getEnv("SUPABASE_SERVICE_ROLE_KEY");
    adminClient = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return adminClient;
}

/**
 * Generates a magic link for the given email.
 * Uses Supabase Admin generateLink with type "magiclink".
 * The link can be sent via your own email provider or written to Airtable for Make/n8n to send.
 */
export async function generateMagicLink(email: string, redirectUrl: string) {
  const admin = getSupabaseAdmin();
  return admin.auth.admin.generateLink({
    type: "magiclink",
    email: email.trim(),
    options: {
      redirectTo: redirectUrl,
    },
  });
}

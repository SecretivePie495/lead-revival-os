/**
 * Persists the main-app sidebar "Current Client" so /analytics can stay in sync
 * when the URL temporarily has no ?clientId= (bookmarks, direct navigation).
 * Not used in the client portal.
 */
export const SELECTED_CLIENT_COOKIE = "lr_selected_client_id";

export function buildSelectedClientCookieHeader(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return `${SELECTED_CLIENT_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  }
  return `${SELECTED_CLIENT_COOKIE}=${encodeURIComponent(trimmed)}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

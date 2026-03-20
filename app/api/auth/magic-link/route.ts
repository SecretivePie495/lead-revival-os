import { NextResponse } from "next/server";
import { generateMagicLink } from "@/lib/supabaseAdmin";
import {
  createAuthEvent,
  updateAuthEvent,
  type AuthEventStatus,
} from "@/lib/airtableAuthEvents";

const MAGIC_LINK_API_KEY = process.env.MAGIC_LINK_API_KEY;
const MAGIC_LINK_REDIRECT_URL = process.env.MAGIC_LINK_REDIRECT_URL;

function getApiKeyFromRequest(req: Request): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7).trim();
  return req.headers.get("x-api-key")?.trim() ?? null;
}

function validateEmail(value: unknown): string | null {
  const s = typeof value === "string" ? value.trim() : "";
  if (!s) return null;
  const simpleEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return simpleEmail.test(s) ? s : null;
}

export async function POST(req: Request) {
  if (MAGIC_LINK_API_KEY) {
    const key = getApiKeyFromRequest(req);
    if (key !== MAGIC_LINK_API_KEY) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
  }

  let body: {
    email?: unknown;
    redirectUrl?: unknown;
    clientId?: unknown;
    supabaseUserId?: unknown;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const email = validateEmail(body?.email);
  if (!email) {
    return NextResponse.json(
      { error: "Valid email is required" },
      { status: 400 }
    );
  }

  const redirectUrl =
    typeof body?.redirectUrl === "string" && body.redirectUrl.trim()
      ? body.redirectUrl.trim()
      : MAGIC_LINK_REDIRECT_URL?.trim();

  if (!redirectUrl) {
    return NextResponse.json(
      { error: "redirectUrl is required in body or MAGIC_LINK_REDIRECT_URL in env" },
      { status: 400 }
    );
  }

  const clientId =
    typeof body?.clientId === "string" && body.clientId.trim()
      ? body.clientId.trim()
      : undefined;
  const supabaseUserId =
    typeof body?.supabaseUserId === "string" && body.supabaseUserId.trim()
      ? body.supabaseUserId.trim()
      : undefined;

  let authEventId: string | null = null;

  try {
    const { data, error } = await generateMagicLink(email, redirectUrl);

    if (error) {
      try {
        const created = await createAuthEvent({
          "Event Type": "magic_link",
          Email: email,
          "Supabase User ID": supabaseUserId,
          "Client ID": clientId,
          Status: "failed",
          "Error Message": error.message,
        });
        authEventId = created.id;
      } catch {
        // ignore Airtable write failure
      }
      return NextResponse.json(
        { error: "Failed to generate magic link" },
        { status: 502 }
      );
    }

    const actionLink =
      data?.properties?.action_link ??
      (data as { action_link?: string })?.action_link ??
      null;

    try {
      const created = await createAuthEvent({
        "Event Type": "magic_link",
        Email: email,
        "Supabase User ID": supabaseUserId,
        "Client ID": clientId,
        Status: "sent",
        "Magic Link URL": actionLink ?? undefined,
      });
      authEventId = created.id;
    } catch {
      // optional: event written for Make/n8n; continue
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (authEventId) {
      try {
        await updateAuthEvent(authEventId, {
          Status: "failed" as AuthEventStatus,
          "Error Message": message,
        });
      } catch {
        // ignore
      }
    } else {
      try {
        await createAuthEvent({
          "Event Type": "magic_link",
          Email: email,
          "Supabase User ID": supabaseUserId,
          "Client ID": clientId,
          Status: "failed",
          "Error Message": message,
        });
      } catch {
        // ignore
      }
    }
    return NextResponse.json(
      { error: "Failed to generate magic link" },
      { status: 500 }
    );
  }
}

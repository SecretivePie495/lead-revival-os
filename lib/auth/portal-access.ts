import { normalizeClientId } from "@/lib/airtable";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type PortalAccess = {
  userId: string;
  email: string | null;
  clientId: string;
  role: string;
};

export type PortalAccessState =
  | { status: "ok"; access: PortalAccess }
  | { status: "unauthenticated" }
  | { status: "forbidden"; message: string };

type PortalUserRow = {
  client_id: string | null;
  status: string | null;
};

export class PortalAccessError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function getPortalAccessState(): Promise<PortalAccessState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { status: "unauthenticated" };
  }

  const { data, error } = await supabase
    .from("portal_users")
    .select("client_id, status")
    .eq("user_id", user.id)
    .maybeSingle<PortalUserRow>();

  if (error) {
    return {
      status: "forbidden",
      message: "Portal access table is missing or not readable. Configure portal_users + RLS.",
    };
  }

  if (!data || (data.status ?? "").toLowerCase() !== "active") {
    return {
      status: "forbidden",
      message: "Your portal access is not active yet. Contact support.",
    };
  }

  const clientId = normalizeClientId(data.client_id);
  if (!clientId) {
    return {
      status: "forbidden",
      message: "Your account is missing a client mapping.",
    };
  }

  return {
    status: "ok",
    access: {
      userId: user.id,
      email: user.email ?? null,
      clientId,
      role: "client",
    },
  };
}

export async function requirePortalAccess(): Promise<PortalAccess> {
  const state = await getPortalAccessState();
  if (state.status === "ok") return state.access;
  if (state.status === "unauthenticated") {
    throw new PortalAccessError("Authentication required.", 401);
  }
  throw new PortalAccessError(state.message, 403);
}

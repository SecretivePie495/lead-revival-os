import { NextResponse } from "next/server";
import {
  assertLeadBelongsToClient,
  updateLeadStatus,
} from "@/lib/airtable";
import { PortalAccessError, requirePortalAccess } from "@/lib/auth/portal-access";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: Request, { params }: Params) {
  try {
    const access = await requirePortalAccess();
    const { id } = await params;
    const body = (await req.json()) as { status?: unknown };
    const status = String(body?.status ?? "").trim();

    if (!status) {
      return NextResponse.json({ error: "Status is required." }, { status: 400 });
    }

    try {
      await assertLeadBelongsToClient(id, access.clientId);
    } catch {
      // Return 404 to avoid leaking cross-tenant record existence.
      return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    }

    await updateLeadStatus(id, status);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof PortalAccessError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    const message =
      error instanceof Error ? error.message : "Unknown portal status update error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

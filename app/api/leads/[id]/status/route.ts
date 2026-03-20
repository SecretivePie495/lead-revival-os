import { NextResponse } from "next/server";
import { updateLeadStatus } from "@/lib/airtable";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = (await req.json()) as { status?: unknown };
    const status = String(body?.status ?? "").trim();

    if (!status) {
      return NextResponse.json({ error: "Status is required." }, { status: 400 });
    }

    await updateLeadStatus(id, status);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown lead status update error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


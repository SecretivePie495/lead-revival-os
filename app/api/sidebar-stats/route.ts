import { NextResponse } from "next/server";
import { getSidebarTodayStats, normalizeClientId } from "@/lib/airtable";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const raw = url.searchParams.get("clientId");
    const normalized = normalizeClientId(raw);
    const clientId = normalized || undefined;
    const recordNorm = normalizeClientId(url.searchParams.get("recordId"));
    const stats = await getSidebarTodayStats(
      clientId,
      recordNorm || undefined
    );
    return NextResponse.json(stats);
  } catch {
    return NextResponse.json({
      newLeadsToday: 0,
      repliesToday: 0,
      bookedCallsToday: 0,
    });
  }
}

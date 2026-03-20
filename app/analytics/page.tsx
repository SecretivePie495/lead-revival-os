export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AnalyticsDashboard from "@/app/components/analytics/AnalyticsDashboard";
import { SELECTED_CLIENT_COOKIE } from "@/lib/analytics-scope";
import {
  getClients,
  getLeadsWithClientContext,
  getUnmatchedClientIdCount,
  normalizeClientId,
} from "@/lib/airtable";

type AnalyticsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function parseClientId(
  resolved: Record<string, string | string[] | undefined>
): string | undefined {
  const raw = resolved.clientId;
  const v = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined;
  const t = v?.trim();
  return t || undefined;
}

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const urlClientId = parseClientId(resolvedSearchParams);

  const cookieStore = await cookies();
  const cookieClientId = cookieStore.get(SELECTED_CLIENT_COOKIE)?.value?.trim() || undefined;

  // Canonical URL: if user last picked a client in the sidebar but landed on /analytics
  // without ?clientId=, redirect so the chart matches Kanban / Inbox.
  if (!urlClientId && cookieClientId) {
    redirect(`/analytics?clientId=${encodeURIComponent(cookieClientId)}`);
  }

  const clientId = urlClientId;

  const [leads, unmatchedCount, clients] = await Promise.all([
    getLeadsWithClientContext(clientId),
    getUnmatchedClientIdCount(),
    getClients(),
  ]);

  const normalized = clientId ? normalizeClientId(clientId) : "";
  const scopedClientLabel = clientId
    ? clients.find((c) => normalizeClientId(c.ClientsID) === normalized)?.["business Name"] ??
      null
    : null;

  return (
    <main className="analytics-main">
      <div className="pg-header analytics-page-header">
        <h1 className="pg-title">Analytics</h1>
        <p className="pg-sub">
          {clientId
            ? `Daily-first trend and KPIs for the client selected in the sidebar (same scope as Kanban), with a monthly rollup toggle.`
            : `Daily-first revival volume, replies, and booked calls — workspace-wide until you pick a client, with a monthly rollup toggle.`}
        </p>
      </div>
      <AnalyticsDashboard
        leads={leads}
        unmatchedCount={unmatchedCount}
        variant="main"
        scopedClientId={clientId ?? null}
        scopedClientLabel={scopedClientLabel}
      />
    </main>
  );
}

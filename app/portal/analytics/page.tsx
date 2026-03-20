import { redirect } from "next/navigation";
import AnalyticsDashboard from "@/app/components/analytics/AnalyticsDashboard";
import { getPortalAccessState } from "@/lib/auth/portal-access";
import { getPortalLeads } from "@/lib/airtable";

export const dynamic = "force-dynamic";

export default async function PortalAnalyticsPage() {
  const state = await getPortalAccessState();
  if (state.status === "unauthenticated") {
    redirect("/portal/login?next=/portal/analytics");
  }
  if (state.status === "forbidden") {
    return null;
  }

  const leads = await getPortalLeads(state.access.clientId);

  return (
    <div className="analytics-main">
      <div className="pg-header analytics-page-header">
        <h1 className="pg-title">Analytics</h1>
        <p className="pg-sub">Your account metrics and trends (same layout as main app).</p>
      </div>
      <AnalyticsDashboard leads={leads} unmatchedCount={0} variant="portal" />
    </div>
  );
}

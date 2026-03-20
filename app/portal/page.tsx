import StatsCards from "@/app/components/StatsCards";
import { redirect } from "next/navigation";
import { getPortalAccessState } from "@/lib/auth/portal-access";
import { getPortalDashboardData } from "@/lib/airtable";
import type { LeadFields } from "@/lib/airtable";

type LeadWithId = { id: string } & LeadFields;

export default async function PortalHomePage() {
  const state = await getPortalAccessState();
  if (state.status === "unauthenticated") {
    redirect("/portal/login?next=/portal");
  }
  if (state.status === "forbidden") {
    return null;
  }

  const { stats, leads } = await getPortalDashboardData(state.access.clientId);
  const recentLeads = (leads as LeadWithId[]).slice(0, 10);

  return (
    <main className="space-y-5">
      <div className="pg-header">
        <div>
          <h1 className="pg-title">Pipeline Revival</h1>
          <p className="pg-sub">Your account — revivals, booked calls &amp; replies</p>
        </div>
        <div className="pg-controls">
          <div className="client-tag">
            <span className="client-tag-dot"></span>
            {state.access.clientId}
          </div>
        </div>
      </div>

      <StatsCards
        leadsImported={stats.totalLeads}
        conversations={stats.conversations}
        bookedCalls={stats.bookedCalls}
        conversionRate={stats.conversionRate}
      />

      <div className="tbl-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Service</th>
              <th>Last Message</th>
            </tr>
          </thead>
          <tbody>
            {recentLeads.length > 0 ? (
              recentLeads.map((lead) => (
                <tr key={lead.id}>
                  <td className="td-name">{lead["Lead Name"] || lead["First Name"] || "—"}</td>
                  <td className="td-phone">{lead.Phone || "—"}</td>
                  <td>{lead.Status || "Contacted"}</td>
                  <td className="td-src">{lead["Service/Product"] || "—"}</td>
                  <td className="td-time">{lead["Last Message Date"] || "—"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="td-name" style={{ padding: 24 }}>
                  No leads found for this client.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

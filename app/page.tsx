import {
  getClients,
  getDashboardStats,
  getLeadsWithClientContext,
  getUnmatchedClientIdCount,
  normalizeClientId,
} from "@/lib/airtable";
import type { LeadFields } from "@/lib/airtable";
import StatsCards from "./components/StatsCards";

export const dynamic = "force-dynamic";

function getStatusPillClass(status: string): string {
  const s = status.toLowerCase();
  if (s.includes("wrong")) return "pill-wrong-number";
  if (s.includes("qualif") || s.includes("qualified")) return "pill-qualified";
  if (s.includes("not") && (s.includes("interested") || s.includes("interest")))
    return "pill-not-interested";
  if (s.includes("book")) return "pill-booked";
  if (s.includes("nurtur")) return "pill-nurturing";
  if (s.includes("repl")) return "pill-replied";
  if (s.includes("contacting")) return "pill-contacting";
  if (s.includes("contacted")) return "pill-contacted";
  if (s.includes("new")) return "pill-new-lead";
  return "pill-contacted";
}

function formatLastTouched(dateStr?: string): string {
  if (!dateStr) return "—";
  return dateStr;
}

type LeadWithId = { id: string } & LeadFields;

type HomeProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Home({ searchParams }: HomeProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const clientIdRaw = resolvedSearchParams.clientId;
  const clientId =
    typeof clientIdRaw === "string"
      ? clientIdRaw
      : Array.isArray(clientIdRaw)
        ? clientIdRaw[0]
        : undefined;

  const [stats, leads, clients, unmatchedCount] = await Promise.all([
    getDashboardStats(clientId),
    getLeadsWithClientContext(clientId),
    getClients(),
    getUnmatchedClientIdCount(),
  ]);
  const recentLeads = (leads as LeadWithId[]).slice(0, 5);
  const normalizedClientId = normalizeClientId(clientId);
  const selectedClientName =
    !normalizedClientId
      ? "All Clients"
      : clients.find((c) => normalizeClientId(c.ClientsID) === normalizedClientId)
          ?.["business Name"] ?? String(clientId);

  return (
    <main>
      <div className="pg-header">
        <div>
          <h1 className="pg-title">Pipeline Revival</h1>
          <p className="pg-sub">
            {selectedClientName} — revivals, booked calls &amp; replies
          </p>
          {unmatchedCount > 0 ? (
            <p className="pg-sub" style={{ color: "var(--amb)", marginTop: 6 }}>
              {unmatchedCount} lead(s) have a Client_ID that doesn&apos;t match any client.
            </p>
          ) : null}
        </div>
        <div className="pg-controls">
          <div className="client-tag">
            <span className="client-tag-dot"></span>
            {selectedClientName}
          </div>
        </div>
      </div>

      <StatsCards
        leadsImported={stats.totalLeads}
        conversations={stats.conversations}
        bookedCalls={stats.bookedCalls}
        conversionRate={stats.conversionRate}
      />

      <div className="body-grid">
        {/* TABLE */}
        <div>
          <div className="section-hd">
            <div>
              <p className="sec-lbl">Latest imported leads</p>
              <p className="sec-sub">
                Last 5 of {stats.totalLeads.toLocaleString()} · filterable by
                status, source, date
              </p>
            </div>
            <button className="btn btn-accent">+ Import leads</button>
          </div>
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
                  recentLeads.map((l) => {
                    const pillClass = getStatusPillClass(l.Status || "");
                    return (
                      <tr key={l.id}>
                        <td className="td-name">
                          {l["Lead Name"] || l["First Name"] || "—"}
                        </td>
                        <td className="td-phone">{l.Phone || "—"}</td>
                        <td>
                          <span className={`pill ${pillClass}`}>
                            <span className="pill-dot"></span>
                            {l.Status || "Contacted"}
                          </span>
                        </td>
                        <td className="td-src">
                          {l["Service/Product"] || "—"}
                        </td>
                        <td className="td-time">
                          {formatLastTouched(l["Last Message Date"])}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="td-name" style={{ padding: 24 }}>
                      No leads yet. Import leads to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="tbl-foot">
              Showing {recentLeads.length} of{" "}
              {stats.totalLeads.toLocaleString()} records
            </div>
          </div>
        </div>

        {/* CAMPAIGNS */}
        <div>
          <div className="section-hd">
            <div>
              <p className="sec-lbl">Revival campaigns</p>
              <p className="sec-sub">Active &amp; recent sequences</p>
            </div>
            <button className="btn">+ New</button>
          </div>
          <div className="camp-list">
            <div className="camp">
              <div className="camp-row1">
                <div>
                  <p className="camp-name">7-Day &quot;Wake Up&quot;</p>
                  <p className="camp-desc">
                    Dormant 90–365 days · FB &amp; Google leads
                  </p>
                </div>
                <span className="status-tag st-run">Running</span>
              </div>
              <div className="camp-metrics">
                <div className="cm">
                  <span className="cm-val">8,120</span>
                  <span className="cm-lbl">Leads</span>
                </div>
                <div className="cm">
                  <span className="cm-val">1,342</span>
                  <span className="cm-lbl">Replies</span>
                </div>
                <div className="cm">
                  <span className="cm-val g">119</span>
                  <span className="cm-lbl">Booked</span>
                </div>
              </div>
              <div className="camp-bar">
                <div
                  className="camp-bar-fill cbf-run"
                  style={{ width: "65%" }}
                ></div>
              </div>
            </div>

            <div className="camp">
              <div className="camp-row1">
                <div>
                  <p className="camp-name">No-Show Reactivation</p>
                  <p className="camp-desc">
                    14-day follow-up · rebooks missed calls
                  </p>
                </div>
                <span className="status-tag st-pau">Paused</span>
              </div>
              <div className="camp-metrics">
                <div className="cm">
                  <span className="cm-val">421</span>
                  <span className="cm-lbl">Leads</span>
                </div>
                <div className="cm">
                  <span className="cm-val">79</span>
                  <span className="cm-lbl">Replies</span>
                </div>
                <div className="cm">
                  <span className="cm-val a">18</span>
                  <span className="cm-lbl">Rebooked</span>
                </div>
              </div>
              <div className="camp-bar">
                <div
                  className="camp-bar-fill cbf-pau"
                  style={{ width: "42%" }}
                ></div>
              </div>
            </div>

            <div className="camp">
              <div className="camp-row1">
                <div>
                  <p className="camp-name">Summer Tune-up Promo</p>
                  <p className="camp-desc">
                    One-off revenue bump · warm list
                  </p>
                </div>
                <span className="status-tag st-don">Completed</span>
              </div>
              <div className="camp-metrics">
                <div className="cm">
                  <span className="cm-val">2,013</span>
                  <span className="cm-lbl">Leads</span>
                </div>
                <div className="cm">
                  <span className="cm-val">243</span>
                  <span className="cm-lbl">Replies</span>
                </div>
                <div className="cm">
                  <span className="cm-val d">100%</span>
                  <span className="cm-lbl">Done</span>
                </div>
              </div>
              <div className="camp-bar">
                <div
                  className="camp-bar-fill cbf-don"
                  style={{ width: "100%" }}
                ></div>
              </div>
              <div className="rev-box">
                <span className="rev-lbl">Estimated revived revenue</span>
                <span className="rev-val">$38,400</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

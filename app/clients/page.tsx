import { getClients, getLeadCountsByClientId } from "@/lib/airtable";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const [clients, leadCountsByClientId] = await Promise.all([
    getClients(),
    getLeadCountsByClientId(),
  ]);

  return (
    <main>
      <div className="pg-header">
        <h1 className="pg-title">Clients</h1>
        <p className="pg-sub">All active client accounts</p>
      </div>

      <div className="tbl-wrap">
        <table>
          <thead>
            <tr>
              <th>Client ID</th>
              <th>Business Name</th>
              <th>From Number</th>
              <th>Leads</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => {
              const key = String(c.ClientsID ?? "").trim().toLowerCase();
              const matchedLeadCount = leadCountsByClientId[key] ?? 0;
              return (
                <tr key={c.id}>
                  <td className="td-name">{c.ClientsID ?? "—"}</td>
                  <td>{c["business Name"] ?? "—"}</td>
                  <td className="td-phone">{c["From Number"] ?? "—"}</td>
                  <td className="td-src">{matchedLeadCount}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}

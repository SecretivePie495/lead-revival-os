import { redirect } from "next/navigation";
import {
  getClients,
  getLeadCountsByClientId,
  normalizeClientId,
} from "@/lib/airtable";
import { getPortalAccessState } from "@/lib/auth/portal-access";

export const dynamic = "force-dynamic";

export default async function PortalClientsPage() {
  const state = await getPortalAccessState();
  if (state.status === "unauthenticated") {
    redirect("/portal/login?next=/portal/clients");
  }
  if (state.status === "forbidden") {
    return null;
  }

  const [clients, leadCountsByClientId] = await Promise.all([
    getClients(),
    getLeadCountsByClientId(),
  ]);

  const scopedClientId = normalizeClientId(state.access.clientId);
  const client =
    clients.find((c) => normalizeClientId(c.ClientsID) === scopedClientId) ??
    clients.find((c) => normalizeClientId(c.id) === scopedClientId) ??
    null;

  const matchedLeadCount = client
    ? leadCountsByClientId[normalizeClientId(client.ClientsID)] ?? 0
    : 0;

  return (
    <main>
      <div className="pg-header">
        <h1 className="pg-title">Clients</h1>
        <p className="pg-sub">Your account mapping</p>
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
            {client ? (
              <tr>
                <td className="td-name">{client.ClientsID ?? state.access.clientId}</td>
                <td>{client["business Name"] ?? "—"}</td>
                <td className="td-phone">{client["From Number"] ?? "—"}</td>
                <td className="td-src">{matchedLeadCount}</td>
              </tr>
            ) : (
              <tr>
                <td colSpan={4} className="td-name" style={{ padding: 24 }}>
                  Client record not found. Contact support.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

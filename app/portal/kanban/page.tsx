import { redirect } from "next/navigation";
import KanbanBoard from "@/app/components/kanban/KanbanBoard";
import { getPortalAccessState } from "@/lib/auth/portal-access";
import { getPortalLeads } from "@/lib/airtable";

export const dynamic = "force-dynamic";

export default async function PortalKanbanPage() {
  const state = await getPortalAccessState();
  if (state.status === "unauthenticated") {
    redirect("/portal/login?next=/portal/kanban");
  }
  if (state.status === "forbidden") {
    return null;
  }

  const leads = await getPortalLeads(state.access.clientId);

  return (
    <main>
      <div className="pg-header">
        <h1 className="pg-title">Kanban</h1>
        <p className="pg-sub">
          {leads.length} lead{leads.length === 1 ? "" : "s"} in your account
        </p>
      </div>
      <p className="sec-sub" style={{ marginBottom: 12 }}>
        Read-only board for client users.
      </p>
      <KanbanBoard
        leads={leads as Parameters<typeof KanbanBoard>[0]["leads"]}
        readOnly
      />
    </main>
  );
}

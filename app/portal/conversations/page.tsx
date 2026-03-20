import { redirect } from "next/navigation";
import ConversationsClient from "@/app/conversations/ConversationsClient";
import { getPortalAccessState } from "@/lib/auth/portal-access";
import { getPortalLeads } from "@/lib/airtable";

export const dynamic = "force-dynamic";

export default async function PortalConversationsPage() {
  const state = await getPortalAccessState();
  if (state.status === "unauthenticated") {
    redirect("/portal/login?next=/portal/conversations");
  }
  if (state.status === "forbidden") {
    return null;
  }

  const leads = await getPortalLeads(state.access.clientId);

  return (
    <section>
      <div className="pg-header">
        <h2 className="pg-title">Conversations</h2>
        <p className="pg-sub">
          {leads.length} lead{leads.length === 1 ? "" : "s"} in your account
        </p>
      </div>
      <p className="sec-sub" style={{ marginBottom: 12 }}>
        Read-only view for client users.
      </p>
      <ConversationsClient
        initialLeads={leads as Parameters<typeof ConversationsClient>[0]["initialLeads"]}
        statusEndpointBase="/api/portal/leads"
        readOnly
      />
    </section>
  );
}

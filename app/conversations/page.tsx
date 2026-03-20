import { getLeadsWithClientContext } from "@/lib/airtable";
import ConversationsClient from "./ConversationsClient";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ clientId?: string }>;
};

export default async function ConversationsPage({ searchParams }: PageProps) {
  const { clientId } = await searchParams;
  const normalizedClientId = (clientId ?? "").trim();
  const [allLeads, leads] = await Promise.all([
    getLeadsWithClientContext(),
    getLeadsWithClientContext(normalizedClientId || undefined),
  ]);

  const subtitle = normalizedClientId
    ? `${leads.length} lead${leads.length !== 1 ? "s" : ""} for selected client`
    : `All leads — ${allLeads.length} total`;

  return (
    <main>
      <div className="pg-header">
        <h1 className="pg-title">Conversations</h1>
        <p className="pg-sub">{subtitle}</p>
      </div>
      <ConversationsClient
        initialLeads={leads as Parameters<typeof ConversationsClient>[0]["initialLeads"]}
      />
    </main>
  );
}

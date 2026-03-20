import KanbanBoard from "@/app/components/kanban/KanbanBoard";
import { getLeadsWithClientContext } from "@/lib/airtable";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function KanbanPage({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const clientIdRaw = resolvedSearchParams.clientId;
  const clientId =
    typeof clientIdRaw === "string"
      ? clientIdRaw
      : Array.isArray(clientIdRaw)
      ? clientIdRaw[0]
      : undefined;

  const normalizedClientId = (clientId ?? "").trim();
  const leads = await getLeadsWithClientContext(normalizedClientId || undefined);

  const subtitle = normalizedClientId
    ? `${leads.length} lead${leads.length === 1 ? "" : "s"} for selected client`
    : `All leads — ${leads.length} total`;

  return (
    <main>
      <div className="pg-header">
        <h1 className="pg-title">Kanban</h1>
        <p className="pg-sub">{subtitle}</p>
      </div>

      <KanbanBoard
        leads={leads as Parameters<typeof KanbanBoard>[0]["leads"]}
        statusEndpointBase="/api/leads"
      />
    </main>
  );
}

import Sidebar from "./Sidebar";
import { getClients } from "@/lib/airtable";
import type { ClientRecord } from "@/lib/airtable";

export default async function Shell({
  children,
}: {
  children: React.ReactNode;
}) {
  let clients: ClientRecord[] = [];
  try {
    clients = await getClients();
  } catch {
    // Airtable not configured — sidebar shows empty client list
  }

  return (
    <div className="shell">
      <Sidebar clients={clients} />
      {children}
    </div>
  );
}

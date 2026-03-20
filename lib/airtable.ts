const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const LEADS_TABLE = process.env.AIRTABLE_LEADS_TABLE || "Leads";
const CLIENTS_TABLE = process.env.AIRTABLE_CLIENTS_TABLE || "Clients";

function validateAirtableConfig(): void {
  const missing: string[] = [];
  if (!AIRTABLE_API_KEY || AIRTABLE_API_KEY.trim() === "") missing.push("AIRTABLE_API_KEY");
  if (!AIRTABLE_BASE_ID || AIRTABLE_BASE_ID.trim() === "") missing.push("AIRTABLE_BASE_ID");
  if (missing.length > 0) {
    console.error(
      "[Airtable] Missing required env vars:",
      missing.join(", "),
      "- Add them to .env.local for local dev or Vercel Project Settings > Environment Variables"
    );
    throw new Error(
      `Airtable config incomplete. Required: ${missing.join(", ")}. Set them in .env.local (local dev) or Vercel Environment Variables.`
    );
  }
  // Debug log for Vercel: confirms env vars are defined (never log full key)
  console.log(
    "[Airtable] Config present - key prefix:",
    AIRTABLE_API_KEY!.slice(0, 4) + "****",
    "baseId:",
    AIRTABLE_BASE_ID
  );
}

function getApiUrl(): string {
  validateAirtableConfig();
  return `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;
}

type AirtableRecord<T = unknown> = {
  id: string;
  fields: T;
};

async function airtableFetch<T>(
  table: string,
  params?: Record<string, string>
): Promise<AirtableRecord<T>[]> {
  const records: AirtableRecord<T>[] = [];
  let offset: string | undefined;

  do {
    const query = new URLSearchParams(params ?? {});
    if (offset) query.set("offset", offset);
    const url = `${getApiUrl()}/${encodeURIComponent(table)}${query.toString() ? `?${query.toString()}` : ""}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      },
      cache: "no-store",
    });

    const text = await res.text();
    if (!res.ok) {
      throw new Error(`Airtable API error (${res.status}): ${text}`);
    }

    const json = JSON.parse(text) as {
      records: AirtableRecord<T>[];
      offset?: string;
    };

    records.push(...json.records);
    offset = json.offset;
  } while (offset);

  return records;
}

async function airtablePatchRecord(
  table: string,
  recordId: string,
  fields: Record<string, unknown>
): Promise<void> {
  const res = await fetch(
    `${getApiUrl()}/${encodeURIComponent(table)}/${encodeURIComponent(recordId)}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify({ fields }),
    }
  );

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Airtable API error (${res.status}): ${text}`);
  }
}

// CLIENTS TABLE
export type ClientFields = {
  ClientsID?: string;
  "business Name"?: string;
  "From Number"?: string;
  "Day 0"?: string | boolean;
  "day 0 2hrs"?: string | boolean;
  "day 0 EOD"?: string | boolean;
  "day 1"?: string | boolean;
  "day 2"?: string | boolean;
  "day 4"?: string | boolean;
  "day 6"?: string | boolean;
  "day 8"?: string | boolean;
  "day 10"?: string | boolean;
  "day 14"?: string | boolean;
  "day 16"?: string | boolean;
  "week 4"?: string | boolean;
  "week 8"?: string | boolean;
  "week 12"?: string | boolean;
  Leads?: string[] | unknown;
  [key: string]: unknown;
};

export type ClientRecord = {
  id: string;
  ClientsID: string;
  "business Name": string;
  "From Number"?: string;
  Leads?: string[] | number | string;
};

function normalizeClient(r: AirtableRecord<ClientFields>): ClientRecord {
  const f = r.fields as Record<string, unknown>;
  return {
    id: r.id,
    ClientsID: String(
      f.ClientsID ?? f["Client ID"] ?? f.client_id ?? f.ClientID ?? ""
    ),
    "business Name": String(
      f["business Name"] ?? f["Business Name"] ?? f.businessName ?? ""
    ),
    "From Number": f["From Number"] != null ? String(f["From Number"]) : undefined,
    Leads: f.Leads as string[] | number | string | undefined,
  };
}

export async function getClients(): Promise<ClientRecord[]> {
  const records = await airtableFetch<ClientFields>(CLIENTS_TABLE);
  return records.map(normalizeClient);
}

function toClientLeadsCount(value: ClientRecord["Leads"]): number {
  if (Array.isArray(value)) return value.length;
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return 0;
    const asNumber = Number(trimmed);
    if (!Number.isNaN(asNumber)) return asNumber;
    return trimmed
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean).length;
  }
  return 0;
}

export async function getTotalLeadsFromClientsTable(clientId?: string): Promise<number> {
  const clients = await getClients();
  const normalizedFilter = normalizeClientId(clientId);
  const scopedClients = normalizedFilter
    ? clients.filter((c) => normalizeClientId(c.ClientsID) === normalizedFilter)
    : clients;
  return scopedClients.reduce((sum, client) => sum + toClientLeadsCount(client.Leads), 0);
}

// LEADS TABLE (Lead Database)
export type LeadFields = {
  "Lead Name"?: string;
  "First Name"?: string;
  Phone?: string;
  Status?: string;
  "Service/Product"?: string;
  "Last Message Date"?: string;
  /** Airtable auto field — required for analytics “leads created” trend. */
  "Created Time"?: string;
  /** Optional fallbacks if your base uses a custom name (also read via index). */
  Created?: string;
  "Created Date"?: string;
  Opted?: string | boolean;
  Notes?: string;
  Convo?: string;
  Calculation?: string | number;
  Replies?: string | number;
  Sequences?: string | string[];
  Client_ID?: string | string[];
  "Client ID"?: string | string[];
  /** Common Airtable linked-record field name */
  Client?: string | string[];
  [key: string]: unknown;
};

export async function getLeads() {
  const records = await airtableFetch<LeadFields>(LEADS_TABLE);
  return records.map((r) => ({ id: r.id, ...r.fields }));
}

type LeadWithId = { id: string } & LeadFields;
type ClientMatch = {
  clientId: string;
  clientName: string;
  matched: boolean;
};

export function normalizeClientId(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

function toNormalizedValues(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((v) => normalizeClientId(v))
      .filter((v) => v !== "");
  }
  if (value == null) return [];
  const normalized = normalizeClientId(value);
  return normalized ? [normalized] : [];
}

function getLeadClientRefs(lead: LeadWithId): string[] {
  const candidates = [
    lead.Client_ID,
    lead["Client ID"],
    lead["client_id"],
    lead["ClientID"],
    lead.Client,
  ];
  return candidates.flatMap((v) => toNormalizedValues(v));
}

export type GetLeadsWithClientContextOptions = {
  /** Airtable Clients row id (`rec…`) — same row as the sidebar picker when codes could collide. */
  clientRecordId?: string;
};

export async function getLeadsWithClientContext(
  clientId?: string,
  options?: GetLeadsWithClientContextOptions
): Promise<Array<LeadWithId & ClientMatch>> {
  const [clients, leads] = await Promise.all([getClients(), getLeads()]);
  const byRecordId = new Map(
    clients
      .filter((c) => normalizeClientId(c.id) !== "")
      .map((c) => [normalizeClientId(c.id), c])
  );
  // First row wins per ClientsID so lead→client resolution matches Sidebar `clients.find` order.
  const byClientId = new Map<string, ClientRecord>();
  for (const c of clients) {
    const k = normalizeClientId(c.ClientsID);
    if (k && !byClientId.has(k)) byClientId.set(k, c);
  }
  const normalizedFilter = normalizeClientId(clientId);
  const recordIdNorm = normalizeClientId(options?.clientRecordId);

  let selectedClientRow: ClientRecord | undefined;
  if (recordIdNorm) {
    selectedClientRow = clients.find((c) => normalizeClientId(c.id) === recordIdNorm);
  }
  if (!selectedClientRow && normalizedFilter) {
    selectedClientRow = clients.find((c) => normalizeClientId(c.ClientsID) === normalizedFilter);
  }

  const scopeRequested = Boolean(recordIdNorm || normalizedFilter);
  const selectedClientRecordId = normalizeClientId(selectedClientRow?.id);
  const selectedClientsIdCode = normalizeClientId(selectedClientRow?.ClientsID);

  return (leads as LeadWithId[])
    .filter((lead) => {
      if (!scopeRequested) return true;
      const refs = getLeadClientRefs(lead);
      if (selectedClientRow) {
        if (selectedClientRecordId) {
          return (
            refs.includes(selectedClientRecordId) ||
            (selectedClientsIdCode ? refs.includes(selectedClientsIdCode) : false)
          );
        }
        return selectedClientsIdCode ? refs.includes(selectedClientsIdCode) : false;
      }
      // Unknown client row but URL had a code — still narrow leads by that code.
      return !!normalizedFilter && refs.includes(normalizedFilter);
    })
    .map((lead) => {
      const refs = getLeadClientRefs(lead);
      const client =
        refs.map((ref) => byRecordId.get(ref) ?? byClientId.get(ref)).find(Boolean) ??
        null;

      return {
        ...lead,
        clientId: client?.ClientsID ?? String(lead.Client_ID ?? ""),
        clientName: client?.["business Name"] || String(lead.Client_ID ?? "Unmatched"),
        // "Matched" means lead references a real client row by linked id or ClientsID.
        matched: client != null,
      };
    });
}

export async function getLeadCountsByClientId(): Promise<Record<string, number>> {
  const clients = await getClients();
  return clients.reduce<Record<string, number>>((acc, client) => {
    const key = normalizeClientId(client.ClientsID);
    if (!key) return acc;
    acc[key] = toClientLeadsCount(client.Leads);
    return acc;
  }, {});
}

export async function getUnmatchedClientIdCount(): Promise<number> {
  const [leads, clients] = await Promise.all([getLeads() as Promise<LeadWithId[]>, getClients()]);
  const knownClientCodes = new Set(
    clients.map((c) => normalizeClientId(c.ClientsID)).filter((id) => id !== "")
  );
  const knownRecordIds = new Set(
    clients.map((c) => normalizeClientId(c.id)).filter((id) => id !== "")
  );
  return leads.filter((l) => {
    const refs = getLeadClientRefs(l);
    if (refs.length === 0) return false;
    return !refs.some((ref) => knownRecordIds.has(ref) || knownClientCodes.has(ref));
  }).length;
}

// DASHBOARD SUMMARY (Leads-table powered)
export async function getDashboardStats(clientId?: string) {
  const normalizedFilter = normalizeClientId(clientId);
  const [rawLeads, clients] = await Promise.all([
    getLeads() as Promise<LeadWithId[]>,
    getClients(),
  ]);
  const selectedClient = normalizedFilter
    ? clients.find((c) => normalizeClientId(c.ClientsID) === normalizedFilter)
    : undefined;
  const selectedClientRecordId = normalizeClientId(selectedClient?.id);
  const leads = rawLeads.filter((lead) => {
    if (!normalizedFilter) return true;
    const refs = getLeadClientRefs(lead);
    if (selectedClientRecordId) {
      return refs.includes(selectedClientRecordId) || refs.includes(normalizedFilter);
    }
    return refs.includes(normalizedFilter);
  });
  const bookedCalls = leads.filter((l) =>
    (l.Status ?? "").toLowerCase().includes("book")
  ).length;
  const totalLeads = leads.length;
  return {
    totalLeads,
    conversations: leads.filter((l) => l.Notes?.length || l.Convo?.length).length,
    bookedCalls,
    conversionRate: totalLeads > 0 ? (bookedCalls / totalLeads) * 100 : 0,
    activeCampaigns: new Set(leads.flatMap((l) => getLeadClientRefs(l))).size,
  };
}

/** Sidebar “Today” strip — same client scope as Kanban / analytics. */
export type SidebarTodayStats = {
  newLeadsToday: number;
  repliesToday: number;
  bookedCallsToday: number;
};

function startOfLocalDay(d: Date = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function isSameLocalCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function parseLeadDateField(value: unknown): Date | null {
  if (value == null || value === "") return null;
  const dt = new Date(String(value));
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function getLeadDateFromCandidates(
  lead: LeadWithId,
  candidateFields: string[]
): Date | null {
  const record = lead as Record<string, unknown>;
  for (const field of candidateFields) {
    const parsed = parseLeadDateField(record[field]);
    if (parsed) return parsed;
  }
  return null;
}

function getLeadCreatedAtForSidebar(lead: LeadWithId): Date | null {
  const record = lead as Record<string, unknown>;
  const candidates = [
    record["Created Time"],
    record["Created"],
    record["Created Date"],
    record["created_time"],
    record["Date Created"],
  ];
  for (const v of candidates) {
    const d = parseLeadDateField(v);
    if (d) return d;
  }
  return null;
}

function getReplyCountForSidebar(lead: LeadWithId): number {
  const raw = lead.Replies;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string") {
    const n = Number(raw.trim());
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function isRepliedStatusForSidebar(lead: LeadWithId): boolean {
  const s = String(lead.Status ?? "").trim().toLowerCase();
  return s === "replied" || s.includes("replied") || s.includes("repl");
}

function isBookedStatusForSidebar(lead: LeadWithId): boolean {
  return String(lead.Status ?? "").toLowerCase().includes("book");
}

function getLeadReplyAtForSidebar(lead: LeadWithId): Date | null {
  return getLeadDateFromCandidates(lead, [
    "First Reply Date",
    "Reply Date",
    "Replied At",
    "Last Message Date",
  ]);
}

function getLeadBookedAtForSidebar(lead: LeadWithId): Date | null {
  return getLeadDateFromCandidates(lead, [
    "Booked Date",
    "Appointment Date",
    "Call Booked Date",
    "Booked At",
    "Last Message Date",
  ]);
}

export async function getSidebarTodayStats(
  clientId?: string,
  clientRecordId?: string
): Promise<SidebarTodayStats> {
  let leads: Array<LeadWithId & ClientMatch>;
  try {
    leads = await getLeadsWithClientContext(clientId, { clientRecordId });
  } catch {
    return { newLeadsToday: 0, repliesToday: 0, bookedCallsToday: 0 };
  }

  const today = startOfLocalDay();
  let newLeadsToday = 0;
  let repliesToday = 0;
  let bookedCallsToday = 0;

  for (const lead of leads) {
    const created = getLeadCreatedAtForSidebar(lead);
    if (created && isSameLocalCalendarDay(created, today)) {
      newLeadsToday += 1;
    }

    const replied = isRepliedStatusForSidebar(lead) || getReplyCountForSidebar(lead) > 0;
    if (replied) {
      const replyAt = getLeadReplyAtForSidebar(lead);
      if (replyAt && isSameLocalCalendarDay(replyAt, today)) {
        repliesToday += 1;
      }
    }

    if (isBookedStatusForSidebar(lead)) {
      const bookedAt = getLeadBookedAtForSidebar(lead);
      if (bookedAt && isSameLocalCalendarDay(bookedAt, today)) {
        bookedCallsToday += 1;
      }
    }
  }

  return { newLeadsToday, repliesToday, bookedCallsToday };
}

export type PortalLead = (LeadWithId & ClientMatch) & {
  id: string;
};

export async function getPortalLeads(clientId: string): Promise<PortalLead[]> {
  const leads = await getLeadsWithClientContext(clientId);
  return leads as PortalLead[];
}

export async function getPortalDashboardData(
  clientId: string
): Promise<{
  stats: Awaited<ReturnType<typeof getDashboardStats>>;
  leads: PortalLead[];
}> {
  const [stats, leads] = await Promise.all([
    getDashboardStats(clientId),
    getPortalLeads(clientId),
  ]);

  return { stats, leads };
}

export async function assertLeadBelongsToClient(
  leadId: string,
  clientId: string
): Promise<void> {
  const normalizedClientId = normalizeClientId(clientId);
  if (!normalizedClientId) throw new Error("Missing clientId");

  const leads = (await getLeadsWithClientContext(clientId)) as Array<LeadWithId & ClientMatch>;
  const exists = leads.some((l) => l.id === leadId);
  if (!exists) throw new Error("Lead not found for client");
}

export async function updateLeadStatus(leadId: string, status: string): Promise<void> {
  const normalizedStatus = String(status ?? "").trim();
  if (!normalizedStatus) throw new Error("Status is required");

  await airtablePatchRecord(LEADS_TABLE, leadId, {
    Status: normalizedStatus,
  });
}

/**
 * Typed access to the Airtable "Auth Events" table.
 * Server-only: import only from API routes or other server-side code.
 */

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AUTH_EVENTS_TABLE =
  process.env.AIRTABLE_AUTH_EVENTS_TABLE_NAME ?? "Auth Events";
const AIRTABLE_TIMEOUT_MS = 12_000;
const AIRTABLE_MAX_RETRIES = 2;

export type AuthEventType = "magic_link" | "onboarding" | "other";
export type AuthEventStatus = "pending" | "processing" | "sent" | "failed";

export type AuthEventFields = {
  "Event Type"?: AuthEventType;
  Email?: string;
  "Supabase User ID"?: string;
  "Client ID"?: string;
  Status?: AuthEventStatus;
  "Magic Link URL"?: string;
  "Error Message"?: string;
  "Created At"?: string;
  "Last Updated"?: string;
};

export type CreateAuthEventFields = {
  "Event Type": AuthEventType;
  Email: string;
  "Supabase User ID"?: string;
  "Client ID"?: string;
  Status?: AuthEventStatus;
  "Magic Link URL"?: string;
  "Error Message"?: string;
};

type AirtableRecord<T> = {
  id: string;
  fields: T;
  createdTime?: string;
};

function validateConfig(): void {
  const missing: string[] = [];
  if (!AIRTABLE_API_KEY?.trim()) missing.push("AIRTABLE_API_KEY");
  if (!AIRTABLE_BASE_ID?.trim()) missing.push("AIRTABLE_BASE_ID");
  if (missing.length > 0) {
    throw new Error(
      `Airtable Auth Events config incomplete. Required: ${missing.join(", ")}.`
    );
  }
}

function getBaseUrl(): string {
  validateConfig();
  return `https://api.airtable.com/v0/${encodeURIComponent(AIRTABLE_BASE_ID!)}/${encodeURIComponent(AUTH_EVENTS_TABLE)}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, init: RequestInit): Promise<Response> {
  let attempt = 0;
  let lastError: Error | null = null;

  while (attempt <= AIRTABLE_MAX_RETRIES) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), AIRTABLE_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (response.ok) return response;
      if (response.status !== 429 && response.status < 500) {
        return response;
      }

      const body = await response.text();
      lastError = new Error(
        `Airtable transient error (${response.status}) on ${url}: ${body}`
      );
    } catch (error) {
      clearTimeout(timeout);
      lastError =
        error instanceof Error
          ? error
          : new Error("Unknown Airtable fetch failure");
    }

    attempt += 1;
    if (attempt <= AIRTABLE_MAX_RETRIES) {
      await sleep(200 * Math.pow(2, attempt - 1));
    }
  }

  throw lastError ?? new Error(`Airtable request failed for ${url}`);
}

const headers = () => ({
  Authorization: `Bearer ${AIRTABLE_API_KEY}`,
  "Content-Type": "application/json",
});

/**
 * Create a new Auth Event record in Airtable.
 */
export async function createAuthEvent(
  fields: CreateAuthEventFields
): Promise<AirtableRecord<AuthEventFields>> {
  const url = getBaseUrl();
  const res = await fetchWithRetry(url, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      fields: {
        "Event Type": fields["Event Type"],
        Email: fields.Email,
        ...(fields["Supabase User ID"] != null && {
          "Supabase User ID": fields["Supabase User ID"],
        }),
        ...(fields["Client ID"] != null && { "Client ID": fields["Client ID"] }),
        Status: fields.Status ?? "pending",
        ...(fields["Magic Link URL"] != null && {
          "Magic Link URL": fields["Magic Link URL"],
        }),
        ...(fields["Error Message"] != null && {
          "Error Message": fields["Error Message"],
        }),
      },
    }),
    cache: "no-store",
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Airtable create Auth Event failed (${res.status}): ${text}`);
  }

  const json = JSON.parse(text) as AirtableRecord<AuthEventFields>;
  return json;
}

/**
 * Update an existing Auth Event record.
 */
export async function updateAuthEvent(
  recordId: string,
  fields: Partial<AuthEventFields>
): Promise<void> {
  const id = String(recordId ?? "").trim();
  if (!id) throw new Error("Auth Event record id is required.");

  const url = `${getBaseUrl()}/${encodeURIComponent(id)}`;
  const res = await fetchWithRetry(url, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify({ fields }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Airtable update Auth Event failed (${res.status}): ${text}`
    );
  }
}

/**
 * Fetch pending Auth Events (Status = "pending") for Make/n8n or internal processing.
 * Optional limit (1–100); records are returned in creation order.
 */
export async function getPendingAuthEvents(
  limit = 10
): Promise<AirtableRecord<AuthEventFields>[]> {
  const params = new URLSearchParams({
    filterByFormula: "{Status} = 'pending'",
    pageSize: String(Math.min(Math.max(1, limit), 100)),
  });
  params.set("sort[0][field]", "Created At");
  params.set("sort[0][direction]", "asc");
  const url = `${getBaseUrl()}?${params.toString()}`;

  const res = await fetchWithRetry(url, {
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
    },
    cache: "no-store",
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(
      `Airtable get pending Auth Events failed (${res.status}): ${text}`
    );
  }

  const json = JSON.parse(text) as { records: AirtableRecord<AuthEventFields>[] };
  return json.records ?? [];
}

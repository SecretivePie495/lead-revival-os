"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ConversationDetailPanel, {
  type LeadForDetail,
} from "@/app/components/conversations/ConversationDetailPanel";

type Lead = {
  id: string;
  "Lead Name"?: string;
  "First Name"?: string;
  Phone?: string;
  Status?: string;
  "Service/Product"?: string;
  Client_ID?: string;
  Notes?: string;
  Convo?: string;
  "Last Message Date"?: string;
  "Created Time"?: string;
  clientId?: string;
  clientName?: string;
  matched?: boolean;
  [key: string]: unknown;
};

type ConversationsClientProps = {
  initialLeads: Lead[];
  statusEndpointBase?: string;
  readOnly?: boolean;
};

// Keep this in sync with the statuses your leads actually contain (so the <select> selected value matches the Status pill color).
const STATUS_OPTIONS = [
  "New Lead",
  "Contacting",
  "Replied",
  "Nurturing",
  "Booked",
  "Not Interested",
] as const;

type SelectOption = { value: string; disabled?: boolean };

function getSelectOptionsForLead(
  currentStatus: string | undefined
): SelectOption[] {
  const normalized = currentStatus?.trim();
  const current = normalized && normalized !== "" ? normalized : "Contacted";
  const baseOptions: SelectOption[] = [...STATUS_OPTIONS].map((v) => ({ value: v }));

  // Never include "Wrong Number" in the dropdown option list.
  // If a lead is currently "Wrong Number", we render a non-editable pill instead of a select
  // (see JSX below), so the status can still match Airtable.
  if (current === "Wrong Number") return baseOptions;

  // If the current status isn't in our base list, still include it (enabled) so the select can render correctly.
  const baseValues = baseOptions.map((o) => o.value);
  if (!baseValues.includes(current)) return [...baseOptions, { value: current }];
  return baseOptions;
}

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

function getServiceLabel(lead: Lead): string {
  const candidates = [
    lead["Service/Product"],
    lead["service/product"],
  ];
  const value = candidates.find(
    (v): v is string => typeof v === "string" && v.trim() !== ""
  );
  return value ?? "—";
}

function toDetailLead(l: Lead): LeadForDetail {
  const conversationKeys = [
    "Convo",
    "Conversation",
    "Messages",
    "Transcript",
    "Chat Transcript",
  ] as const;
  const conversationFromAnyField =
    conversationKeys
      .map((key) => l[key])
      .find((value): value is string => typeof value === "string" && value.trim() !== "") ??
    undefined;

  return {
    id: l.id,
    name: l["Lead Name"] || l["First Name"] || "—",
    phone: l.Phone,
    service: getServiceLabel(l),
    status: l.Status,
    notes: l.Notes,
    convo: conversationFromAnyField,
    lastMessageDate: l["Last Message Date"],
    createdTime: l["Created Time"],
  };
}

export default function ConversationsClient({
  initialLeads,
  statusEndpointBase = "/api/leads",
  readOnly = false,
}: ConversationsClientProps) {
  const [leads, setLeads] = useState(initialLeads);
  const [search, setSearch] = useState("");
  const [selectedLead, setSelectedLead] = useState<LeadForDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [savingLeadId, setSavingLeadId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const leadsRef = useRef(leads);
  useEffect(() => {
    leadsRef.current = leads;
  }, [leads]);

  const handleRowClick = (lead: Lead) => {
    setSelectedLead(toDetailLead(lead));
    setDetailOpen(true);
  };

  const handleMoveStatus = async (leadId: string, newStatus: string) => {
    if (readOnly) return;

    const previousStatus =
      String(
        leadsRef.current.find((l) => l.id === leadId)?.Status ?? "Contacted"
      ).trim();

    setSaveError(null);
    setSavingLeadId(leadId);

    // Optimistic UI update.
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, Status: newStatus } : l))
    );
    if (selectedLead?.id === leadId) {
      setSelectedLead((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    try {
      const res = await fetch(
        `${statusEndpointBase}/${encodeURIComponent(leadId)}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (!res.ok) throw new Error("Failed to update lead status");
    } catch {
      // Revert on failure.
      setLeads((prev) =>
        prev.map((l) =>
          l.id === leadId ? { ...l, Status: previousStatus } : l
        )
      );
      if (selectedLead?.id === leadId) {
        setSelectedLead((prev) =>
          prev ? { ...prev, status: previousStatus } : null
        );
      }
      setSaveError("Could not update lead status. Please try again.");
    } finally {
      setSavingLeadId((v) => (v === leadId ? null : v));
    }
  };

  const filteredLeads = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return leads;

    return leads.filter((l) => {
      const name = String(l["Lead Name"] || l["First Name"] || "").toLowerCase();
      const phone = String(l.Phone || "").toLowerCase();
      const service = getServiceLabel(l).toLowerCase();
      const status = String(l.Status || "").toLowerCase();
      const lastMessage = String(l["Last Message Date"] || "").toLowerCase();

      return [name, phone, service, status, lastMessage].some((v) => v.includes(q));
    });
  }, [leads, search]);

  return (
    <>
      {saveError ? (
        <div className="sec-error" role="alert" style={{ marginBottom: 12 }}>
          {saveError}
        </div>
      ) : null}
      <div className="kbn-toolbar" style={{ marginBottom: 12 }}>
        <p className="kbn-toolbar-text">
          {filteredLeads.length} lead{filteredLeads.length === 1 ? "" : "s"}
          {!readOnly ? " · Search in Inbox" : " · Search"}
        </p>
        <div className="kbn-toolbar-actions">
          <div className="kbn-search-wrap">
            <svg
              className="kbn-search-icon"
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden
            >
              <circle cx="5" cy="5" r="3.5" stroke="currentColor" strokeWidth="1.3" />
              <path
                d="M9 9L7.5 7.5"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="search"
              className="kbn-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search leads..."
              aria-label="Search leads"
            />
          </div>
        </div>
      </div>
      <div className="tbl-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Service</th>
              <th>Status</th>
              <th>Last Message</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.length > 0 ? (
              filteredLeads.map((l) => {
              const status = (l.Status || "Contacted").trim();
              const pillClass = getStatusPillClass(status);

              return (
                <tr
                  key={l.id}
                  className="cursor-pointer"
                  onClick={() => handleRowClick(l)}
                >
                  <td className="td-name">
                    {l["Lead Name"] || l["First Name"] || "—"}
                  </td>
                  <td className="td-phone">{l.Phone ?? "—"}</td>
                  <td className="td-src">{getServiceLabel(l)}</td>
                  <td>
                      {readOnly ||
                      status === "Wrong Number" ||
                      status === "Contacted" ||
                      status === "Qualified" ? (
                      <span className={`pill ${pillClass}`}>
                        <span className="pill-dot"></span>
                        {status}
                      </span>
                    ) : (
                      <select
                        value={status}
                        onChange={(e) => handleMoveStatus(l.id, e.target.value)}
                        className={`pill ${pillClass}`}
                        disabled={savingLeadId === l.id}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Change status for ${l["Lead Name"] || l["First Name"] || "Lead"}`}
                      >
                        {getSelectOptionsForLead(status).map((opt) => (
                          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                            {opt.value}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="td-time">{l["Last Message Date"] ?? "—"}</td>
                </tr>
              );
              })
            ) : (
              <tr>
                <td colSpan={5} className="td-name" style={{ padding: 24 }}>
                  No leads match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConversationDetailPanel
        lead={selectedLead}
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </>
  );
}

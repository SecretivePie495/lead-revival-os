"use client";

import { useMemo, useState } from "react";

const KANBAN_STATUSES = [
  "New Lead",
  "Contacting",
  "Replied",
  "Nurturing",
  "Booked",
  "Not Interested",
] as const;

type KanbanStatus = (typeof KANBAN_STATUSES)[number];

const COLUMN_TONE: Record<KanbanStatus, string> = {
  "New Lead": "sky",
  "Contacting": "vio",
  "Replied": "sky",
  "Nurturing": "amb",
  "Booked": "grn",
  "Not Interested": "tx-3",
};

const AVATAR_PALETTES = [
  { from: "#1e3a5f", to: "#1d4ed8", text: "#93c5fd" },
  { from: "#064e3b", to: "#047857", text: "#6ee7b7" },
  { from: "#451a03", to: "#b45309", text: "#fcd34d" },
  { from: "#2e1065", to: "#6d28d9", text: "#c4b5fd" },
  { from: "#500724", to: "#9f1239", text: "#fda4af" },
  { from: "#0c4a6e", to: "#0369a1", text: "#7dd3fc" },
  { from: "#14532d", to: "#15803d", text: "#86efac" },
  { from: "#1e293b", to: "#475569", text: "#cbd5e1" },
];

type KanbanLead = {
  id: string;
  "Lead Name"?: string;
  "First Name"?: string;
  Phone?: string;
  Status?: string;
  "Service/Product"?: string;
  "Last Message Date"?: string;
  Source?: string;
  "Lead Source"?: string;
  [key: string]: unknown;
};

type KanbanBoardProps = {
  leads: KanbanLead[];
  readOnly?: boolean;
  statusEndpointBase?: string;
};

function getLeadName(lead: KanbanLead): string {
  return lead["Lead Name"] || lead["First Name"] || "—";
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getAvatarPalette(id: string) {
  const hash = Array.from(id).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return AVATAR_PALETTES[hash % AVATAR_PALETTES.length];
}

function getSourceLabel(lead: KanbanLead): string {
  const v = lead.Source ?? lead["Lead Source"];
  return typeof v === "string" && v.trim() ? v : "";
}

function getStatusTagClass(status: KanbanStatus): string {
  switch (status) {
    case "New Lead":
      return "kbn-status-new-lead";
    case "Contacting":
      return "kbn-status-contacting";
    case "Replied":
      return "kbn-status-replied";
    case "Nurturing":
      return "kbn-status-nurturing";
    case "Booked":
      return "kbn-status-booked";
    case "Not Interested":
      return "kbn-status-not-interested";
    default:
      return "kbn-status-not-interested";
  }
}

function normalizeStatus(status: string | undefined): KanbanStatus {
  const s = String(status ?? "").trim();
  const exact = KANBAN_STATUSES.find((k) => k.toLowerCase() === s.toLowerCase());
  if (exact) return exact;
  const lower = s.toLowerCase();
  if (lower.includes("new")) return "New Lead";
  if (lower.includes("contact")) return "Contacting";
  if (lower.includes("repl")) return "Replied";
  if (lower.includes("nurtur")) return "Nurturing";
  if (lower.includes("book")) return "Booked";
  if (lower.includes("not") || lower.includes("interest")) return "Not Interested";
  return "New Lead";
}

export default function KanbanBoard({
  leads,
  readOnly = false,
  statusEndpointBase = "/api/leads",
}: KanbanBoardProps) {
  const [items, setItems] = useState<KanbanLead[]>(leads);
  const [dragLeadId, setDragLeadId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [savingLeadId, setSavingLeadId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const grouped = useMemo(() => {
    const cols = KANBAN_STATUSES.reduce<Record<KanbanStatus, KanbanLead[]>>(
      (acc, s) => {
        acc[s] = [];
        return acc;
      },
      {} as Record<KanbanStatus, KanbanLead[]>
    );
    const q = search.trim().toLowerCase();
    items
      .filter((lead) => {
        if (!q) return true;
        const n = getLeadName(lead).toLowerCase();
        const svc = String(lead["Service/Product"] ?? "").toLowerCase();
        return n.includes(q) || svc.includes(q);
      })
      .forEach((lead) => {
        cols[normalizeStatus(lead.Status)].push(lead);
      });
    return cols;
  }, [items, search]);

  const moveLeadToStatus = async (leadId: string, nextStatus: KanbanStatus) => {
    const current = items.find((l) => l.id === leadId);
    if (!current || normalizeStatus(current.Status) === nextStatus) return;
    const previousItems = items;
    setSaveError(null);
    setSavingLeadId(leadId);
    setItems((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, Status: nextStatus } : l))
    );
    try {
      const res = await fetch(
        `${statusEndpointBase}/${encodeURIComponent(leadId)}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus }),
        }
      );
      if (!res.ok) throw new Error("Failed to update status");
    } catch {
      setItems(previousItems);
      setSaveError("Could not update lead status. Please try again.");
    } finally {
      setSavingLeadId((v) => (v === leadId ? null : v));
    }
  };

  return (
    <div className="kbn-wrap">
      {saveError ? (
        <div className="kbn-error" role="alert">
          {saveError}
        </div>
      ) : null}

      <div className="kbn-toolbar">
        <p className="kbn-toolbar-text">
          {items.length} lead{items.length !== 1 ? "s" : ""}
          {!readOnly ? " · Drag cards to update status" : " · Read-only"}
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
              <path d="M9 9L7.5 7.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
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

      <div className="kbn-board">
        {KANBAN_STATUSES.map((status) => {
          const cards = grouped[status];
          const tone = COLUMN_TONE[status];
          const isOver = dragOverCol === status;

          return (
            <div
              key={status}
              className={`kbn-col ${isOver ? "kbn-col-drop" : ""}`}
              onDragOver={(e) => {
                if (readOnly) return;
                e.preventDefault();
                setDragOverCol(status);
              }}
              onDragLeave={() => setDragOverCol((c) => (c === status ? null : c))}
              onDrop={async (e) => {
                if (readOnly) return;
                e.preventDefault();
                const leadId =
                  e.dataTransfer.getData("text/plain") || dragLeadId;
                if (leadId) await moveLeadToStatus(leadId, status);
                setDragLeadId(null);
                setDragOverCol(null);
              }}
            >
              <div className="kbn-col-head">
                <div className="kbn-col-title-wrap">
                  <span className={`kbn-col-dot kbn-dot-${tone}`} />
                  <span className="kbn-col-title">{status}</span>
                </div>
                <span className="kbn-col-count">{cards.length}</span>
              </div>
              <div className="kbn-cards">
                {cards.length === 0 ? (
                  <div className="kbn-empty">Drop leads here</div>
                ) : (
                  cards.map((lead) => {
                    const name = getLeadName(lead);
                    const palette = getAvatarPalette(lead.id);
                    const source = getSourceLabel(lead);
                    const isDragging = dragLeadId === lead.id;
                    const isSaving = savingLeadId === lead.id;

                    return (
                      <article
                        key={lead.id}
                        className="kbn-card"
                        draggable={!readOnly}
                        onDragStart={(e) => {
                          if (readOnly) return;
                          e.dataTransfer.setData("text/plain", lead.id);
                          setDragLeadId(lead.id);
                        }}
                        onDragEnd={() => setDragLeadId(null)}
                        style={{
                          opacity: isDragging || isSaving ? 0.65 : 1,
                          cursor: readOnly ? "default" : "grab",
                        }}
                      >
                        <div className="kbn-card-top">
                          <div className="kbn-card-lead">
                            <div
                              className="kbn-avatar"
                              style={{
                                background: `linear-gradient(135deg, ${palette.from}, ${palette.to})`,
                                color: palette.text,
                              }}
                            >
                              {getInitials(name)}
                            </div>
                            <div>
                              <p className="kbn-name">{name}</p>
                              <p className="kbn-service">
                                {lead["Service/Product"] || "—"}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="kbn-tags">
                          {source ? (
                            <span className="kbn-tag">{source}</span>
                          ) : null}
                          <span className={`kbn-tag ${getStatusTagClass(status)}`}>{status}</span>
                        </div>
                        <div className="kbn-meta">
                          <span className="kbn-meta-item">
                            {lead["Last Message Date"] || "—"}
                          </span>
                          <span className="kbn-meta-item">
                            {lead.Phone || "—"}
                          </span>
                        </div>
                        {!readOnly ? (
                          <div className="kbn-actions">
                            <select
                              className="kbn-select"
                              value={normalizeStatus(lead.Status)}
                              onChange={(e) =>
                                moveLeadToStatus(
                                  lead.id,
                                  normalizeStatus(e.target.value)
                                )
                              }
                              disabled={isSaving}
                              aria-label={`Change status for ${name}`}
                            >
                              {KANBAN_STATUSES.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : null}
                      </article>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

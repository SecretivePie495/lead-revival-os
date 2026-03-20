"use client";

import Modal from "@/app/components/ui/Modal";

export type LeadForDetail = {
  id: string;
  name: string;
  phone?: string;
  service?: string;
  status?: string;
  notes?: string;
  convo?: string;
  lastMessageDate?: string;
  createdTime?: string;
};

type ConversationDetailPanelProps = {
  lead: LeadForDetail | null;
  isOpen: boolean;
  onClose: () => void;
};

export default function ConversationDetailPanel({
  lead,
  isOpen,
  onClose,
}: ConversationDetailPanelProps) {
  if (!lead) return null;

  const messages = lead.convo
    ? lead.convo.split(/\n\n+/).filter(Boolean)
    : ["No conversation history yet."];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={lead.name} size="lg">
      <div className="space-y-4">
        <div
          className="grid gap-3 text-sm"
          style={{ gridTemplateColumns: "1fr 1fr" }}
        >
          <div>
            <span style={{ color: "var(--tx-3)", fontSize: 11 }}>Phone</span>
            <p style={{ color: "var(--tx)", fontWeight: 500 }}>{lead.phone ?? "—"}</p>
          </div>
          <div>
            <span style={{ color: "var(--tx-3)", fontSize: 11 }}>Service</span>
            <p style={{ color: "var(--tx)", fontWeight: 500 }}>{lead.service ?? "—"}</p>
          </div>
          <div>
            <span style={{ color: "var(--tx-3)", fontSize: 11 }}>Status</span>
            <p style={{ color: "var(--tx)", fontWeight: 500 }}>{lead.status ?? "—"}</p>
          </div>
          {lead.lastMessageDate && (
            <div>
              <span style={{ color: "var(--tx-3)", fontSize: 11 }}>Last message</span>
              <p style={{ color: "var(--tx-2)", fontSize: 12 }}>{lead.lastMessageDate}</p>
            </div>
          )}
        </div>
        {lead.notes && (
          <div>
            <p style={{ color: "var(--tx-3)", fontSize: 11, marginBottom: 4 }}>Notes</p>
            <p style={{ color: "var(--tx-2)", fontSize: 12 }}>{lead.notes}</p>
          </div>
        )}
        <div>
          <p style={{ color: "var(--tx-3)", fontSize: 11, marginBottom: 8 }}>
            Conversation history
          </p>
          <div
            className="space-y-2 rounded p-3 max-h-64 overflow-y-auto"
            style={{
              background: "var(--panel-2)",
              border: "1px solid var(--line)",
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  color: "var(--tx-2)",
                  fontSize: 12,
                  padding: "6px 0",
                  borderBottom: i < messages.length - 1 ? "1px solid var(--line)" : "none",
                }}
              >
                {msg}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

"use client";

import type { Sequence } from "@/lib/types/playbooks";

type SequenceOverviewProps = {
  sequence: Sequence;
};

export default function SequenceOverview({
  sequence,
}: SequenceOverviewProps) {
  return (
    <div
      className="rounded-[var(--r)] border p-4"
      style={{
        background: "var(--panel)",
        borderColor: "var(--line)",
      }}
    >
      <div className="section-hd mb-4">
        <p className="sec-lbl">Sequence Overview</p>
      </div>
      <div className="grid gap-3 text-sm" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div>
          <span style={{ color: "var(--tx-3)", fontSize: 11 }}>Name</span>
          <p style={{ color: "var(--tx)", fontWeight: 500 }}>{sequence.name}</p>
        </div>
        <div>
          <span style={{ color: "var(--tx-3)", fontSize: 11 }}>Client</span>
          <p style={{ color: "var(--tx)", fontWeight: 500 }}>{sequence.clientName ?? "All"}</p>
        </div>
        <div>
          <span style={{ color: "var(--tx-3)", fontSize: 11 }}>Template</span>
          <p style={{ color: "var(--tx)", fontWeight: 500 }}>{sequence.templateName ?? "Custom"}</p>
        </div>
        <div>
          <span style={{ color: "var(--tx-3)", fontSize: 11 }}>Status</span>
          <p>
            <span
              className={`status-tag ${sequence.status === "Active" ? "st-run" : sequence.status === "Paused" ? "st-pau" : "st-don"}`}
            >
              {sequence.status}
            </span>
          </p>
        </div>
      </div>
      {sequence.targetingSummary && (
        <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--line)" }}>
          <span style={{ color: "var(--tx-3)", fontSize: 11 }}>Targeting</span>
          <p style={{ color: "var(--tx-2)", fontSize: 12 }}>
            {sequence.targetingSummary}
          </p>
        </div>
      )}
    </div>
  );
}

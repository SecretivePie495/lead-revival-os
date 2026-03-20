"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import SequenceOverview from "@/app/components/playbooks/SequenceOverview";
import LogicTogglesComponent from "@/app/components/playbooks/LogicToggles";
import { MOCK_SEQUENCES_INITIAL } from "@/lib/mock/sequences";

export default function PortalSequenceDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const sequence = MOCK_SEQUENCES_INITIAL.find((s) => s.id === id);

  if (!sequence) {
    return (
      <main>
        <p style={{ color: "var(--tx-2)" }}>Sequence not found.</p>
        <Link href="/portal/playbooks/sequences" className="btn mt-4">
          Back to sequences
        </Link>
      </main>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/portal/playbooks/sequences" className="btn" style={{ fontSize: 11 }}>
        ← Back to sequences
      </Link>

      <SequenceOverview sequence={sequence} />

      <div className="space-y-4">
        <div className="section-hd">
          <p className="sec-lbl">Steps</p>
          <p className="sec-sub">{sequence.steps.length} steps in this sequence</p>
        </div>
        <div className="space-y-3">
          {sequence.steps.map((step) => (
            <div
              key={step.id}
              className="rounded-[var(--r)] border p-4"
              style={{ background: "var(--panel)", borderColor: "var(--line)" }}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="status-tag st-run">Day {step.dayOffset}</span>
                <span className="text-xs" style={{ color: "var(--tx-3)" }}>
                  Step #{step.order + 1}
                </span>
              </div>
              <p style={{ color: "var(--tx-2)", fontSize: 13 }}>{step.message}</p>
            </div>
          ))}
        </div>
      </div>

      <LogicTogglesComponent toggles={sequence.logicToggles} />
    </div>
  );
}

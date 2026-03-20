"use client";

import type { LogicToggles } from "@/lib/types/playbooks";

type LogicTogglesProps = {
  toggles: LogicToggles;
  onChange?: (toggles: LogicToggles) => void;
};

export default function LogicTogglesComponent({
  toggles,
  onChange,
}: LogicTogglesProps) {
  const handleToggle = (key: keyof LogicToggles, value: boolean) => {
    onChange?.({ ...toggles, [key]: value });
  };

  return (
    <div
      className="rounded-[var(--r)] border p-4"
      style={{
        background: "var(--panel)",
        borderColor: "var(--line)",
      }}
    >
      <div className="section-hd mb-4">
        <p className="sec-lbl">Logic</p>
        <p className="sec-sub">Sequence behavior options</p>
      </div>
      <div className="space-y-3">
        <label className="flex cursor-pointer items-center justify-between gap-4">
          <span style={{ color: "var(--tx-2)", fontSize: 12 }}>
            Stop sequence on any reply
          </span>
          <input
            type="checkbox"
            checked={toggles.stopOnReply}
            onChange={(e) => handleToggle("stopOnReply", e.target.checked)}
            disabled={!onChange}
            className="h-4 w-4 rounded"
          />
        </label>
        <label className="flex cursor-pointer items-center justify-between gap-4">
          <span style={{ color: "var(--tx-2)", fontSize: 12 }}>
            Unsubscribe on STOP
          </span>
          <input
            type="checkbox"
            checked={toggles.unsubscribeOnStop}
            onChange={(e) => handleToggle("unsubscribeOnStop", e.target.checked)}
            disabled={!onChange}
            className="h-4 w-4 rounded"
          />
        </label>
        <label className="flex cursor-pointer items-center justify-between gap-4">
          <span style={{ color: "var(--tx-2)", fontSize: 12 }}>
            Mark qualified when they answer required questions
          </span>
          <input
            type="checkbox"
            checked={toggles.markQualifiedOnRequiredAnswers}
            onChange={(e) =>
              handleToggle("markQualifiedOnRequiredAnswers", e.target.checked)
            }
            disabled={!onChange}
            className="h-4 w-4 rounded"
          />
        </label>
      </div>
    </div>
  );
}

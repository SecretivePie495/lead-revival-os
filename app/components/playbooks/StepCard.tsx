"use client";

import { useState } from "react";
import MessageVariablePicker from "./MessageVariablePicker";
import type { Step } from "@/lib/types/playbooks";

type StepCardProps = {
  step: Step;
  onUpdate?: (stepId: string, updates: Partial<Step>) => void;
  onDuplicate?: (stepId: string) => void;
  onDelete?: (stepId: string) => void;
};

export default function StepCard({
  step,
  onUpdate,
  onDuplicate,
  onDelete,
}: StepCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState(step.message);

  const handleInsertVariable = (variable: string) => {
    setMessage((prev) => prev + variable);
  };

  const handleSave = () => {
    onUpdate?.(step.id, { message });
    setIsEditing(false);
  };

  return (
    <div
      className="camp flex flex-col gap-3"
      style={{ padding: 12 }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex shrink-0 items-center gap-2">
          <span
            className="rounded px-2 py-0.5 font-mono text-xs"
            style={{
              background: "var(--sky-bg)",
              color: "var(--sky)",
              border: "1px solid var(--line-accent)",
            }}
          >
            Day {step.dayOffset}
          </span>
          {step.timeWindow && (
            <span style={{ color: "var(--tx-3)", fontSize: 11 }}>
              {step.timeWindow}
            </span>
          )}
        </div>
        <div className="flex gap-1">
          {onDuplicate && (
            <button
              type="button"
              className="btn"
              style={{ padding: "3px 6px", fontSize: 10 }}
              onClick={() => onDuplicate(step.id)}
            >
              Duplicate
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              className="btn"
              style={{ padding: "3px 6px", fontSize: 10, color: "var(--amb)" }}
              onClick={() => onDelete(step.id)}
            >
              Delete
            </button>
          )}
        </div>
      </div>
      {isEditing ? (
        <div className="space-y-2">
          <MessageVariablePicker onInsert={handleInsertVariable} />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full rounded px-2 py-1.5 text-sm"
            style={{
              background: "var(--panel-2)",
              border: "1px solid var(--line)",
              color: "var(--tx)",
            }}
          />
          <div className="flex gap-2">
            <button type="button" className="btn btn-accent" onClick={handleSave}>
              Save
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setMessage(step.message);
                setIsEditing(false);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div
          className="cursor-pointer rounded p-2 text-sm"
          style={{
            background: "var(--panel-2)",
            border: "1px solid var(--line)",
            color: "var(--tx-2)",
          }}
          onClick={() => setIsEditing(true)}
        >
          {step.message}
        </div>
      )}
    </div>
  );
}

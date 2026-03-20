"use client";

import { useState } from "react";
import StepCard from "./StepCard";
import MessageVariablePicker from "./MessageVariablePicker";
import type { Step } from "@/lib/types/playbooks";

type StepsListProps = {
  steps: Step[];
  onAddStep?: (dayOffset: number, message: string) => void;
  onDuplicateStep?: (stepId: string) => void;
  onDeleteStep?: (stepId: string) => void;
  onUpdateStep?: (stepId: string, updates: Partial<Step>) => void;
};

export default function StepsList({
  steps,
  onAddStep,
  onDuplicateStep,
  onDeleteStep,
  onUpdateStep,
}: StepsListProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDay, setNewDay] = useState(0);
  const [newMessage, setNewMessage] = useState("");

  const handleInsertVariable = (variable: string) => {
    setNewMessage((prev) => prev + variable);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    onAddStep?.(newDay, newMessage);
    setNewDay(0);
    setNewMessage("");
    setShowAddForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="section-hd">
        <p className="sec-lbl">Steps</p>
        <p className="sec-sub">{steps.length} steps in this sequence</p>
      </div>
      <div className="space-y-3">
        {steps.map((step) => (
          <StepCard
            key={step.id}
            step={step}
            onUpdate={onUpdateStep}
            onDuplicate={onDuplicateStep}
            onDelete={onDeleteStep}
          />
        ))}
      </div>
      {showAddForm ? (
        <form
          onSubmit={handleAdd}
          className="rounded-[var(--r)] border p-4"
          style={{
            background: "var(--panel-2)",
            borderColor: "var(--line)",
          }}
        >
          <MessageVariablePicker onInsert={handleInsertVariable} />
          <div className="mb-3 mt-2 flex gap-3">
            <div>
              <label className="mb-1 block text-xs" style={{ color: "var(--tx-3)" }}>
                Day
              </label>
              <input
                type="number"
                min={0}
                value={newDay}
                onChange={(e) => setNewDay(Number(e.target.value))}
                className="w-20 rounded px-2 py-1.5 text-sm"
                style={{
                  background: "var(--panel)",
                  border: "1px solid var(--line)",
                  color: "var(--tx)",
                }}
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="mb-1 block text-xs" style={{ color: "var(--tx-3)" }}>
              Message
            </label>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Enter message content... Use {name} and {service} as variables."
              rows={3}
              required
              className="w-full rounded px-2 py-1.5 text-sm"
              style={{
                background: "var(--panel)",
                border: "1px solid var(--line)",
                color: "var(--tx)",
              }}
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn btn-accent">
              Add Step
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          className="btn btn-accent w-full"
          onClick={() => setShowAddForm(true)}
        >
          + Add Step
        </button>
      )}
    </div>
  );
}

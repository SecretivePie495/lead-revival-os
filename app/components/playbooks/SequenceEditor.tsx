"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SequenceOverview from "./SequenceOverview";
import StepsList from "./StepsList";
import LogicTogglesComponent from "./LogicToggles";
import type { Sequence } from "@/lib/types/playbooks";
import { usePlaybooks } from "@/lib/playbooks-context";

type SequenceEditorProps = {
  sequence: Sequence;
};

export default function SequenceEditor({ sequence }: SequenceEditorProps) {
  const router = useRouter();
  const { updateSequence, getSequence } = usePlaybooks();
  const seq = getSequence(sequence.id) ?? sequence;
  const [submitted, setSubmitted] = useState(false);

  const handleAddStep = (dayOffset: number, message: string) => {
    const newStep = {
      id: `step-${Date.now()}`,
      dayOffset,
      message,
      order: seq.steps.length,
    };
    updateSequence(seq.id, {
      steps: [...seq.steps, newStep].sort((a, b) => a.order - b.order),
    });
  };

  const handleDuplicateStep = (stepId: string) => {
    const step = seq.steps.find((s) => s.id === stepId);
    if (!step) return;
    const newStep = {
      ...step,
      id: `step-${Date.now()}`,
      order: step.order + 1,
    };
    const newSteps = [...seq.steps, newStep].sort((a, b) => a.order - b.order);
    updateSequence(seq.id, { steps: newSteps });
  };

  const handleDeleteStep = (stepId: string) => {
    updateSequence(seq.id, {
      steps: seq.steps.filter((s) => s.id !== stepId),
    });
  };

  const handleUpdateStep = (stepId: string, updates: Partial<{ message: string; dayOffset: number }>) => {
    updateSequence(seq.id, {
      steps: seq.steps.map((s) =>
        s.id === stepId ? { ...s, ...updates } : s
      ),
    });
  };

  const handleUpdateLogic = (toggles: Sequence["logicToggles"]) => {
    updateSequence(seq.id, { logicToggles: toggles });
  };

  const handleSubmit = () => {
    updateSequence(seq.id, { lastUpdated: new Date().toISOString() });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      router.push("/playbooks/sequences");
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <Link href="/playbooks/sequences" className="btn" style={{ fontSize: 11 }}>
        ← Back to sequences
      </Link>
      <SequenceOverview sequence={seq} />
      <StepsList
        steps={seq.steps}
        onAddStep={handleAddStep}
        onDuplicateStep={handleDuplicateStep}
        onDeleteStep={handleDeleteStep}
        onUpdateStep={handleUpdateStep}
      />
      <LogicTogglesComponent
        toggles={seq.logicToggles}
        onChange={handleUpdateLogic}
      />
      <div className="pt-4" style={{ borderTop: "1px solid var(--line)" }}>
        <button
          type="button"
          className="btn btn-accent"
          onClick={handleSubmit}
          disabled={submitted}
        >
          {submitted ? "Saved — redirecting…" : "Submit"}
        </button>
      </div>
    </div>
  );
}

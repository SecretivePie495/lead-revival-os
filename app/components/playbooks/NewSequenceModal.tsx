"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/app/components/ui/Modal";
import { usePlaybooks } from "@/lib/playbooks-context";
import CreateTemplateModal from "./CreateTemplateModal";

type NewSequenceModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function NewSequenceModal({
  isOpen,
  onClose,
}: NewSequenceModalProps) {
  const router = useRouter();
  const { templates, addSequence, createSequenceFromTemplate } = usePlaybooks();
  const [mode, setMode] = useState<"choice" | "template" | "create-template">("choice");
  const [templateId, setTemplateId] = useState("");
  const [name, setName] = useState("");

  const handleUseTemplate = () => {
    setMode("template");
    setTemplateId(templates[0]?.id ?? "");
  };

  const handleCreateFromTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    const template = templates.find((t) => t.id === templateId);
    if (template && name.trim()) {
      const seq = createSequenceFromTemplate(templateId, name.trim());
      onClose();
      setMode("choice");
      setName("");
      router.push(`/playbooks/sequences/${seq.id}`);
    }
  };

  const handleBuildFromScratch = () => {
    const seq = addSequence({
      name: "New Sequence",
      templateId: null,
      templateName: null,
      clientId: null,
      clientName: null,
      status: "Draft",
      steps: [],
      logicToggles: {
        stopOnReply: true,
        unsubscribeOnStop: true,
        markQualifiedOnRequiredAnswers: false,
      },
    });
    onClose();
    setMode("choice");
    router.push(`/playbooks/sequences/${seq.id}`);
  };

  const handleCreateTemplate = () => {
    setMode("create-template");
  };

  if (mode === "create-template") {
    return (
      <CreateTemplateModal
        isOpen={isOpen}
        onClose={() => setMode("choice")}
      />
    );
  }

  if (mode === "template" && templates.length > 0) {
    return (
      <Modal isOpen={isOpen} onClose={() => { setMode("choice"); onClose(); }} title="Create from template">
        <form onSubmit={handleCreateFromTemplate} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider" style={{ color: "var(--tx-3)" }}>
              Template
            </label>
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="w-full rounded px-3 py-2 text-sm"
              style={{
                background: "var(--panel-2)",
                border: "1px solid var(--line)",
                color: "var(--tx)",
              }}
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider" style={{ color: "var(--tx-3)" }}>
              Sequence name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded px-3 py-2 text-sm"
              style={{
                background: "var(--panel-2)",
                border: "1px solid var(--line)",
                color: "var(--tx)",
              }}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn" onClick={() => setMode("choice")}>
              Back
            </button>
            <button type="submit" className="btn btn-accent">Create</button>
          </div>
        </form>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Sequence">
      <div className="space-y-3">
        <p style={{ color: "var(--tx-2)", fontSize: 13 }}>
          Start from a template or build your own sequence from scratch.
        </p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            className="btn btn-accent block text-center"
            onClick={handleUseTemplate}
          >
            Start from template
          </button>
          <button
            type="button"
            className="btn block text-center"
            onClick={handleBuildFromScratch}
          >
            Build from scratch
          </button>
          <button
            type="button"
            className="btn block text-center"
            onClick={handleCreateTemplate}
          >
            + Create new template
          </button>
        </div>
      </div>
    </Modal>
  );
}

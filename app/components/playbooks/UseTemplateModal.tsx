"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/app/components/ui/Modal";
import type { PlaybookTemplate } from "@/lib/types/playbooks";
import { usePlaybooks } from "@/lib/playbooks-context";

type UseTemplateModalProps = {
  template: PlaybookTemplate | null;
  isOpen: boolean;
  onClose: () => void;
};

export default function UseTemplateModal({
  template,
  isOpen,
  onClose,
}: UseTemplateModalProps) {
  const router = useRouter();
  const { createSequenceFromTemplate } = usePlaybooks();
  const [name, setName] = useState("");
  const [clientId, setClientId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!template) return;
    const seq = createSequenceFromTemplate(template.id, name.trim(), clientId || undefined);
    setName("");
    setClientId("");
    onClose();
    router.push(`/playbooks/sequences/${seq.id}`);
  };

  if (!template) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Create sequence from "${template.name}"`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="seq-name"
            className="mb-1.5 block text-xs font-medium uppercase tracking-wider"
            style={{ color: "var(--tx-3)" }}
          >
            Sequence name
          </label>
          <input
            id="seq-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. My Wake Up Sequence"
            required
            className="w-full rounded px-3 py-2 text-sm"
            style={{
              background: "var(--panel-2)",
              border: "1px solid var(--line)",
              color: "var(--tx)",
            }}
          />
        </div>
        <div>
          <label
            htmlFor="client"
            className="mb-1.5 block text-xs font-medium uppercase tracking-wider"
            style={{ color: "var(--tx-3)" }}
          >
            Client (optional)
          </label>
          <select
            id="client"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full rounded px-3 py-2 text-sm"
            style={{
              background: "var(--panel-2)",
              border: "1px solid var(--line)",
              color: "var(--tx)",
            }}
          >
            <option value="">None</option>
            <option value="c1">Phoenix Solar & Home</option>
          </select>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-accent">
            Create Sequence
          </button>
        </div>
      </form>
    </Modal>
  );
}

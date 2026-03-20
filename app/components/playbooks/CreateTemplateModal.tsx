"use client";

import { useState } from "react";
import Modal from "@/app/components/ui/Modal";
import { usePlaybooks } from "@/lib/playbooks-context";

type CreateTemplateModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CreateTemplateModal({
  isOpen,
  onClose,
}: CreateTemplateModalProps) {
  const { addTemplate } = usePlaybooks();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTemplate({
      name: name.trim(),
      description: description.trim(),
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      exampleSteps: [
        { day: 0, message: `Hi {{name}}, ${name}...` },
        { day: 2, message: "Follow-up message." },
      ],
    });
    setName("");
    setDescription("");
    setTags("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create template">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider" style={{ color: "var(--tx-3)" }}>
            Name
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
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider" style={{ color: "var(--tx-3)" }}>
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded px-3 py-2 text-sm"
            style={{
              background: "var(--panel-2)",
              border: "1px solid var(--line)",
              color: "var(--tx)",
            }}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider" style={{ color: "var(--tx-3)" }}>
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Revival, No-Show, ..."
            className="w-full rounded px-3 py-2 text-sm"
            style={{
              background: "var(--panel-2)",
              border: "1px solid var(--line)",
              color: "var(--tx)",
            }}
          />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-accent">
            Create template
          </button>
        </div>
      </form>
    </Modal>
  );
}

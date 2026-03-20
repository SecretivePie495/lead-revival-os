"use client";

import Modal from "@/app/components/ui/Modal";
import type { PlaybookTemplate } from "@/lib/types/playbooks";

type TemplateDetailModalProps = {
  template: PlaybookTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onUseTemplate: (template: PlaybookTemplate) => void;
};

export default function TemplateDetailModal({
  template,
  isOpen,
  onClose,
  onUseTemplate,
}: TemplateDetailModalProps) {
  if (!template) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={template.name} size="lg">
      <div className="space-y-4">
        <p style={{ color: "var(--tx-2)", fontSize: 13 }}>{template.description}</p>
        {template.builtFor && (
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--tx-3)" }}>
            Built for: {template.builtFor}
          </p>
        )}
        {template.exampleSteps && template.exampleSteps.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--tx-3)" }}>
              Example steps
            </p>
            <div
              className="space-y-2 rounded p-3"
              style={{ background: "var(--panel-2)", border: "1px solid var(--line)" }}
            >
              {template.exampleSteps.map((step, i) => (
                <div key={i} className="flex gap-3 text-sm" style={{ color: "var(--tx-2)" }}>
                  <span className="shrink-0 font-mono text-xs" style={{ color: "var(--sky)" }}>
                    Day {step.day}
                  </span>
                  <span>{step.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="flex justify-end pt-4">
          <button
            type="button"
            className="btn btn-accent"
            onClick={() => {
              onClose();
              onUseTemplate(template);
            }}
          >
            Use Template
          </button>
        </div>
      </div>
    </Modal>
  );
}

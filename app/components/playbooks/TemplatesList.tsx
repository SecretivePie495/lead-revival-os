"use client";

import { useState } from "react";
import TemplateCard from "./TemplateCard";
import TemplateDetailModal from "./TemplateDetailModal";
import UseTemplateModal from "./UseTemplateModal";
import CreateTemplateModal from "./CreateTemplateModal";
import type { PlaybookTemplate } from "@/lib/types/playbooks";
import { usePlaybooks } from "@/lib/playbooks-context";

export default function TemplatesList() {
  const { templates } = usePlaybooks();
  const [detailTemplate, setDetailTemplate] = useState<PlaybookTemplate | null>(null);
  const [useTemplate, setUseTemplate] = useState<PlaybookTemplate | null>(null);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);

  const handleUseTemplate = (template: PlaybookTemplate) => {
    setDetailTemplate(null);
    setUseTemplate(template);
  };

  return (
    <>
      <div className="section-hd">
        <div>
          <p className="sec-lbl">Template library</p>
          <p className="sec-sub">
            Reusable message flows — start from a template, then customize steps.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-accent"
          onClick={() => setShowCreateTemplate(true)}
        >
          + New template
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="pb-empty">
          <p className="pb-empty-title">No templates yet</p>
          <p className="pb-empty-sub">
            Create your first template to define example steps and tags. Sequences can
            then be built from these blueprints.
          </p>
          <button
            type="button"
            className="btn btn-accent"
            onClick={() => setShowCreateTemplate(true)}
          >
            + Create template
          </button>
        </div>
      ) : (
        <div className="pb-template-grid">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onViewDetail={setDetailTemplate}
              onUseTemplate={handleUseTemplate}
            />
          ))}
        </div>
      )}

      <TemplateDetailModal
        template={detailTemplate}
        isOpen={!!detailTemplate}
        onClose={() => setDetailTemplate(null)}
        onUseTemplate={handleUseTemplate}
      />
      <UseTemplateModal
        template={useTemplate}
        isOpen={!!useTemplate}
        onClose={() => setUseTemplate(null)}
      />
      <CreateTemplateModal
        isOpen={showCreateTemplate}
        onClose={() => setShowCreateTemplate(false)}
      />
    </>
  );
}

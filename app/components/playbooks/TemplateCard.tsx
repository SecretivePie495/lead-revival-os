"use client";

import type { PlaybookTemplate } from "@/lib/types/playbooks";

type TemplateCardProps = {
  template: PlaybookTemplate;
  onViewDetail: (template: PlaybookTemplate) => void;
  onUseTemplate: (template: PlaybookTemplate) => void;
};

const MAX_TAGS = 3;

export default function TemplateCard({
  template,
  onViewDetail,
  onUseTemplate,
}: TemplateCardProps) {
  const stepCount = template.exampleSteps?.length ?? 0;
  const tags = template.tags ?? [];
  const visibleTags = tags.slice(0, MAX_TAGS);
  const extra = tags.length - visibleTags.length;

  return (
    <article className="pb-template-card">
      <p className="pb-template-kicker">Template</p>
      <h3 className="pb-template-name">{template.name}</h3>
      <p className="pb-template-desc">{template.description}</p>

      <div className="pb-template-meta">
        <div className="pb-template-meta-item">
          <strong>Steps</strong>
          {stepCount > 0 ? `${stepCount} example` : "—"}
        </div>
        {template.builtFor ? (
          <div className="pb-template-meta-item" style={{ flex: "1 1 180px" }}>
            <strong>Built for</strong>
            {template.builtFor}
          </div>
        ) : null}
      </div>

      {tags.length > 0 ? (
        <div className="pb-template-tags">
          <p className="pb-template-tags-label">Tags</p>
          <div className="pb-tag-row">
            {visibleTags.map((tag) => (
              <span key={tag} className="pb-tag">
                {tag}
              </span>
            ))}
            {extra > 0 ? <span className="pb-tag-more">+{extra}</span> : null}
          </div>
        </div>
      ) : null}

      <div className="pb-template-actions">
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => onViewDetail(template)}
        >
          View details
        </button>
        <button
          type="button"
          className="btn btn-accent btn-sm"
          onClick={() => onUseTemplate(template)}
        >
          Use template
        </button>
      </div>
    </article>
  );
}

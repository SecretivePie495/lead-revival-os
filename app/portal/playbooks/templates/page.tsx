import { MOCK_TEMPLATES } from "@/lib/mock/playbook-templates";

const MAX_TAGS = 3;

export default function PortalTemplatesPage() {
  return (
    <>
      <div className="section-hd">
        <div>
          <p className="sec-lbl">Template library</p>
          <p className="sec-sub">Read-only preview of available playbook templates.</p>
        </div>
        <span className="btn btn-ghost btn-sm" style={{ pointerEvents: "none", opacity: 0.85 }}>
          Read-only
        </span>
      </div>

      <div className="pb-template-grid">
        {MOCK_TEMPLATES.map((template) => {
          const stepCount = template.exampleSteps?.length ?? 0;
          const tags = template.tags ?? [];
          const visibleTags = tags.slice(0, MAX_TAGS);
          const extra = tags.length - visibleTags.length;

          return (
            <article key={template.id} className="pb-template-card">
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

              <div className="pb-template-actions" style={{ justifyContent: "flex-start" }}>
                <span className="pb-template-meta-item" style={{ margin: 0 }}>
                  Preview only — editing is disabled in the client portal.
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}

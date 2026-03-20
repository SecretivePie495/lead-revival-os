"use client";

import { useState } from "react";
import SequenceRow from "./SequenceRow";
import NewSequenceModal from "./NewSequenceModal";
import CreateTemplateModal from "./CreateTemplateModal";
import { usePlaybooks } from "@/lib/playbooks-context";

export default function SequencesList() {
  const { sequences, updateSequence } = usePlaybooks();
  const [showNewModal, setShowNewModal] = useState(false);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [view, setView] = useState<"active" | "archived">("active");

  const handleArchive = (id: string) => {
    updateSequence(id, { status: "Archived" });
  };

  const handleUnarchive = (id: string) => {
    updateSequence(id, { status: "Draft" });
  };

  const activeSequences = sequences.filter((s) => s.status !== "Archived");
  const archivedSequences = sequences.filter((s) => s.status === "Archived");
  const archivedCount = archivedSequences.length;
  const showing = view === "archived" ? archivedSequences : activeSequences;

  return (
    <>
      <div className="section-hd">
        <div>
          <p className="sec-lbl">Sequences</p>
          <p className="sec-sub">
            {view === "active"
              ? `${activeSequences.length} in workspace · ${archivedCount} archived`
              : `${archivedCount} archived sequence${archivedCount === 1 ? "" : "s"}`}
          </p>
        </div>
        <div className="pb-seq-toolbar">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setShowCreateTemplate(true)}
          >
            + New template
          </button>
          <button className="btn btn-accent" onClick={() => setShowNewModal(true)}>
            + New sequence
          </button>
          <button
            type="button"
            className="btn btn-sm pb-seq-toggle"
            onClick={() => setView(view === "archived" ? "active" : "archived")}
            aria-pressed={view === "archived"}
          >
            Archived
            {archivedCount > 0 ? (
              <span className="pb-seq-badge">{archivedCount}</span>
            ) : null}
          </button>
        </div>
      </div>

      <div className="tbl-wrap pb-seq-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Template</th>
              <th>Status</th>
              <th>Last updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {showing.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="pb-empty" style={{ border: "none", background: "transparent" }}>
                    <p className="pb-empty-title">
                      {view === "archived" ? "No archived sequences" : "No sequences yet"}
                    </p>
                    <p className="pb-empty-sub">
                      {view === "archived"
                        ? "Archived sequences appear here when you archive them from the list."
                        : "Create a sequence from a template or from scratch, then configure steps and logic."}
                    </p>
                    {view === "active" ? (
                      <button
                        type="button"
                        className="btn btn-accent"
                        onClick={() => setShowNewModal(true)}
                      >
                        + New sequence
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ) : (
              showing.map((seq) => (
                <SequenceRow
                  key={seq.id}
                  sequence={seq}
                  onArchive={handleArchive}
                  onUnarchive={view === "archived" ? handleUnarchive : undefined}
                  showUnarchive={view === "archived"}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <NewSequenceModal isOpen={showNewModal} onClose={() => setShowNewModal(false)} />
      <CreateTemplateModal
        isOpen={showCreateTemplate}
        onClose={() => setShowCreateTemplate(false)}
      />
    </>
  );
}

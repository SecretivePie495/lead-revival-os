"use client";

import Link from "next/link";
import type { Sequence } from "@/lib/types/playbooks";

type SequenceRowProps = {
  sequence: Sequence;
  onArchive?: (id: string) => void;
  onUnarchive?: (id: string) => void;
  showUnarchive?: boolean;
  /** Base path for the sequence detail link (default: main app). */
  sequenceBasePath?: string;
  /** Label for the primary link (default: Open). */
  linkLabel?: string;
};

function statusClass(status: string): string {
  switch (status) {
    case "Active":
      return "st-run";
    case "Paused":
      return "st-pau";
    case "Archived":
      return "st-arch";
    case "Draft":
      return "st-draft";
    default:
      return "st-draft";
  }
}

function formatRelativeUpdated(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return d.toLocaleDateString();
}

export default function SequenceRow({
  sequence,
  onArchive,
  onUnarchive,
  showUnarchive,
  sequenceBasePath = "/playbooks/sequences",
  linkLabel = "Open",
}: SequenceRowProps) {
  const fullDate = new Date(sequence.lastUpdated).toLocaleString();
  const detailHref = `${sequenceBasePath.replace(/\/$/, "")}/${sequence.id}`;

  return (
    <tr className="pb-seq-row">
      <td>
        <div className="pb-seq-name">{sequence.name}</div>
      </td>
      <td>
        <div className="pb-seq-template">{sequence.templateName ?? "—"}</div>
      </td>
      <td>
        <span className={`status-tag ${statusClass(sequence.status)}`}>
          {sequence.status}
        </span>
      </td>
      <td className="td-time" title={fullDate}>
        {formatRelativeUpdated(sequence.lastUpdated)}
      </td>
      <td>
        <div className="flex gap-1" style={{ justifyContent: "flex-end" }}>
          <Link href={detailHref} className="btn btn-accent btn-sm">
            {linkLabel}
          </Link>
          {sequence.status !== "Archived" && onArchive && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => onArchive(sequence.id)}
            >
              Archive
            </button>
          )}
          {showUnarchive && onUnarchive && (
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => onUnarchive(sequence.id)}
            >
              Unarchive
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

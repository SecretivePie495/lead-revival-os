import SequenceRow from "@/app/components/playbooks/SequenceRow";
import { MOCK_SEQUENCES_INITIAL } from "@/lib/mock/sequences";

export default function PortalSequencesPage() {
  const activeSequences = MOCK_SEQUENCES_INITIAL.filter((s) => s.status !== "Archived");
  const archivedCount = MOCK_SEQUENCES_INITIAL.filter(
    (s) => s.status === "Archived"
  ).length;

  return (
    <>
      <div className="section-hd">
        <div>
          <p className="sec-lbl">Sequences</p>
          <p className="sec-sub">
            {activeSequences.length} in workspace · {archivedCount} archived
          </p>
        </div>
        <span className="btn btn-ghost btn-sm" style={{ pointerEvents: "none", opacity: 0.85 }}>
          Read-only
        </span>
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
            {activeSequences.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="pb-empty" style={{ border: "none", background: "transparent" }}>
                    <p className="pb-empty-title">No sequences</p>
                    <p className="pb-empty-sub">There are no active sequences to show.</p>
                  </div>
                </td>
              </tr>
            ) : (
              activeSequences.map((sequence) => (
                <SequenceRow
                  key={sequence.id}
                  sequence={sequence}
                  sequenceBasePath="/portal/playbooks/sequences"
                  linkLabel="View"
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

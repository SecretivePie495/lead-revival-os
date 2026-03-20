"use client";

import { useParams } from "next/navigation";
import SequenceEditor from "@/app/components/playbooks/SequenceEditor";
import { usePlaybooks } from "@/lib/playbooks-context";

export default function SequenceEditorPage() {
  const params = useParams();
  const id = params.id as string;
  const { getSequence } = usePlaybooks();
  const sequence = getSequence(id);

  if (!sequence) {
    return (
      <main>
        <p style={{ color: "var(--tx-2)" }}>Sequence not found.</p>
        <a href="/playbooks/sequences" className="btn mt-4">
          Back to sequences
        </a>
      </main>
    );
  }

  return <SequenceEditor sequence={sequence} />;
}

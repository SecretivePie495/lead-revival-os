"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="shell" style={{ padding: 32 }}>
      <div
        style={{
          background: "var(--panel)",
          border: "1px solid var(--line)",
          borderRadius: 6,
          padding: 24,
          maxWidth: 600,
        }}
      >
        <h2 style={{ color: "var(--tx)", marginBottom: 8 }}>
          Something went wrong
        </h2>
        <pre
          style={{
            color: "var(--tx-2)",
            fontSize: 12,
            fontFamily: "IBM Plex Mono, monospace",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            marginBottom: 16,
          }}
        >
          {error.message}
        </pre>
        <button className="btn btn-accent" type="button" onClick={() => reset()}>
          Try again
        </button>
      </div>
    </div>
  );
}

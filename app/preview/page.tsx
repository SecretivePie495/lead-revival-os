"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";

function PreviewInner() {
  const searchParams = useSearchParams();
  const rawPath = searchParams.get("path") || "/analytics";
  const path = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
  const clientId = searchParams.get("clientId");

  const src = useMemo(() => {
    if (typeof window === "undefined") return "";
    const u = new URL(path, window.location.origin);
    if (clientId && clientId.trim() !== "") {
      u.searchParams.set("clientId", clientId.trim());
    }
    return u.toString();
  }, [path, clientId]);

  if (!src) {
    return (
      <main className="analytics-main" style={{ padding: 24 }}>
        <p className="pg-sub">Loading preview…</p>
      </main>
    );
  }

  return (
    <main className="analytics-main" style={{ padding: 0, gap: 0, minHeight: "100vh" }}>
      <div
        style={{
          padding: "10px 16px",
          borderBottom: "1px solid var(--line)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          background: "var(--panel-2)",
        }}
      >
        <span className="analytics-scope-label" style={{ letterSpacing: "0.12em" }}>
          In-app preview
        </span>
        <code style={{ fontSize: 11, color: "var(--sky)" }}>{path}</code>
        <span style={{ fontSize: 11, color: "var(--tx-3)" }}>
          Use <code>?path=/analytics</code> and optional <code>&amp;clientId=…</code>
        </span>
      </div>
      <iframe
        title="App preview"
        src={src}
        style={{
          width: "100%",
          height: "calc(100vh - 52px)",
          minHeight: 480,
          border: "none",
          display: "block",
          background: "var(--bg)",
        }}
      />
    </main>
  );
}

export default function PreviewPage() {
  return (
    <Suspense
      fallback={
        <main className="analytics-main" style={{ padding: 24 }}>
          <p className="pg-sub">Loading preview…</p>
        </main>
      }
    >
      <PreviewInner />
    </Suspense>
  );
}

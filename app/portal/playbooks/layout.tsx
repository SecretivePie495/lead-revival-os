"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function PortalPlaybooksNav() {
  const pathname = usePathname();
  const isTemplates = pathname.includes("/templates");
  const isSequences = pathname.includes("/sequences");

  return (
    <nav className="pb-nav" aria-label="Playbooks sections">
      <Link
        href="/portal/playbooks/templates"
        className={`pb-nav-link ${isTemplates ? "active" : ""}`}
      >
        <span className="pb-nav-kicker">Library</span>
        Templates
      </Link>
      <Link
        href="/portal/playbooks/sequences"
        className={`pb-nav-link ${isSequences ? "active" : ""}`}
      >
        <span className="pb-nav-kicker">Live</span>
        Sequences
      </Link>
    </nav>
  );
}

export default function PortalPlaybooksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isTemplates = pathname.includes("/templates");
  const subtitle = isTemplates
    ? "Template library (read-only preview)"
    : "Sequences (read-only)";

  return (
    <main>
      <div className="pg-header">
        <div>
          <h1 className="pg-title">Playbooks</h1>
          <p className="pg-sub">{subtitle}</p>
        </div>
      </div>
      <PortalPlaybooksNav />
      {children}
    </main>
  );
}

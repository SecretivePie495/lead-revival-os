"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PlaybooksProvider } from "@/lib/playbooks-context";

function PlaybooksNav() {
  const pathname = usePathname();
  const isTemplates = pathname.includes("/templates");
  const isSequences = pathname.includes("/sequences") || pathname === "/playbooks";

  return (
    <nav className="pb-nav" aria-label="Playbooks sections">
      <Link
        href="/playbooks/templates"
        className={`pb-nav-link ${isTemplates ? "active" : ""}`}
      >
        <span className="pb-nav-kicker">Library</span>
        Templates
      </Link>
      <Link
        href="/playbooks/sequences"
        className={`pb-nav-link ${isSequences ? "active" : ""}`}
      >
        <span className="pb-nav-kicker">Live</span>
        Sequences
      </Link>
    </nav>
  );
}

export default function PlaybooksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isTemplates = pathname.includes("/templates");
  const subtitle = isTemplates
    ? "Template library — reusable flows and messaging patterns"
    : "Sequences — active automations tied to your pipeline";

  return (
    <PlaybooksProvider>
      <main>
        <div className="pg-header">
          <div>
            <h1 className="pg-title">Playbooks</h1>
            <p className="pg-sub">{subtitle}</p>
          </div>
        </div>
        <PlaybooksNav />
        {children}
      </main>
    </PlaybooksProvider>
  );
}

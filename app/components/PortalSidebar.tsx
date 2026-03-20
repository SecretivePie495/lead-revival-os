"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "./ThemeProvider";
import PortalSignOutButton from "@/app/portal/PortalSignOutButton";

const navItems = [
  { href: "/portal", label: "Dashboard", chip: "Overview", icon: <GridIcon /> },
  { href: "/portal/clients", label: "Clients", chip: "Account", icon: <UsersIcon /> },
  { href: "/portal/conversations", label: "Inbox", chip: "Inbox", icon: <ChatIcon /> },
  { href: "/portal/kanban", label: "Kanban", chip: "Board", icon: <KanbanIcon /> },
  { href: "/portal/playbooks", label: "Playbooks", chip: "Sequences", icon: <BookIcon /> },
  { href: "/portal/analytics", label: "Analytics", chip: "Reports", icon: <ChartIcon /> },
];

type PortalSidebarProps = {
  email: string | null;
  clientId: string;
};

export default function PortalSidebar({ email, clientId }: PortalSidebarProps) {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <aside className="sidebar">
      <div style={{ padding: "20px 18px 16px", borderBottom: "1px solid var(--line)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              flexShrink: 0,
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 10px rgba(37,99,235,0.35)",
            }}
          >
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
              <path
                d="M8.5 1.5L14.5 5v7l-6 3.5L2.5 12V5L8.5 1.5Z"
                stroke="white"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              <circle cx="8.5" cy="8.5" r="2.2" fill="white" />
            </svg>
          </div>
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "var(--tx)",
                letterSpacing: "-0.01em",
              }}
            >
              Lead Revival OS
            </div>
            <div
              style={{
                fontSize: 10,
                color: "var(--tx-3)",
                fontWeight: 500,
                marginTop: 1,
              }}
            >
              Client Portal
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          padding: "12px 14px 10px",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <div
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.1em",
            color: "var(--tx-3)",
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          Account Scope
        </div>
        <div
          style={{
            width: "100%",
            background: "var(--panel-2)",
            border: "1px solid var(--line)",
            borderRadius: 10,
            padding: "10px 11px",
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--tx)" }}>
            {email ?? "client user"}
          </div>
          <div style={{ fontSize: 10, color: "var(--tx-3)", marginTop: 2 }}>
            Client ID: {clientId}
          </div>
        </div>
      </div>

      <nav className="sb-nav">
        <p className="nav-label">Menu</p>
        {navItems.map((item) => {
          const active =
            item.href === "/portal"
              ? pathname === "/portal"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${active ? "active" : ""}`}
              style={{ gap: 9 }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexShrink: 0,
                  color: active ? "var(--sky)" : "var(--tx-3)",
                }}
              >
                {item.icon}
              </span>
              <span style={{ flex: 1 }}>{item.label}</span>
              <span className="nav-chip">{item.chip}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sb-footer">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ position: "relative", width: 8, height: 8, flexShrink: 0 }}>
              <span className="sb-badge-dot" />
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--grn)",
                letterSpacing: "0.02em",
              }}
            >
              Session Active
            </span>
          </div>
          <button
            onClick={toggle}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            style={{
              width: 30,
              height: 30,
              borderRadius: 7,
              flexShrink: 0,
              background: "var(--panel-2)",
              border: "1px solid var(--line)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--tx-2)",
            }}
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>

        <PortalSignOutButton />
      </div>
    </aside>
  );
}

function GridIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="1" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="8" y="1" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="1" y="8" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="8" y="8" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="5.2" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M1 12c0-2.32 1.88-4.2 4.2-4.2S9.4 9.68 9.4 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M10.2 2.8c.97.4 1.65 1.35 1.65 2.45S11.17 7.35 10.2 7.7M13 12c0-1.72-1.1-3.17-2.6-3.7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M12 9a1.33 1.33 0 01-1.33 1.33H4L1 13.5V2.33A1.33 1.33 0 012.33 1h8.34A1.33 1.33 0 0112 2.33V9z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function KanbanIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="2" width="3.2" height="10" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="5.4" y="2" width="3.2" height="10" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="9.8" y="2" width="3.2" height="10" rx="1" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 1.5h5.5v11L7 11.5l-5 1.5V1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M7.5 1.5H13v11.5L7.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M1 10.5l3.5-4.5 3 3.5L11 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M1 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.8 2.8l1.1 1.1M10.1 10.1l1.1 1.1M11.2 2.8l-1.1 1.1M3.9 10.1l-1.1 1.1"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M12 7.8A5 5 0 016.2 2a5 5 0 100 10 5 5 0 005.8-4.2z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

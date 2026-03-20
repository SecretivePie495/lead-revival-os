"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo, useRef } from "react";
import { useTheme } from "./ThemeProvider";
import type { ClientRecord } from "@/lib/airtable";
import { buildSelectedClientCookieHeader } from "@/lib/analytics-scope";

type SidebarProps = {
  clients: ClientRecord[];
};

const navItems = [
  { href: "/",              label: "Dashboard",     chip: "Overview",  icon: <GridIcon /> },
  { href: "/clients",       label: "Clients",       chip: "All",       icon: <UsersIcon /> },
  { href: "/conversations", label: "Inbox",         chip: "Inbox",     icon: <ChatIcon /> },
  { href: "/kanban",        label: "Kanban",        chip: "Board",     icon: <KanbanIcon /> },
  { href: "/playbooks",     label: "Playbooks",     chip: "Sequences", icon: <BookIcon /> },
  { href: "/analytics",     label: "Analytics",     chip: "Reports",   icon: <ChartIcon /> },
  { href: "/preview",       label: "Preview",       chip: "Browser",   icon: <GlobeIcon /> },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function normalizeClientId(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

type SidebarTodayStats = {
  newLeadsToday: number;
  repliesToday: number;
  bookedCallsToday: number;
};

export default function Sidebar({ clients }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, toggle } = useTheme();
  const [clientOpen, setClientOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [todayStats, setTodayStats] = useState<SidebarTodayStats | null>(null);
  const selectedClientId = normalizeClientId(searchParams.get("clientId"));
  const selectedClient = useMemo(
    () =>
      selectedClientId
        ? clients.find((c) => normalizeClientId(c.ClientsID) === selectedClientId) ?? null
        : null,
    [clients, selectedClientId]
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setClientOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Keep cookie in sync with URL so /analytics (and server fetches) match Kanban/Inbox scope.
  useEffect(() => {
    const id = searchParams.get("clientId");
    if (id && id.trim() !== "") {
      document.cookie = buildSelectedClientCookieHeader(id);
    } else {
      document.cookie = buildSelectedClientCookieHeader("");
    }
  }, [searchParams]);

  useEffect(() => {
    const ac = new AbortController();
    const params = new URLSearchParams();
    if (selectedClientId) params.set("clientId", selectedClientId);
    if (selectedClient?.id) params.set("recordId", selectedClient.id);
    const q = params.toString();
    setTodayStats(null);
    fetch(`/api/sidebar-stats${q ? `?${q}` : ""}`, { signal: ac.signal })
      .then((res) => res.json())
      .then((body: SidebarTodayStats) => {
        if (!ac.signal.aborted) {
          setTodayStats({
            newLeadsToday: Number(body?.newLeadsToday) || 0,
            repliesToday: Number(body?.repliesToday) || 0,
            bookedCallsToday: Number(body?.bookedCallsToday) || 0,
          });
        }
      })
      .catch(() => {
        if (!ac.signal.aborted) {
          setTodayStats({ newLeadsToday: 0, repliesToday: 0, bookedCallsToday: 0 });
        }
      });
    return () => ac.abort();
  }, [selectedClientId, selectedClient?.id]);

  const handleClientSelect = (client: ClientRecord | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!client) {
      params.delete("clientId");
      document.cookie = buildSelectedClientCookieHeader("");
    } else {
      const id = String(client.ClientsID ?? "");
      params.set("clientId", id);
      document.cookie = buildSelectedClientCookieHeader(id);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
    setClientOpen(false);
  };

  const isDark = theme === "dark";
  const displayName = selectedClient?.["business Name"] || "All Clients";
  const displayInitials =
    displayName !== "All Clients" ? getInitials(displayName) : "AC";

  return (
    <aside className="sidebar">

      {/* ── Brand ── */}
      <div style={{ padding: "20px 18px 16px", borderBottom: "1px solid var(--line)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 10px rgba(37,99,235,0.35)",
          }}>
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
              <path d="M8.5 1.5L14.5 5v7l-6 3.5L2.5 12V5L8.5 1.5Z" stroke="white" strokeWidth="1.4" strokeLinejoin="round"/>
              <circle cx="8.5" cy="8.5" r="2.2" fill="white"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--tx)", letterSpacing: "-0.01em" }}>
              Lead Revival OS
            </div>
            <div style={{ fontSize: 10, color: "var(--tx-3)", fontWeight: 500, marginTop: 1 }}>
              UTG Labs · Enterprise
            </div>
          </div>
        </div>
      </div>

      {/* ── Client Selector ── */}
      <div
        ref={dropdownRef}
        style={{ padding: "12px 14px 10px", borderBottom: "1px solid var(--line)", position: "relative" }}
      >
        <div style={{
          fontSize: 9, fontWeight: 700, letterSpacing: "0.1em",
          color: "var(--tx-3)", textTransform: "uppercase", marginBottom: 6,
        }}>
          Current Client
        </div>
        <button
          onClick={() => setClientOpen((o) => !o)}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            width: "100%", background: "var(--panel-2)",
            border: "1px solid var(--line)", borderRadius: 10,
            padding: "9px 11px", cursor: "pointer",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7, flexShrink: 0,
              background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 6px rgba(245,158,11,0.3)",
            }}>
              <span style={{ fontSize: 9, fontWeight: 800, color: "white", letterSpacing: "0.02em" }}>
                {displayInitials}
              </span>
            </div>
            <div style={{ textAlign: "left", minWidth: 0 }}>
              <div style={{
                fontSize: 12, fontWeight: 700, color: "var(--tx)",
                lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                maxWidth: 120,
              }}>
                {displayName}
              </div>
              {selectedClient?.ClientsID && (
                <div style={{ fontSize: 10, color: "var(--tx-3)", marginTop: 1 }}>
                  ID: {selectedClient.ClientsID}
                </div>
              )}
            </div>
          </div>
          <svg
            width="13" height="13" viewBox="0 0 13 13" fill="none"
            style={{
              transform: clientOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.15s", flexShrink: 0, color: "var(--tx-3)",
            }}
          >
            <path d="M3.5 5L6.5 8L9.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Dropdown list */}
        {clientOpen && (
          <div style={{
            position: "absolute", top: "calc(100% - 2px)", left: 14, right: 14,
            background: "var(--panel)", border: "1px solid var(--line)",
            borderRadius: 10, zIndex: 100, overflow: "hidden",
            boxShadow: isDark
              ? "0 8px 24px rgba(0,0,0,0.5)"
              : "0 8px 24px rgba(15,23,42,0.12)",
            maxHeight: 220, overflowY: "auto",
          }}>
            {clients.length === 0 ? (
              <div style={{ padding: "12px 14px", fontSize: 12, color: "var(--tx-3)" }}>
                No clients found
              </div>
            ) : (
              <>
                <button
                  onClick={() => handleClientSelect(null)}
                  style={{
                    display: "flex", alignItems: "center", gap: 9,
                    width: "100%", padding: "9px 12px",
                    border: "none",
                    borderBottom: "1px solid var(--line)",
                    cursor: "pointer",
                    background: selectedClient == null ? "var(--sky-bg)" : "transparent",
                  }}
                >
                  <div style={{
                    width: 26, height: 26, borderRadius: 6, flexShrink: 0,
                    background: "linear-gradient(135deg, #38bdf8, #2563eb)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ fontSize: 8, fontWeight: 800, color: "white" }}>
                      AC
                    </span>
                  </div>
                  <div style={{ textAlign: "left", minWidth: 0 }}>
                    <div style={{
                      fontSize: 12, fontWeight: 600,
                      color: selectedClient == null ? "var(--sky)" : "var(--tx)",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      All Clients
                    </div>
                  </div>
                  {selectedClient == null && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginLeft: "auto", flexShrink: 0, color: "var(--sky)" }}>
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>

                {clients.map((c, i) => {
                  const isSelected =
                    normalizeClientId(c.ClientsID) === selectedClientId;
                  return (
                    <button
                      key={c.id}
                      onClick={() => handleClientSelect(c)}
                      style={{
                        display: "flex", alignItems: "center", gap: 9,
                        width: "100%", padding: "9px 12px",
                        border: "none",
                        borderBottom: i < clients.length - 1 ? "1px solid var(--line)" : "none",
                        cursor: "pointer",
                        background: isSelected ? "var(--sky-bg)" : "transparent",
                      }}
                    >
                      <div style={{
                        width: 26, height: 26, borderRadius: 6, flexShrink: 0,
                        background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <span style={{ fontSize: 8, fontWeight: 800, color: "white" }}>
                          {getInitials(c["business Name"] || "?")}
                        </span>
                      </div>
                      <div style={{ textAlign: "left", minWidth: 0 }}>
                        <div style={{
                          fontSize: 12, fontWeight: 600,
                          color: isSelected ? "var(--sky)" : "var(--tx)",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {c["business Name"] || "Unnamed"}
                        </div>
                        {c.ClientsID && (
                          <div style={{ fontSize: 10, color: "var(--tx-3)" }}>
                            {c.ClientsID}
                          </div>
                        )}
                      </div>
                      {isSelected && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginLeft: "auto", flexShrink: 0, color: "var(--sky)" }}>
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </button>
                  );
                })}
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Nav ── */}
      <nav className="sb-nav">
        <p className="nav-label">Menu</p>
        {navItems.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const currentClientId = searchParams.get("clientId");
          const href =
            item.href === "/preview" && currentClientId
              ? `${item.href}?path=${encodeURIComponent("/analytics")}&clientId=${encodeURIComponent(currentClientId)}`
              : currentClientId
                ? `${item.href}?clientId=${encodeURIComponent(currentClientId)}`
                : item.href;
          return (
            <Link
              key={item.href}
              href={href}
              className={`nav-item ${active ? "active" : ""}`}
              style={{ gap: 9 }}
            >
              <span style={{
                display: "flex", alignItems: "center", flexShrink: 0,
                color: active ? "var(--sky)" : "var(--tx-3)",
              }}>
                {item.icon}
              </span>
              <span style={{ flex: 1 }}>{item.label}</span>
              <span className="nav-chip">{item.chip}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── Footer ── */}
      <div className="sb-footer">
        {/* Live status + theme toggle */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <div style={{ position: "relative", width: 8, height: 8, flexShrink: 0, marginTop: 3 }}>
              <span className="sb-badge-dot" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--grn)", letterSpacing: "0.02em" }}>
                Live Ops Active
              </span>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 600,
                  color: "var(--tx-3)",
                  letterSpacing: "0.04em",
                  lineHeight: 1.3,
                }}
              >
                {selectedClient ? displayName : "All clients"}
              </span>
            </div>
          </div>
          <button
            onClick={toggle}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            style={{
              width: 30, height: 30, borderRadius: 7, flexShrink: 0,
              background: "var(--panel-2)", border: "1px solid var(--line)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "var(--tx-2)",
            }}
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>

        <p className="sb-footer-label" style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "4px 8px" }}>
          <span>Today</span>
          <span style={{ fontWeight: 500, color: "var(--tx-3)", textTransform: "none", letterSpacing: "0.02em" }}>
            · {selectedClient ? displayName : "All clients"}
          </span>
        </p>
        <div className="sb-stat-row">
          <span className="k">Booked calls</span>
          <span className={`v ${todayStats && todayStats.bookedCallsToday > 0 ? "g" : ""}`}>
            {todayStats === null ? "…" : todayStats.bookedCallsToday > 0 ? `+${todayStats.bookedCallsToday}` : String(todayStats.bookedCallsToday)}
          </span>
        </div>
        <div className="sb-stat-row">
          <span className="k">Replies</span>
          <span className="v">
            {todayStats === null ? "…" : todayStats.repliesToday.toLocaleString()}
          </span>
        </div>
        <div className="sb-stat-row">
          <span className="k">New leads</span>
          <span className="v">
            {todayStats === null
              ? "…"
              : todayStats.newLeadsToday > 0
                ? `+${todayStats.newLeadsToday}`
                : String(todayStats.newLeadsToday)}
          </span>
        </div>
        <p className="sb-tagline">
          &quot;No new ads. No new funnels. Just your dead leads waking back up.&quot;
        </p>
      </div>
    </aside>
  );
}

// ── Icons ──────────────────────────────────────────────────────

function GridIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="1" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="8" y="1" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="1" y="8" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="8" y="8" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="5.2" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M1 12c0-2.32 1.88-4.2 4.2-4.2S9.4 9.68 9.4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M10.2 2.8c.97.4 1.65 1.35 1.65 2.45S11.17 7.35 10.2 7.7M13 12c0-1.72-1.1-3.17-2.6-3.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M12 9a1.33 1.33 0 01-1.33 1.33H4L1 13.5V2.33A1.33 1.33 0 012.33 1h8.34A1.33 1.33 0 0112 2.33V9z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
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
      <path d="M2 1.5h5.5v11L7 11.5l-5 1.5V1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M7.5 1.5H13v11.5L7.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M1 10.5l3.5-4.5 3 3.5L11 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M1 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M1.5 7h11M7 1.5c1.8 2.2 1.8 8.8 0 11M7 1.5c-1.8 2.2-1.8 8.8 0 11"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.8 2.8l1.1 1.1M10.1 10.1l1.1 1.1M11.2 2.8l-1.1 1.1M3.9 10.1l-1.1 1.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M12 7.8A5 5 0 016.2 2a5 5 0 100 10 5 5 0 005.8-4.2z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

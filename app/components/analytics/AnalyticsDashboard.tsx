"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { LeadFields } from "@/lib/airtable";

const AnalyticsLineChart = dynamic(
  () => import("./AnalyticsLineChart"),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          width: "100%",
          height: 440,
          minHeight: 320,
          borderRadius: "var(--r)",
          border: "1px solid var(--line)",
          background: "var(--panel-2)",
        }}
        aria-hidden
      />
    ),
  }
);

type PipelineKpis = {
  totalLeads: number;
  repliedLeads: number;
  bookedCalls: number;
};

/** One bucket for the line chart (daily or monthly). */
type TrendPoint = {
  /** YYYY-MM-DD (day) or month-start YYYY-MM-DD (monthly) for sorting */
  sortKey: string;
  /** X-axis label */
  label: string;
  leadsCreated: number;
  replies: number;
  bookedCalls: number;
};

type SequenceStat = {
  id: string;
  name: string;
  messagesSent: number;
  replies: number;
  replyRate: number;
};

type AnalyticsData = {
  kpis: PipelineKpis;
  dailyTrend: TrendPoint[];
  sequences: SequenceStat[];
};

type LeadWithContext = { id: string; matched?: boolean } & LeadFields;

type AnalyticsDashboardProps = {
  leads: LeadWithContext[];
  unmatchedCount: number;
  /** Main app = all clients (optionally URL-filtered). Portal = single client. */
  variant?: "main" | "portal";
  /** When set (main app), chart/KPIs match sidebar Current Client + Kanban/Inbox. */
  scopedClientId?: string | null;
  scopedClientLabel?: string | null;
};

const KPI_CONFIG: { key: keyof PipelineKpis; label: string }[] = [
  { key: "totalLeads", label: "Total Leads (Scope Total)" },
  { key: "repliedLeads", label: "Replied Leads (Scope Total)" },
  { key: "bookedCalls", label: "Booked Calls (Scope Total)" },
];

/** KPI + trend: conversation / reply signals (booked-only statuses use booked line). */
function isRepliedStatus(lead: LeadWithContext) {
  if (getReplyCount(lead) > 0) return true;
  const s = String(lead.Status ?? "").trim().toLowerCase();
  if (s === "" || s === "new lead") return false;
  if (isBookedStatus(lead)) {
    return (
      s.includes("replied") ||
      s.includes("reply") ||
      s.includes("repl") ||
      s.includes("nurtur") ||
      s.includes("qualif")
    );
  }
  return (
    s.includes("replied") ||
    s.includes("repl") ||
    s.includes("reply") ||
    s.includes("respond") ||
    s.includes("engag") ||
    s.includes("nurtur") ||
    s.includes("qualif") ||
    s.includes("contact") ||
    s.includes("follow") ||
    s.includes("messag") ||
    s.includes("convo")
  );
}

/** True when last message is after created time (UTC day or instant) — infers a reply touch. */
function hasLastMessageAfterCreated(lead: LeadWithContext): boolean {
  const created = getLeadCreatedAt(lead);
  const lastRaw = lead["Last Message Date"];
  if (!created || lastRaw == null || lastRaw === "") return false;
  const last = new Date(String(lastRaw));
  if (Number.isNaN(last.getTime())) return false;
  return last.getTime() > created.getTime();
}

function truncateToUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function formatUtcDateKey(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseDateKey(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function addUtcDays(d: Date, days: number): Date {
  const copy = new Date(d.getTime());
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

function formatFixedDateLabelFromKey(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${monthNames[(m ?? 1) - 1] ?? "Jan"} ${d ?? 1}`;
}

/** Prefer Airtable "Created Time"; fall back to common alternate field names. */
function getLeadCreatedAt(lead: LeadWithContext): Date | null {
  const record = lead as Record<string, unknown>;
  const candidates = [
    record["Created Time"],
    record["Created"],
    record["Created Date"],
    record["created_time"],
    record["Date Created"],
  ];
  for (const v of candidates) {
    if (v == null || v === "") continue;
    const d = new Date(String(v));
    if (!Number.isNaN(d.getTime())) return d;
  }
  return null;
}

function getDateFromCandidates(lead: LeadWithContext, fields: string[]): Date | null {
  const record = lead as Record<string, unknown>;
  for (const field of fields) {
    const value = record[field];
    if (value == null || value === "") continue;
    const d = new Date(String(value));
    if (!Number.isNaN(d.getTime())) return d;
  }
  return null;
}

function getLeadReplyAt(lead: LeadWithContext): Date | null {
  return getDateFromCandidates(lead, [
    "First Reply Date",
    "Reply Date",
    "Replied At",
    "Last Message Date",
  ]);
}

function getLeadBookedAt(lead: LeadWithContext): Date | null {
  return getDateFromCandidates(lead, [
    "Booked Date",
    "Appointment Date",
    "Call Booked Date",
    "Booked At",
    "Last Message Date",
  ]);
}

function getReplyCount(lead: LeadWithContext): number {
  const raw = lead.Replies;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string") {
    const parsed = Number(raw.trim());
    if (Number.isFinite(parsed)) return parsed;
    const digits = raw.match(/\d+/);
    if (digits) {
      const n = Number(digits[0]);
      if (Number.isFinite(n)) return n;
    }
    return 0;
  }
  return 0;
}

function isBookedStatus(lead: LeadWithContext): boolean {
  const s = String(lead.Status ?? "").trim().toLowerCase();
  return (
    s.includes("book") ||
    s.includes("appoint") ||
    s.includes("schedul") ||
    s.includes("consult") ||
    s.includes("qualified") ||
    s.includes("close") ||
    s.includes("won")
  );
}

function getSequenceNames(lead: LeadWithContext): string[] {
  const raw = lead.Sequences;
  if (Array.isArray(raw)) {
    return raw
      .map((v) => String(v).trim())
      .filter((v) => v !== "");
  }
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    return trimmed
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v !== "");
  }
  return [];
}

function startOfMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

function formatMonthRangeLabel(monthStart: Date): string {
  const end = new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 0));
  const startKey = formatUtcDateKey(monthStart);
  const endKey = formatUtcDateKey(end);
  return `${formatFixedDateLabelFromKey(startKey)} - ${formatFixedDateLabelFromKey(endKey)}`;
}

function aggregateMonthly(daily: TrendPoint[]): TrendPoint[] {
  const map = new Map<
    string,
    { leadsCreated: number; replies: number; bookedCalls: number; monthStart: Date }
  >();

  for (const row of daily) {
    const d = parseDateKey(row.sortKey);
    const monthStart = startOfMonth(d);
    const monthKey = formatUtcDateKey(monthStart);
    const cur = map.get(monthKey) ?? {
      leadsCreated: 0,
      replies: 0,
      bookedCalls: 0,
      monthStart,
    };
    cur.leadsCreated += row.leadsCreated;
    cur.replies += row.replies;
    cur.bookedCalls += row.bookedCalls;
    map.set(monthKey, cur);
  }

  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([sortKey, v]) => ({
      sortKey,
      label: formatMonthRangeLabel(v.monthStart),
      leadsCreated: v.leadsCreated,
      replies: v.replies,
      bookedCalls: v.bookedCalls,
    }));
}

function toCumulativeTrend(rows: TrendPoint[]): TrendPoint[] {
  let leadsRunning = 0;
  let repliesRunning = 0;
  let bookedRunning = 0;
  return rows.map((row) => {
    leadsRunning += row.leadsCreated;
    repliesRunning += row.replies;
    bookedRunning += row.bookedCalls;
    return {
      ...row,
      leadsCreated: leadsRunning,
      replies: repliesRunning,
      bookedCalls: bookedRunning,
    };
  });
}

function buildDailyTrend30Days(leads: LeadWithContext[]): TrendPoint[] {
  const pointsByKey = new Map<
    string,
    { leadsCreated: number; replies: number; bookedCalls: number }
  >();

  const addToBucket = (
    d: Date,
    key: "leadsCreated" | "replies" | "bookedCalls",
    amount: number = 1
  ) => {
    const day = truncateToUtcDay(d);
    const sortKey = formatUtcDateKey(day);
    const cur = pointsByKey.get(sortKey) ?? { leadsCreated: 0, replies: 0, bookedCalls: 0 };
    cur[key] += amount;
    pointsByKey.set(sortKey, cur);
  };

  for (const lead of leads) {
    const created = getLeadCreatedAt(lead);
    if (created) addToBucket(created, "leadsCreated");

    const replied = isRepliedStatus(lead) || hasLastMessageAfterCreated(lead);
    if (replied) {
      let replyAt: Date | null = getLeadReplyAt(lead) ?? created;
      if (!replyAt && lead["Last Message Date"]) {
        const lm = new Date(String(lead["Last Message Date"]));
        if (!Number.isNaN(lm.getTime())) replyAt = lm;
      }
      if (replyAt) addToBucket(replyAt, "replies");
    }

    if (isBookedStatus(lead)) {
      const bookedAt = getLeadBookedAt(lead) ?? created;
      if (bookedAt) addToBucket(bookedAt, "bookedCalls");
    }
  }

  const sortedKeys = Array.from(pointsByKey.keys()).sort((a, b) => a.localeCompare(b));
  if (sortedKeys.length === 0) return [];

  const start = parseDateKey(sortedKeys[0]);
  const end = parseDateKey(sortedKeys[sortedKeys.length - 1]);
  const rows: TrendPoint[] = [];
  for (let cur = start; cur.getTime() <= end.getTime(); cur = addUtcDays(cur, 1)) {
    const sortKey = formatUtcDateKey(cur);
    const totals = pointsByKey.get(sortKey) ?? {
      leadsCreated: 0,
      replies: 0,
      bookedCalls: 0,
    };
    rows.push({
      sortKey,
      label: formatFixedDateLabelFromKey(sortKey),
      leadsCreated: totals.leadsCreated,
      replies: totals.replies,
      bookedCalls: totals.bookedCalls,
    });
  }
  return rows;
}

function buildAnalyticsData(leads: LeadWithContext[]): AnalyticsData {
  const bySequence = new Map<string, { sent: number; replies: number }>();

  leads.forEach((lead) => {
    const replyCount = getReplyCount(lead);
    const sequenceNames = getSequenceNames(lead);
    const sequenceKeys = sequenceNames.length > 0 ? sequenceNames : ["Unassigned"];
    sequenceKeys.forEach((sequenceName) => {
      const stat = bySequence.get(sequenceName) ?? { sent: 0, replies: 0 };
      stat.sent += 1;
      stat.replies += replyCount;
      bySequence.set(sequenceName, stat);
    });
  });

  const repliedLeads = leads.filter(
    (l) => isRepliedStatus(l) || hasLastMessageAfterCreated(l)
  ).length;
  const bookedCalls = leads.filter(isBookedStatus).length;

  const sequences = Array.from(bySequence.entries())
    .map(([name, stat], idx) => ({
      id: `svc-${idx}`,
      name,
      messagesSent: stat.sent,
      replies: stat.replies,
      replyRate: stat.sent > 0 ? (stat.replies / stat.sent) * 100 : 0,
    }))
    .sort((a, b) => b.messagesSent - a.messagesSent)
    .slice(0, 8);

  return {
    kpis: {
      totalLeads: leads.length,
      repliedLeads,
      bookedCalls,
    },
    dailyTrend: buildDailyTrend30Days(leads),
    sequences,
  };
}

function hasAnyTrendActivity(rows: TrendPoint[]): boolean {
  return rows.some((r) => r.leadsCreated > 0 || r.replies > 0 || r.bookedCalls > 0);
}

export default function AnalyticsDashboard({
  leads,
  unmatchedCount,
  variant = "main",
  scopedClientId = null,
  scopedClientLabel = null,
}: AnalyticsDashboardProps) {
  const data = useMemo(() => buildAnalyticsData(leads), [leads]);
  const [granularity, setGranularity] = useState<"daily" | "monthly">("daily");
  const [chartHeight, setChartHeight] = useState(440);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    const compute = () => {
      setChartHeight(
        Math.max(380, Math.min(720, Math.round(window.innerHeight * 0.52)))
      );
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  const chartData = useMemo(
    () =>
      granularity === "daily" ? data.dailyTrend : aggregateMonthly(data.dailyTrend),
    [data.dailyTrend, granularity]
  );

  const chartDataRevision = useMemo(() => {
    const scope = variant === "portal" ? "portal" : scopedClientId ?? "all";
    const totals = chartData.reduce(
      (acc, r) =>
        acc + r.leadsCreated + r.replies + r.bookedCalls,
      0
    );
    const keys = chartData.map((r) => r.sortKey).join(",");
    return `${scope}|${granularity}|${chartData.length}|${totals}|${keys}`;
  }, [chartData, granularity, scopedClientId, variant]);

  const chartHasData = hasAnyTrendActivity(chartData);

  const scopeDescription =
    variant === "portal"
      ? "Your account only — leads mapped to your client in Supabase."
      : scopedClientId
        ? `Filtered to Current Client in the sidebar: ${scopedClientLabel?.trim() || "Selected client"} (ID ${scopedClientId}). This chart and KPIs match Kanban and Inbox for that client.`
        : "No client filter — totals include all leads in the workspace. Pick Current Client in the sidebar (your choice is saved for Analytics), or open Analytics from the menu while a client is selected.";

  return (
    <div className="analytics-dashboard">
      {unmatchedCount > 0 ? (
        <div
          className="rounded-[var(--r)] border px-4 py-3 text-xs"
          style={{
            background: "var(--amb-bg)",
            borderColor: "rgba(251,191,36,.18)",
            color: "var(--amb)",
          }}
        >
          {unmatchedCount} lead(s) have a Client_ID that doesn&apos;t match any client.
        </div>
      ) : null}

      <div className="analytics-scope-row" role="status">
        <span className="analytics-scope-label">
          {variant === "portal"
            ? "Account scope"
            : scopedClientId
              ? "Client scope"
              : "Workspace scope"}
        </span>
        <span className="analytics-scope-text">{scopeDescription}</span>
      </div>

      <section className="analytics-kpi-row" aria-label="Summary KPIs">
        {KPI_CONFIG.map((item, i) => {
          const value = data.kpis[item.key];
          const colors = ["s", "g", "a"] as const;
          const c = colors[i % colors.length];
          return (
            <div key={item.key} className={`stat ${c}`}>
              <p className="stat-lbl">{item.label}</p>
              <p className="stat-num" suppressHydrationWarning>
                {hydrated ? value.toLocaleString() : "—"}
              </p>
            </div>
          );
        })}
      </section>

      <section className="analytics-chart-hero" aria-label="Trend chart">
        <div className="analytics-chart-hero-head">
          <div>
            <h2 className="sec-lbl" style={{ marginBottom: 4 }}>
              Daily Trend
            </h2>
            <p className="sec-sub" style={{ maxWidth: 560 }}>
              Daily activity for leads created, replies, and booked calls. Switch to monthly for
              a cleaner long-range rollup.
            </p>
          </div>
          <div
            className="inline-flex shrink-0 items-center gap-1 rounded-full border px-1 py-1 text-xs"
            style={{
              borderColor: "var(--line)",
              background: "var(--panel-2)",
              color: "var(--tx-2)",
            }}
            role="group"
            aria-label="Chart granularity"
          >
            <button
              type="button"
              className="rounded-full px-3 py-1 font-medium transition-colors"
              style={{
                background: granularity === "daily" ? "var(--panel)" : "transparent",
                color: granularity === "daily" ? "var(--tx)" : "var(--tx-3)",
              }}
              onClick={() => setGranularity("daily")}
              aria-pressed={granularity === "daily"}
            >
              Daily
            </button>
            <button
              type="button"
              className="rounded-full px-3 py-1 font-medium transition-colors"
              style={{
                background: granularity === "monthly" ? "var(--panel)" : "transparent",
                color: granularity === "monthly" ? "var(--tx)" : "var(--tx-3)",
              }}
              onClick={() => setGranularity("monthly")}
              aria-pressed={granularity === "monthly"}
            >
              Monthly
            </button>
          </div>
        </div>

        {!chartHasData ? (
          <div
            className="rounded-[var(--r)] border px-4 py-4 text-xs"
            style={{
              background: "var(--panel-2)",
              borderColor: "var(--line)",
              color: "var(--tx-2)",
              marginBottom: 10,
            }}
          >
            <strong style={{ color: "var(--tx)" }}>No data in this date range.</strong>{" "}
            Ensure Airtable leads have <strong>Created Time</strong> (auto in most bases) or a
            custom created date field — we also try{" "}
            <code style={{ fontSize: 10 }}>Created</code>,{" "}
            <code style={{ fontSize: 10 }}>Created Date</code>. For replies/booked timing, add
            event-date fields (for example <code style={{ fontSize: 10 }}>Reply Date</code> or{" "}
            <code style={{ fontSize: 10 }}>Booked Date</code>). We also fall back to{" "}
            <strong>Last Message Date</strong>.
          </div>
        ) : null}

        <div className="analytics-chart-hero-body w-full overflow-x-auto">
          <AnalyticsLineChart
            height={chartHeight}
            dataRevision={chartDataRevision}
            data={chartData.map(({ label, leadsCreated, replies, bookedCalls }) => ({
              label,
              leadsCreated,
              replies,
              bookedCalls,
            }))}
          />
        </div>
      </section>

      <section
        className="rounded-[var(--r)] border p-5"
        style={{ background: "var(--panel)", borderColor: "var(--line)" }}
      >
        <div className="mb-4">
          <h2 className="sec-lbl">Sequence Performance</h2>
          <p className="sec-sub">
            See which follow-up flows are generating the most replies.
          </p>
        </div>

        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Sequence</th>
                <th style={{ textAlign: "right" }}>Messages Sent</th>
                <th style={{ textAlign: "right" }}>Replies</th>
                <th style={{ textAlign: "right" }}>Reply Rate</th>
              </tr>
            </thead>
            <tbody>
              {data.sequences.map((seq) => {
                const replyColor =
                  seq.replyRate >= 20
                    ? "var(--grn)"
                    : seq.replyRate >= 10
                      ? "var(--amb)"
                      : "#f43f5e";
                return (
                  <tr key={seq.id}>
                    <td className="td-name" style={{ maxWidth: 240 }}>
                      {seq.name}
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        color: "var(--tx-2)",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {seq.messagesSent.toLocaleString()}
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        color: "var(--tx-2)",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {seq.replies.toLocaleString()}
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        fontWeight: 600,
                        color: replyColor,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {seq.replyRate.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

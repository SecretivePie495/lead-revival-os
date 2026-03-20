"use client";

import { useEffect, useRef } from "react";

type StatsCardsProps = {
  leadsImported: number;
  conversations: number;
  bookedCalls: number;
  conversionRate: number;
};

function countUp(
  el: HTMLParagraphElement,
  target: number,
  ms: number,
  decimals = 0,
  suffix = ""
): () => void {
  let cancelled = false;
  const factor = Math.pow(10, decimals);
  const t0 = performance.now();
  const tick = (now: number) => {
    if (cancelled) return;
    const p = Math.min((now - t0) / ms, 1);
    const e = 1 - Math.pow(1 - p, 3);
    const current = Math.round(e * target * factor) / factor;
    el.textContent = `${current.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}${suffix}`;
    if (p < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = `${target.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}${suffix}`;
    }
  };
  requestAnimationFrame(tick);
  return () => {
    cancelled = true;
  };
}

const BAR_DELAYS = [250, 350, 450, 550];
const DURATIONS = [1300, 1100, 900, 500];

export default function StatsCards({
  leadsImported,
  conversations,
  bookedCalls,
  conversionRate,
}: StatsCardsProps) {
  const numRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);

  const values = [leadsImported, conversations, bookedCalls, conversionRate];
  const maxVal = Math.max(...values, 1);
  const barWidths = values.map((v) => Math.min(100, Math.round((v / maxVal) * 88)));

  const stats = [
    {
      variant: "s" as const,
      label: "Total leads",
      target: leadsImported,
      note: (
        <>
          <strong>{leadsImported.toLocaleString()}</strong> total records in this
          scope
        </>
      ),
      decimals: 0,
      suffix: "",
    },
    {
      variant: "g" as const,
      label: "Conversations",
      target: conversations,
      note: (
        <>
          <strong>
            {leadsImported > 0
              ? ((conversations / leadsImported) * 100).toFixed(1)
              : 0}
            %
          </strong>{" "}
          reply rate across all campaigns
        </>
      ),
      decimals: 0,
      suffix: "",
    },
    {
      variant: "a" as const,
      label: "Booked calls",
      target: bookedCalls,
      note: (
        <>
          <strong>
            {leadsImported > 0
              ? ((bookedCalls / leadsImported) * 100).toFixed(1)
              : 0}
            %
          </strong>{" "}
          of dormant leads converted
        </>
      ),
      decimals: 0,
      suffix: "",
    },
    {
      variant: "v" as const,
      label: "Conversion rate",
      target: conversionRate,
      note: <>Booked calls as a percentage of total leads</>,
      decimals: 1,
      suffix: "%",
    },
  ];

  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const countUpCleanups: (() => void)[] = [];
    stats.forEach((stat, i) => {
      const numEl = numRefs.current[i];
      const barEl = barRefs.current[i];
      if (numEl) {
        countUpCleanups.push(
          countUp(numEl, stat.target, DURATIONS[i], stat.decimals, stat.suffix)
        );
      }
      if (barEl) {
        const delay = BAR_DELAYS[i];
        const pct = barWidths[i];
        const timeout = setTimeout(() => {
          barEl.style.transition =
            "width 1.3s cubic-bezier(0.4, 0, 0.2, 1)";
          barEl.style.width = `${pct}%`;
        }, delay);
        timeouts.push(timeout);
      }
    });
    return () => {
      timeouts.forEach(clearTimeout);
      countUpCleanups.forEach((cleanup) => cleanup());
    };
  }, [leadsImported, conversations, bookedCalls, conversionRate]);

  return (
    <div className="stats">
      {stats.map((stat, i) => (
        <div key={stat.label} className={`stat ${stat.variant}`}>
          <p className="stat-lbl">{stat.label}</p>
          <p
            className="stat-num"
            ref={(el) => {
              numRefs.current[i] = el;
            }}
          >
            0
          </p>
          <p className="stat-note">{stat.note}</p>
          <div className="stat-bar">
            <div
              className="stat-fill"
              ref={(el) => {
                barRefs.current[i] = el;
              }}
              style={{ width: 0 }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

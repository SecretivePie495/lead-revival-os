"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
  Brush,
} from "recharts";

export type AnalyticsChartRow = {
  label: string;
  leadsCreated: number;
  replies: number;
  bookedCalls: number;
};

type Props = {
  data: AnalyticsChartRow[];
  /** Chart height in px (default 320). */
  height?: number;
  /** Change when filter/granularity/data changes so the chart rescales and animates. */
  dataRevision?: string;
};

/** Grid/axis: rgba works reliably in SVG; ticks use theme vars where supported. */
const GRID_STROKE = "rgba(148, 163, 184, 0.22)";
const AXIS_STROKE = "rgba(148, 163, 184, 0.35)";

/** Y-axis top from actual series max — adds headroom so lines aren’t glued to the top. */
function yAxisMaxFromData(rows: AnalyticsChartRow[]): number {
  let raw = 0;
  for (const row of rows) {
    raw = Math.max(raw, row.leadsCreated, row.replies, row.bookedCalls);
  }
  if (raw <= 0) return 1;
  const headroom = Math.max(1, Math.ceil(raw * 0.18));
  const top = raw + headroom;
  // Prefer integer ticks for counts
  return Math.max(1, Math.ceil(top));
}

function yAxisMaxForRepliesAndBooked(rows: AnalyticsChartRow[]): number {
  let raw = 0;
  for (const row of rows) {
    raw = Math.max(raw, row.replies, row.bookedCalls);
  }
  if (raw <= 0) return 1;
  const headroom = Math.max(1, Math.ceil(raw * 0.22));
  return Math.max(1, Math.ceil(raw + headroom));
}

export default function AnalyticsLineChart({
  data,
  height = 320,
  dataRevision = "default",
}: Props) {
  const maxY = useMemo(() => yAxisMaxFromData(data), [data]);
  const maxYSecondary = useMemo(() => yAxisMaxForRepliesAndBooked(data), [data]);
  /** Keep small reply/booked counts off the baseline so lines stay visible. */
  const secondaryTop = useMemo(() => Math.max(maxYSecondary, 6), [maxYSecondary]);
  const brushStartIndex = useMemo(() => Math.max(0, data.length - 45), [data.length]);
  const brushEndIndex = useMemo(() => Math.max(0, data.length - 1), [data.length]);

  const chartKey = useMemo(
    () => `${dataRevision}|${data.length}|${maxY}|${data[0]?.label ?? ""}|${data[data.length - 1]?.label ?? ""}`,
    [data, dataRevision, maxY]
  );

  return (
    <div
      className="analytics-line-chart-wrap"
      style={{
        width: "100%",
        height,
        minHeight: Math.min(height, 280),
      }}
    >
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          key={chartKey}
          data={data}
          margin={{ top: 8, right: 12, left: 4, bottom: data.length > 8 ? 36 : 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={{ stroke: AXIS_STROKE }}
            tick={{ fill: "var(--tx-2)", fontSize: 10 }}
            interval="preserveStartEnd"
            minTickGap={12}
          />
          <YAxis
            yAxisId="left"
            domain={[0, maxY]}
            tickLine={false}
            axisLine={{ stroke: AXIS_STROKE }}
            tick={{ fill: "var(--tx-2)", fontSize: 11 }}
            allowDecimals={false}
            width={44}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, secondaryTop]}
            tickLine={false}
            axisLine={{ stroke: AXIS_STROKE }}
            tick={{ fill: "var(--tx-2)", fontSize: 11 }}
            allowDecimals={false}
            width={40}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--panel)",
              border: "1px solid var(--line)",
              borderRadius: "var(--r)",
              fontSize: 12,
              color: "var(--tx)",
            }}
            labelStyle={{ color: "var(--tx)", fontWeight: 600 }}
          />
          <Legend
            wrapperStyle={{
              paddingTop: 8,
              fontSize: 11,
              color: "var(--tx-2)",
            }}
          />
          <Line
            type="linear"
            dataKey="leadsCreated"
            name="Leads created"
            yAxisId="left"
            stroke="#2dd4ff"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 2 }}
            isAnimationActive={false}
            connectNulls
          />
          <Line
            type="linear"
            dataKey="replies"
            name="Replies"
            yAxisId="right"
            stroke="#22e3a3"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 2 }}
            isAnimationActive={false}
            connectNulls
          />
          <Line
            type="linear"
            dataKey="bookedCalls"
            name="Booked calls"
            yAxisId="right"
            stroke="#ffc233"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 2 }}
            isAnimationActive={false}
            connectNulls
          />
          {data.length > 6 ? (
            <Brush
              dataKey="label"
              height={24}
              stroke="rgba(56,189,248,0.55)"
              fill="rgba(56,189,248,0.08)"
              travellerWidth={9}
              startIndex={brushStartIndex}
              endIndex={brushEndIndex}
              tickFormatter={() => ""}
            />
          ) : null}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

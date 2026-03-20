"use client";

const DEFAULT_VARIABLES = ["{name}", "{service}"] as const;

type MessageVariablePickerProps = {
  onInsert: (variable: string) => void;
  variables?: readonly string[];
};

export default function MessageVariablePicker({
  onInsert,
  variables = DEFAULT_VARIABLES,
}: MessageVariablePickerProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span
        className="text-[10px] uppercase tracking-wider"
        style={{ color: "var(--tx-3)", marginRight: 4 }}
      >
        Insert:
      </span>
      {variables.map((v) => (
        <button
          key={v}
          type="button"
          className="rounded px-2 py-1 font-mono text-xs transition-colors hover:opacity-90"
          style={{
            background: "var(--sky-bg)",
            border: "1px solid var(--line-accent)",
            color: "var(--sky)",
          }}
          onClick={() => onInsert(v)}
        >
          {v}
        </button>
      ))}
    </div>
  );
}

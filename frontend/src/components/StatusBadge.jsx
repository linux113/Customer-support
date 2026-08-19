const STYLES = {
  Open: "bg-clay-500/12 text-clay-500 ring-clay-500/20",
  "In Progress": "bg-brass-400/16 text-brass-500 ring-brass-400/25",
  Closed: "bg-moss-500/12 text-moss-600 ring-moss-500/20",
};

export default function StatusBadge({ status, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${STYLES[status] || "bg-ink-900/5 text-ink-700 ring-ink-900/10"} ${className}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === "Open"
            ? "bg-clay-500"
            : status === "Closed"
              ? "bg-moss-500"
              : "bg-brass-400"
        }`}
      />
      {status}
    </span>
  );
}

const STYLES = {
  Open: "bg-orange-400/10 text-orange-300 ring-orange-400/20",
  "In Progress": "bg-amber-300/10 text-amber-200 ring-amber-300/20",
  Closed: "bg-emerald-400/10 text-emerald-300 ring-emerald-400/20",
};

export default function StatusBadge({ status, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${STYLES[status] || "bg-white/5 text-white/70 ring-white/10"} ${className}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === "Open"
            ? "bg-orange-400"
            : status === "Closed"
              ? "bg-emerald-400"
              : "bg-amber-300"
        }`}
      />
      {status}
    </span>
  );
}

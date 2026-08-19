import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import StatusBadge from "../components/StatusBadge.jsx";
import { fetchStats, fetchTickets, toFriendlyError } from "../services/api.js";
import { formatDate, initials } from "../utils/format.js";

const FILTERS = ["All Statuses", "Open", "In Progress", "Closed"];

function StatCard({ label, value, hint, accent }) {
  return (
    <article className="rounded-3xl border border-ink-900/8 bg-white/80 p-5 shadow-card">
      <p className="text-xs uppercase tracking-[0.18em] text-ink-500">{label}</p>
      <div className="mt-3 flex items-end justify-between">
        <p className="font-display text-4xl leading-none">{value}</p>
        <span className={`h-8 w-8 rounded-2xl ${accent}`} />
      </div>
      <p className="mt-3 text-sm text-ink-500">{hint}</p>
    </article>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [status, setStatus] = useState("All Statuses");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const id = setTimeout(() => setDebounced(search.trim()), 220);
    return () => clearTimeout(id);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [list, summary] = await Promise.all([
          fetchTickets({ status, search: debounced }),
          fetchStats(),
        ]);
        if (!cancelled) {
          setTickets(list);
          setStats(summary);
        }
      } catch (err) {
        if (!cancelled) setError(toFriendlyError(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [status, debounced]);

  const emptyCopy = useMemo(() => {
    if (debounced || status !== "All Statuses") {
      return "No tickets match this search or filter.";
    }
    return "The queue is empty. Create the first ticket to get started.";
  }, [debounced, status]);

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-brass-500">
            Today’s queue
          </p>
          <h1 className="mt-2 font-display text-4xl tracking-tight sm:text-5xl">
            Customer support
          </h1>
          <p className="mt-2 max-w-xl text-ink-500">
            Search, filter and work tickets without leaving the desk. Status
            changes and notes stay on the record.
          </p>
        </div>
        <Link
          to="/tickets/new"
          className="inline-flex items-center justify-center rounded-full bg-ink-900 px-5 py-3 text-sm font-medium text-cream-50 transition hover:bg-ink-800"
        >
          Create ticket
        </Link>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total"
          value={stats?.total ?? "—"}
          hint="All tickets on file"
          accent="bg-ink-900"
        />
        <StatCard
          label="Open"
          value={stats?.open ?? "—"}
          hint="Waiting for an owner"
          accent="bg-clay-500"
        />
        <StatCard
          label="In progress"
          value={stats?.in_progress ?? "—"}
          hint="Actively being worked"
          accent="bg-brass-400"
        />
        <StatCard
          label="Closed"
          value={stats?.closed ?? "—"}
          hint="Resolved this cycle"
          accent="bg-moss-500"
        />
      </section>

      <section className="rounded-[28px] border border-ink-900/8 bg-white/80 p-4 shadow-card sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search ID, customer, email, subject or description"
              className="w-full rounded-2xl border border-ink-900/10 bg-cream-50 px-4 py-3 text-sm outline-none ring-brass-400/40 placeholder:text-ink-400 focus:ring-2"
              aria-label="Search tickets"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setStatus(item)}
                className={`rounded-full px-3.5 py-2 text-sm transition ${
                  status === item
                    ? "bg-ink-900 text-cream-50"
                    : "bg-cream-100 text-ink-700 hover:bg-cream-200"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-clay-500/30 bg-clay-500/10 px-4 py-3 text-sm text-clay-500">
            {error}
          </div>
        )}

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink-900/8 text-xs uppercase tracking-[0.14em] text-ink-500">
                <th className="px-3 py-3 font-medium">Ticket</th>
                <th className="px-3 py-3 font-medium">Customer</th>
                <th className="px-3 py-3 font-medium">Subject</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium">Created</th>
                <th className="px-3 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="border-b border-ink-900/5">
                    <td colSpan={6} className="px-3 py-4">
                      <div className="h-4 animate-pulse rounded bg-cream-200" />
                    </td>
                  </tr>
                ))}

              {!loading && tickets.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-16 text-center text-ink-500">
                    {emptyCopy}
                  </td>
                </tr>
              )}

              {!loading &&
                tickets.map((ticket) => (
                  <tr
                    key={ticket.ticket_id}
                    className="ticket-row cursor-pointer border-b border-ink-900/5 last:border-0"
                    onClick={() => navigate(`/tickets/${ticket.ticket_id}`)}
                  >
                    <td className="whitespace-nowrap px-3 py-4 font-medium">
                      {ticket.ticket_id}
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-3">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink-900 text-[11px] font-medium text-cream-50">
                          {initials(ticket.customer_name)}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-medium">
                            {ticket.customer_name}
                          </span>
                          <span className="block truncate text-xs text-ink-500">
                            {ticket.customer_email}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className="max-w-xs px-3 py-4">
                      <span className="line-clamp-1">{ticket.subject}</span>
                    </td>
                    <td className="px-3 py-4">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-ink-500">
                      {formatDate(ticket.created_at)}
                    </td>
                    <td className="px-3 py-4 text-right">
                      <Link
                        to={`/tickets/${ticket.ticket_id}`}
                        onClick={(event) => event.stopPropagation()}
                        className="text-sm font-medium text-moss-600 hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Hero from "../components/Hero.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { fetchStats, fetchTickets, toFriendlyError } from "../services/api.js";
import { formatDate, initials } from "../utils/format.js";

const FILTERS = ["All Statuses", "Open", "In Progress", "Closed"];

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
      <Hero onCreate={() => navigate("/tickets/new")} stats={stats} />

      <motion.section
        id="queue"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel scroll-mt-6 rounded-[28px] p-4 sm:p-5"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search ID, customer, email, subject or description"
            className="field min-w-0 flex-1"
            maxLength={80}
            aria-label="Search tickets"
          />
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setStatus(item)}
                className="relative rounded-full px-3.5 py-2 text-sm"
              >
                {status === item && (
                  <motion.span
                    layoutId="status-pill"
                    className="absolute inset-0 rounded-full bg-white"
                    transition={{ type: "spring", stiffness: 380, damping: 28 }}
                  />
                )}
                <span className={`relative z-10 ${status === item ? "text-zinc-950" : "text-white/65"}`}>
                  {item}
                </span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-[0.14em] text-white/40">
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
                  <tr key={index}>
                    <td colSpan={6} className="px-3 py-4">
                      <div className="h-4 animate-pulse rounded bg-white/10" />
                    </td>
                  </tr>
                ))}

              {!loading && tickets.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-16 text-center text-white/45">
                    {emptyCopy}
                  </td>
                </tr>
              )}

              <AnimatePresence>
                {!loading &&
                  tickets.map((ticket, index) => (
                    <motion.tr
                      key={ticket.ticket_id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="cursor-pointer border-b border-white/5 last:border-0 hover:bg-white/[0.03]"
                      onClick={() => navigate(`/tickets/${ticket.ticket_id}`)}
                    >
                      <td className="whitespace-nowrap px-3 py-4 font-medium">{ticket.ticket_id}</td>
                      <td className="px-3 py-4">
                        <div className="flex items-center gap-3">
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 text-[11px] font-medium">
                            {initials(ticket.customer_name)}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate">{ticket.customer_name}</span>
                            <span className="block truncate text-xs text-white/40">
                              {ticket.customer_email}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="max-w-xs px-3 py-4">
                        <span className="line-clamp-1 text-white/80">{ticket.subject}</span>
                      </td>
                      <td className="px-3 py-4">
                        <StatusBadge status={ticket.status} />
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-white/45">
                        {formatDate(ticket.created_at)}
                      </td>
                      <td className="px-3 py-4 text-right">
                        <Link
                          to={`/tickets/${ticket.ticket_id}`}
                          onClick={(event) => event.stopPropagation()}
                          className="text-sm font-medium text-amber-200/80 hover:text-amber-100"
                        >
                          View
                        </Link>
                      </td>
                    </motion.tr>
                  ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.section>
    </div>
  );
}

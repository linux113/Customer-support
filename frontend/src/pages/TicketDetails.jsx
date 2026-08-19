import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import StatusBadge from "../components/StatusBadge.jsx";
import GlowButton from "../components/ui/GlowButton.jsx";
import { fetchTicket, toFriendlyError, updateTicket } from "../services/api.js";
import { formatDateTime, initials } from "../utils/format.js";

const STATUSES = ["Open", "In Progress", "Closed"];

export default function TicketDetails() {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [status, setStatus] = useState("Open");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await fetchTicket(ticketId);
        if (!cancelled) {
          setTicket(data);
          setStatus(data.status);
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
  }, [ticketId]);

  async function handleUpdate(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const payload = {};
      if (status !== ticket.status) payload.status = status;
      if (note.trim()) payload.notes = note.trim();
      if (!payload.status && !payload.notes) {
        setError("Change the status or add a note before updating.");
        setSaving(false);
        return;
      }
      const updated = await updateTicket(ticketId, payload);
      setTicket(updated);
      setStatus(updated.status);
      setNote("");
      setNotice("Ticket updated and saved.");
    } catch (err) {
      setError(toFriendlyError(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="glass-panel rounded-[28px] p-8">
        <div className="h-8 w-40 animate-pulse rounded bg-white/10" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <section className="glass-panel rounded-[28px] p-8">
        <h1 className="font-display text-3xl">Ticket not found</h1>
        <p className="mt-2 text-white/50">{error || "No record for that id."}</p>
        <Link to="/" className="mt-6 inline-block text-sm">
          ← Return to queue
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/" className="text-sm text-white/45 hover:text-white">
          ← Back to queue
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-4xl tracking-tight">{ticket.ticket_id}</h1>
          <StatusBadge status={ticket.status} />
        </div>
        <p className="mt-2 max-w-2xl text-lg text-white/75">{ticket.subject}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-5">
          <article className="glass-panel rounded-[28px] p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-white/40">Customer</p>
            <div className="mt-4 flex items-center gap-4">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 font-medium">
                {initials(ticket.customer_name)}
              </span>
              <div>
                <p className="text-lg font-medium">{ticket.customer_name}</p>
                <a href={`mailto:${ticket.customer_email}`} className="text-sm text-amber-200/80">
                  {ticket.customer_email}
                </a>
              </div>
            </div>
          </article>

          <article className="glass-panel rounded-[28px] p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-white/40">Description</p>
            <p className="mt-4 whitespace-pre-wrap leading-7 text-white/75">{ticket.description}</p>
            <dl className="mt-6 grid gap-4 border-t border-white/10 pt-5 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-white/40">Created</dt>
                <dd className="mt-1">{formatDateTime(ticket.created_at)}</dd>
              </div>
              <div>
                <dt className="text-white/40">Last updated</dt>
                <dd className="mt-1">{formatDateTime(ticket.updated_at)}</dd>
              </div>
            </dl>
          </article>

          <article className="glass-panel rounded-[28px] p-6">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.18em] text-white/40">Internal notes</p>
              <span className="text-xs text-white/35">{ticket.notes?.length || 0} on file</span>
            </div>
            <div className="mt-4 space-y-3">
              {(!ticket.notes || ticket.notes.length === 0) && (
                <p className="rounded-2xl bg-white/[0.04] px-4 py-6 text-sm text-white/45">
                  No notes yet.
                </p>
              )}
              <AnimatePresence initial={false}>
                {ticket.notes?.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
                  >
                    <p className="text-sm leading-6">{item.note_text}</p>
                    <p className="mt-2 text-xs text-white/35">{formatDateTime(item.created_at)}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </article>
        </section>

        <aside className="glass-panel h-fit rounded-[28px] p-6">
          <h2 className="font-display text-2xl">Update ticket</h2>
          <p className="mt-1 text-sm text-white/45">Change status, leave a note, or both.</p>
          <form onSubmit={handleUpdate} className="mt-5 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs uppercase tracking-[0.16em] text-white/40">Status</span>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="field"
              >
                {STATUSES.map((item) => (
                  <option key={item} value={item} className="bg-zinc-900">
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs uppercase tracking-[0.16em] text-white/40">Add note</span>
              <textarea
                rows={5}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Escalated to payment team."
                maxLength={2000}
                className="field resize-y"
              />
            </label>
            {error && (
              <p className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>
            )}
            {notice && (
              <p className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                {notice}
              </p>
            )}
            <GlowButton type="submit" disabled={saving} className="w-full">
              {saving ? "Saving…" : "Update ticket"}
            </GlowButton>
          </form>
        </aside>
      </div>
    </div>
  );
}

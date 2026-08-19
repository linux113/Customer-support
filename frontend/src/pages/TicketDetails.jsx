import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import StatusBadge from "../components/StatusBadge.jsx";
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
      <div className="rounded-[28px] border border-ink-900/8 bg-white/80 p-8 shadow-card">
        <div className="h-8 w-40 animate-pulse rounded bg-cream-200" />
        <div className="mt-4 h-24 animate-pulse rounded-2xl bg-cream-100" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <section className="rounded-[28px] border border-ink-900/8 bg-white/85 p-8 shadow-card">
        <h1 className="font-display text-3xl">Ticket not found</h1>
        <p className="mt-2 text-ink-500">{error || `No record for ${ticketId}.`}</p>
        <Link to="/" className="mt-6 inline-block text-sm font-medium">
          ← Return to queue
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <Link to="/" className="text-sm text-ink-500 hover:text-ink-900">
            ← Back to queue
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="font-display text-4xl tracking-tight">
              {ticket.ticket_id}
            </h1>
            <StatusBadge status={ticket.status} />
          </div>
          <p className="mt-2 max-w-2xl text-lg text-ink-800">{ticket.subject}</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-5">
          <article className="rounded-[28px] border border-ink-900/8 bg-white/85 p-6 shadow-card">
            <p className="text-xs uppercase tracking-[0.18em] text-ink-500">
              Customer
            </p>
            <div className="mt-4 flex items-center gap-4">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ink-900 font-medium text-cream-50">
                {initials(ticket.customer_name)}
              </span>
              <div>
                <p className="text-lg font-medium">{ticket.customer_name}</p>
                <a
                  href={`mailto:${ticket.customer_email}`}
                  className="text-sm text-moss-600 hover:underline"
                >
                  {ticket.customer_email}
                </a>
              </div>
            </div>
          </article>

          <article className="rounded-[28px] border border-ink-900/8 bg-white/85 p-6 shadow-card">
            <p className="text-xs uppercase tracking-[0.18em] text-ink-500">
              Description
            </p>
            <p className="mt-4 whitespace-pre-wrap leading-7 text-ink-800">
              {ticket.description}
            </p>
            <dl className="mt-6 grid gap-4 border-t border-ink-900/8 pt-5 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-ink-500">Created</dt>
                <dd className="mt-1 font-medium">{formatDateTime(ticket.created_at)}</dd>
              </div>
              <div>
                <dt className="text-ink-500">Last updated</dt>
                <dd className="mt-1 font-medium">{formatDateTime(ticket.updated_at)}</dd>
              </div>
            </dl>
          </article>

          <article className="rounded-[28px] border border-ink-900/8 bg-white/85 p-6 shadow-card">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.18em] text-ink-500">
                Internal notes
              </p>
              <span className="text-xs text-ink-400">
                {ticket.notes?.length || 0} on file
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {(!ticket.notes || ticket.notes.length === 0) && (
                <p className="rounded-2xl bg-cream-100 px-4 py-6 text-sm text-ink-500">
                  No notes yet. Add the first internal comment on the right.
                </p>
              )}
              {ticket.notes?.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-ink-900/8 bg-cream-50 px-4 py-3"
                >
                  <p className="text-sm leading-6">{item.note_text}</p>
                  <p className="mt-2 text-xs text-ink-400">
                    {formatDateTime(item.created_at)}
                  </p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <aside className="h-fit rounded-[28px] border border-ink-900/8 bg-white/85 p-6 shadow-card">
          <h2 className="font-display text-2xl">Update ticket</h2>
          <p className="mt-1 text-sm text-ink-500">
            Change status, leave an internal note, or do both.
          </p>
          <form onSubmit={handleUpdate} className="mt-5 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs uppercase tracking-[0.16em] text-ink-500">
                Status
              </span>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="w-full rounded-2xl border border-ink-900/10 bg-cream-50 px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-brass-400/40"
              >
                {STATUSES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs uppercase tracking-[0.16em] text-ink-500">
                Add note
              </span>
              <textarea
                rows={5}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Escalated to payment team."
                className="w-full resize-y rounded-2xl border border-ink-900/10 bg-cream-50 px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-brass-400/40"
              />
            </label>

            {error && (
              <p className="rounded-2xl border border-clay-500/30 bg-clay-500/10 px-4 py-3 text-sm text-clay-500">
                {error}
              </p>
            )}
            {notice && (
              <p className="rounded-2xl border border-moss-500/25 bg-moss-500/10 px-4 py-3 text-sm text-moss-600">
                {notice}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-full bg-ink-900 px-5 py-3 text-sm font-medium text-cream-50 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Update ticket"}
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}

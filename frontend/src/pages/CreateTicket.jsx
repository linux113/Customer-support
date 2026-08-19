import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import GlowButton from "../components/ui/GlowButton.jsx";
import { createTicket, toFriendlyError } from "../services/api.js";

const EMPTY = {
  customer_name: "",
  customer_email: "",
  subject: "",
  description: "",
};

export default function CreateTicket() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(null);

  function update(field) {
    return (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      setCreated(await createTicket(form));
    } catch (err) {
      setError(toFriendlyError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence mode="wait">
      {created ? (
        <motion.section
          key="done"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel mx-auto max-w-xl rounded-[28px] p-8 text-center"
        >
          <p className="text-xs uppercase tracking-[0.22em] text-emerald-300">Ticket opened</p>
          <h1 className="mt-3 font-display text-4xl">It’s on the queue</h1>
          <p className="mt-3 text-white/55">
            Logged as <span className="text-white">{created.ticket_id}</span> with status Open.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <GlowButton type="button" onClick={() => navigate(`/tickets/${created.ticket_id}`)}>
              Open ticket
            </GlowButton>
            <button
              type="button"
              onClick={() => {
                setCreated(null);
                setForm(EMPTY);
              }}
              className="rounded-full border border-white/15 px-5 py-3 text-sm"
            >
              File another
            </button>
          </div>
        </motion.section>
      ) : (
        <motion.div key="form" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-2xl">
          <Link to="/" className="text-sm text-white/45 hover:text-white">
            ← Back to queue
          </Link>
          <h1 className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">New ticket</h1>
          <p className="mt-2 max-w-md text-white/50">
            Capture the customer and the issue. A ticket ID is generated on save.
          </p>
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Customer name">
                <input required value={form.customer_name} onChange={update("customer_name")} className="field" placeholder="Rahul Sharma" maxLength={120} />
              </Field>
              <Field label="Customer email">
                <input required type="email" value={form.customer_email} onChange={update("customer_email")} className="field" placeholder="rahul@gmail.com" maxLength={254} />
              </Field>
            </div>
            <Field label="Subject">
              <input required value={form.subject} onChange={update("subject")} className="field" placeholder="Payment Failed" maxLength={200} />
            </Field>
            <Field label="Description">
              <textarea required rows={6} value={form.description} onChange={update("description")} className="field resize-y" placeholder="What happened, and what should happen next?" maxLength={4000} />
            </Field>
            {error && (
              <p className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>
            )}
            <div className="flex items-center gap-3 pt-2">
              <GlowButton type="submit" disabled={submitting}>
                {submitting ? "Creating…" : "Create ticket"}
              </GlowButton>
              <Link to="/" className="text-sm text-white/45">
                Cancel
              </Link>
            </div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-[0.16em] text-white/40">{label} *</span>
      {children}
    </label>
  );
}

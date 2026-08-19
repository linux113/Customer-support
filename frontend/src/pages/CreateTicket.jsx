import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
    return (event) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const ticket = await createTicket(form);
      setCreated(ticket);
    } catch (err) {
      setError(toFriendlyError(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (created) {
    return (
      <section className="mx-auto max-w-xl rounded-[28px] border border-ink-900/8 bg-white/85 p-8 text-center shadow-card">
        <p className="text-xs uppercase tracking-[0.22em] text-moss-500">
          Ticket opened
        </p>
        <h1 className="mt-3 font-display text-4xl">It’s on the queue</h1>
        <p className="mt-3 text-ink-500">
          We’ve logged this as{" "}
          <span className="font-medium text-ink-900">{created.ticket_id}</span>{" "}
          with status Open.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => navigate(`/tickets/${created.ticket_id}`)}
            className="rounded-full bg-ink-900 px-5 py-3 text-sm font-medium text-cream-50"
          >
            Open ticket
          </button>
          <button
            type="button"
            onClick={() => {
              setCreated(null);
              setForm(EMPTY);
            }}
            className="rounded-full bg-cream-100 px-5 py-3 text-sm font-medium"
          >
            File another
          </button>
        </div>
      </section>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_0.72fr]">
      <section>
        <Link to="/" className="text-sm text-ink-500 hover:text-ink-900">
          ← Back to queue
        </Link>
        <h1 className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">
          New ticket
        </h1>
        <p className="mt-2 max-w-md text-ink-500">
          Capture the customer and the issue. A ticket ID is generated on save
          and the case starts as Open.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Customer name" required>
              <input
                required
                value={form.customer_name}
                onChange={update("customer_name")}
                className="field"
                placeholder="Rahul Sharma"
              />
            </Field>
            <Field label="Customer email" required>
              <input
                required
                type="email"
                value={form.customer_email}
                onChange={update("customer_email")}
                className="field"
                placeholder="rahul@gmail.com"
              />
            </Field>
          </div>
          <Field label="Subject" required>
            <input
              required
              value={form.subject}
              onChange={update("subject")}
              className="field"
              placeholder="Payment Failed"
            />
          </Field>
          <Field label="Description" required>
            <textarea
              required
              rows={6}
              value={form.description}
              onChange={update("description")}
              className="field resize-y"
              placeholder="What happened, and what should happen next?"
            />
          </Field>

          {error && (
            <p className="rounded-2xl border border-clay-500/30 bg-clay-500/10 px-4 py-3 text-sm text-clay-500">
              {error}
            </p>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-ink-900 px-5 py-3 text-sm font-medium text-cream-50 disabled:opacity-60"
            >
              {submitting ? "Creating…" : "Create ticket"}
            </button>
            <Link to="/" className="text-sm text-ink-500">
              Cancel
            </Link>
          </div>
        </form>
      </section>

      <aside className="h-fit rounded-[28px] border border-ink-900/8 bg-ink-900 p-6 text-cream-50 shadow-card">
        <p className="text-xs uppercase tracking-[0.22em] text-brass-300">
          How IDs work
        </p>
        <h2 className="mt-3 font-display text-3xl">TKT-00X</h2>
        <p className="mt-3 text-sm leading-6 text-cream-200">
          The next sequential ticket number is assigned by the API. You will
          see it immediately after the ticket is stored.
        </p>
        <ul className="mt-6 space-y-3 text-sm text-cream-200">
          <li>Required: name, email, subject, description</li>
          <li>Invalid emails return a 400 from the API</li>
          <li>Default status is Open</li>
        </ul>
      </aside>

      <style>{`
        .field {
          width: 100%;
          border-radius: 1rem;
          border: 1px solid rgba(18,25,22,0.1);
          background: rgba(251,247,239,0.9);
          padding: 0.8rem 0.95rem;
          font-size: 0.925rem;
          outline: none;
        }
        .field:focus {
          box-shadow: 0 0 0 3px rgba(201,164,74,0.28);
        }
      `}</style>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-[0.16em] text-ink-500">
        {label}
        {required ? " *" : ""}
      </span>
      {children}
    </label>
  );
}

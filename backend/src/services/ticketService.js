const { db, nowIso } = require("../db/connection");
const { nextTicketId } = require("../utils/ticketId");

function mapTicket(row) {
  if (!row) return null;
  return {
    id: row.id,
    ticket_id: row.ticket_id,
    customer_name: row.customer_name,
    customer_email: row.customer_email,
    subject: row.subject,
    description: row.description,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function mapNote(row) {
  return {
    id: row.id,
    ticket_id: row.ticket_id,
    note_text: row.note_text,
    created_at: row.created_at,
  };
}

async function listTickets({ status, search } = {}) {
  const clauses = [];
  const params = [];

  if (status && status !== "All" && status !== "All Statuses") {
    clauses.push("status = ?");
    params.push(status);
  }

  if (search && search.trim()) {
    const q = `%${search.trim().toLowerCase()}%`;
    clauses.push(
      `(LOWER(ticket_id) LIKE ? OR LOWER(customer_name) LIKE ? OR LOWER(customer_email) LIKE ? OR LOWER(subject) LIKE ? OR LOWER(description) LIKE ?)`
    );
    params.push(q, q, q, q, q);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const rows = await db.all(
    `SELECT * FROM tickets ${where} ORDER BY created_at DESC`,
    params
  );
  return rows.map(mapTicket);
}

async function getTicketById(ticketId) {
  const ticket = mapTicket(
    await db.get("SELECT * FROM tickets WHERE ticket_id = ?", [ticketId])
  );
  if (!ticket) return null;

  const notes = await db.all(
    "SELECT * FROM notes WHERE ticket_id = ? ORDER BY created_at ASC",
    [ticketId]
  );
  return { ...ticket, notes: notes.map(mapNote) };
}

async function createTicket(payload) {
  const last = await db.get(
    "SELECT ticket_id FROM tickets ORDER BY id DESC LIMIT 1"
  );
  const ticket_id = nextTicketId(last?.ticket_id);
  const stamp = nowIso();

  await db.run(
    `INSERT INTO tickets
      (ticket_id, customer_name, customer_email, subject, description, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 'Open', ?, ?)`,
    [
      ticket_id,
      payload.customer_name,
      payload.customer_email,
      payload.subject,
      payload.description,
      stamp,
      stamp,
    ]
  );

  return getTicketById(ticket_id);
}

async function updateTicket(ticketId, { status, notes }) {
  const existing = await db.get(
    "SELECT * FROM tickets WHERE ticket_id = ?",
    [ticketId]
  );
  if (!existing) return null;

  const stamp = nowIso();

  if (status) {
    await db.run(
      "UPDATE tickets SET status = ?, updated_at = ? WHERE ticket_id = ?",
      [status, stamp, ticketId]
    );
  } else {
    await db.run("UPDATE tickets SET updated_at = ? WHERE ticket_id = ?", [
      stamp,
      ticketId,
    ]);
  }

  if (notes) {
    await db.run(
      "INSERT INTO notes (ticket_id, note_text, created_at) VALUES (?, ?, ?)",
      [ticketId, notes, stamp]
    );
  }

  return getTicketById(ticketId);
}

async function getStats() {
  const rows = await db.all(
    "SELECT status, COUNT(*) AS count FROM tickets GROUP BY status"
  );
  const counts = { Open: 0, "In Progress": 0, Closed: 0 };
  for (const row of rows) {
    counts[row.status] = Number(row.count);
  }
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
  return {
    total,
    open: counts.Open,
    in_progress: counts["In Progress"],
    closed: counts.Closed,
  };
}

module.exports = {
  listTickets,
  getTicketById,
  createTicket,
  updateTicket,
  getStats,
};

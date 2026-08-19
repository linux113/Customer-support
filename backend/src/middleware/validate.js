const ALLOWED_STATUSES = ["Open", "In Progress", "Closed"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TICKET_ID_RE = /^TKT-\d{1,8}$/;

const LIMITS = {
  customer_name: 120,
  customer_email: 254,
  subject: 200,
  description: 4000,
  notes: 2000,
  search: 80,
};

function clean(value, max) {
  if (typeof value !== "string") return "";
  const trimmed = value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim();
  return max ? trimmed.slice(0, max) : trimmed;
}

function tooLong(value, max) {
  return typeof value === "string" && value.trim().length > max;
}

function validateCreateTicket(req, res, next) {
  const raw = req.body || {};
  if (
    tooLong(raw.customer_name, LIMITS.customer_name) ||
    tooLong(raw.customer_email, LIMITS.customer_email) ||
    tooLong(raw.subject, LIMITS.subject) ||
    tooLong(raw.description, LIMITS.description)
  ) {
    return res.status(400).json({
      error: "Validation Error",
      message: "One or more fields are too long.",
    });
  }

  const customer_name = clean(raw.customer_name, LIMITS.customer_name);
  const customer_email = clean(raw.customer_email, LIMITS.customer_email).toLowerCase();
  const subject = clean(raw.subject, LIMITS.subject);
  const description = clean(raw.description, LIMITS.description);

  const missing = [];
  if (!customer_name) missing.push("customer_name");
  if (!customer_email) missing.push("customer_email");
  if (!subject) missing.push("subject");
  if (!description) missing.push("description");

  if (missing.length) {
    return res.status(400).json({
      error: "Validation Error",
      message: "Please fill in all required fields.",
      details: { missing },
    });
  }

  if (!EMAIL_RE.test(customer_email)) {
    return res.status(400).json({
      error: "Validation Error",
      message: "Please enter a valid customer email address.",
      details: { field: "customer_email" },
    });
  }

  req.body = { customer_name, customer_email, subject, description };
  next();
}

function validateUpdateTicket(req, res, next) {
  const raw = req.body || {};
  if (tooLong(raw.notes, LIMITS.notes) || tooLong(raw.note_text, LIMITS.notes)) {
    return res.status(400).json({
      error: "Validation Error",
      message: "Note is too long.",
    });
  }

  const status = raw.status != null ? clean(raw.status, 20) : undefined;
  const notes =
    raw.notes != null
      ? clean(raw.notes, LIMITS.notes)
      : raw.note_text != null
        ? clean(raw.note_text, LIMITS.notes)
        : undefined;

  if (status === undefined && (notes === undefined || notes === "")) {
    return res.status(400).json({
      error: "Validation Error",
      message: "Provide a new status and/or a note to update this ticket.",
    });
  }

  if (status !== undefined && !ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({
      error: "Validation Error",
      message: "Status must be Open, In Progress or Closed.",
      details: { allowed: ALLOWED_STATUSES },
    });
  }

  req.body = {
    status,
    notes: notes || undefined,
  };
  next();
}

function validateTicketId(req, res, next) {
  const ticketId = String(req.params.ticket_id || "");
  if (!TICKET_ID_RE.test(ticketId)) {
    return res.status(400).json({
      error: "Validation Error",
      message: "Ticket id must look like TKT-001.",
    });
  }
  next();
}

function sanitizeListQuery(req, res, next) {
  if (req.query.search) {
    req.query.search = clean(String(req.query.search), LIMITS.search);
  }
  if (req.query.status && !["Open", "In Progress", "Closed"].includes(req.query.status)) {
    if (req.query.status !== "All" && req.query.status !== "All Statuses") {
      return res.status(400).json({
        error: "Validation Error",
        message: "Status filter must be Open, In Progress or Closed.",
      });
    }
  }
  next();
}

module.exports = {
  ALLOWED_STATUSES,
  validateCreateTicket,
  validateUpdateTicket,
  validateTicketId,
  sanitizeListQuery,
};

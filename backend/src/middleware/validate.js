const ALLOWED_STATUSES = ["Open", "In Progress", "Closed"];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

function validateCreateTicket(req, res, next) {
  const customer_name = clean(req.body?.customer_name);
  const customer_email = clean(req.body?.customer_email);
  const subject = clean(req.body?.subject);
  const description = clean(req.body?.description);

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
  const status = req.body?.status != null ? clean(req.body.status) : undefined;
  const notes =
    req.body?.notes != null
      ? clean(req.body.notes)
      : req.body?.note_text != null
        ? clean(req.body.note_text)
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

module.exports = {
  ALLOWED_STATUSES,
  validateCreateTicket,
  validateUpdateTicket,
};

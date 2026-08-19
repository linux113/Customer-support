const { db, nowIso } = require("./connection");

const SAMPLE_TICKETS = [
  {
    ticket_id: "TKT-001",
    customer_name: "Rahul Sharma",
    customer_email: "rahul@gmail.com",
    subject: "Payment Failed",
    description:
      "Payment was deducted from my card but the order was not confirmed. Transaction ref UPI-88421.",
    status: "In Progress",
    notes: ["Escalated to payment team.", "Waiting on bank confirmation."],
  },
  {
    ticket_id: "TKT-002",
    customer_name: "Aisha Khan",
    customer_email: "aisha.khan@outlook.com",
    subject: "Unable to reset password",
    description:
      "Reset email never arrives. Tried three times from work and personal inbox.",
    status: "Open",
    notes: [],
  },
  {
    ticket_id: "TKT-003",
    customer_name: "Daniel Okoye",
    customer_email: "daniel.okoye@acme.co",
    subject: "Invoice missing GSTIN",
    description:
      "January invoice does not show our GSTIN. Finance cannot process payment.",
    status: "Closed",
    notes: ["Updated billing profile.", "Reissued invoice INV-2044."],
  },
  {
    ticket_id: "TKT-004",
    customer_name: "Priya Nair",
    customer_email: "priya.nair@gmail.com",
    subject: "App crashes on checkout",
    description:
      "Android 14, Pixel 7. Tapping Pay Now closes the app immediately.",
    status: "In Progress",
    notes: ["Reproduced on Pixel lab device."],
  },
  {
    ticket_id: "TKT-005",
    customer_name: "James Whitaker",
    customer_email: "james.w@whitaker.io",
    subject: "Wrong shipping address",
    description:
      "Order #8821 is going to my old office. Need to reroute to the Pune warehouse.",
    status: "Open",
    notes: [],
  },
  {
    ticket_id: "TKT-006",
    customer_name: "Meera Iyer",
    customer_email: "meera.iyer@ganesh.in",
    subject: "Duplicate subscription charge",
    description:
      "Billed twice for the Pro plan on 12 Aug. Need refund of the second charge.",
    status: "Open",
    notes: ["Customer attached two Stripe receipts."],
  },
  {
    ticket_id: "TKT-007",
    customer_name: "Luis Fernandez",
    customer_email: "luis@fernandez.mx",
    subject: "Export CSV is empty",
    description:
      "Reports > Export returns a 0-byte file for last 30 days of tickets.",
    status: "Closed",
    notes: ["Bug fixed in 1.4.2.", "Customer confirmed export works."],
  },
  {
    ticket_id: "TKT-008",
    customer_name: "Ananya Bose",
    customer_email: "ananya.bose@yahoo.com",
    subject: "Agent never replied",
    description:
      "Opened a chat last Friday. Waited 40 minutes, then the session timed out.",
    status: "In Progress",
    notes: [],
  },
];

async function seedIfEmpty() {
  if (String(process.env.SEED_SAMPLE_DATA).toLowerCase() === "false") return;

  const row = await db.get("SELECT COUNT(*) AS count FROM tickets");
  const count = Number(row?.count ?? row?.COUNT ?? 0);
  if (count > 0) return;

  const created = new Date("2026-08-12T09:30:00.000Z");

  for (let i = 0; i < SAMPLE_TICKETS.length; i += 1) {
    const ticket = SAMPLE_TICKETS[i];
    const createdAt = new Date(created.getTime() + i * 36e5 * 7).toISOString();
    const updatedAt = new Date(
      created.getTime() + i * 36e5 * 7 + 9e5
    ).toISOString();

    await db.run(
      `INSERT INTO tickets
        (ticket_id, customer_name, customer_email, subject, description, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ticket.ticket_id,
        ticket.customer_name,
        ticket.customer_email,
        ticket.subject,
        ticket.description,
        ticket.status,
        createdAt,
        updatedAt,
      ]
    );

    for (const note of ticket.notes) {
      await db.run(
        `INSERT INTO notes (ticket_id, note_text, created_at) VALUES (?, ?, ?)`,
        [ticket.ticket_id, note, nowIso()]
      );
    }
  }
}

module.exports = { seedIfEmpty };

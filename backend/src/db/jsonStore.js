const fs = require("fs");
const path = require("path");

function storePath() {
  if (process.env.VERCEL) return "/tmp/ganesh-support.json";
  return (
    process.env.JSON_DB_PATH ||
    path.join(__dirname, "../../data/support.json")
  );
}

function emptyState() {
  return { tickets: [], notes: [], nextTicket: 1, nextNote: 1 };
}

function load(file) {
  try {
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, "utf8"));
    }
  } catch (error) {
    console.error("[json-store] read failed", error.message);
  }
  return emptyState();
}

function save(file, state) {
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(state));
  } catch (error) {
    console.error("[json-store] write failed", error.message);
  }
}

function createJsonStore() {
  const file = storePath();
  let state = load(file);

  const persist = () => save(file, state);

  return {
    dialect: "json",
    all(sql, params = []) {
      const text = String(sql);
      if (text.includes("FROM tickets") && text.includes("GROUP BY status")) {
        const counts = {};
        for (const ticket of state.tickets) {
          counts[ticket.status] = (counts[ticket.status] || 0) + 1;
        }
        return Object.entries(counts).map(([status, count]) => ({
          status,
          count,
        }));
      }

      if (text.includes("FROM notes")) {
        const ticketId = params[0];
        return state.notes
          .filter((note) => note.ticket_id === ticketId)
          .sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)));
      }

      let rows = [...state.tickets];
      if (text.includes("status = ?")) {
        rows = rows.filter((row) => row.status === params[0]);
        params = params.slice(1);
      }
      if (text.includes("LIKE ?")) {
        const needle = String(params[0] || "")
          .replace(/%/g, "")
          .toLowerCase();
        rows = rows.filter((row) =>
          ["ticket_id", "customer_name", "customer_email", "subject", "description"]
            .some((key) => String(row[key] || "").toLowerCase().includes(needle))
        );
      }
      return rows.sort((a, b) =>
        String(b.created_at).localeCompare(String(a.created_at))
      );
    },
    get(sql, params = []) {
      const text = String(sql);
      if (text.includes("COUNT(*)")) {
        return { count: state.tickets.length };
      }
      if (text.includes("ORDER BY id DESC")) {
        const last = [...state.tickets].sort((a, b) => b.id - a.id)[0];
        return last ? { ticket_id: last.ticket_id } : null;
      }
      if (text.includes("WHERE ticket_id = ?")) {
        return state.tickets.find((row) => row.ticket_id === params[0]) || null;
      }
      return null;
    },
    run(sql, params = []) {
      const text = String(sql);
      if (text.startsWith("INSERT INTO tickets")) {
        const [
          ticket_id,
          customer_name,
          customer_email,
          subject,
          description,
          status,
          created_at,
          updated_at,
        ] = params.length === 8
          ? params
          : [params[0], params[1], params[2], params[3], params[4], "Open", params[5], params[6]];
        const row = {
          id: state.nextTicket++,
          ticket_id,
          customer_name,
          customer_email,
          subject,
          description,
          status: status || "Open",
          created_at,
          updated_at,
        };
        state.tickets.push(row);
        persist();
        return { changes: 1, lastInsertRowid: row.id };
      }
      if (text.startsWith("INSERT INTO notes")) {
        const [ticket_id, note_text, created_at] = params;
        const row = {
          id: state.nextNote++,
          ticket_id,
          note_text,
          created_at,
        };
        state.notes.push(row);
        persist();
        return { changes: 1, lastInsertRowid: row.id };
      }
      if (text.startsWith("UPDATE tickets SET status")) {
        const [status, updated_at, ticket_id] = params;
        const row = state.tickets.find((item) => item.ticket_id === ticket_id);
        if (!row) return { changes: 0 };
        row.status = status;
        row.updated_at = updated_at;
        persist();
        return { changes: 1 };
      }
      if (text.startsWith("UPDATE tickets SET updated_at")) {
        const [updated_at, ticket_id] = params;
        const row = state.tickets.find((item) => item.ticket_id === ticket_id);
        if (!row) return { changes: 0 };
        row.updated_at = updated_at;
        persist();
        return { changes: 1 };
      }
      return { changes: 0 };
    },
    async transaction(fn) {
      return fn(this);
    },
  };
}

module.exports = { createJsonStore };

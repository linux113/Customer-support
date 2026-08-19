function pad(n, width = 3) {
  return String(n).padStart(width, "0");
}

function nextTicketId(lastId) {
  if (!lastId) return "TKT-001";
  const match = String(lastId).match(/(\d+)$/);
  const next = match ? Number(match[1]) + 1 : 1;
  return `TKT-${pad(next)}`;
}

module.exports = { nextTicketId };

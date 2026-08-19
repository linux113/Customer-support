import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

function toFriendlyError(error) {
  const data = error.response?.data;
  if (data?.message) return data.message;
  if (error.code === "ECONNABORTED") return "The request timed out. Please try again.";
  if (!error.response) return "Cannot reach the support API. Check that the server is running.";
  return "Something unexpected happened. Please try again.";
}

export async function fetchTickets({ status, search } = {}) {
  const params = {};
  if (status && status !== "All Statuses") params.status = status;
  if (search) params.search = search;
  const { data } = await api.get("/tickets", { params });
  return data;
}

export async function fetchStats() {
  const { data } = await api.get("/tickets/stats");
  return data;
}

export async function fetchTicket(ticketId) {
  const { data } = await api.get(`/tickets/${encodeURIComponent(ticketId)}`);
  return data;
}

export async function createTicket(payload) {
  const { data } = await api.post("/tickets", payload);
  return data;
}

export async function updateTicket(ticketId, payload) {
  const { data } = await api.put(`/tickets/${encodeURIComponent(ticketId)}`, payload);
  return data;
}

export { toFriendlyError };

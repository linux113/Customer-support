const ticketService = require("../services/ticketService");

async function createTicket(req, res, next) {
  try {
    const ticket = await ticketService.createTicket(req.body);
    res.status(201).json(ticket);
  } catch (error) {
    next(error);
  }
}

async function listTickets(req, res, next) {
  try {
    const { status, search } = req.query;
    const tickets = await ticketService.listTickets({ status, search });
    res.json(tickets);
  } catch (error) {
    next(error);
  }
}

async function getTicket(req, res, next) {
  try {
    const ticket = await ticketService.getTicketById(req.params.ticket_id);
    if (!ticket) {
      return res.status(404).json({
        error: "Not Found",
        message: `No ticket found with id ${req.params.ticket_id}.`,
      });
    }
    res.json(ticket);
  } catch (error) {
    next(error);
  }
}

async function updateTicket(req, res, next) {
  try {
    const ticket = await ticketService.updateTicket(
      req.params.ticket_id,
      req.body
    );
    if (!ticket) {
      return res.status(404).json({
        error: "Not Found",
        message: `No ticket found with id ${req.params.ticket_id}.`,
      });
    }
    res.json(ticket);
  } catch (error) {
    next(error);
  }
}

async function getStats(req, res, next) {
  try {
    const stats = await ticketService.getStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createTicket,
  listTickets,
  getTicket,
  updateTicket,
  getStats,
};

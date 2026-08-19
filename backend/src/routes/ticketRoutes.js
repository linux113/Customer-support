const express = require("express");
const ticketController = require("../controllers/ticketController");
const {
  validateCreateTicket,
  validateUpdateTicket,
  validateTicketId,
  sanitizeListQuery,
} = require("../middleware/validate");
const { requireWrite } = require("../middleware/requireWrite");

const router = express.Router();

router.post("/", requireWrite, validateCreateTicket, ticketController.createTicket);
router.get("/", sanitizeListQuery, ticketController.listTickets);
router.get("/stats", ticketController.getStats);
router.get("/:ticket_id", validateTicketId, ticketController.getTicket);
router.put(
  "/:ticket_id",
  requireWrite,
  validateTicketId,
  validateUpdateTicket,
  ticketController.updateTicket
);

module.exports = router;

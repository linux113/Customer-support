const express = require("express");
const ticketController = require("../controllers/ticketController");
const {
  validateCreateTicket,
  validateUpdateTicket,
} = require("../middleware/validate");

const router = express.Router();

router.post("/", validateCreateTicket, ticketController.createTicket);
router.get("/", ticketController.listTickets);
router.get("/stats", ticketController.getStats);
router.get("/:ticket_id", ticketController.getTicket);
router.put("/:ticket_id", validateUpdateTicket, ticketController.updateTicket);

module.exports = router;

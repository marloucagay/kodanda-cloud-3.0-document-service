const { Router } = require("express");
const router = Router();
const {
  generateTripTicketPdf,
} = require("../controllers/tripTicket.controller.js");
router.post("/pdf", generateTripTicketPdf);

module.exports = router;
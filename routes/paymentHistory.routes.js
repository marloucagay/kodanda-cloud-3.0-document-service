const { Router } = require("express");
const router = Router();
const {
  generatePaymentHistoryPdf,
} = require("../controllers/paymentHistory.controller.js");
router.post("/pdf", generatePaymentHistoryPdf);

module.exports = router;

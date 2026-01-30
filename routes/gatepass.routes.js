const { Router } = require("express");
const router = Router();
const {
  generateGatepassPdf,
} = require("../controllers/gatepass.controller.js");
// You can do /invoices/pdf if you don't want invoiceNo in URL
router.post("/pdf", generateGatepassPdf);

module.exports = router;

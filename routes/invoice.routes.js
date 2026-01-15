const { Router } = require("express");
const router = Router();
const { generateInvoicePdf } = require("../controllers/invoice.controller.js");
// You can do /invoices/pdf if you don't want invoiceNo in URL
router.post("/invoices/pdf", generateInvoicePdf);

module.exports = router;

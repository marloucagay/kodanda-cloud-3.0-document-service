const { Router } = require("express");
const router = Router();
const {
  generateQuotationPdf,
} = require("../controllers/quotation.controller.js");

router.post("/pdf", generateQuotationPdf);

module.exports = router;

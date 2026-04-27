const { Router } = require("express");
const router = Router();
const {
  generateStockReportPdf,
} = require("../controllers/stockReport.controller.js");
router.post("/pdf", generateStockReportPdf);

module.exports = router;

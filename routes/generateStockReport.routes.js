const { Router } = require("express");
const router = Router();
const { generateStockReportExcel, generateInventorySummaryExcel } = require("../controllers/generateStockReport.controller.js");
router.post("/excel", generateStockReportExcel);
router.post("/inventory-summary-excel", generateInventorySummaryExcel);

module.exports = router;

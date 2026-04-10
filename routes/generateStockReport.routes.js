const { Router } = require("express");
const router = Router();
const {
  generateStockReportExcel,
  generateInventorySummaryExcel,
  generateBillingReportExcel,
  generateInvoiceDebitExcel
} = require("../controllers/generateStockReport.controller.js");
router.post("/excel", generateStockReportExcel);
router.post("/inventory-summary-excel", generateInventorySummaryExcel);
router.post("/billing-report-excel", generateBillingReportExcel);
router.post("/invoice-debit-excel", generateInvoiceDebitExcel);

module.exports = router;

const { Router } = require("express");
const router = Router();
const {
  generateStockMovementExcel,
  generateBillingSummaryExcel,
  generateBillingServiceExcel,
  generateStorageReportExcel
} = require("../controllers/generateExcel.controller.js");
router.post("/excel", generateStockMovementExcel);
router.post("/excel-billing", generateBillingSummaryExcel);
router.post("/excel-billing-service", generateBillingServiceExcel);
router.post("/excel-storage", generateStorageReportExcel);

module.exports = router;

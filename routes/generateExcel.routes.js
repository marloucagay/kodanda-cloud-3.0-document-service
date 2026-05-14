const { Router } = require("express");
const router = Router();
const {
  generateStockMovementExcel,
  generateBillingSummaryExcel,
  generateBillingServiceExcel,
  generateStorageReportExcel,
  generateStockItemsExcel
} = require("../controllers/generateExcel.controller.js");
router.post("/stock-movement/excel", generateStockMovementExcel);
router.post("/billing-summary/excel", generateBillingSummaryExcel);
router.post("/billing-service/excel", generateBillingServiceExcel);
router.post("/storage-reports/excel", generateStorageReportExcel);
router.post("/stock-items/excel", generateStockItemsExcel);

module.exports = router;

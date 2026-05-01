const { Router } = require("express");
const router = Router();
const {
  generateStockMovementExcel,
  generateBillingSummaryExcel,
  generateBillingServiceExcel
} = require("../controllers/generateExcel.controller.js");
router.post("/excel", generateStockMovementExcel);
router.post("/excel-billing", generateBillingSummaryExcel);
router.post("/excel-billing-service", generateBillingServiceExcel);

module.exports = router;

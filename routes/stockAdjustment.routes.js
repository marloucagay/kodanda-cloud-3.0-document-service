const { Router } = require("express");
const router = Router();
const {
  generateStockAdjustmentPdf,
} = require("../controllers/stockAdjustment.controller.js");
router.post("/pdf", generateStockAdjustmentPdf);

module.exports = router;
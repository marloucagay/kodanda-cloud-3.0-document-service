const { Router } = require("express");
const {
  generateDeliveryReceiptPdf,
} = require("../controllers/deliveryReceipt.controller.js");

const router = Router();

// POST /api/delivery-receipts/pdf
router.post("/pdf", generateDeliveryReceiptPdf);

module.exports = router;

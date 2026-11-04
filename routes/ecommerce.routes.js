const { Router } = require("express");
const router = Router();
const {
  generateEcomPickingListPdf,
  generateEcomBatchPdf,
  generateEcomDispatchPdf,
} = require("../controllers/ecommerce.controller.js");
router.post("/picklist/pdf", generateEcomPickingListPdf);
router.post("/batch/pdf", generateEcomBatchPdf);
router.post("/dispatch/pdf", generateEcomDispatchPdf);

module.exports = router;

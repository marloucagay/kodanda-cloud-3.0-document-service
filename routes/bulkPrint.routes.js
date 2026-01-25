const { Router } = require("express");
const { generateBulkPrintPdf } = require("../controllers/bulkPrint.controller.js");

const router = Router();

// POST /api/bulk-dr-download/pdf
router.post("/pdf", generateBulkPrintPdf);

module.exports = router;

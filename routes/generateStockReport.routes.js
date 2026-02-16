const { Router } = require("express");
const router = Router();
const { generateStockReportExcel } = require("../controllers/generateStockReport.controller.js");
router.post("/excel", generateStockReportExcel);

module.exports = router;

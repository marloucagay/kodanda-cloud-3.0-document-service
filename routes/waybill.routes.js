const express = require("express");
const {
  createWaybillPdf,
  createMultiWaybillPdf,
} = require("../controllers/waybill.controller.js");

const router = express.Router();

router.post("/pdf", createWaybillPdf);
router.post("/multi-pdf", createMultiWaybillPdf);

module.exports = router;

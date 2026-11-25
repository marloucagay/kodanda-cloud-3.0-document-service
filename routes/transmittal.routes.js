const { Router } = require("express");
const router = Router();
const {
  generateTransmittalPdf,
} = require("../controllers/transmittal.controller.js");
router.post("/pdf", generateTransmittalPdf);

module.exports = router;

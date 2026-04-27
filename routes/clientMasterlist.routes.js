const { Router } = require("express");
const router = Router();
const {
  generateClientMasterlistPdf,
} = require("../controllers/clientMasterlist.controller.js");
router.post("/pdf", generateClientMasterlistPdf);

module.exports = router;
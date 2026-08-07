const { Router } = require("express");
const router = Router();
const {
  generateEcomPickingListPdf,
} = require("../controllers/ecommerce.controller.js");
router.post("/picklist/pdf", generateEcomPickingListPdf);

module.exports = router;
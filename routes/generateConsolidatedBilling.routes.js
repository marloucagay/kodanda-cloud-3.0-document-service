const { Router } = require("express");
const router = Router();
const {
  generateConsolidatedBilling
} = require("../controllers/generateConsolidatedBilling.controller.js");

router.post("/excel", generateConsolidatedBilling);

module.exports = router;

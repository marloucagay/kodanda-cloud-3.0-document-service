const { Router } = require("express");
const router = Router();
const {
  generatePickingListPdf,
} = require("../controllers/pickingList.controller.js");
router.post("/pdf", generatePickingListPdf);

module.exports = router;
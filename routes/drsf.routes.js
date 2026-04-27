const { Router } = require("express");
const router = Router();
const {
  generateDrsfPdf,
} = require("../controllers/drsf.controller.js");

router.post("/pdf", generateDrsfPdf);

module.exports = router;

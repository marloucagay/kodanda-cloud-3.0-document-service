const { Router } = require("express");
const router = Router();
const {
  generateCollectionEntriesPdf,
} = require("../controllers/collectionEntries.controller.js");
router.post("/pdf", generateCollectionEntriesPdf);

module.exports = router;

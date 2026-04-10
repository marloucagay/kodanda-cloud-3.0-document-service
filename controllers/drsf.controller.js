const {
  generateDrsfPdfBuffer,
} = require("../services/drsfPdf.service.js");
const { money, safeText } = require("../utils/format.js");
const { ensureDataUriLogo } = require("../utils/logoUri.js");

/**
 * POST /api/drsf/:drsfID/pdf
 * Body: DRSF object
 */
async function generateDrsfPdf(req, res) {
  try {
    const drsf = req.body;

    if (!drsf || typeof drsf !== "object") {
      return res.status(400).json({ message: "Invalid DRSF payload" });
    }

    drsf.logoSrcDataUri = await ensureDataUriLogo(drsf.logoSrc);
    const pdfBuffer = await generateDrsfPdfBuffer(drsf);

    res.setHeader("Content-Type", "application/pdf");
    res.status(200).send(pdfBuffer);
  } catch (err) {
    console.error("generateDrsfPdf error:", err);
    res.status(500).json({ message: "Failed to generate DRSF PDF" });
  }
}

module.exports = {
  generateDrsfPdf,
};

const { generateDrsfPdfBuffer } = require("../services/drsfPdf.service.js");
const { money, safeText, dateFormat } = require("../utils/format.js");
const { ensureDataUriLogo } = require("../utils/logoUri.js");

/**
 * POST /api/drsf/:drsfID/pdf
 * Body: DRSF object
 */

const padRows = (arr, targetLength) => {
  const padded = arr.slice(0, targetLength);
  while (padded.length < targetLength) {
    padded.push({});
  }
  return padded;
};

async function generateDrsfPdf(req, res) {
  try {
    const drsf = req.body;

    if (!drsf || typeof drsf !== "object") {
      return res.status(400).json({ message: "Invalid DRSF payload" });
    }

    drsf.logoSrcDataUri = await ensureDataUriLogo(drsf.logoSrc);
    drsf.date = dateFormat(drsf.date);

    const totalChargeable = drsf.cargoDimensions.reduce((sum, row) => sum + (row.chargeable || 0), 0);

    const totalRow = {
        boxNumber: '',
        length: '',
        width: '',
        height: '',
        volume: 'Total:',
        totalChargeable: totalChargeable,
        isTotal: true
    };
    const drsfTotalChargeable = [...drsf.cargoDimensions, totalRow];
    drsf.cargoDimensions = drsfTotalChargeable;

    // if (drsf.cargoDimensions && Array.isArray(drsf.cargoDimensions)) {
    //   drsf.cargoDimensionsFirstPage = padRows(drsf.cargoDimensions || [], 10);
    //   drsf.cargoDimensionsRest =
    //     drsf.cargoDimensions && drsf.cargoDimensions.length > 10
    //       ? drsf.cargoDimensions.slice(10)
    //       : [];
    // }

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

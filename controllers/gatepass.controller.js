const {
  generateGatepassPdfBuffer,
} = require("../services/gatepassPdf.service.js");
const { money, safeText } = require("../utils/format.js");
const { ensureDataUriLogo } = require("../utils/logoUri.js");

function buildViewModel(gatepass) {
  // Normalize fields used by template (avoid blank strings)
  return {
    ...gatepass,
    gatepassID: safeText(gatepass.gatepassID),
    gatepassDate: safeText(gatepass.date),
    gatepassName: safeText(gatepass.name),
    gatepassVehicle: safeText(gatepass.vehicle),
  };
}

/**
 * POST /api/gatepasses/:gatepassID/pdf
 * Body: gatepass object
 */
async function generateGatepassPdf(req, res) {
  try {
    const gatepass = req.body;

    // Minimal validation
    if (!gatepass || typeof gatepass !== "object") {
      return res.status(400).json({ message: "Invalid gatepass payload" });
    }

    const vm = buildViewModel(gatepass);
    vm.logoSrcDataUri = await ensureDataUriLogo(vm.logoSrc);
    vm.isDraft = String(vm.status || "").toLowerCase() === "draft";

    const pdfBuffer = await generateGatepassPdfBuffer(vm);

    const fileName = `${vm.gatepassID}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);
    res.status(200).send(pdfBuffer);
  } catch (err) {
    console.error("generateGatepassPdf error:", err);
    res.status(500).json({ message: "Failed to generate gatepass PDF" });
  }
}

module.exports = {
  generateGatepassPdf,
};

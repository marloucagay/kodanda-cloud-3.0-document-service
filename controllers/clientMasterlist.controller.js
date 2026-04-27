const {
  generateClientMasterlistPdfBuffer,
} = require("../services/clientMasterlist.service.js");
const { money, safeText } = require("../utils/format.js");
const { ensureDataUriLogo } = require("../utils/logoUri.js");

function buildViewModel(gatepass) {
  
  return {
    ...gatepass,
    gatepassID: safeText(gatepass.gatepassID),
    gatepassDate: safeText(gatepass.date),
    gatepassName: safeText(gatepass.name),
    gatepassVehicle: safeText(gatepass.vehicle),
    gatepassItems: (gatepass.gatepassItems || []).map(item => ({
      ...item,
      displayRefNo: item.tripTicketNo || item.serialNo || '',
    })),
  };
}

/**
 * POST /api/gatepasses/:gatepassID/pdf
 * Body: gatepass object
 */
async function generateClientMasterlistPdf(req, res) {
  try {
    const clientData = req.body;

    if (!clientData || typeof clientData !== "object") {
      return res.status(400).json({ message: "Invalid Client payload" });
    }

    // const vm = buildViewModel(gatepass);
    clientData.logoSrcDataUri = await ensureDataUriLogo(clientData.logoSrc);
    // vm.isDraft = String(vm.status || "").toLowerCase() === "draft";

    const pdfBuffer = await generateClientMasterlistPdfBuffer(clientData);

    res.setHeader("Content-Type", "application/pdf");
    // res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);
    res.status(200).send(pdfBuffer);
  } catch (err) {
    console.error("Error generating Client Masterlist:", err);
    res.status(500).json({ message: "Failed to generate Client Masterlist PDF" });
  }
}

module.exports = {
  generateClientMasterlistPdf,
};

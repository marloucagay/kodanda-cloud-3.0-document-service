const {
  generateGatepassPdfBuffer,
} = require("../services/gatepassPdf.service.js");
const { money, safeText } = require("../utils/format.js");
const { ensureDataUriLogo } = require("../utils/logoUri.js");

function buildViewModel(gatepass) {
  // Normalize fields used by template (avoid blank strings)
  // const items = [
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  //   { displayRefNo: '25_00001', quantity: 1, packaging: 'Box' },
  // ];
  return {
    ...gatepass,
    gatepassID: safeText(gatepass.gatepassID),
    gatepassDate: safeText(gatepass.date),
    gatepassName: safeText(gatepass.name),
    gatepassVehicle: safeText(gatepass.vehicle),
    // gatepassItems: (items || []).map(item => ({
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
async function generateGatepassPdf(req, res) {
  try {
    const gatepass = req.body;

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

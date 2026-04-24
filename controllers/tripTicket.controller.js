const {
  generateTripTicketPdfBuffer,
} = require("../services/tripTicket.service.js");
const { money, safeText } = require("../utils/format.js");
const { ensureDataUriLogo } = require("../utils/logoUri.js");

function buildViewModel(tripTicket) {
  
  return {
    ...tripTicket,
    tripTicketID: safeText(tripTicket.tripTicketID),
    tripTicketDate: safeText(tripTicket.date),
    tripTicketName: safeText(tripTicket.name),
    tripTicketVehicle: safeText(tripTicket.vehicle),
    tripTicketItems: (tripTicket.tripTicketItems || []).map(item => ({
      ...item,
      displayRefNo: item.tripTicketNo || item.serialNo || '',
    })),
  };
}

/**
 * POST /api/gatepasses/:gatepassID/pdf
 * Body: gatepass object
 */
async function generateTripTicketPdf(req, res) {
  try {
    const tripTicketData = req.body;

    if (!tripTicketData || typeof tripTicketData !== "object") {
      return res.status(400).json({ message: "Invalid Trip Ticket payload" });
    }

    const totalQty = tripTicketData.pickupAndDeliveryDetails.reduce((sum, row) => sum + (row.qty || 0), 0);

    const totalRow = {
        dRNumber: '',
        pickupSite: '',
        deliverySite: '',
        transactionFile: 'Total:',
        qty: totalQty,
        typeOfCargo: '',
        remarks: '',
        isTotal: true,
    };
    const ticketDataWithTotal = [...tripTicketData.pickupAndDeliveryDetails, totalRow];

    tripTicketData.pickupAndDeliveryDetails = ticketDataWithTotal;

    // const vm = buildViewModel(gatepass);
    tripTicketData.logoSrcDataUri = await ensureDataUriLogo(tripTicketData.logoSrc);
    // vm.isDraft = String(vm.status || "").toLowerCase() === "draft";

    const pdfBuffer = await generateTripTicketPdfBuffer(tripTicketData);

    res.setHeader("Content-Type", "application/pdf");
    // res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);
    res.status(200).send(pdfBuffer);
  } catch (err) {
    console.error("Error generating Trip Ticket:", err);
    res.status(500).json({ message: "Failed to generate Trip Ticket PDF" });
  }
}

module.exports = {
  generateTripTicketPdf,
};

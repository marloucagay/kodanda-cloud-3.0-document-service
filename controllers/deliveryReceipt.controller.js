const { ensureDataUriLogo } = require("../utils/logoUri.js");
const { safeText } = require("../utils/format.js");
const {
  generateDeliveryReceiptPdfBuffer,
} = require("../services/deliveryReceiptPdf.service.js");

function buildViewModel(payload) {
  const items = Array.isArray(payload.deliveryItems)
    ? payload.deliveryItems
    : [];

  // The PDF shows '-' when empty for a lot of fields (Requesting Unit, Declared Value, etc.) :contentReference[oaicite:2]{index=2}
  const dash = (v) => safeText(v, "");

  return {
    // Header
    documentTitle: "Delivery Receipt",
    drNumber: dash(payload.dRNumber),

    // Top info
    client: dash(payload.client),
    requestingUnit: dash(payload.requestingUnit),
    date: dash(payload.date),

    shipmentReference: dash(payload.shipmentReference),
    declaredValue: dash(payload.declaredValue),
    transactionFile: dash(payload.transactionFile),
    typeOfCargo: dash(payload.typeOfCargo),
    pickingListNo: dash(payload.pickingListNo),
    specialInstructions: dash(payload.specialInstructions),
    drsfNo: dash(payload.drsfNo),
    numberOfBoxes: dash(payload.numberOfBoxes),

    // Pickup / Delivery blocks
    pickupSite: dash(payload.pickupSite),
    deliverySite: dash(payload.deliverySite),

    pickupAddress: dash(payload.pickupAddress),
    deliveryAddress: dash(payload.deliveryAddress),

    pickupContactPerson: dash(payload.pickupContactPerson),
    pickupContactNumber: dash(payload.pickupContactNumber),

    deliveryContactPerson: dash(payload.deliveryContactPerson),
    deliveryContactNumber: dash(payload.deliveryContactNumber),

    // Items table
    items: items.map((it) => ({
      qty: dash(it.quantity ?? payload.qty),
      unit: dash(it.unit),
      // The PDF “PARTICULARS” block contains Description, Lot/Batch No, Expiry Date, Serial No :contentReference[oaicite:3]{index=3}
      description: dash(it.itemDescription),
      lot: dash(it.lot),
      expiryDate: dash(it.expiryDate),
      serialNo: dash(it.serialNo),
      dangerousGoods: !!it.dangerousGoods,
    })),

    // Footer fields
    receivedDate: dash(payload.receivedDate),

    // Logo for Puppeteer header
    logoSrc: payload.logoSrc || "",
  };
}

async function generateDeliveryReceiptPdf(req, res) {
  try {
    const payload = req.body;
    if (!payload || typeof payload !== "object") {
      return res
        .status(400)
        .json({ message: "Invalid delivery receipt payload" });
    }

    const vm = buildViewModel(payload);

    // Best-effort logo URL -> data URI so header always renders in Cloud Run
    try {
      vm.logoSrcDataUri = await ensureDataUriLogo(vm.logoSrc);
    } catch (e) {
      console.warn(
        "DR logo fetch failed, continuing without logo:",
        e?.message || e
      );
      vm.logoSrcDataUri = "";
    }

    // Printed by/on (optional)
    vm.printedBy =
      payload.printedBy || payload?.processor?.sessionName || "System";
    vm.printedOn = payload.printedOn || new Date().toLocaleString();

    const pdfBuffer = await generateDeliveryReceiptPdfBuffer(vm);

    const fileName = `${vm.drNumber || "delivery-receipt"}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);
    return res.status(200).send(pdfBuffer);
  } catch (err) {
    console.error("generateDeliveryReceiptPdf error:", err?.stack || err);
    return res
      .status(500)
      .json({ message: "Failed to generate delivery receipt PDF" });
  }
}

module.exports = {
  generateDeliveryReceiptPdf,
};

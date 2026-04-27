const { ensureDataUriLogo } = require("../utils/logoUri.js");
const { safeText } = require("../utils/format.js");
const {
  generateBulkPrintPdfBuffer,
} = require("../services/bulkPrintPdf.service.js");
const { generateMultiWaybillPdf, generateWaybillPdf } = require("../services/waybill.service.js");

function buildViewModel(doc, payload) {
  const dash = (v) => safeText(v, "");
  const get = (obj, key) => (obj && obj[key] ? obj[key] : "");

  const resolveField = (value, key) => {
    if (!value) return "";

    if (typeof value === "string") return value;

    if (typeof value === "object") {
      return value[key] || "";
    }

    return "";
  };

  // function extractSiteName(site) {
  //   if (!site) return "";
  //   if (typeof site === "string") return site;
  //   if (typeof site === "object") return site.deliverySite || site.pickUpSite || "";
  //   return "";
  // }

  // function extractSiteAddress(site) {
  //   if (!site) return "";
  //   if (typeof site === "object") return site.address || "";
  //   return "";
  // }

  const dummyData = [
    { quantity: 1, unit: "box", itemDescription: "Item B", lot: "L002", expiryDate: "2025-06-30", serialNo: "S002", dangerousGoods: true },
    { quantity: 2, unit: "pcs", itemDescription: "Item A", lot: "L001", expiryDate: "2024-12-31", serialNo: "S001", dangerousGoods: false },
    { quantity: 3, unit: "box", itemDescription: "Item B", lot: "L002", expiryDate: "2025-06-30", serialNo: "S002", dangerousGoods: true },
    { quantity: 4, unit: "pcs", itemDescription: "Item A", lot: "L001", expiryDate: "2024-12-31", serialNo: "S001", dangerousGoods: false },
    { quantity: 5, unit: "box", itemDescription: "Item B", lot: "L002", expiryDate: "2025-06-30", serialNo: "S002", dangerousGoods: true },
    { quantity: 6, unit: "pcs", itemDescription: "Item A", lot: "L001", expiryDate: "2024-12-31", serialNo: "S001", dangerousGoods: false },
    { quantity: 7, unit: "box", itemDescription: "Item B", lot: "L002", expiryDate: "2025-06-30", serialNo: "S002", dangerousGoods: true },
    { quantity: 8, unit: "pcs", itemDescription: "Item A", lot: "L001", expiryDate: "2024-12-31", serialNo: "S001", dangerousGoods: false },
    { quantity: 9, unit: "box", itemDescription: "Item B", lot: "L002", expiryDate: "2025-06-30", serialNo: "S002", dangerousGoods: true },
    { quantity: 10, unit: "pcs", itemDescription: "Item A", lot: "L001", expiryDate: "2024-12-31", serialNo: "S001", dangerousGoods: false },
    { quantity: 11, unit: "pcs", itemDescription: "Item A", lot: "L001", expiryDate: "2024-12-31", serialNo: "S001", dangerousGoods: false },
    { quantity: 12, unit: "box", itemDescription: "Item B", lot: "L002", expiryDate: "2025-06-30", serialNo: "S002", dangerousGoods: true },
    { quantity: 13, unit: "pcs", itemDescription: "Item A", lot: "L001", expiryDate: "2024-12-31", serialNo: "S001", dangerousGoods: false },
    { quantity: 14, unit: "pcs", itemDescription: "Item A", lot: "L001", expiryDate: "2024-12-31", serialNo: "S001", dangerousGoods: false },
    { quantity: 15, unit: "box", itemDescription: "Item B", lot: "L002", expiryDate: "2025-06-30", serialNo: "S002", dangerousGoods: true },
    { quantity: 16, unit: "pcs", itemDescription: "Item A", lot: "L001", expiryDate: "2024-12-31", serialNo: "S001", dangerousGoods: false },
  ];

  return {
    // Header
    documentTitle: dash(doc.deliveryDocumentType || doc.deliveryDocument || "Delivery Receipt"),
    drNumber: dash(doc.deliveryDocumentNo || doc.dRNumber),

    // Top info
    client: dash(doc.client || payload.clientName),
    requestingUnit: dash(doc.requestingUnit),
    date: dash(doc.dateCreated || doc.date),
    shipmentReference: dash(doc.shipmentReference),
    declaredValue: dash(doc.declaredValue),
    transactionFile: dash(doc.transactionFile || payload.transactionFile),
    typeOfCargo: dash(doc.typeOfCargo),
    pickingListNo: dash(doc.pickingListNo),
    specialInstructions: dash(doc.specialInstructions),
    drsfNo: dash(doc.dRSFNo || doc.drsfNo),
    numberOfBoxes: dash(doc.numberOfBoxes),

    // Pickup / Delivery info
    pickupSite: dash(resolveField(doc.pickupSite || doc.pickUpSite, "pickUpSite")),
    deliverySite: dash(resolveField(doc.deliverySite, "deliverySite")),

    pickupAddress: dash(resolveField(doc.pickupAddress || doc.pickUpSite, "address")),
    deliveryAddress: dash(resolveField(doc.deliveryAddress || doc.deliverySite, "address")),

    pickupContactPerson: dash(resolveField(doc.pickupContactPerson || doc.pickUpSite, "contactPerson")),
    pickupContactNumber: dash(resolveField(doc.pickupContactNumber || doc.pickUpSite, "contactNo")),

    deliveryContactPerson: dash(resolveField(doc.deliveryContactPerson || doc.deliverySite, "contactPerson")),
    deliveryContactNumber: dash(resolveField(doc.deliveryContactNumber || doc.deliverySite, "contactNo")),

    // For Delivery Items table
    // items: Array.isArray(dummyData)
    //   ? dummyData.map((it) => ({
    items: Array.isArray(doc.deliveryItems)
      ? doc.deliveryItems.map((it) => ({
          qty: dash(it.quantity ?? doc.qty),
          unit: dash(it.unit),
          description: dash(it.itemDescription),
          lot: dash(it.lot),
          expiryDate: dash(it.expiryDate),
          serialNo: dash(it.serialNo),
          dangerousGoods: !!it.dangerousGoods,
        }))
      : [],

    receivedDate: dash(doc.receivedDate),

    logoSrc: payload.logoSrc || "",
    printedBy: payload.printedBy || "",
    printedOn: payload.printedOn || "",
  };
}

async function generateBulkPrintPdf(req, res) {
  try {
    const payload = req.body;
    const docs = Array.isArray(payload.deliveryDocuments) ? payload.deliveryDocuments : [];

    if (docs.length === 0) {
      return res.status(400).json({ message: "No delivery documents found" });
    }

    const allWaybills = docs.every((doc) => doc.deliveryDocument === "Waybill");

    let pdfBuffer;

    if (allWaybills) {
      // For Waybill document service
    } else {
      const viewModels = await Promise.all(
        docs.map(async (doc) => {
          const vm = buildViewModel(doc, payload);
          try {
            vm.logoSrcDataUri = await ensureDataUriLogo(vm.logoSrc);
          } catch (e) {
            vm.logoSrcDataUri = "";
          }
          return vm;
        })
      );

      pdfBuffer = await generateBulkPrintPdfBuffer(viewModels);
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="bulk-print.pdf"`);
    return res.status(200).send(pdfBuffer);
  } catch (err) {
    console.error("generateBulkPrintPdf error:", err?.stack || err);
    return res.status(500).json({ message: "Failed to generate bulk print PDF" });
  }
}

module.exports = {
  generateBulkPrintPdf,
};
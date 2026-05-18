const { PDFDocument } = require("pdf-lib");
const { ensureDataUriLogo } = require("../utils/logoUri.js");
const { safeText, dateFormat } = require("../utils/format.js");
const {
  generateBulkPrintPdfBuffer,
} = require("../services/bulkPrintPdf.service.js");
const {
  generateMultiWaybillPdf,
  generateWaybillPdf,
} = require("../services/waybill.service.js");
const {
  generateStockReportPdfBuffer,
} = require("../services/stockReport.service.js");
const {
  generatePickingListPdfBuffer,
} = require("../services/pickingList.service.js");

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

  // const dummyData = [
  //   { quantity: 1, unit: "box", itemDescription: "Item B", lot: "L002", expiryDate: "2025-06-30", serialNo: "S002", dangerousGoods: true },
  //   { quantity: 2, unit: "pcs", itemDescription: "Item A", lot: "L001", expiryDate: "2024-12-31", serialNo: "S001", dangerousGoods: false },
  //   { quantity: 3, unit: "box", itemDescription: "Item B", lot: "L002", expiryDate: "2025-06-30", serialNo: "S002", dangerousGoods: true },
  //   { quantity: 4, unit: "pcs", itemDescription: "Item A", lot: "L001", expiryDate: "2024-12-31", serialNo: "S001", dangerousGoods: false },
  //   { quantity: 5, unit: "box", itemDescription: "Item B", lot: "L002", expiryDate: "2025-06-30", serialNo: "S002", dangerousGoods: true },
  //   { quantity: 6, unit: "pcs", itemDescription: "Item A", lot: "L001", expiryDate: "2024-12-31", serialNo: "S001", dangerousGoods: false },
  //   { quantity: 7, unit: "box", itemDescription: "Item B", lot: "L002", expiryDate: "2025-06-30", serialNo: "S002", dangerousGoods: true },
  //   { quantity: 8, unit: "pcs", itemDescription: "Item A", lot: "L001", expiryDate: "2024-12-31", serialNo: "S001", dangerousGoods: false },
  //   { quantity: 9, unit: "box", itemDescription: "Item B", lot: "L002", expiryDate: "2025-06-30", serialNo: "S002", dangerousGoods: true },
  //   { quantity: 10, unit: "pcs", itemDescription: "Item A", lot: "L001", expiryDate: "2024-12-31", serialNo: "S001", dangerousGoods: false },
  //   { quantity: 11, unit: "pcs", itemDescription: "Item A", lot: "L001", expiryDate: "2024-12-31", serialNo: "S001", dangerousGoods: false },
  //   { quantity: 12, unit: "box", itemDescription: "Item B", lot: "L002", expiryDate: "2025-06-30", serialNo: "S002", dangerousGoods: true },
  //   { quantity: 13, unit: "pcs", itemDescription: "Item A", lot: "L001", expiryDate: "2024-12-31", serialNo: "S001", dangerousGoods: false },
  //   { quantity: 14, unit: "pcs", itemDescription: "Item A", lot: "L001", expiryDate: "2024-12-31", serialNo: "S001", dangerousGoods: false },
  //   { quantity: 15, unit: "box", itemDescription: "Item B", lot: "L002", expiryDate: "2025-06-30", serialNo: "S002", dangerousGoods: true },
  //   { quantity: 16, unit: "pcs", itemDescription: "Item A", lot: "L001", expiryDate: "2024-12-31", serialNo: "S001", dangerousGoods: false },
  // ];

  return {
    // Header
    documentTitle: dash(
      doc.deliveryDocumentType || doc.deliveryDocument || "Delivery Receipt",
    ),
    drNumber: dash(doc.deliveryDocumentNo || doc.dRNumber),

    // Top info
    client: dash(doc.client || payload.clientName),
    requestingUnit: dash(doc.requestingUnit),
    date: dateFormat(doc.dateCreated || doc.date),
    shipmentReference: dash(doc.shipmentReference),
    declaredValue: dash(doc.declaredValue),
    transactionFile: dash(doc.transactionFile || payload.transactionFile),
    typeOfCargo: dash(doc.typeOfCargo),
    pickingListNo: dash(doc.pickingListNo),
    specialInstructions: dash(doc.specialInstructions),
    drsfNo: dash(doc.dRSFNo || doc.drsfNo),
    numberOfBoxes: dash(doc.numberOfBoxes),

    // Pickup / Delivery info
    pickupSite: dash(
      resolveField(doc.pickupSite || doc.pickUpSite, "pickUpSite"),
    ),
    deliverySite: dash(resolveField(doc.deliverySite, "deliverySite")),

    pickupAddress: dash(
      resolveField(doc.pickupAddress || doc.pickUpSite, "address"),
    ),
    deliveryAddress: dash(
      resolveField(doc.deliveryAddress || doc.deliverySite, "address"),
    ),

    pickupContactPerson: dash(
      resolveField(doc.pickupContactPerson || doc.pickUpSite, "contactPerson"),
    ),
    pickupContactNumber: dash(
      resolveField(doc.pickupContactNumber || doc.pickUpSite, "contactNo"),
    ),

    deliveryContactPerson: dash(
      resolveField(
        doc.deliveryContactPerson || doc.deliverySite,
        "contactPerson",
      ),
    ),
    deliveryContactNumber: dash(
      resolveField(doc.deliveryContactNumber || doc.deliverySite, "contactNo"),
    ),

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

function buildViewModelWarehouse(pickingList) {
  const dummyData = [
    {
      itemCode: "ITEM001",
      itemName: "Sample Item 1",
      quantity: 10,
      uQ: "pcs",
      batchNo: "BATCH001",
      serialNo: "SN00001",
      displayExpiry: "2025-12-31",
      location: "LOC-1",
      remarks: "Remark for item 1",
    },
    {
      itemCode: "ITEM002",
      itemName: "Sample Item 2",
      quantity: 5,
      uQ: "pcs",
      batchNo: "BATCH002",
      serialNo: "SN00002",
      displayExpiry: "2026-01-15",
      location: "LOC-2",
      remarks: "Remark for item 2",
    },
    {
      itemCode: "ITEM003",
      itemName: "Sample Item 3",
      quantity: 20,
      uQ: "pcs",
      batchNo: "BATCH003",
      serialNo: "SN00003",
      displayExpiry: "2026-06-30",
      location: "LOC-3",
      remarks: "Remark for item 3",
    },
    {
      itemCode: "ITEM001",
      itemName: "Sample Item 1",
      quantity: 10,
      uQ: "pcs",
      batchNo: "BATCH001",
      serialNo: "SN00001",
      displayExpiry: "2025-12-31",
      location: "LOC-1",
      remarks: "Remark for item 1",
    },
    {
      itemCode: "ITEM002",
      itemName: "Sample Item 2",
      quantity: 5,
      uQ: "pcs",
      batchNo: "BATCH002",
      serialNo: "SN00002",
      displayExpiry: "2026-01-15",
      location: "LOC-2",
      remarks: "Remark for item 2",
    },
    {
      itemCode: "ITEM003",
      itemName: "Sample Item 3",
      quantity: 20,
      uQ: "pcs",
      batchNo: "BATCH003",
      serialNo: "SN00003",
      displayExpiry: "2026-06-30",
      location: "LOC-3",
      remarks: "Remark for item 3",
    },
    {
      itemCode: "ITEM001",
      itemName: "Sample Item 1",
      quantity: 10,
      uQ: "pcs",
      batchNo: "BATCH001",
      serialNo: "SN00001",
      displayExpiry: "2025-12-31",
      location: "LOC-1",
      remarks: "Remark for item 1",
    },
    {
      itemCode: "ITEM002",
      itemName: "Sample Item 2",
      quantity: 5,
      uQ: "pcs",
      batchNo: "BATCH002",
      serialNo: "SN00002",
      displayExpiry: "2026-01-15",
      location: "LOC-2",
      remarks: "Remark for item 2",
    },
    {
      itemCode: "ITEM003",
      itemName: "Sample Item 3",
      quantity: 20,
      uQ: "pcs",
      batchNo: "BATCH003",
      serialNo: "SN00003",
      displayExpiry: "2026-06-30",
      location: "LOC-3",
      remarks: "Remark for item 3",
    },
    {
      itemCode: "ITEM001",
      itemName: "Sample Item 1",
      quantity: 10,
      uQ: "pcs",
      batchNo: "BATCH001",
      serialNo: "SN00001",
      displayExpiry: "2025-12-31",
      location: "LOC-1",
      remarks: "Remark for item 1",
    },
    {
      itemCode: "ITEM002",
      itemName: "Sample Item 2",
      quantity: 5,
      uQ: "pcs",
      batchNo: "BATCH002",
      serialNo: "SN00002",
      displayExpiry: "2026-01-15",
      location: "LOC-2",
      remarks: "Remark for item 2",
    },
    {
      itemCode: "ITEM003",
      itemName: "Sample Item 3",
      quantity: 20,
      uQ: "pcs",
      batchNo: "BATCH003",
      serialNo: "SN00003",
      displayExpiry: "2026-06-30",
      location: "LOC-3",
      remarks: "Remark for item 3",
    },
    {
      itemCode: "ITEM001",
      itemName: "Sample Item 1",
      quantity: 10,
      uQ: "pcs",
      batchNo: "BATCH001",
      serialNo: "SN00001",
      displayExpiry: "2025-12-31",
      location: "LOC-1",
      remarks: "Remark for item 1",
    },
    {
      itemCode: "ITEM002",
      itemName: "Sample Item 2",
      quantity: 5,
      uQ: "pcs",
      batchNo: "BATCH002",
      serialNo: "SN00002",
      displayExpiry: "2026-01-15",
      location: "LOC-2",
      remarks: "Remark for item 2",
    },
    {
      itemCode: "ITEM003",
      itemName: "Sample Item 3",
      quantity: 20,
      uQ: "pcs",
      batchNo: "BATCH003",
      serialNo: "SN00003",
      displayExpiry: "2026-06-30",
      location: "LOC-3",
      remarks: "Remark for item 3",
    },
    {
      itemCode: "ITEM001",
      itemName: "Sample Item 1",
      quantity: 10,
      uQ: "pcs",
      batchNo: "BATCH001",
      serialNo: "SN00001",
      displayExpiry: "2025-12-31",
      location: "LOC-1",
      remarks: "Remark for item 1",
    },
    {
      itemCode: "ITEM002",
      itemName: "Sample Item 2",
      quantity: 5,
      uQ: "pcs",
      batchNo: "BATCH002",
      serialNo: "SN00002",
      displayExpiry: "2026-01-15",
      location: "LOC-2",
      remarks: "Remark for item 2",
    },
    {
      itemCode: "ITEM003",
      itemName: "Sample Item 3",
      quantity: 20,
      uQ: "pcs",
      batchNo: "BATCH003",
      serialNo: "SN00003",
      displayExpiry: "2026-06-30",
      location: "LOC-3",
      remarks: "Remark for item 3",
    },
    {
      itemCode: "ITEM001",
      itemName: "Sample Item 1",
      quantity: 10,
      uQ: "pcs",
      batchNo: "BATCH001",
      serialNo: "SN00001",
      displayExpiry: "2025-12-31",
      location: "LOC-1",
      remarks: "Remark for item 1",
    },
    {
      itemCode: "ITEM002",
      itemName: "Sample Item 2",
      quantity: 5,
      uQ: "pcs",
      batchNo: "BATCH002",
      serialNo: "SN00002",
      displayExpiry: "2026-01-15",
      location: "LOC-2",
      remarks: "Remark for item 2",
    },
    {
      itemCode: "ITEM003",
      itemName: "Sample Item 3",
      quantity: 20,
      uQ: "pcs",
      batchNo: "BATCH003",
      serialNo: "SN00003",
      displayExpiry: "2026-06-30",
      location: "LOC-3",
      remarks: "Remark for item 3",
    },
    {
      itemCode: "ITEM001",
      itemName: "Sample Item 1",
      quantity: 10,
      uQ: "pcs",
      batchNo: "BATCH001",
      serialNo: "SN00001",
      displayExpiry: "2025-12-31",
      location: "LOC-1",
      remarks: "Remark for item 1",
    },
    {
      itemCode: "ITEM002",
      itemName: "Sample Item 2",
      quantity: 5,
      uQ: "pcs",
      batchNo: "BATCH002",
      serialNo: "SN00002",
      displayExpiry: "2026-01-15",
      location: "LOC-2",
      remarks: "Remark for item 2",
    },
    {
      itemCode: "ITEM003",
      itemName: "Sample Item 3",
      quantity: 20,
      uQ: "pcs",
      batchNo: "BATCH003",
      serialNo: "SN00003",
      displayExpiry: "2026-06-30",
      location: "LOC-3",
      remarks: "Remark for item 3",
    },
    {
      itemCode: "ITEM001",
      itemName: "Sample Item 1",
      quantity: 10,
      uQ: "pcs",
      batchNo: "BATCH001",
      serialNo: "SN00001",
      displayExpiry: "2025-12-31",
      location: "LOC-1",
      remarks: "Remark for item 1",
    },
    {
      itemCode: "ITEM002",
      itemName: "Sample Item 2",
      quantity: 5,
      uQ: "pcs",
      batchNo: "BATCH002",
      serialNo: "SN00002",
      displayExpiry: "2026-01-15",
      location: "LOC-2",
      remarks: "Remark for item 2",
    },
    {
      itemCode: "ITEM003",
      itemName: "Sample Item 3",
      quantity: 20,
      uQ: "pcs",
      batchNo: "BATCH003",
      serialNo: "SN00003",
      displayExpiry: "2026-06-30",
      location: "LOC-3",
      remarks: "Remark for item 3",
    },
    {
      itemCode: "ITEM001",
      itemName: "Sample Item 1",
      quantity: 10,
      uQ: "pcs",
      batchNo: "BATCH001",
      serialNo: "SN00001",
      displayExpiry: "2025-12-31",
      location: "LOC-1",
      remarks: "Remark for item 1",
    },
    {
      itemCode: "ITEM002",
      itemName: "Sample Item 2",
      quantity: 5,
      uQ: "pcs",
      batchNo: "BATCH002",
      serialNo: "SN00002",
      displayExpiry: "2026-01-15",
      location: "LOC-2",
      remarks: "Remark for item 2",
    },
    {
      itemCode: "ITEM003",
      itemName: "Sample Item 3",
      quantity: 20,
      uQ: "pcs",
      batchNo: "BATCH003",
      serialNo: "SN00003",
      displayExpiry: "2026-06-30",
      location: "LOC-3",
      remarks: "Remark for item 3",
    },
    {
      itemCode: "ITEM001",
      itemName: "Sample Item 1",
      quantity: 10,
      uQ: "pcs",
      batchNo: "BATCH001",
      serialNo: "SN00001",
      displayExpiry: "2025-12-31",
      location: "LOC-1",
      remarks: "Remark for item 1",
    },
    {
      itemCode: "ITEM002",
      itemName: "Sample Item 2",
      quantity: 5,
      uQ: "pcs",
      batchNo: "BATCH002",
      serialNo: "SN00002",
      displayExpiry: "2026-01-15",
      location: "LOC-2",
      remarks: "Remark for item 2",
    },
    {
      itemCode: "ITEM003",
      itemName: "Sample Item 3",
      quantity: 20,
      uQ: "pcs",
      batchNo: "BATCH003",
      serialNo: "SN00003",
      displayExpiry: "2026-06-30",
      location: "LOC-3",
      remarks: "Remark for item 3",
    },
    {
      itemCode: "ITEM001",
      itemName: "Sample Item 1",
      quantity: 10,
      uQ: "pcs",
      batchNo: "BATCH001",
      serialNo: "SN00001",
      displayExpiry: "2025-12-31",
      location: "LOC-1",
      remarks: "Remark for item 1",
    },
    {
      itemCode: "ITEM002",
      itemName: "Sample Item 2",
      quantity: 5,
      uQ: "pcs",
      batchNo: "BATCH002",
      serialNo: "SN00002",
      displayExpiry: "2026-01-15",
      location: "LOC-2",
      remarks: "Remark for item 2",
    },
    {
      itemCode: "ITEM003",
      itemName: "Sample Item 3",
      quantity: 20,
      uQ: "pcs",
      batchNo: "BATCH003",
      serialNo: "SN00003",
      displayExpiry: "2026-06-30",
      location: "LOC-3",
      remarks: "Remark for item 3",
    },
    {
      itemCode: "ITEM001",
      itemName: "Sample Item 1",
      quantity: 10,
      uQ: "pcs",
      batchNo: "BATCH001",
      serialNo: "SN00001",
      displayExpiry: "2025-12-31",
      location: "LOC-1",
      remarks: "Remark for item 1",
    },
    {
      itemCode: "ITEM002",
      itemName: "Sample Item 2",
      quantity: 5,
      uQ: "pcs",
      batchNo: "BATCH002",
      serialNo: "SN00002",
      displayExpiry: "2026-01-15",
      location: "LOC-2",
      remarks: "Remark for item 2",
    },
    {
      itemCode: "ITEM003",
      itemName: "Sample Item 3",
      quantity: 20,
      uQ: "pcs",
      batchNo: "BATCH003",
      serialNo: "SN00003",
      displayExpiry: "2026-06-30",
      location: "LOC-3",
      remarks: "Remark for item 3",
    },
    {
      itemCode: "ITEM001",
      itemName: "Sample Item 1",
      quantity: 10,
      uQ: "pcs",
      batchNo: "BATCH001",
      serialNo: "SN00001",
      displayExpiry: "2025-12-31",
      location: "LOC-1",
      remarks: "Remark for item 1",
    },
    {
      itemCode: "ITEM002",
      itemName: "Sample Item 2",
      quantity: 5,
      uQ: "pcs",
      batchNo: "BATCH002",
      serialNo: "SN00002",
      displayExpiry: "2026-01-15",
      location: "LOC-2",
      remarks: "Remark for item 2",
    },
    {
      itemCode: "ITEM003",
      itemName: "Sample Item 3",
      quantity: 20,
      uQ: "pcs",
      batchNo: "BATCH003",
      serialNo: "SN00003",
      displayExpiry: "2026-06-30",
      location: "LOC-3",
      remarks: "Remark for item 3",
    },
    {
      itemCode: "ITEM001",
      itemName: "Sample Item 1",
      quantity: 10,
      uQ: "pcs",
      batchNo: "BATCH001",
      serialNo: "SN00001",
      displayExpiry: "2025-12-31",
      location: "LOC-1",
      remarks: "Remark for item 1",
    },
    {
      itemCode: "ITEM002",
      itemName: "Sample Item 2",
      quantity: 5,
      uQ: "pcs",
      batchNo: "BATCH002",
      serialNo: "SN00002",
      displayExpiry: "2026-01-15",
      location: "LOC-2",
      remarks: "Remark for item 2",
    },
    {
      itemCode: "ITEM003",
      itemName: "Sample Item 3",
      quantity: 20,
      uQ: "pcs",
      batchNo: "BATCH003",
      serialNo: "SN00003",
      displayExpiry: "2026-06-30",
      location: "LOC-3",
      remarks: "Remark for item 3",
    },
    {
      itemCode: "ITEM001",
      itemName: "Sample Item 1",
      quantity: 10,
      uQ: "pcs",
      batchNo: "BATCH001",
      serialNo: "SN00001",
      displayExpiry: "2025-12-31",
      location: "LOC-1",
      remarks: "Remark for item 1",
    },
    {
      itemCode: "ITEM002",
      itemName: "Sample Item 2",
      quantity: 5,
      uQ: "pcs",
      batchNo: "BATCH002",
      serialNo: "SN00002",
      displayExpiry: "2026-01-15",
      location: "LOC-2",
      remarks: "Remark for item 2",
    },
    {
      itemCode: "ITEM003",
      itemName: "Sample Item 3",
      quantity: 20,
      uQ: "pcs",
      batchNo: "BATCH003",
      serialNo: "SN00003",
      displayExpiry: "2026-06-30",
      location: "LOC-3",
      remarks: "Remark for item 3",
    },
    {
      itemCode: "ITEM001",
      itemName: "Sample Item 1",
      quantity: 10,
      uQ: "pcs",
      batchNo: "BATCH001",
      serialNo: "SN00001",
      displayExpiry: "2025-12-31",
      location: "LOC-1",
      remarks: "Remark for item 1",
    },
    {
      itemCode: "ITEM002",
      itemName: "Sample Item 2",
      quantity: 5,
      uQ: "pcs",
      batchNo: "BATCH002",
      serialNo: "SN00002",
      displayExpiry: "2026-01-15",
      location: "LOC-2",
      remarks: "Remark for item 2",
    },
    {
      itemCode: "ITEM003",
      itemName: "Sample Item 3",
      quantity: 20,
      uQ: "pcs",
      batchNo: "BATCH003",
      serialNo: "SN00003",
      displayExpiry: "2026-06-30",
      location: "LOC-3",
      remarks: "Remark for item 3",
    },
  ];
  // const pickingListsItems = Array.isArray(dummyData)
  //   ? dummyData.map(item => ({
  const pickingListsItems = Array.isArray(pickingList.pickingLists)
    ? pickingList.pickingLists.map((item) => ({
        ...item,
        displayExpiry: item.expirationDate || item.expiryDate || "",
      }))
    : [];

  const totalQuantity = pickingListsItems.reduce(
    (sum, item) => sum + (parseFloat(item.quantity) || 0),
    0,
  );

  return {
    ...pickingList,
    pickingListsItems,
    client:
      safeText(pickingList.client) || safeText(pickingList.customer) || "-",
    date:
      dateFormat(pickingList.date) ||
      dateFormat(pickingList.dateCreated) ||
      "-",
    pickingListNo:
      safeText(pickingList.pickingListNo) ||
      safeText(pickingList.pickListNo) ||
      safeText(pickingList.picklistNo) ||
      "-",
    transactionFile: safeText(pickingList.transactionFile) || "-",
    customerRef: safeText(pickingList.customerReference) || "-",
    serialNo:
      safeText(pickingList.incomingStocksNo) ||
      safeText(pickingList.outgoingStocksNo) ||
      safeText(pickingList.serialNo) ||
      "-",
    deliverySite: safeText(pickingList.deliverySite?.deliverySite) || "-",
    deliverySiteAddress: safeText(pickingList.deliverySite?.address) || "-",
    remarks: safeText(pickingList.remarks) || "-",
    address:
      safeText(pickingList.deliverySiteAddress) ||
      safeText(pickingList.clientAddress) ||
      "-",
    totalQuantity,
  };
}

async function generateBulkPrintPdf(req, res) {
  try {
    const payload = req.body;
    const docs = Array.isArray(payload.documents) ? payload.documents : [];
    const printMode = payload.printMode || "";

    if (docs.length === 0) {
      return res.status(400).json({ message: "No delivery documents found" });
    }

    const waybills = docs.filter((doc) => doc.deliveryDocument === "Waybill" || doc.deliveryDocumentType === "Waybill");
    const deliveryReceipts = docs.filter(
      (doc) => doc.deliveryDocument === "Delivery Receipt" || doc.deliveryDocumentType === "Delivery Receipt",
    );

    const incomingStocks = docs.filter(
      (doc) => doc.transactionNo && !doc.picklistNo && !doc.deliveryDocument,
    );

    const outgoingStocks = docs.filter(
      (doc) => doc.outgoingStocksNo && doc.transactionNo && !doc.deliveryDocument,
    );

    const pickingLists = docs.filter(
      (doc) => doc.picklistNo && doc.transactionNo && !doc.deliveryDocument,
    );

    const pdfBuffers = [];

    if (payload?.typeOfBooking === 'Warehouse' || payload?.typeOfBooking === 'Warehouse Trucking') {
      if (payload?.warehouseMode === 'Outgoing') {
        if (printMode === "Outgoing") {
          // Print ALL as outgoing stock
          const viewModels = await Promise.all(
            outgoingStocks.map(async (doc) => {
              const vm = buildViewModelWarehouse(doc);
              vm.warehouseMode = "Outgoing";
              try {
                vm.logoSrcDataUri = await ensureDataUriLogo(payload.logoSrc);
              } catch {
                vm.logoSrcDataUri = "";
              }
              return vm;
            }),
          );
          pdfBuffers.push(await generateStockReportPdfBuffer(viewModels));
        } else if (printMode === "DeliveryReceipt") {
          // Print as Delivery Receipts
          const viewModels = await Promise.all(
            deliveryReceipts.map(async (doc) => {
              const vm = buildViewModel(doc, payload);
              try {
                vm.logoSrcDataUri = await ensureDataUriLogo(vm.logoSrc);
              } catch {
                vm.logoSrcDataUri = "";
              }
              return vm;
            }),
          );
          pdfBuffers.push(await generateBulkPrintPdfBuffer(viewModels));
        } else {
          // Print as Picking lists
          const viewModels = await Promise.all(
            pickingLists.map(async (doc) => {
              const vm = buildViewModelWarehouse(doc);
              try {
                vm.logoSrcDataUri = await ensureDataUriLogo(payload.logoSrc);
              } catch {
                vm.logoSrcDataUri = "";
              }
              return vm;
            }),
          );
          pdfBuffers.push(await generatePickingListPdfBuffer(viewModels));
        }
      } else {
        // Incoming Stocks
        if (incomingStocks.length > 0) {
          const viewModels = await Promise.all(
            incomingStocks.map(async (doc) => {
              const vm = buildViewModelWarehouse(doc);
              vm.warehouseMode = "Incoming";
              try {
                vm.logoSrcDataUri = await ensureDataUriLogo(payload.logoSrc);
              } catch {
                vm.logoSrcDataUri = "";
              }
              return vm;
            }),
          );
          pdfBuffers.push(await generateStockReportPdfBuffer(viewModels));
        }
      }

    } else {
      // Waybills
      if (waybills.length > 0) {
        const waybillPdf = await generateMultiWaybillPdf({
          pageWidthCm: payload.pageWidthCm || 28,
          pageHeightCm: payload.pageHeightCm || 20,
          waybills,
        });
        pdfBuffers.push(waybillPdf);
      }

      // Delivery Receipts
      if (deliveryReceipts.length > 0) {
        const viewModels = await Promise.all(
          deliveryReceipts.map(async (doc) => {
            const vm = buildViewModel(doc, payload);
            try {
              vm.logoSrcDataUri = await ensureDataUriLogo(vm.logoSrc);
            } catch {
              vm.logoSrcDataUri = "";
            }
            return vm;
          }),
        );
        pdfBuffers.push(await generateBulkPrintPdfBuffer(viewModels));
      }
    }

    if (pdfBuffers.length === 0) {
      return res.status(400).json({ message: "No valid documents to process" });
    }

    let finalPdfBuffer;
    if (pdfBuffers.length === 1) {
      finalPdfBuffer = pdfBuffers[0];
    } else {
      const mergedPdf = await PDFDocument.create();
      for (const pdfBuffer of pdfBuffers) {
        const pdf = await PDFDocument.load(pdfBuffer);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((page) => mergedPdf.addPage(page));
      }
      finalPdfBuffer = await mergedPdf.save();
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'inline; filename="bulk-print.pdf"');
    return res.status(200).send(finalPdfBuffer);
  } catch (err) {
    console.error("generateBulkPrintPdf error:", err?.stack || err);
    return res
      .status(500)
      .json({ message: err.message || "Failed to generate bulk print PDF" });
  }
}

module.exports = {
  generateBulkPrintPdf,
};

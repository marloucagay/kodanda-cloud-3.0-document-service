const {
  generateStockReportPdfBuffer,
} = require("../services/stockReport.service.js");
const { money, safeText } = require("../utils/format.js");
const { ensureDataUriLogo } = require("../utils/logoUri.js");

function buildViewModel(pickingList) {
  const pickingListsItems = Array.isArray(pickingList.pickingLists)
    ? pickingList.pickingLists.map(item => ({
        ...item,
        displayExpiry: item.expirationDate || item.expiryDate || '',
      }))
    : [];

  const totalQuantity = pickingListsItems.reduce(
    (sum, item) => sum + (parseFloat(item.quantity) || 0),
    0
  );

  return {
    ...pickingList,
    pickingListsItems,
    client: safeText(pickingList.client) || safeText(pickingList.customer) || '-',
    date: safeText(pickingList.date) || '-',
    pickingListNo: safeText(pickingList.pickingListNo) || safeText(pickingList.pickListNo) || '-',
    transactionFile: safeText(pickingList.transactionFile) || '-',
    customerRef: safeText(pickingList.customerReference) || '-',
    serialNumber: safeText(pickingList.serialNo) || '-',
    deliverySite: safeText(pickingList.deliverySite) || '-',
    remarks: safeText(pickingList.remarks) || '-',
    address: safeText(pickingList.deliverySiteAddress) || safeText(pickingList.clientAddress) || '-',
    totalQuantity
  };
}

const printDummyStockReport = async (req, res) => {
  const pickingListsItems = Array.from({ length: 100 }, (_, i) => ({
    itemCode: `ITEM${String(i + 1).padStart(3, '0')}`,
    itemName: `Sample Item ${i + 1}`,
    quantity: Math.floor(Math.random() * 100) + 1,
    uQ: 'pcs',
    batchNo: `BATCH${String(i + 1).padStart(3, '0')}`,
    serialNo: `SN${String(i + 1).padStart(5, '0')}`,
    displayExpiry: `2026-12-${String((i % 28) + 1).padStart(2, '0')}`,
    location: `LOC-${(i % 10) + 1}`,
    remarks: `Remark for item ${i + 1}`
  }));

  const viewModel = {
    pickingListsItems,
    totalQuantity: pickingListsItems.reduce((sum, item) => sum + item.quantity, 0),
    billingReference: "BR-123456",
    client: "Test Client",
    date: "2026-02-12",
    pickingListNo: "PL-2026-001",
    transactionFile: "TF-2026-001",
    customerRef: "CR-2026-001",
    serialNumber: "SERIAL-001",
    deliverySite: "Main Warehouse",
    logoSrc: "data:image/png;base64,...", // or your real logo
    warehouseMode: "Outgoing"
  };

  try {
    const pdfBuffer = await generateStockReportPdfBuffer(viewModel);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="dummy-stock-report.pdf"',
    });
    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).send('Failed to generate dummy PDF');
  }
};

/**
 * POST /api/picking-list/:pickingListID/pdf
 * Body: picking list object
 */
async function generateStockReportPdf(req, res) {
  try {
    const pickingList = req.body;
    // Minimal validation
    if (!pickingList || typeof pickingList !== "object") {
      return res.status(400).json({ message: "Invalid picking list payload" });
    }

    const vm = buildViewModel(pickingList);
    vm.logoSrcDataUri = await ensureDataUriLogo(vm.logoSrc);
    // vm.isDraft = String(vm.status || "").toLowerCase() === "draft";

    const pdfBuffer = await generateStockReportPdfBuffer(vm);
    
    res.setHeader("Content-Type", "application/pdf");
    res.status(200).send(pdfBuffer);
  } catch (err) {
    console.error("generateStockReportPdf error:", err);
    res.status(500).json({ message: "Failed to generate stock report PDF" });
  }
}

module.exports = {
  generateStockReportPdf,
  printDummyStockReport,
};

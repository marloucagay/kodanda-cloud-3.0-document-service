const {
  generatePickingListPdfBuffer,
} = require("../services/pickingList.service.js");
const { money, safeText, dateFormat } = require("../utils/format.js");
const { ensureDataUriLogo } = require("../utils/logoUri.js");

function buildViewModel(pickingList) {
    // const pickingListsDummy = [
    //   {
    //     itemCode: "STOCK-0001",
    //     itemName: "SDFKSJDFJFS SDFJSDHJFHH SDJFHJHJJJJJJJJJJ SJDFHJHJHJ SDJFHJHJHJ SDJFHJHJHJ SDJFHJHJHJ SDJFHJHJHJ SDJFHJHJHJ",
    //     quantity: 100,
    //     uQ: "Case",
    //     batchNo: "BATCH-001",
    //     serialNo: "SERIAL-001",
    //     expirationDate: "01 Jan 2028",
    //     location: "Location A",
    //     remarks: "Remark 1"
    //   },
    //   {
    //     itemCode: "STOCK-0002",
    //     itemName: "Item Name 2",
    //     itemName: "SDFKSJDFJFS SDFJSDHJFHH SDJFHJHJJJJJJJJJJ SJDFHJHJHJ SDJFHJHJHJ SDJFHJHJHJ SDJFHJHJHJ SDJFHJHJHJ SDJFHJHJHJ",

    //     quantity: 200,
    //     uQ: "Box",
    //     batchNo: "BATCH-002",
    //     serialNo: "SERIAL-002",
    //     expirationDate: "02 Feb 2028",
    //     location: "Location B",
    //     remarks: "Remark 2"
    //   },
    //   {
    //     itemCode: "STOCK-0003",
    //     itemName: "Item Name 3",
    //     quantity: 300,
    //     uQ: "Piece",
    //     batchNo: "BATCH-003",
    //     serialNo: "SERIAL-003",
    //     expirationDate: "03 Mar 2028",
    //     location: "Location C",
    //     remarks: "Remark 3"
    //   },
    //   {
    //     itemCode: "STOCK-0004",
    //     itemName: "Item Name 4",
    //     quantity: 400,
    //     uQ: "Pack",
    //     batchNo: "BATCH-004",
    //     serialNo: "SERIAL-004",
    //     expirationDate: "04 Apr 2028",
    //     location: "Location D",
    //     remarks: "Remark 4"
    //   },
    //   {
    //     itemCode: "STOCK-0005",
    //     itemName: "Item Name 5",
    //     quantity: 500,
    //     uQ: "Case",
    //     batchNo: "BATCH-005",
    //     serialNo: "SERIAL-005",
    //     expirationDate: "05 May 2028",
    //     location: "Location E",
    //     remarks: "Remark 5"
    //   },
    //   {
    //     itemCode: "STOCK-0006",
    //     itemName: "Item Name 6",
    //     quantity: 600,
    //     uQ: "Box",
    //     batchNo: "BATCH-006",
    //     serialNo: "SERIAL-006",
    //     expirationDate: "06 Jun 2028",
    //     location: "Location F",
    //     remarks: "Remark 6"
    //   },
    //   {
    //     itemCode: "STOCK-0007",
    //     itemName: "Item Name 7",
    //     quantity: 700,
    //     uQ: "Piece",
    //     batchNo: "BATCH-007",
    //     serialNo: "SERIAL-007",
    //     expirationDate: "07 Jul 2028",
    //     location: "Location G",
    //     remarks: "Remark 7"
    //   },
    //   {
    //     itemCode: "STOCK-0008",
    //     itemName: "Item Name 8",
    //     quantity: 800,
    //     uQ: "Pack",
    //     batchNo: "BATCH-008",
    //     serialNo: "SERIAL-008",
    //     expirationDate: "08 Aug 2028",
    //     location: "Location H",
    //     remarks: "Remark 8"
    //   },
    //   {
    //     itemCode: "STOCK-0009",
    //     itemName: "Item Name 9",
    //     quantity: 900,
    //     uQ: "Case",
    //     batchNo: "BATCH-009",
    //     serialNo: "SERIAL-009",
    //     expirationDate: "09 Sep 2028",
    //     location: "Location I",
    //     remarks: "Remark 9"
    //   },
    //   {
    //     itemCode: "STOCK-0010",
    //     itemName: "Item Name 10",
    //     quantity: 1000,
    //     uQ: "Box",
    //     batchNo: "BATCH-010",
    //     serialNo: "SERIAL-010",
    //     expirationDate: "10 Oct 2028",
    //     location: "Location J",
    //     remarks: "Remark 10"
    //   },
    //   {
    //     itemCode: "STOCK-0001",
    //     itemName: "Item Name 1",
    //     quantity: 100,
    //     uQ: "Case",
    //     batchNo: "BATCH-001",
    //     serialNo: "SERIAL-001",
    //     expirationDate: "01 Jan 2028",
    //     location: "Location A",
    //     remarks: "Remark 1"
    //   },
    //   {
    //     itemCode: "STOCK-0002",
    //     itemName: "Item Name 2",
    //     quantity: 200,
    //     uQ: "Box",
    //     batchNo: "BATCH-002",
    //     serialNo: "SERIAL-002",
    //     expirationDate: "02 Feb 2028",
    //     location: "Location B",
    //     remarks: "Remark 2"
    //   },
    //   {
    //     itemCode: "STOCK-0003",
    //     itemName: "Item Name 3",
    //     quantity: 300,
    //     uQ: "Piece",
    //     batchNo: "BATCH-003",
    //     serialNo: "SERIAL-003",
    //     expirationDate: "03 Mar 2028",
    //     location: "Location C",
    //     remarks: "Remark 3"
    //   },
    //   {
    //     itemCode: "STOCK-0004",
    //     itemName: "Item Name 4",
    //     quantity: 400,
    //     uQ: "Pack",
    //     batchNo: "BATCH-004",
    //     serialNo: "SERIAL-004",
    //     expirationDate: "04 Apr 2028",
    //     location: "Location D",
    //     remarks: "Remark 4"
    //   },
    //   {
    //     itemCode: "STOCK-0005",
    //     itemName: "Item Name 5",
    //     quantity: 500,
    //     uQ: "Case",
    //     batchNo: "BATCH-005",
    //     serialNo: "SERIAL-005",
    //     expirationDate: "05 May 2028",
    //     location: "Location E",
    //     remarks: "Remark 5"
    //   },
    //   {
    //     itemCode: "STOCK-0006",
    //     itemName: "Item Name 6",
    //     quantity: 600,
    //     uQ: "Box",
    //     batchNo: "BATCH-006",
    //     serialNo: "SERIAL-006",
    //     expirationDate: "06 Jun 2028",
    //     location: "Location F",
    //     remarks: "Remark 6"
    //   },
    //   {
    //     itemCode: "STOCK-0007",
    //     itemName: "Item Name 7",
    //     quantity: 700,
    //     uQ: "Piece",
    //     batchNo: "BATCH-007",
    //     serialNo: "SERIAL-007",
    //     expirationDate: "07 Jul 2028",
    //     location: "Location G",
    //     remarks: "Remark 7"
    //   },
    //   {
    //     itemCode: "STOCK-0008",
    //     itemName: "Item Name 8",
    //     quantity: 800,
    //     uQ: "Pack",
    //     batchNo: "BATCH-008",
    //     serialNo: "SERIAL-008",
    //     expirationDate: "08 Aug 2028",
    //     location: "Location H",
    //     remarks: "Remark 8"
    //   },
    //   {
    //     itemCode: "STOCK-0009",
    //     itemName: "Item Name 9",
    //     quantity: 900,
    //     uQ: "Case",
    //     batchNo: "BATCH-009",
    //     serialNo: "SERIAL-009",
    //     expirationDate: "09 Sep 2028",
    //     location: "Location I",
    //     remarks: "Remark 9"
    //   },
    //   {
    //     itemCode: "STOCK-0010",
    //     itemName: "Item Name 10",
    //     quantity: 1000,
    //     uQ: "Box",
    //     batchNo: "BATCH-010",
    //     serialNo: "SERIAL-010",
    //     expirationDate: "10 Oct 2028",
    //     location: "Location J",
    //     remarks: "Remark 10"
    //   }
    // ];

  // const pickingListsItems = Array.isArray(pickingListsDummy)
  //   ? pickingListsDummy.map(item => ({
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
    client: safeText(pickingList.client) || '-',
    date: dateFormat(pickingList.date) || '-',
    pickingListNo: safeText(pickingList.pickingListNo) || '-',
    transactionFile: safeText(pickingList.transactionFile) || '-',
    customerRef: safeText(pickingList.customerReference) || '-',
    serialNo: safeText(pickingList.serialNo) || '-',
    deliverySite: safeText(pickingList.deliverySite) || '-',
    remarks: safeText(pickingList.remarks) || '-',
    totalQuantity
  };
}

/**
 * POST /api/picking-list/:pickingListID/pdf
 * Body: picking list object
 */
async function generatePickingListPdf(req, res) {
  try {
    const pickingList = req.body;
    // Minimal validation
    if (!pickingList || typeof pickingList !== "object") {
      return res.status(400).json({ message: "Invalid picking list payload" });
    }

    const vm = buildViewModel(pickingList);
    vm.logoSrcDataUri = await ensureDataUriLogo(vm.logoSrc);
    // vm.isDraft = String(vm.status || "").toLowerCase() === "draft";

    const pdfBuffer = await generatePickingListPdfBuffer(vm);

    const fileName = `${vm.pickingListNo}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);
    res.status(200).send(pdfBuffer);
  } catch (err) {
    console.error("generatePickingListPdf error:", err);
    res.status(500).json({ message: "Failed to generate picking list PDF" });
  }
}

module.exports = {
  generatePickingListPdf,
};
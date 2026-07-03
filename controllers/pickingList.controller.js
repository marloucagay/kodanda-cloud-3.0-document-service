const {
  generatePickingListPdfBuffer,
} = require("../services/pickingList.service.js");
const { money, safeText, dateFormat } = require("../utils/format.js");
const { ensureDataUriLogo } = require("../utils/logoUri.js");

function buildViewModel(pickingList) {
  const pickingListsItems = Array.isArray(pickingList.pickingLists)
    ? pickingList.pickingLists.map((item) => ({
        ...item,
        displayExpiry: item.expirationDate || "",
      }))
    : [];

  const totalQuantity = pickingListsItems.reduce(
    (sum, item) => sum + (parseFloat(item.quantity) || 0),
    0,
  );

  return {
    ...pickingList,
    pickingListsItems,
    client: safeText(pickingList.client) || "-",
    date: dateFormat(pickingList.date) || "-",
    pickingListNo: safeText(pickingList.pickingListNo) || "-",
    transactionFile: safeText(pickingList.transactionFile) || "-",
    customerRef: safeText(pickingList.customerReference) || "-",
    serialNo: safeText(pickingList.serialNo) || "-",
    deliverySite: safeText(pickingList.deliverySite) || "-",
    remarks: safeText(pickingList.remarks) || "-",
    completeAddress:
      pickingList.deliverySite && pickingList.deliverySiteAddress
        ? `${pickingList.deliverySite}, ${pickingList.deliverySiteAddress}`
        : pickingList.deliverySite || pickingList.deliverySiteAddress || "-",
    totalQuantity,
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

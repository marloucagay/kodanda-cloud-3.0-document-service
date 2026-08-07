const {
  generateEcomPickingListPdfBuffer,
} = require("../services/ecommerce.service.js");
const { money, safeText, dateFormat } = require("../utils/format.js");
const { ensureDataUriLogo } = require("../utils/logoUri.js");

const BLANK_ROW_THRESHOLD = 5;
const TARGET_ROWS_WHEN_SPARSE = 15;

function buildViewModel(pickingList) {
  const pickingListsItems = Array.isArray(pickingList.picklistByOrder)
    ? pickingList.picklistByOrder.map((item, index) => ({
        ...item,
        rowNo: index + 1,
      }))
    : [];

  const totalQuantity = pickingListsItems.reduce(
    (sum, item) => sum + (parseFloat(item.quantity) || 0),
    0,
  );

  // Extra Rows if items are less than 5
  if (pickingListsItems.length < BLANK_ROW_THRESHOLD) {
    const blankRowsNeeded = Math.max(
      0,
      TARGET_ROWS_WHEN_SPARSE - pickingListsItems.length,
    );
    for (let i = 0; i < blankRowsNeeded; i++) {
      pickingListsItems.push({
        rowNo: "",
        itemCode: "",
        itemName: "",
        quantity: "",
        expirationDate: "",
        condition: "",
        location: "",
      });
    }
  }

  return {
    ...pickingList,
    pickingListsItems,
    consigneeName: safeText(pickingList.consigneeName) || "-",
    orderDate: dateFormat(pickingList.orderDate) || "-",
    siNumber: safeText(pickingList.sI) || "-",
    orderNumber: safeText(pickingList.oRDER) || "-",
    dateTimeProcessed: safeText(pickingList.dateTimeProcessed) || "-",
    deliveryAddress: safeText(pickingList.deliveryAddress) || "-",
    totalQuantity,
  };
}

/**
 * POST /api/ecommerce/picklist/pdf
 * Body: picking list object
 */
async function generateEcomPickingListPdf(req, res) {
  try {
    const pickingList = req.body;
    // Minimal validation
    if (!pickingList || typeof pickingList !== "object") {
      return res.status(400).json({ message: "Invalid picking list payload" });
    }

    const vm = buildViewModel(pickingList);
    vm.logoSrcDataUri = await ensureDataUriLogo(vm.logoSrc);
    // vm.isDraft = String(vm.status || "").toLowerCase() === "draft";

    const pdfBuffer = await generateEcomPickingListPdfBuffer(vm);

    const fileName = `${vm.pickingListNo}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);
    res.status(200).send(pdfBuffer);
  } catch (err) {
    console.error("generateEcomPickingListPdf error:", err);
    // #region agent log
    console.error(
      "[DEBUG-73b8e7]",
      JSON.stringify({
        sessionId: "73b8e7",
        location: "pickingList.controller.js:generateEcomPickingListPdf:catch",
        message: "controller caught picking list pdf error",
        data: {
          errorMessage: err?.message || String(err),
          errorName: err?.name,
        },
        timestamp: Date.now(),
        hypothesisId: "A,C,D",
        runId: process.env.DEBUG_RUN_ID || "pre-fix",
      }),
    );
    fetch("http://127.0.0.1:7618/ingest/71039342-14db-438f-8e6a-22bc8642d8d7", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "73b8e7",
      },
      body: JSON.stringify({
        sessionId: "73b8e7",
        location: "pickingList.controller.js:generateEcomPickingListPdf:catch",
        message: "controller caught picking list pdf error",
        data: {
          errorMessage: err?.message || String(err),
          errorName: err?.name,
        },
        timestamp: Date.now(),
        hypothesisId: "A,C,D",
        runId: process.env.DEBUG_RUN_ID || "pre-fix",
      }),
    }).catch(() => {});
    // #endregion
    res.status(500).json({ message: "Failed to generate picking list PDF" });
  }
}

module.exports = {
  generateEcomPickingListPdf,
};

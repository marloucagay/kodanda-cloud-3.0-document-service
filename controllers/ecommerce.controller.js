const {
  generateEcomPickingListPdfBuffer,
  generateEcomBatchPdfBuffer,
  generateEcomDispatchPdfBuffer,
} = require("../services/ecommerce.service.js");
const { money, safeText, dateFormat } = require("../utils/format.js");
const { ensureDataUriLogo } = require("../utils/logoUri.js");

const PICKLIST_MIN_ROWS = 20;
const BATCH_PICKLIST_MIN_ROWS = 15;

const EMPTY_ROW = Object.freeze({
  rowNo: "",
  itemCode: "",
  itemName: "",
  quantity: "",
  expirationDate: "",
  condition: "",
  location: "",
});

// Shared: numbers the items and pads with blank rows up to minRows
function buildItemRows(items, minRows) {
  const list = Array.isArray(items) ? items : [];

  const rows = list.map((item, index) => ({ ...item, rowNo: index + 1 }));
  const blanks = Array.from(
    { length: Math.max(0, minRows - rows.length) },
    () => ({ ...EMPTY_ROW }),
  );

  return [...rows, ...blanks];
}

const sumQuantity = (items) =>
  (Array.isArray(items) ? items : []).reduce(
    (sum, item) => sum + (parseFloat(item.quantity) || 0),
    0,
  );

// Single picklist/ picklist by order
function buildPicklistViewModel(pickingList) {
  return {
    ...pickingList,
    pickingListsItems: buildItemRows(
      pickingList.picklistByOrder,
      PICKLIST_MIN_ROWS,
    ),
    consigneeName: safeText(pickingList.consigneeName) || "-",
    orderDate: dateFormat(pickingList.orderDate) || "-",
    siNumber: safeText(pickingList.sI) || "-",
    orderNumber: safeText(pickingList.oRDER) || "-",
    dateTimeProcessed: safeText(pickingList.dateTimeProcessed) || "-",
    deliveryAddress: safeText(pickingList.deliveryAddress) || "-",
    totalQuantity: sumQuantity(pickingList.picklistByOrder),
  };
}

// Batch picklist
function buildBatchViewModel(batchPicklist) {
  return {
    ...batchPicklist,
    pickingListsItems: buildItemRows(
      batchPicklist.batchPicklist,
      BATCH_PICKLIST_MIN_ROWS,
    ),
    batchNo: safeText(batchPicklist.batchNo) || "-",
    dateGenerated: safeText(batchPicklist.dateGenerated) || "-",
    totalQuantity: sumQuantity(batchPicklist.batchPicklist),
  };
}

// Dispatch
function buildDispatchViewModel(dispatch) {
  const items = Array.isArray(dispatch.batchPicklist)
    ? dispatch.batchPicklist
    : [];

  return {
    ...dispatch,
    pickingListsItems: items.map((item) => ({
      ...item,
      batchingCode: safeText(item.batchingCode) || "-",
      expirationDate: safeText(item.expirationDate) || "NO EXPIRY",
      staging: safeText(item.staging) || "-",
      location: safeText(item.location) || "-",
    })),
    dispatchNo: safeText(dispatch.dispatchNo) || "-",
    dateDispatch: safeText(dispatch.dateDispatch) || "-",
    plateNo: safeText(dispatch.plateNo) || "-",
    typeOfVehicle: safeText(dispatch.typeOfVehicle) || "-",
    driver: safeText(dispatch.driver) || "-",
    helper: safeText(dispatch.helper) || "-",
    preparedBy: safeText(dispatch.ownerName) || "-",
    totalQuantity: sumQuantity(items),
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

    const vm = buildPicklistViewModel(pickingList);
    vm.logoSrcDataUri = await ensureDataUriLogo(vm.logoSrc);
    // vm.isDraft = String(vm.status || "").toLowerCase() === "draft";

    const pdfBuffer = await generateEcomPickingListPdfBuffer(vm);

    const fileName = `${vm.ecomPickListNo}.pdf`;

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

async function generateEcomBatchPdf(req, res) {
  try {
    const batchPicklist = req.body;
    // Minimal validation
    if (!batchPicklist || typeof batchPicklist !== "object") {
      return res.status(400).json({ message: "Invalid picking list payload" });
    }

    const vm = buildBatchViewModel(batchPicklist);
    vm.logoSrcDataUri = await ensureDataUriLogo(vm.logoSrc);
    // vm.isDraft = String(vm.status || "").toLowerCase() === "draft";

    const pdfBuffer = await generateEcomBatchPdfBuffer(vm);

    res.setHeader("Content-Type", "application/pdf");
    res.status(200).send(pdfBuffer);
  } catch (err) {
    console.error("generateEcomBatchPdf error:", err);
    // #region agent log
    console.error(
      "[DEBUG-73b8e7]",
      JSON.stringify({
        sessionId: "73b8e7",
        location: "pickingList.controller.js:generateEcomBatchPdf:catch",
        message: "controller caught batch pdf error",
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
        location: "pickingList.controller.js:generateEcomBatchPdf:catch",
        message: "controller caught batch pdf error",
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
    res.status(500).json({ message: "Failed to generate batch picklist PDF" });
  }
}

async function generateEcomDispatchPdf(req, res) {
  try {
    const dispatchInfo = req.body;
    // Minimal validation
    if (!dispatchInfo || typeof dispatchInfo !== "object") {
      return res.status(400).json({ message: "Invalid dispatch info payload" });
    }

    const vm = buildDispatchViewModel(dispatchInfo);
    vm.logoSrcDataUri = await ensureDataUriLogo(vm.logoSrc);
    // vm.isDraft = String(vm.status || "").toLowerCase() === "draft";

    const pdfBuffer = await generateEcomDispatchPdfBuffer(vm);

    res.setHeader("Content-Type", "application/pdf");
    res.status(200).send(pdfBuffer);
  } catch (err) {
    console.error("generateEcomDispatchPdf error:", err);
    // #region agent log
    console.error(
      "[DEBUG-73b8e7]",
      JSON.stringify({
        sessionId: "73b8e7",
        location: "pickingList.controller.js:generateEcomDispatchPdf:catch",
        message: "controller caught dispatch pdf error",
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
        location: "pickingList.controller.js:generateEcomDispatchPdf:catch",
        message: "controller caught dispatch pdf error",
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
    res
      .status(500)
      .json({ message: "Failed to generate ecommerce dispatch PDF" });
  }
}

module.exports = {
  generateEcomPickingListPdf,
  generateEcomBatchPdf,
  generateEcomDispatchPdf,
};

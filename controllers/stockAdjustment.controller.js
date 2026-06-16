const {
  generateStockAdjustmentPdfBuffer,
} = require("../services/stockAdjustment.service.js");
const { money, safeText, dateFormat } = require("../utils/format.js");
const { ensureDataUriLogo } = require("../utils/logoUri.js");

function buildViewModel(stockAdjustment) {

  return {
    adjustmentID: safeText(stockAdjustment.adjustmentID),
    date: dateFormat(stockAdjustment.date),
    createdBy: safeText(stockAdjustment.createdBy),
    status: safeText(stockAdjustment.status),
    parentItemCode: safeText(stockAdjustment.parentItemCode),
    itemDescription: safeText(stockAdjustment.itemDescription),
    clientName: safeText(stockAdjustment.clientName),
    remarks: safeText(stockAdjustment.remarks),
    printedBy: stockAdjustment.printedBy,
    printedOn: stockAdjustment.printedOn,
    approvedBy: stockAdjustment.approvedBy,
    logoSrc: stockAdjustment.logoSrc || null,
    selectedReasons: (stockAdjustment.selectedReasons || []).map((reason) => {
        const match = (stockAdjustment.adjustmentValues || []).find((v) => v.key === reason.key);
        return {
            ...reason,
            currentValue: match?.currentValue ?? '',
            newValue: match?.newValue ?? ''
        };
    }),
  };
}

/**
 * POST /api/stock-adjustments/:stockAdjustmentID/pdf
 * Body: stockAdjustment object
 */
async function generateStockAdjustmentPdf(req, res) {
  try {
    const stockAdjustment = req.body;

    if (!stockAdjustment || typeof stockAdjustment !== "object") {
      return res.status(400).json({ message: "Invalid stock adjustment payload" });
    }

    const vm = buildViewModel(stockAdjustment);
    vm.logoSrcDataUri = await ensureDataUriLogo(vm.logoSrc);
    vm.isDraft = String(vm.status || "").toLowerCase() === "draft";

    const pdfBuffer = await generateStockAdjustmentPdfBuffer(vm);

    res.setHeader("Content-Type", "application/pdf");
    res.status(200).send(pdfBuffer);
  } catch (err) {
    console.error("generateStockAdjustmentPdf error:", err);
    res.status(500).json({ message: "Failed to generate stock adjustment PDF" });
  }
}

module.exports = {
  generateStockAdjustmentPdf,
};

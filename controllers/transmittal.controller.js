const {
  generateTransmittalPdfBuffer,
} = require("../services/transmittal.service.js");
const { money, safeText, dateFormat } = require("../utils/format.js");
const { ensureDataUriLogo } = require("../utils/logoUri.js");

function buildViewModel(transmittal) {
  return {
    ...transmittal,

    // Transmittal Information
    transmittalNo: safeText(transmittal.transmittalNo),
    dateCreated: dateFormat(transmittal.createdAt || transmittal.created_at),
    invoiceStatementNo: safeText(
      transmittal.invoiceStatementNumber || transmittal.invoiceNo,
    ),
    status: safeText(transmittal.status_name || transmittal.status),

    // Customer Information
    customerName: safeText(transmittal.customerName),
    billingAddress: safeText(transmittal.billingAddress),
    contactPerson: safeText(transmittal.contactPerson),
    contactNo: safeText(transmittal.contactNo),
    tinNumber: safeText(transmittal.tINNumber),
    exchangeRate: safeText(transmittal.exchangeRate),
    creditTerm: safeText(transmittal.creditTerm),

    // Message to Customer
    message: safeText(transmittal.message),

    // Documents
    documents: (transmittal.itemsToBill || []).map((item, index) => ({
      ...item,
      number: index + 1,
      documentNo: safeText(
        item.invoiceNo ||
          item.invoiceNumber ||
          item.documentNo ||
          item.documentNumber ||
          item.referenceNo,
      ),
      remarks: safeText(item.remarks),
    })),

    // Additional Information
    remarks: safeText(transmittal.remarks),
    logoSrc: transmittal.logoSrc || "",
  };
}

/**
 * POST /api/transmittal/:transmittalID/pdf
 * Body: transmittal object
 */
async function generateTransmittalPdf(req, res) {
  try {
    const transmittal = req.body;

    if (!transmittal || typeof transmittal !== "object") {
      return res.status(400).json({ message: "Invalid transmittal payload" });
    }

    const vm = buildViewModel(transmittal);
    vm.logoSrcDataUri = await ensureDataUriLogo(vm.logoSrc);
    vm.isDraft = String(vm.status || "").toLowerCase() === "draft";

    const pdfBuffer = await generateTransmittalPdfBuffer(vm);

    res.setHeader("Content-Type", "application/pdf");
    res.status(200).send(pdfBuffer);
  } catch (err) {
    console.error("generateTransmittalPdf error:", err);
    res.status(500).json({ message: "Failed to generate transmittal PDF" });
  }
}

module.exports = {
  generateTransmittalPdf,
};

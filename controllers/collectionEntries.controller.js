const {
  generateCollectionEntriesPdfBuffer,
} = require("../services/collectionEntries.service.js");

const { money, safeText, dateFormat } = require("../utils/format.js");
const { ensureDataUriLogo } = require("../utils/logoUri.js");

function getOriginalAmount(item) {
  const charges = item.charges || [];

  return charges.reduce((total, charge) => {
    const chargeTotal = Number(charge.total) || 0;
    const vat = Number(charge.vat) || 0;
    const withholdingTax = Number(charge.withholdingTax) || 0;

    return total + chargeTotal + vat - withholdingTax;
  }, 0);
}

function getTotalAmountPaid(item, payments) {
  return payments
    .filter((payment) => {
      const matchesTransaction =
        payment.invoiceId === item.invoiceId ||
        payment.documentKey === item.invoiceId;

      return matchesTransaction && payment.status === "Posted";
    })
    .reduce((total, payment) => {
      return total + (Number(payment.amount) || 0);
    }, 0);
}

function buildViewModel(collectionEntries) {
  const payments = collectionEntries.payments || [];

  return {
    ...collectionEntries,

    // Collection Entries Information
    arNo: safeText(collectionEntries.aRNo),
    dateCreated: dateFormat(
      collectionEntries.createdAt || collectionEntries.created_at,
    ),
    transmittalNo: safeText(collectionEntries.transmittalNo),
    status: safeText(collectionEntries.status_name || collectionEntries.status),

    // Customer Information
    customerName: safeText(collectionEntries.customerName),
    billingAddress: safeText(collectionEntries.billingAddress),
    contactPerson: safeText(collectionEntries.contactPerson),
    contactNo: safeText(collectionEntries.contactNo),
    tinNumber: safeText(collectionEntries.tINNumber),
    creditTerm: safeText(collectionEntries.creditTerm),

    // Outstanding Transactions
    outstandingTransactions: (collectionEntries.itemsToBill || []).map(
      (item, index) => {
        const originalAmount = getOriginalAmount(item);

        const totalAmountPaid = getTotalAmountPaid(item, payments);

        const outstandingBalance = Math.max(
          originalAmount - totalAmountPaid,
          0,
        );

        return {
          ...item,

          number: index + 1,

          documentType: safeText(item.billing),
          documentNumber: safeText(item.invoiceNo),
          documentDate: dateFormat(item.dateCreated),

          originalAmount: money(originalAmount),
          totalAmountPaid: money(totalAmountPaid),
          outstandingBalance: money(outstandingBalance),

          paymentStatus: safeText(item.status),
        };
      },
    ),

    totalAmount: money(collectionEntries.totalAmount || 0),

    logoSrc: collectionEntries.logoSrc || "",
  };
}

/**
 * POST /api/collection-entries/:collectionEntriesID/pdf
 * Body: collection entries object
 */
async function generateCollectionEntriesPdf(req, res) {
  try {
    const collectionEntries = req.body;

    if (
      !collectionEntries ||
      typeof collectionEntries !== "object" ||
      Array.isArray(collectionEntries)
    ) {
      return res
        .status(400)
        .json({ message: "Invalid collectionEntries payload" });
    }

    const vm = buildViewModel(collectionEntries);

    vm.logoSrcDataUri = await ensureDataUriLogo(vm.logoSrc);

    vm.isDraft = String(vm.status || "").toLowerCase() === "draft";

    const pdfBuffer = await generateCollectionEntriesPdfBuffer(vm);

    res.setHeader("Content-Type", "application/pdf");
    res.status(200).send(pdfBuffer);
  } catch (err) {
    console.error("generateCollectionEntriesPdf error:", err);

    res
      .status(500)
      .json({ message: "Failed to generate collection entries PDF" });
  }
}

module.exports = {
  generateCollectionEntriesPdf,
};

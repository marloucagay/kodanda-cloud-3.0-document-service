const {
  generatePaymentHistoryPdfBuffer,
} = require("../services/paymentHistory.service.js");

const { money, safeText, dateFormat } = require("../utils/format.js");
const { ensureDataUriLogo } = require("../utils/logoUri.js");

function getPaymentSummary(paymentHistory) {
  return {
    originalAmount: (Number(paymentHistory.originalCents) || 0) / 100,
    paidAmount: (Number(paymentHistory.paidCents) || 0) / 100,
    outstandingBalance: (Number(paymentHistory.outstandingCents) || 0) / 100,
  };
}

function buildViewModel(paymentHistory) {
  const payments = paymentHistory.payments || [];
  const summary = getPaymentSummary(paymentHistory);

  const postedPayments = payments.filter(
    (payment) => payment.status === "Posted",
  );

  const totalPostedAmount = postedPayments.reduce(
    (total, payment) => total + (Number(payment.amount) || 0),
    0,
  );

  return {
    ...paymentHistory,

    // Document Information
    documentType: safeText(paymentHistory.billing),
    documentNumber: safeText(paymentHistory.invoiceNo),
    documentDate: dateFormat(paymentHistory.documentDate),
    currency: safeText(paymentHistory.currency),
    paymentStatus: safeText(paymentHistory.paymentStatus),

    // Payment Summary
    originalAmount: money(summary.originalAmount),
    totalPaid: money(summary.paidAmount),
    outstandingBalance: money(summary.outstandingBalance),

    // Payment History
    paymentRecords: payments.map((payment, index) => ({
      ...payment,

      number: index + 1,

      paymentDate: dateFormat(payment.paymentDate || payment.createdAt),

      paymentMethod: safeText(payment.paymentMethod),
      referenceNumber: safeText(payment.referenceNumber),
      amount: money(payment.amount || 0),
      recordedBy: safeText(payment.createdByName),
      status: safeText(payment.status),
      remarks: safeText(payment.remarks),

      proofOfPaymentName: safeText(
        payment.proofOfPayment?.originalname ||
          payment.proofOfPayment?.file_name,
      ),
    })),

    totalPaymentRecords: payments.length,
    totalPostedPayments: postedPayments.length,
    totalPostedAmount: money(totalPostedAmount),

    logoSrc: paymentHistory.logoSrc || "",
  };
}

/**
 * POST /api/payment-history/:documentKey/pdf
 * Body: selected document with its payments array
 */
async function generatePaymentHistoryPdf(req, res) {
  try {
    const paymentHistory = req.body;

    if (
      !paymentHistory ||
      typeof paymentHistory !== "object" ||
      Array.isArray(paymentHistory)
    ) {
      return res
        .status(400)
        .json({ message: "Invalid payment history payload" });
    }

    if (!Array.isArray(paymentHistory.payments)) {
      return res
        .status(400)
        .json({ message: "Payment history must contain a payments array" });
    }

    const vm = buildViewModel(paymentHistory);

    vm.logoSrcDataUri = await ensureDataUriLogo(vm.logoSrc);

    const pdfBuffer = await generatePaymentHistoryPdfBuffer(vm);

    res.setHeader("Content-Type", "application/pdf");
    res.status(200).send(pdfBuffer);
  } catch (err) {
    console.error("generatePaymentHistoryPdf error:", err);

    res.status(500).json({ message: "Failed to generate payment history PDF" });
  }
}

module.exports = {
  generatePaymentHistoryPdf,
};

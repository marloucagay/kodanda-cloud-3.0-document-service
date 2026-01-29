const {
  generateInvoicePdfBuffer,
} = require("../services/invoicePdf.service.js");
const { money, safeText } = require("../utils/format.js");
const { ensureDataUriLogo } = require("../utils/logoUri.js");

function buildTotalsRows(summary = {}, overallTotal, clientCurrency) {
  const left = [
    ["Vatable Sales", money(summary.vatableSales)],
    ["VAT", money(summary.vat)],
    ["Zero Rated Sales", money(summary.zeroRatedSales)],
    ["VAT Exempt Sales", money(summary.vatExemptSales)],
  ];

  const right = [
    ["Total Sales", money(summary.totalSales)],
    ["Less: VAT", money(summary.lessVat)],
    ["Amount Net of VAT", money(summary.netOfVat)],
    ["Less: Discount (SC/PWD/NAAC/MOV/SP)", money(summary.discount)],
    ["Add: VAT", money(summary.addVat)],
    ["Less: Withholding Tax", money(summary.withholdingTax)],
  ];

  const groups = Array.isArray(summary.withholdingGroups)
    ? summary.withholdingGroups
    : [];
  for (const g of groups) {
    right.push([
      `Withholding Tax ${safeText(g.witholdingPercentage)}%`,
      money(g.totalWithholdingTax),
    ]);
  }

  right.push([`Total Amount Due (${clientCurrency})`, money(overallTotal)]);

  const rows = Math.max(left.length, right.length);
  return Array.from({ length: rows }).map((_, i) => ({
    leftLabel: left[i]?.[0] ?? "",
    leftValue: left[i]?.[1] ?? "",
    rightLabel: right[i]?.[0] ?? "",
    rightValue: right[i]?.[1] ?? "",
  }));
}

function buildViewModel(invoice) {
  // Normalize fields used by template (avoid blank strings)
  console.log("Building invoice view model for:", invoice);
  return {
    ...invoice,
    invoiceNo: safeText(invoice.invoiceNo),
    vatType: safeText(invoice.vatType),
    invoiceDate: safeText(invoice.invoiceDate),
    status: safeText(invoice.status),

    fileNo: safeText(invoice.fileNo),
    quotationNo: safeText(invoice.quotationNo),
    customerName: safeText(invoice.customerName),
    billingAddress: safeText(invoice.billingAddress),
    contactPerson: safeText(invoice.contactPerson),
    contactNo: safeText(invoice.contactNo),
    creditTerm: safeText(invoice.creditTerm),
    exchangeRate: safeText(invoice.exchangeRate),

    mAWB: safeText(invoice.mAWB),
    hAWB: safeText(invoice.hAWB),
    referenceDetails: safeText(invoice.referenceDetails),
    referenceDate: safeText(invoice.referenceDate),
    description: safeText(invoice.description),
    origin: safeText(invoice.origin),

    clientTIN: safeText(invoice.clientTIN),
    businessStyle: invoice.businessEntities || [],

    // If you want logo: use a base64 data-uri or a URL reachable by puppeteer.
    // logoSrc: "data:image/png;base64,....",
    logoSrc: invoice.logoSrc || "",

    charges: (invoice.charges ?? []).map((c) => ({
      ...c,
      description: safeText(c.description),
      rateBasis: safeText(c.rateBasis),
      rateFmt: money(c.rate ?? c.ratePHP ?? 0),
    })),

    totalsRows: buildTotalsRows(
      invoice.summary,
      invoice.overallTotal,
      invoice.clientCurrency
    ),
  };
}

/**
 * POST /api/invoices/:invoiceNo/pdf
 * Body: invoice object
 */
async function generateInvoicePdf(req, res) {
  try {
    const invoice = req.body;

    // Minimal validation
    if (!invoice || typeof invoice !== "object") {
      return res.status(400).json({ message: "Invalid invoice payload" });
    }

    const vm = buildViewModel(invoice);
    vm.logoSrcDataUri = await ensureDataUriLogo(vm.logoSrc);
    vm.isDraft = String(vm.status || "").toLowerCase() === "draft";

    const pdfBuffer = await generateInvoicePdfBuffer(vm);

    const fileName = `${vm.invoiceNo}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);
    res.status(200).send(pdfBuffer);
  } catch (err) {
    console.error("generateInvoicePdf error:", err);
    res.status(500).json({ message: "Failed to generate invoice PDF" });
  }
}

module.exports = {
  generateInvoicePdf,
};

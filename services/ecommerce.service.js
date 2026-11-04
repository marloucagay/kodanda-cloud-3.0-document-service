const fs = require("fs");
const path = require("path");
const mustache = require("mustache");
const { PDFDocument } = require("pdf-lib");
const { launchPuppeteerBrowser } = require("../utils/puppeteerLaunch.js");

const PRINT_TIME_ZONE = "Asia/Manila";
const BROWSER_OWNER = "ecommerce.service";
const DEFAULT_PRINTED_BY = "System";
const COMPANY_ADDRESS =
  "Lot 1 Ninoy Aquino Ave., Corner Old Kabihasnan St., San Dionisio, Parañaque City";

const TEMPLATES_DIR = path.join(process.cwd(), "templates");

const DEFAULT_MARGIN = Object.freeze({
  top: "8mm",
  bottom: "20mm",
  left: "8mm",
  right: "8mm",
});

const DOCUMENT_TYPES = Object.freeze({
  picklist: { templateFile: "ecom-picklist.mustache", landscape: false },
  batchPicklist: {
    templateFile: "ecom-batch-picklist.mustache",
    landscape: true,
  },
  dispatch: {
    templateFile: "ecom-dispatch.mustache",
    landscape: false,
    title: "Dispatch",
    preparedBy: (vm) => vm.ownerName || "-",
    margin: { top: "42mm", bottom: "35mm", left: "8mm", right: "8mm" },
  },
});

// HELPERS

const formatPrintDate = (now) =>
  now.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: PRINT_TIME_ZONE,
  }); // "03 Nov 2026"

const formatPrintTime = (now) =>
  now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: PRINT_TIME_ZONE,
  });

const withPrintStamp = (viewModel, now = new Date()) => ({
  printDate: formatPrintDate(now),
  printTime: formatPrintTime(now),
  ...viewModel,
});

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const toArray = (valueOrArray) =>
  Array.isArray(valueOrArray) ? valueOrArray : [valueOrArray];

const createTemplateRenderer = (templateFile) => {
  const source = fs.readFileSync(
    path.join(TEMPLATES_DIR, templateFile),
    "utf8",
  );
  return (viewModel) => mustache.render(source, viewModel);
};

const buildHeaderTemplate = (viewModel, title) => {
  const logo = viewModel.logoSrcDataUri || "";

  return `
    <style>
      .header-container { width:100%; display:flex; flex-direction:column; align-items:flex-start; padding:0 10mm; margin-top:8px; font-family:Arial,sans-serif; }
      .logo { width:150px; }
      .header-title { width:100%; text-align:center; font-size:18px; font-weight:700; border-top:1px solid #d0d0d0; border-bottom:1px solid #d0d0d0; padding:6px 0; margin-top:5px; }
    </style>
    <div class="header-container">
      ${logo ? `<img src="${logo}" class="logo" />` : ""}
      <div class="header-title">${escapeHtml(title)}</div>
    </div>
  `;
};

const buildSignatureRow = (labels = []) =>
  labels.length === 0
    ? ""
    : `
      <div style="display:grid; grid-template-columns:repeat(${labels.length}, 1fr); gap:8px; margin-bottom:24px;">
        ${labels
          .map(
            (label) => `
          <div style="display:flex; justify-content:center; gap:4px;">
            <h5 style="margin:0; font-size:12px; font-weight:400; text-align:center;">${escapeHtml(label)}</h5>
            <div style="border-bottom:1px solid #111; flex:1; margin-bottom:4px; margin-left:auto;"></div>
          </div>`,
          )
          .join("")}
      </div>
    `;

const buildPreparedBy = (name) =>
  name
    ? `
      <div style="display:flex; align-items:baseline; gap:12px; margin-bottom:16px; font-size:12px;">
        <span style="font-weight:700;">Prepared By:</span>
        <span>${escapeHtml(name)}</span>
      </div>
    `
    : "";

const buildFooterTemplate = (viewModel, { signatures, preparedBy } = {}) => {
  const printedBy = viewModel.printedBy || DEFAULT_PRINTED_BY;
  const now = new Date();
  const printedOn =
    viewModel.printedOn || `${formatPrintDate(now)} ${formatPrintTime(now)}`;

  return `
    <div style="width:100%; padding:0 10mm; color:#111; font-family:Arial,sans-serif;">
      ${buildPreparedBy(preparedBy)}
      ${buildSignatureRow(signatures)}
      <div style="margin-bottom:4px; font-size:9px; text-align:center; color:#1E3A8A;">
        <div>${escapeHtml(COMPANY_ADDRESS)}</div>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin:8px 0; font-size:9px; color:#1E3A8A;">
        <div>Printed by: ${escapeHtml(printedBy)} | Printed on: ${escapeHtml(printedOn)}</div>
        <div>Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>
      </div>
    </div>
  `;
};

const createPdfPageRenderer =
  ({ landscape, title, signatures, preparedBy, margin = DEFAULT_MARGIN }) =>
  async (browser, html, viewModel) => {
    const page = await browser.newPage();

    try {
      await page.setCacheEnabled(false);
      await page.setContent(html, { waitUntil: "networkidle0" });

      const resolve = (value) =>
        typeof value === "function" ? value(viewModel) : value;

      return await page.pdf({
        format: "A4",
        landscape,
        printBackground: true,
        displayHeaderFooter: true,
        ...(title && { headerTemplate: buildHeaderTemplate(viewModel, title) }),
        footerTemplate: buildFooterTemplate(viewModel, {
          signatures: resolve(signatures),
          preparedBy: resolve(preparedBy),
        }),
        margin,
      });
    } finally {
      await page.close();
    }
  };

const mergePdfBuffers = async (pdfBuffers) => {
  if (pdfBuffers.length === 1) return pdfBuffers[0];

  const mergedDoc = await PDFDocument.create();

  for (const buffer of pdfBuffers) {
    const donor = await PDFDocument.load(buffer);
    const copiedPages = await mergedDoc.copyPages(
      donor,
      donor.getPageIndices(),
    );
    copiedPages.forEach((page) => mergedDoc.addPage(page));
  }

  return Buffer.from(await mergedDoc.save());
};

const createPdfGenerator =
  ({ renderTemplate, renderPdf, mergePdfs, launchBrowser, label }) =>
  async (viewModelOrArray) => {
    const viewModels = toArray(viewModelOrArray);

    if (viewModels.length === 0) {
      throw new Error(`${label}: viewModels array is empty.`);
    }

    const browser = await launchBrowser();

    try {
      const pdfBuffers = [];
      for (const viewModel of viewModels) {
        const html = renderTemplate(withPrintStamp(viewModel));
        pdfBuffers.push(await renderPdf(browser, html, viewModel));
      }
      return await mergePdfs(pdfBuffers);
    } finally {
      await browser.close();
    }
  };

const launchBrowser = () => launchPuppeteerBrowser(BROWSER_OWNER);

const createDocumentGenerator = (documentType, label) =>
  createPdfGenerator({
    renderTemplate: createTemplateRenderer(documentType.templateFile),
    renderPdf: createPdfPageRenderer(documentType),
    mergePdfs: mergePdfBuffers,
    launchBrowser,
    label,
  });

const generateEcomPickingListPdfBuffer = createDocumentGenerator(
  DOCUMENT_TYPES.picklist,
  "generateEcomPickingListPdfBuffer",
);

const generateEcomBatchPdfBuffer = createDocumentGenerator(
  DOCUMENT_TYPES.batchPicklist,
  "generateEcomBatchPdfBuffer",
);

const generateEcomDispatchPdfBuffer = createDocumentGenerator(
  DOCUMENT_TYPES.dispatch,
  "generateEcomDispatchPdfBuffer",
);

module.exports = {
  generateEcomPickingListPdfBuffer,
  generateEcomBatchPdfBuffer,
  generateEcomDispatchPdfBuffer,
};

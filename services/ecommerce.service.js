const fs = require("fs");
const path = require("path");
const mustache = require("mustache");
const { PDFDocument } = require("pdf-lib");
const { launchPuppeteerBrowser } = require("../utils/puppeteerLaunch.js");

const templatePath = path.join(
  process.cwd(),
  "templates",
  "ecom-picklist.mustache",
);
const template = fs.readFileSync(templatePath, "utf8");

function renderPickingListHtml(viewModel) {
  return mustache.render(template, viewModel);
}

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function renderSinglePdf(viewModel, browser) {
  const html = renderPickingListHtml(viewModel);
  const now = new Date();

  const printedBy = viewModel.printedBy || "System";
  const printedOn = viewModel.printedOn || now.toLocaleString();
  const logo = viewModel.logoSrcDataUri || "";

  const dateNow = `${now.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
  })}, ${now.getFullYear()}`;

  const timeNow = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const page = await browser.newPage();

  try {
    await page.setCacheEnabled(false);
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      // landscape: true,
      printBackground: true,
      displayHeaderFooter: true,

    //   headerTemplate: `
    //     <style>
    //       .header-container {
    //         width: 100%;
    //         display: flex;
    //         flex-direction: column;
    //         align-items: flex-start;
    //         padding: 0 10mm;
    //         margin-top: 8px;
    //         font-family: Arial, sans-serif;
    //       }
    //       .logo { width: 200px; margin-left: -22px; margin-top: -20px; }
    //       .quotation-header-title {
    //         width: 100%;
    //         text-align: center;
    //         font-size: 18px;
    //         font-weight: 700;
    //         border-top: 1px solid #d0d0d0;
    //         border-bottom: 1px solid #d0d0d0;
    //         padding: 6px 0;
    //         margin-top: -10px;
    //       }
    //     </style>
    //     <div class="header-container">
    //       ${logo ? `<img src="${logo}" class="logo" />` : ""}
    //       <div class="quotation-header-title">Picking List</div>
    //     </div>
    //   `,

      footerTemplate: `
        <div style="width:100%; padding:0 10mm; color:#111; font-family:Arial,sans-serif;">
          <div style="margin-bottom:4px; font-size:9px; text-align:center; color:#1E3A8A;">
            <div>Lot 1 Ninoy Aquino Ave., Corner Old Kabihasnan St., San Dionisio, Parañaque City</div>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; margin-top:8px; font-size:9px; color:#1E3A8A;">
            <div>Printed by: ${escapeHtml(printedBy)} | Printed on: ${escapeHtml(printedOn)}</div>
            <div>Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>
          </div>
        </div>
      `,

      margin: { top: "8mm", bottom: "20mm", left: "8mm", right: "8mm" },
    //   margin: { top: "46mm", bottom: "40mm", left: "8mm", right: "8mm" },
    });

    return pdfBuffer;
  } finally {
    await page.close();
  }
}

async function mergePdfBuffers(pdfBuffers) {
  const mergedDoc = await PDFDocument.create();

  for (const buffer of pdfBuffers) {
    const donor = await PDFDocument.load(buffer);
    const pageIndices = donor.getPageIndices();
    const copiedPages = await mergedDoc.copyPages(donor, pageIndices);
    copiedPages.forEach((page) => mergedDoc.addPage(page));
  }

  const mergedBytes = await mergedDoc.save();
  return Buffer.from(mergedBytes);
}

async function generateEcomPickingListPdfBuffer(viewModelOrArray) {
  const viewModels = Array.isArray(viewModelOrArray)
    ? viewModelOrArray
    : [viewModelOrArray];

  if (viewModels.length === 0) {
    throw new Error("generateEcomPickingListPdfBuffer: viewModels array is empty.");
  }

  const browser = await launchPuppeteerBrowser("pickingList.service");

  try {
    const pdfBuffers = [];
    for (const viewModel of viewModels) {
      const buf = await renderSinglePdf(viewModel, browser);
      pdfBuffers.push(buf);
    }

    if (pdfBuffers.length === 1) {
      return pdfBuffers[0];
    }

    return await mergePdfBuffers(pdfBuffers);
  } finally {
    await browser.close();
  }
}

module.exports = {
  generateEcomPickingListPdfBuffer,
};

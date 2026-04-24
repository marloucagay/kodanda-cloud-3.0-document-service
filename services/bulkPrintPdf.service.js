const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");
const mustache = require("mustache");
const { PDFDocument } = require('pdf-lib');

const templatePath = path.join(
  process.cwd(),
  "templates",
  "delivery-receipt.mustache",
);
const template = fs.readFileSync(templatePath, "utf8");

function renderHtml(vm) {
  return mustache.render(template, vm);
}

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function generateBulkPrintPdfBuffer(viewModels) {
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--no-zygote",
    ],
  });

  try {
    const pdfBuffers = [];
    for (const vm of viewModels) {
      const page = await browser.newPage();
      const html = renderHtml(vm);
      await page.setContent(html, { waitUntil: "networkidle0" });

      const printedBy = escapeHtml(vm.printedBy || "System");
      const printedOn = escapeHtml(vm.printedOn || new Date().toLocaleString());
      const logo = vm.logoSrcDataUri;
      const docName = escapeHtml(vm.documentTitle) === "Waybill" ? "WAYBILL" : "DELIVERY RECEIPT";
      const drNumber = escapeHtml(vm.drNumber);

      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: `
          <div style="width: 100%; font-family: Arial, sans-serif; padding: 2mm 2mm 0 2mm;">
            <!-- Company -->
            <div style="font-size: 11px; line-height: 1.25; margin-bottom: 6px; color: #111; display: flex; justify-content: center; position: relative;">
              ${logo ? `<img src="${logo}" style="position: absolute; left: 16%; top: 0; width: 50px;" />` : ""}
              <div style="text-align: center; width: 100%;">
                <div style="font-weight: 700; font-size: 20px; margin-left: 10px;">
                  MONARCH DIVERSIFIED LOGISTICS, INC.
                </div>
                <div>Lot 1 Ninoy Aquino Ave. cor. Old Kabihasnan St. San Dionisio,</div>
                <div>City of Parañaque, NCR, Fourth District, Philippines 1700</div>
                <div>Tel. No.: (02) 4523644 / 8691-0165</div>
                <div>VAT Reg. TIN:009-586-612-00000</div>
              </div>
            </div>
            <!-- Header Row -->
            <div style="display: flex; align-items: center; justify-content: space-between; margin: 20px 0; padding-right: 8mm">
              <div style="flex: 1;"></div>
              <div style="flex: 1; text-align: center; font-size: 19px; font-weight: 700;">
                ${docName}
              </div>
              <div style="flex: 1; text-align: right; color: #c0392b; font-size: 12px; font-weight: 700;">
                ${drNumber}
              </div>
            </div>
          </div>
        `,
        footerTemplate: `
          <div style="width:100%; padding:0 14mm; font-size:9px; color:#111; font-family: Arial, sans-serif;">
            <div style="display:grid; grid-template-columns:1fr 360px; column-gap:18px;">
              <div style="font-size:11px; font-weight:500; align-items:flex-end; display:flex;">
                THIS DOCUMENT IS NOT VALID FOR CLAIMING INPUT TAX
              </div>
              <div style="display:flex; flex-direction:column; align-items:flex-start; gap:8px; font-size:12px;">
                <div style="margin-bottom:0;">Received the above items in good order and condition.</div>
                <div style="display:flex; gap:4px; width:100%; white-space:nowrap; margin-top:15px;">
                  <div style="min-width:90px;"><b>Received by:</b></div>
                  <div style="border-bottom:1px solid #111; flex:1; min-width:120px;"></div>
                </div>
                <div style="display:flex; width:100%; white-space:nowrap; padding-left:150px;">
                  <div>Printed Name and Signature</div>
                </div>
                <div style="display:flex; gap:4px; width:100%; white-space:nowrap; margin-top:15px;">
                  <div style="min-width:90px;"><b>Date:</b></div>
                  <div style="border-bottom:1px solid #111; flex:1; min-width:120px;"></div>
                </div>
              </div>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:8px; margin-top:32px;">
              <div>Printed by: ${printedBy} | Printed on: ${printedOn}</div>
              <div><span class="pageNumber"></span> of <span class="totalPages"></span></div>
            </div>
          </div>
        `,
        margin: {
          top: "45mm",
          bottom: "55mm",
          left: "8mm",
          right: "8mm",
        },
      });

      pdfBuffers.push(pdfBuffer);
      await page.close();
    }

    // Merge all PDF into one
    const mergedPdf = await PDFDocument.create();
    for (const pdfBuffer of pdfBuffers) {
      const pdf = await PDFDocument.load(pdfBuffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }
    const mergedPdfBytes = await mergedPdf.save();
    return Buffer.from(mergedPdfBytes);

  } finally {
    await browser.close();
  }
}

module.exports = {
  generateBulkPrintPdfBuffer,
};
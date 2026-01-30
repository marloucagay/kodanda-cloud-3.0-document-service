const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");
const mustache = require("mustache");

const templatePath = path.join(
  process.cwd(),
  "templates",
  "delivery-receipt.mustache"
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
    const page = await browser.newPage();
    // Render all receipts, separated by page breaks
    const html = viewModels.map(vm => mustache.render(template, vm)).join('<div style="page-break-after: always;"></div>');
    await page.setContent(html, { waitUntil: "networkidle0" });

    const printedBy = escapeHtml(viewModels[0].printedBy || "System");
    const printedOn = escapeHtml(viewModels[0].printedOn || new Date().toLocaleString());

    return await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: `<div class="h"></div>`,
      footerTemplate: `
        <div style="width:100%; padding:0 14mm; font-size:9px; color:#111;">
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
        top: "26mm",
        bottom: "16mm",
        left: "14mm",
        right: "14mm",
      },
    });
  } finally {
    await browser.close();
  }
}

module.exports = {
  generateBulkPrintPdfBuffer,
};

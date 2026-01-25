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
        <div style="width:100%; padding:0 14mm; font-size:9px; color:#111; display:flex; justify-content:space-between;">
          <div>Printed by: ${printedBy} | Printed on: ${printedOn}</div>
          <div><span class="pageNumber"></span> of <span class="totalPages"></span></div>
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

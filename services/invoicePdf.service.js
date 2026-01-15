const fs = require("fs");
const path = require("path");
const mustache = require("mustache");
const puppeteer = require("puppeteer");
const templatePath = path.join(process.cwd(), "templates", "invoice.mustache");
const template = fs.readFileSync(templatePath, "utf8");

/**
 * Render HTML using mustache template
 */
function renderInvoiceHtml(viewModel) {
  return mustache.render(template, viewModel);
}

/**
 * Convert HTML to PDF Buffer using Puppeteer
 */
async function generateInvoicePdfBuffer(viewModel) {
  const html = renderInvoiceHtml(viewModel);

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    // Helpful if your HTML has external assets (ideally none)
    await page.setCacheEnabled(false);

    await page.setContent(html, { waitUntil: "networkidle0" });

    const printedBy = viewModel.printedBy || "System";
    const printedOn = viewModel.printedOn || new Date().toLocaleString();
    const logo = viewModel.logoSrcDataUri || "";

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      displayHeader: false,

      headerTemplate: `
        <style>
          .h { width:100%;}
        </style>
        <div class="h">
          
        </div>
      `,

      footerTemplate: `
        <div style="
          width:100%;
          padding:0 10mm;
          font-size:9px;
          color:#111;
          display:flex;
          justify-content:space-between;
          align-items:center;
        ">
          <div>Printed by: ${escapeHtml(printedBy)} | Printed on: ${escapeHtml(
        printedOn
      )}</div>
          <div>Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>
        </div>
      `,

      // Must provide room for header/footer
      margin: {
        top: "14mm",
        bottom: "14mm",
        left: "10mm",
        right: "10mm",
      },
    });

    return pdfBuffer;
  } finally {
    await browser.close();
  }
}

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

module.exports = {
  generateInvoicePdfBuffer,
};

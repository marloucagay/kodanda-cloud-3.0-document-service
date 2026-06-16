const fs = require("fs");
const path = require("path");
const mustache = require("mustache");
const puppeteer = require("puppeteer");
const templatePath = path.join(process.cwd(), "templates", "stock-adjustment.mustache");
const template = fs.readFileSync(templatePath, "utf8");

/**
 * Render HTML using mustache template
 */
function renderStockAdjustmentHtml(viewModel) {
  return mustache.render(template, viewModel);
}

/**
 * Convert HTML to PDF Buffer using Puppeteer
 */
async function generateStockAdjustmentPdfBuffer(viewModel) {
  const html = renderStockAdjustmentHtml(viewModel);

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

    // Helpful if your HTML has external assets (ideally none)
    await page.setCacheEnabled(false);

    await page.setContent(html, { waitUntil: "networkidle0" });

    const printedBy = viewModel.printedBy || "System";
    const printedOn = viewModel.printedOn || new Date().toLocaleString();
    const approvedBy = viewModel.approvedBy || "";
    const logo = viewModel.logoSrcDataUri || "";

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      displayHeader: false,

      headerTemplate: `
          <style>
              .header-container {
                  width: 100%;
                  display: flex;
                  flex-direction: column;
                  align-items: flex-start;
                  padding: 0 10mm;
                  margin-top: 8px;
                  font-family: Arial, sans-serif;
              }
              .logo {
                  width: 200px;
                  margin-left: -22px;
                  margin-top: -20px;
              }
              .stockAdjustmentTitle {
                  width: 100%;
                  text-align: center;
                  font-size: 18px;
                  font-weight: 700;
                  border-top: 1px solid #e3e8ef;
                  border-bottom: 1px solid #e3e8ef;
                  padding: 6px 0;
                  margin-top: -10px;
              }
              .stockAdjustmentID { 
                width: 100%;
                text-align: right;
                font-size: 12px; 
                margin: 10px 0; 
                color: #c0392b;
                font-weight: 700; 
              }
          </style>
          <div class="header-container">
              ${logo ? `<img src="${logo}" class="logo" />` : ""}
              <div class="stockAdjustmentTitle">Stock Adjustment</div>
          </div>
        `,

      footerTemplate: `
        <div style="width:100%; padding:0 10mm; font-size:9px; color:#111; font-family: Arial, sans-serif;">
          <div>
            <div style="margin-top:20px; text-align:center; color: #1E3A8A;">
              <h6 style="margin:4px 0; font-size:10px; font-weight:400;">Lot 1 Ninoy Aquino Ave., Corner Old Kabihasnan St., San Dionisio, Parañaque City</h6>
              <h6 style="margin:4px 0; font-size:10px; font-weight:400;">Telephone: (02)8691-0615</h6>
            </div>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; margin-top:12px; color: #1E3A8A;">
            <div>Printed by: ${escapeHtml(printedBy)} | Printed on: ${escapeHtml(printedOn)} | Approved by: ${escapeHtml(approvedBy)}</div>
            <div>Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>
          </div>
        </div>
      `,

      // Must provide room for header/footer
      margin: {
        top: "47mm",
        bottom: "50mm",
        left: "8mm",
        right: "8mm",
      },
    });

    return pdfBuffer;
  } catch (err) {
    console.error("STOCK ADJUSTMENT PDF ERROR:", err?.stack || err);
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
  generateStockAdjustmentPdfBuffer,
};

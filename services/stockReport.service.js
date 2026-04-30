const fs = require("fs");
const path = require("path");
const mustache = require("mustache");
const puppeteer = require("puppeteer");
// const templatePath = path.join(process.cwd(), "templates", "stock-report.mustache");
// const template = fs.readFileSync(templatePath, "utf8");

function getTemplatePath(type) {
  if (type === 'Incoming') {
    return path.join(process.cwd(), "templates", "stock-report-incoming.mustache");
  } else if (type === 'Outgoing') {
    return path.join(process.cwd(), "templates", "stock-report-outgoing.mustache");
  }
}

/**
 * Render HTML using mustache template
 */
// function renderStockReportHtml(viewModel) {
//   return mustache.render(template, viewModel);
// }
function renderStockReportHtml(viewModel) {
  const templatePath = getTemplatePath(viewModel.warehouseMode);
  const template = fs.readFileSync(templatePath, "utf8");
  return mustache.render(template, viewModel);
}

/**
 * Convert HTML to PDF Buffer using Puppeteer
 */
async function generateStockReportPdfBuffer(viewModel) {
  const html = renderStockReportHtml(viewModel);

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
    const logo = viewModel.logoSrcDataUri || "";
    const stockName = viewModel.warehouseMode === 'Incoming' ? 'Incoming Stocks' : 'Outgoing Stocks';

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
            .stock-header-title {
                width: 100%;
                text-align: center;
                font-size: 18px;
                font-weight: 700;
                border-top: 1px solid #d0d0d0;
                border-bottom: 1px solid #d0d0d0;
                padding: 6px 0;
                margin-top: -10px;
            }
          </style>
          <div class="header-container">
              ${logo ? `<img src="${logo}" class="logo" />` : ""}
              <div class="stock-header-title">${stockName}</div>
          </div>
        `,

        footerTemplate: `
        <div style="width:100%; padding:0 10mm; color:#111; font-family: Arial, sans-serif;">
            ${getFooterHtml(viewModel)}
            <div style="margin-bottom:4px; font-size:9px; text-align: center; color: #1E3A8A">
            <div>Lot 1 Ninoy Aquino Ave., Corner Old Kabihasnan St., San Dionisio, Parañaque City</div>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; margin-top:8px; font-size:9px;">
            <div>Printed by: ${escapeHtml(printedBy)} | Printed on: ${escapeHtml(printedOn)}</div>
            <div>Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>
            </div>
        </div>
        `,

      // Must provide room for header/footer
      margin: {
        top: "47mm",
        bottom: "40mm",
        left: "8mm",
        right: "8mm",
      },
    });

    return pdfBuffer;
  } catch (err) {
    console.error("Stock Report PDF ERROR:", err?.stack || err);

    // send a short message back (don’t leak internals in prod if you don’t want to)
    return res.status(500).json({
      message: "Failed to generate stock report PDF",
      error: String(err?.message || err),
    });
  } finally {
    await browser.close();
  }
}

function getFooterHtml(viewModel) {
  if (viewModel.warehouseMode === 'Incoming') {
    return `
      <div style="display: flex; gap: 8px; margin-bottom: 10px;">
        <div style="flex: 1 1 50%; display: flex; align-items: center; white-space: nowrap;">
          <div style="width: 50%; font-size: 12px; margin-bottom: 0;">Encoded By:</div>
          <div style="width: 50%; font-size: 12px; padding-left: 6px;">${escapeHtml(viewModel.encodedBy || '')}</div>
        </div>
        <div style="flex: 1 1 50%; display: flex; align-items: center; white-space: nowrap;">
          <div style="width: 50%; font-size: 12px; margin-bottom: 0;">Encoded Date:</div>
          <div style="width: 50%; font-size: 12px; padding-left: 6px;">${escapeHtml(viewModel.encodedDate || '')}</div>
        </div>
      </div>
      <div style="display: flex; gap: 8px; margin-bottom: 30px;">
        <div style="flex: 1 1 50%; display: flex; align-items: center; white-space: nowrap;">
          <div style="width: 50%; font-size: 12px; margin-bottom: 0;">Verified By:</div>
          <div style="width: 50%; font-size: 12px; padding-left: 6px;">${escapeHtml(viewModel.verifiedBy || '')}</div>
        </div>
        <div style="flex: 1 1 50%; display: flex; align-items: center; white-space: nowrap;">
          <div style="width: 50%; font-size: 12px; margin-bottom: 0;">Verified Date:</div>
          <div style="width: 50%; font-size: 12px; padding-left: 6px;">${escapeHtml(viewModel.verifiedDate || '')}</div>
        </div>
      </div>
    `;
  } else if (viewModel.warehouseMode === 'Outgoing') {
    return `
      <div style="display: flex; gap: 8px; margin-bottom: 10px; font-family: Courier, Courier, monospace;">
        <div style="flex: 1 1 50%; display: flex; align-items: center; white-space: nowrap;">
          <div style="width: 50%; font-size: 12px; margin-bottom: 0;">Released By:</div>
          <div style="width: 50%; font-size: 12px; padding-left: 6px;">${escapeHtml(viewModel.releasedBy || '')}</div>
        </div>
        <div style="flex: 1 1 50%; display: flex; align-items: center; white-space: nowrap;">
          <div style="width: 50%; font-size: 12px; margin-bottom: 0;">Received By:</div>
          <div style="width: 50%; font-size: 12px; padding-left: 6px;">${escapeHtml(viewModel.receivedBy || '')}</div>
        </div>
      </div>
      <div style="width: 50%; display: flex; gap: 8px; margin-bottom: 30px;">
        <div style="flex: 1 1 50%; display: flex; align-items: center; white-space: nowrap;">
          <div style="width: 50%; font-size: 12px; margin-bottom: 0;">Date:</div>
          <div style="width: 50%; font-size: 12px; padding-left: 6px;">${escapeHtml(viewModel.date || '')}</div>
        </div>
      </div>
    `;
  }
  return '';
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
  generateStockReportPdfBuffer,
};

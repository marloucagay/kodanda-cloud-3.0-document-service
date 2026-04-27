const fs = require("fs");
const path = require("path");
const mustache = require("mustache");
const puppeteer = require("puppeteer");
const templatePath = path.join(process.cwd(), "templates", "picking-list.mustache");
const template = fs.readFileSync(templatePath, "utf8");

/**
 * Render HTML using mustache template
 */
function renderPickingListHtml(viewModel) {
  return mustache.render(template, viewModel);
}

/**
 * Convert HTML to PDF Buffer using Puppeteer
 */
async function generatePickingListPdfBuffer(viewModel) {
  const html = renderPickingListHtml(viewModel);

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
              .quotation-header-title {
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
              <div class="quotation-header-title">Picking List</div>
          </div>
        `,

        footerTemplate: `
        <div style="width:100%; padding:0 10mm; color:#111; font-family: Arial, sans-serif;">
            <div style="margin-bottom:4px; font-size:9px; text-align: center; color: #1E3A8A;">
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
          top: "46mm",
          bottom: "18mm",
          left: "8mm",
          right: "8mm",
      },
    });

    return pdfBuffer;
  } catch (err) {
    console.error("Picking List PDF ERROR:", err?.stack || err);

    // send a short message back (don’t leak internals in prod if you don’t want to)
    return res.status(500).json({
      message: "Failed to generate picking list PDF",
      error: String(err?.message || err),
    });
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
  generatePickingListPdfBuffer,
};
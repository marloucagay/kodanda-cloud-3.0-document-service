const fs = require("fs");
const path = require("path");
const mustache = require("mustache");
const puppeteer = require("puppeteer");
const templatePath = path.join(process.cwd(), "templates", "gatepass.mustache");
const template = fs.readFileSync(templatePath, "utf8");

/**
 * Render HTML using mustache template
 */
function renderGatepassHtml(viewModel) {
  return mustache.render(template, viewModel);
}

/**
 * Convert HTML to PDF Buffer using Puppeteer
 */
async function generateGatepassPdfBuffer(viewModel) {
  const html = renderGatepassHtml(viewModel);

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
    const gatepassID = viewModel.gatepassID || "";

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
                  padding: 6px 0;
                  margin-top: -10px;
              }
              .gatepassID { 
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
              <div class="quotation-header-title">MDLI GATEPASS</div>
              <div class="gatepassID" style="margin-top: -10px;">
                <div>${gatepassID}</div>
              </div>
          </div>
        `,

      footerTemplate: `
        <div style="width:100%; padding:0 10mm; font-size:9px; color:#111; font-family: Arial, sans-serif;">
          <div>
            <div style="display:grid; grid-template-columns:2fr 1fr; gap:4px 6px; margin-top:10px;">
              <div style="display:flex; flex-direction:column; justify-content:center; gap:4px;">
                <h3 style="margin:0; font-size:12px; font-weight:700;">Released by:</h3>
                <h4 style="margin:0; font-size:12px; font-weight:400;">(Warehouse Personnel)</h4>
              </div>
              <div style="display:flex; flex-direction:column; justify-content:center; gap:4px;">
                <div style="border-bottom:1px solid #111; width:300px; height:32px; margin-bottom:4px; margin-left:auto;"></div>
                <h5 style="margin:0; font-size:12px; font-weight:400; text-align:center;">Name and Signature</h5>
              </div>
            </div>
            <div style="display:grid; grid-template-columns:2fr 1fr; gap:4px 6px; margin-top:10px;">
              <div style="display:flex; flex-direction:column; justify-content:center; gap:4px;">
                <h3 style="margin:0; font-size:12px; font-weight:700;">Approved by:</h3>
              </div>
              <div style="display:flex; flex-direction:column; justify-content:center; gap:4px;">
                <div style="border-bottom:1px solid #111; width:300px; height:32px; margin-bottom:4px; margin-left:auto;"></div>
                <h5 style="margin:0; font-size:12px; font-weight:400; text-align:center;">Name and Signature</h5>
              </div>
            </div>
            <div style="display:grid; grid-template-columns:2fr 1fr; gap:4px 6px; margin-top:10px;">
              <div style="display:flex; flex-direction:column; justify-content:center; gap:4px;">
                <h3 style="margin:0; font-size:12px; font-weight:700;">Security in Charge:</h3>
              </div>
              <div style="display:flex; flex-direction:column; justify-content:center; gap:4px;">
                <div style="border-bottom:1px solid #111; width:300px; height:32px; margin-bottom:4px; margin-left:auto;"></div>
                <h5 style="margin:0; font-size:12px; font-weight:400; text-align:center;">Name and Signature</h5>
              </div>
            </div>
            <div style="margin-top:20px; text-align:center; color: #1E3A8A;">
              <h6 style="margin:4px 0; font-size:10px; font-weight:400;">Lot 1 Ninoy Aquino Ave., Corner Old Kabihasnan St., San Dionisio, Parañaque City</h6>
              <h6 style="margin:4px 0; font-size:10px; font-weight:400;">Telephone: (02)8691-0615</h6>
            </div>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; margin-top:12px; color: #1E3A8A;">
            <div>Printed by: ${escapeHtml(printedBy)} | Printed on: ${escapeHtml(printedOn)}</div>
            <div>Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>
          </div>
        </div>
      `,

      // Must provide room for header/footer
      margin: {
        top: "47mm",
        bottom: "90mm",
        left: "8mm",
        right: "8mm",
      },
    });

    return pdfBuffer;
  } catch (err) {
    console.error("GATEPASS PDF ERROR:", err?.stack || err);

    // send a short message back (don’t leak internals in prod if you don’t want to)
    return res.status(500).json({
      message: "Failed to generate gatepass PDF",
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
  generateGatepassPdfBuffer,
};

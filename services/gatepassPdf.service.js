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
  <div style="width:100%; padding:0 10mm; font-size:9px; color:#111;">
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
      <div style="margin-top:20px;">
        <h6 style="margin:4px 0; font-size:10px; font-weight:400;">Lot 1 Ninoy Aquino Ave., Corner Old Kabihasnan St., San Dionisio, Parañaque City</h6>
        <h6 style="margin:4px 0; font-size:10px; font-weight:400;">Telephone: (02)8691-0615</h6>
      </div>
    </div>
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; margin-top:32px;">
      <div>Printed by: ${escapeHtml(printedBy)} | Printed on: ${escapeHtml(printedOn)}</div>
      <div>Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>
    </div>
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

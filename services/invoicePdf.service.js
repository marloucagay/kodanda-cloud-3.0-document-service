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
    const invoiceNo = viewModel.invoiceNo || "";

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      displayHeader: false,

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
                SERVICE INVOICE
              </div>
              <div style="flex: 1; text-align: right; color: #c0392b; font-size: 12px; font-weight: 700;">
                ${invoiceNo}
              </div>
            </div>
          </div>
      `,

      footerTemplate: `
        <div style="
          width:100%;
          padding:0 10mm;
          font-size:9px;
          color:#111;
          font-family: Arial, sans-serif;
        ">
        <h3>
          <i>Please make all checks payable to MONARCH DIVERSIFIED LOGISTICS, INC</i>
        </h3>

        <div style="text-align:right margin-bottom:20px;">
          <div style="border-bottom: 1px solid #111;
            width: 350px;
            height: 32px;
            margin-bottom: 10px;
            margin-left: auto;"></div>
          <div style="font-size: 13px;
            color: #333;
            width: 350px;
            text-align: center;
            margin-left: auto;">
            Authorized Representative Signature Over Printed Name
          </div>
        </div>
        <div style="display:flex; flex-direction:row; justify-content:space-between; color: #1E3A8A; margin-top: 20px;">
          <div>Printed by: ${escapeHtml(printedBy)} | Printed on: ${escapeHtml(
            printedOn,
          )}</div>
          <div>Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>
          </div>
        </div>
      `,

      // Must provide room for header/footer
      margin: {
        top: "45mm",
        bottom: "35mm",
        left: "10mm",
        right: "10mm",
      },
    });

    return pdfBuffer;
  } catch (err) {
    console.error("INVOICE PDF ERROR:", err?.stack || err);

    // send a short message back (don’t leak internals in prod if you don’t want to)
    return res.status(500).json({
      message: "Failed to generate invoice PDF",
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
  generateInvoicePdfBuffer,
};

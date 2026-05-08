const puppeteer = require("puppeteer");
const fs = require("fs/promises");
const mustache = require("mustache");
const path = require("path");
const { PDFDocument } = require("pdf-lib");

const TEMPLATE_PATH = path.join(process.cwd(), "templates/waybill.mustache");
const MULTI_TEMPLATE_PATH = path.join(
  process.cwd(),
  "templates/waybill-multi.mustache",
);
async function generateWaybillPdf(data) {
  const template = await fs.readFile(TEMPLATE_PATH, "utf8");
  const html = mustache.render(template, data);

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
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdf = await page.pdf({
    printBackground: true,
    preferCSSPageSize: true,
    width: `${data.pageWidthCm}cm`,
    height: `${data.pageHeightCm}cm`,
    scale: 1.5,
  });
  await browser.close();
  return pdf;
}

async function generateMultiWaybillPdf({
  pageWidthCm,
  pageHeightCm,
  waybills,
}) {
  const template = await fs.readFile(MULTI_TEMPLATE_PATH, "utf8");

  const html = mustache.render(template, {
    pageWidthCm,
    pageHeightCm,
    waybills,
  });

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

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdf = await page.pdf({
    printBackground: true,
    preferCSSPageSize: true,
    width: `${pageWidthCm}cm`,
    height: `${pageHeightCm}cm`,
    scale: 1.5,
  });

  await browser.close();
  return pdf;
}

async function generateMultiWaybillPdf({
  pageWidthCm,
  pageHeightCm,
  waybills,
}) {
  const template = await fs.readFile(TEMPLATE_PATH, "utf8");

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

  const pdfBuffers = [];

  // Generate a PDF for each waybill
  for (const waybill of waybills) {
    const html = mustache.render(template, {
      pageWidthCm,
      pageHeightCm,
      ...waybill,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      printBackground: true,
      preferCSSPageSize: true,
      width: `${pageWidthCm}cm`,
      height: `${pageHeightCm}cm`,
      scale: 1.5,
    });

    pdfBuffers.push(pdf);
    await page.close();
  }

  await browser.close();

  // Merge all PDFs
  const mergedPdf = await PDFDocument.create();

  for (const pdfBuffer of pdfBuffers) {
    const pdf = await PDFDocument.load(pdfBuffer);
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    pages.forEach((page) => mergedPdf.addPage(page));
  }

  return await mergedPdf.save();
}

module.exports = {
  generateWaybillPdf,
  generateMultiWaybillPdf,
};

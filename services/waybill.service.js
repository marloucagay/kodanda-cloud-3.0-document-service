const puppeteer = require("puppeteer");
const fs = require("fs/promises");
const mustache = require("mustache");
const path = require("path");

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
  });

  await browser.close();
  return pdf;
}

module.exports = {
  generateWaybillPdf,
  generateMultiWaybillPdf,
};

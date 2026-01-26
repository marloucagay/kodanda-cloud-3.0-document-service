const {
  generateWaybillPdf,
  generateMultiWaybillPdf,
} = require("../services/waybill.service.js");

async function createWaybillPdf(req, res) {
  try {
    const { pageWidthCm, pageHeightCm, fields } = req.body;

    if (!pageWidthCm || !pageHeightCm) {
      return res.status(400).json({
        error: "pageWidthCm and pageHeightCm are required",
      });
    }

    const pdf = await generateWaybillPdf({
      pageWidthCm,
      pageHeightCm,
      ...fields,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="waybill.pdf"');

    res.send(pdf);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
}

async function createMultiWaybillPdf(req, res) {
  try {
    const { pageWidthCm, pageHeightCm, waybills } = req.body;

    if (!Array.isArray(waybills) || waybills.length === 0) {
      return res.status(400).json({
        error: "waybills array is required",
      });
    }

    const pdf = await generateMultiWaybillPdf({
      pageWidthCm,
      pageHeightCm,
      waybills,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="waybills.pdf"');

    res.send(pdf);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
}
module.exports = {
  createWaybillPdf,
  createMultiWaybillPdf,
};

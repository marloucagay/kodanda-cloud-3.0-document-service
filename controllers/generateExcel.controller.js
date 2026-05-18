const {
  generateStockMovementBuffer,
  generateBillingSummaryBuffer,
  generateBillingServiceBuffer,
  generateStorageReportBuffer,
  generateStockItemsBuffer
} = require("../services/generateExcel.service.js");

const generateStockMovementExcel = async (req, res) => {
  try {
    const { client, logoSrc, stocks } = req.body;
    
    const viewModel = {
      clientName: client || "",
      logo: logoSrc || "",
      stocks: Array.isArray(stocks) ? stocks : [],
    };

    const buffer = await generateStockMovementBuffer(viewModel);

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    return res.status(200).send(buffer);
  } catch (err) {
    console.error("generateStockMovementExcel error:", err?.stack || err);
    return res.status(500).json({ message: "Failed to generate stock movement report" });
  }
};

const generateBillingSummaryExcel = async (req, res) => {
  try {
    const { client, logoSrc, stocks } = req.body;

    const viewModel = {
      clientName: client || "",
      logo: logoSrc || "",
      stocks: Array.isArray(stocks) ? stocks : [],
    };

    const buffer = await generateBillingSummaryBuffer(viewModel);

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    return res.status(200).send(buffer);
  } catch (err) {
    console.error("generateBillingSummaryExcel error:", err?.stack || err);
    return res.status(500).json({ message: "Failed to generate billing summary report" });
  }
};

const generateBillingServiceExcel = async (req, res) => {
  try {
    const { client, logoSrc, billings } = req.body;

    const viewModel = {
      clientName: client || "",
      logo: logoSrc || "",
      billings: Array.isArray(billings) ? billings : [],
    };

    const buffer = await generateBillingServiceBuffer(viewModel);

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    return res.status(200).send(buffer);
  } catch (err) {
    console.error("generateBillingServiceExcel error:", err?.stack || err);
    return res.status(500).json({ message: "Failed to generate billing service report" });
  }
};

const generateStorageReportExcel = async (req, res) => {
  try {
    const { client, logoSrc, stocks } = req.body;

    const viewModel = {
      clientName: client || "",
      logo: logoSrc || "",
      stocks: Array.isArray(stocks) ? stocks : [],
    };

    const buffer = await generateStorageReportBuffer(viewModel);

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    return res.status(200).send(buffer);
  } catch (err) {
    console.error("generateStorageReportExcel error:", err?.stack || err);
    return res.status(500).json({ message: "Failed to generate storage report" });
  }
};

const generateStockItemsExcel = async (req, res) => {
  try {
    const { stocks } = req.body;

    const viewModel = {
      stocks: Array.isArray(stocks) ? stocks : [],
    };

    const buffer = await generateStockItemsBuffer(viewModel);

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    return res.status(200).send(buffer);
  } catch (err) {
    console.error("generateStockItemsExcel error:", err?.stack || err);
    return res.status(500).json({ message: "Failed to generate stock items report" });
  }
};

module.exports = { generateStockMovementExcel, generateBillingSummaryExcel, generateBillingServiceExcel, generateStorageReportExcel, generateStockItemsExcel };
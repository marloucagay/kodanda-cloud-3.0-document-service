const {
  generateConsolidatedBillingBuffer
} = require("../services/generateConsolidatedBilling.services.js");

const generateConsolidatedBilling = async (req, res) => {
  try {
    const { billings, clientName, clientCurrency, logoSrc } = req.body;

    const viewModel = {
      clientName: clientName || "",
      clientCurrency: clientCurrency || "",
      logoSrc: logoSrc || "",
      billings: Array.isArray(billings) ? billings : [],
    };

    const buffer = await generateConsolidatedBillingBuffer(viewModel);

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    return res.status(200).send(buffer);
  } catch (err) {
    console.error("generateConsolidatedBilling error:", err?.stack || err);
    return res.status(500).json({ message: "Failed to generate consolidated billing" });
  }
};

module.exports = { generateConsolidatedBilling };
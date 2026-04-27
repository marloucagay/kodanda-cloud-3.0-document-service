const { safeText } = require("../utils/format.js");
const {
  generateReceivingReportExcelBuffer,
  generateOutgoingStockExcelBuffer,
  generateInventorySummaryExcelBuffer,
  generateBillingReportExcelBuffer,
  generateInvoiceDebitExcelBuffer
} = require("../services/generateStockReport.service.js");

const configs = {
  Incoming: {
    service: generateReceivingReportExcelBuffer,
    buildViewModel: (payload) => {
      const dash = (v) => safeText(v, "");
      const pickingLists = Array.isArray(payload.pickingLists) ? payload.pickingLists : [];
      return {
        logo: dash(payload.logoSrc),
        clientName: dash(payload.client),
        date: dash(payload.date),
        fileNo: dash(payload.transactionFile),
        supplier: dash(payload.supplier),
        billingReference: dash(payload.billingReference),
        deliveryReferenceNo: dash(payload.contractNo),
        receivingReferenceNo: dash(payload._id),
        remarks: dash(payload.remarks),
        encodedBy: dash(payload.encodedBy),
        encodedDate: dash(payload.encodedDate),
        verifiedBy: dash(payload.verifiedBy),
        verifiedDate: dash(payload.verifiedDate),
        incomingStocksNo: dash(payload.incomingStocksNo),
        deliveryPlateNumber: dash(payload.deliveryPlateNumber),
        items: pickingLists.map(item => ({
          itemCode: dash(item.itemCode || ""),
          itemName: dash(item.itemName || item.itemDescription || ""),
          commodity: dash(item.commodity || item.category || ""),
          qty: dash(item.qty || item.quantity || ""),
          uQ: dash(item.uQ || item.uom || ""),
          batchNo: dash(item.batchNo || ""),
          expiryDate: dash(item.expiryDate || item.expirationDate || ""),
          serialNo: dash(item.serialNo || ""),
          unitPrice: dash(item.unitPrice || item.price || ""),
          currency: dash(item.currency || ""),
          storageTemperature: dash(item.storageTemperature || ""),
          condition: dash(item.condition || ""),
          location: dash(item.location || "")
        }))
      };
    }
  },
  Outgoing: {
    service: generateOutgoingStockExcelBuffer,
    buildViewModel: (payload) => {
      const dash = (v) => safeText(v, "");
      const pickingLists = Array.isArray(payload.pickingLists) ? payload.pickingLists : [];
      return {
        logo: dash(payload.logoSrc),
        clientName: dash(payload.customer),
        customer: dash(payload.customerReference),
        address: dash(payload.deliverySiteAddress),
        fileNo: dash(payload.transactionFile),
        billingReference: dash(payload.billingReference),
        outgoingReferenceNo: dash(payload._id),
        remarks: dash(payload.remarks),
        releasedBy: dash(payload.releasedBy),
        releasedDate: dash(payload.releasedDate),
        receivedBy: dash(payload.receivedBy),
        receivedDate: dash(payload.receivedDate),
        outgoingStocksNo: dash(payload.outgoingStocksNo),
        items: pickingLists.map(item => ({
          productCode: dash(item.itemCode || ""),
          description: dash(item.itemName || item.itemDescription || ""),
          batchNo: dash(item.batchNo || ""),
          expiryDate: dash(item.expiryDate || item.expirationDate || ""),
          qty: dash(item.qty || item.quantity || ""),
          uQ: dash(item.uQ || "")
        }))
      };
    }
  }
};

const generateStockReportExcel = async (req, res) => {
  try {
    const { warehouseMode, ...payload } = req.body;
    if (!warehouseMode || !configs[warehouseMode]) {
      return res.status(400).json({ message: "Invalid or missing Warehouse Mode" });
    }
    const viewModel = configs[warehouseMode].buildViewModel(payload);
    const buffer = await configs[warehouseMode].service(viewModel);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    return res.status(200).send(buffer);
  } catch (err) {
    console.error("generateStockReportExcel error:", err?.stack || err);
    return res.status(500).json({ message: "Failed to generate stock report Excel" });
  }
};

const generateInventorySummaryExcel = async (req, res) => {
  try {
    const { items, onHandItems, clientName, logoSrc, itemCode, itemName, quantity } = req.body;

    const viewModel = {
      logo: logoSrc || "",
      clientName: clientName || "",
      itemCode: itemCode || "",
      itemName: itemName || "",
      quantity: quantity || "",
      items: Array.isArray(items) ? items : [],
      onHandItems: Array.isArray(onHandItems) ? onHandItems : []
    };

    const buffer = await generateInventorySummaryExcelBuffer(viewModel);

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    return res.status(200).send(buffer);
  } catch (err) {
    console.error("generateInventorySummaryExcel error:", err?.stack || err);
    return res.status(500).json({ message: "Failed to generate inventory summary Excel" });
  }
};

const generateBillingReportExcel = async (req, res) => {
  try {
    const { billings, clientName, logoSrc, clientAddress, clientTIN } = req.body;

    const viewModel = {
      logo: logoSrc || "",
      clientName: clientName || "",
      clientAddress: clientAddress || "",
      clientTIN: clientTIN || "",
      billings: Array.isArray(billings) ? billings : [],
    };

    const buffer = await generateBillingReportExcelBuffer(viewModel);

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    return res.status(200).send(buffer);
  } catch (err) {
    console.error("generateBillingReportExcel error:", err?.stack || err);
    return res.status(500).json({ message: "Failed to generate billing report Excel" });
  }
};

const generateInvoiceDebitExcel = async (req, res) => {
  try {
    const { billings, clientName } = req.body;

    const viewModel = {
      clientName: clientName || "",
      billings: Array.isArray(billings) ? billings : [],
    };

    const buffer = await generateInvoiceDebitExcelBuffer(viewModel);

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    return res.status(200).send(buffer);
  } catch (err) {
    console.error("generateInvoiceDebitExcel error:", err?.stack || err);
    return res.status(500).json({ message: "Failed to generate invoice debit Excel" });
  }
};

module.exports = { generateStockReportExcel, generateInventorySummaryExcel, generateBillingReportExcel, generateInvoiceDebitExcel };
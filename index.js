const express = require("express");
const PDFDocument = require("pdfkit");
const cors = require("cors");
const https = require("https");
const bodyParser = require("body-parser");
const invoiceRoutes = require("./routes/invoice.routes.js");
const pickingListRoutes = require("./routes/pickingList.routes.js");
const deliveryReceiptRoutes = require("./routes/deliveryReceipt.routes.js");
const bulkPrint = require("./routes/bulkPrint.routes.js");
const waybillRoutes = require("./routes/waybill.routes.js");
const gatepassRoutes = require("./routes/gatepass.routes.js");
const generateStockReportRoutes = require("./routes/generateStockReport.routes.js");
const drsfRoutes = require("./routes/drsf.routes.js");
const generateConsolidatedBillingRoutes = require("./routes/generateConsolidatedBilling.routes.js");
const quotationRoutes = require("./routes/quotation.routes.js");
const stockReportRoutes = require("./routes/stockReport.routes.js");
const clientMasterlistRoutes = require("./routes/clientMasterlist.routes.js");
const tripTicketRoutes = require("./routes/tripTicket.routes.js");
const generateExcelRoutes = require("./routes/generateExcel.routes.js");

const app = express();
app.use(express.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use("/api/waybills", waybillRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/picking-list", pickingListRoutes);
app.use("/api/delivery-receipts", deliveryReceiptRoutes);
app.use("/api/bulk-print", bulkPrint);
app.use("/api/gatepass", gatepassRoutes);
app.use("/api/drsf", drsfRoutes);
app.use("/api/quotation", quotationRoutes);
app.use("/api/generate-stock-report", generateStockReportRoutes);
app.use("/api/generate-consolidated-billing", generateConsolidatedBillingRoutes);
app.use("/api/stock-report", stockReportRoutes);
app.use("/api/client-masterlist", clientMasterlistRoutes);
app.use("/api/trip-ticket", tripTicketRoutes);

app.use("/api/generate-stock-movement", generateExcelRoutes);
app.use("/api/generate-billing-summary", generateExcelRoutes);
app.use("/api/generate-billing-service", generateExcelRoutes);
app.use("/api/generate-storage-report", generateExcelRoutes);
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Document Service listening on port ${PORT}`);
});

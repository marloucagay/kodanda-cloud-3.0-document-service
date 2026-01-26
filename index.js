const express = require("express");
const PDFDocument = require("pdfkit");
const cors = require("cors");
const https = require("https");
const bodyParser = require("body-parser");
const invoiceRoutes = require("./routes/invoice.routes.js");
const deliveryReceiptRoutes = require("./routes/deliveryReceipt.routes.js");
const bulkPrint = require("./routes/bulkPrint.routes.js");
const waybillRoutes = require("./routes/waybill.routes.js");

const app = express();
app.use(express.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use("/api/waybills", waybillRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/delivery-receipts", deliveryReceiptRoutes);
app.use("/api/bulk-print", bulkPrint);
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Document Service listening on port ${PORT}`);
});

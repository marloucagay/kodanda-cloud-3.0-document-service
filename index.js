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
const fs = require("fs");
const helmet = require("helmet");
const useragent = require("express-useragent");


const app = express();

app.use(helmet());
app.use(cors());
app.use(useragent.express());

// Turn this to false to run locally
const backupserver = true;


app.use(express.json({ limit: "100mb" }));
app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: "100mb",
  }),
);

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Cache-Control", "no-cache, no-store, must-revalidate");
  res.header("Pragma", "no-cache");
  res.header("Expires", 0);
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE",
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept",
  );
  next();
});

app.use("/api/waybills", waybillRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/picking-list", pickingListRoutes);
app.use("/api/delivery-receipts", deliveryReceiptRoutes);
app.use("/api/bulk-print", bulkPrint);
app.use("/api/gatepass", gatepassRoutes);
app.use("/api/drsf", drsfRoutes);
app.use("/api/quotation", quotationRoutes);
app.use("/api/generate-stock-report", generateStockReportRoutes);
app.use(
  "/api/generate-consolidated-billing",
  generateConsolidatedBillingRoutes,
);
app.use("/api/stock-report", stockReportRoutes);
app.use("/api/client-masterlist", clientMasterlistRoutes);
app.use("/api/trip-ticket", tripTicketRoutes);

app.use("/api/generate", generateExcelRoutes);
app.use("/api/generate", generateExcelRoutes);
app.use("/api/generate", generateExcelRoutes);
app.use("/api/generate", generateExcelRoutes);
app.use("/api/generate", generateExcelRoutes);

const PORT = process.env.PORT || 8093;




var server;
if (backupserver) {
  console.log("Running Server");
  server = https
    .createServer(
      {
        key: fs.readFileSync("/var/www/ssl/api2.kodanda.cloud.2026.key"),
        cert: fs.readFileSync("/var/www/ssl/api2.kodanda.cloud.2026.crt"),
        ca: fs.readFileSync("/var/www/ssl/api2.kodanda.cloud.2026.ca-bundle"),
        //passphrase: 'asdf'
      },
      app,
    )
    .listen(PORT);
} else {
  console.log("Running Locally");
  server = app.listen(PORT, function () {
    console.log("Express server listening on port " + PORT);
  });
}
server.timeout = 600000000;

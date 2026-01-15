const express = require("express");
const PDFDocument = require("pdfkit");
const cors = require("cors");
const https = require("https");
const bodyParser = require("body-parser");
const invoiceRoutes = require("./routes/invoice.routes.js");
const app = express();
app.use(express.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
// ---- Helpers ----
const CM_TO_PT = 28.346456692913385;
const cmToPt = (cm) => cm * CM_TO_PT;
/**
 * Draw text where x_cm, y_cm are measured from TOP-LEFT corner.
 */
function drawTextTopLeft(
  doc,
  pageWidthPt,
  pageHeightPt,
  x_cm,
  y_cm,
  text,
  opts = {}
) {
  if (text === undefined || text === null || text === "") return;

  const x = cmToPt(x_cm);
  const y = cmToPt(y_cm);

  const { fontSize = 9, widthCm = null, align = "left" } = opts;

  doc.font("Helvetica").fontSize(fontSize);

  if (widthCm) {
    doc.text(String(text), x, y, { width: cmToPt(widthCm), align });
  } else {
    doc.text(String(text), x, y);
  }
}

function drawMarkerTopLeft(doc, pageHeightPt, x_cm, y_cm, label, opts = {}) {
  const x = cmToPt(x_cm);
  const y = cmToPt(y_cm);

  const {
    sizePt = 6,
    fontSize = 6,
    labelDxPt = 8,
    labelDyPt = -6, // a bit above the point
  } = opts;

  doc.save();

  // crosshair
  doc
    .moveTo(x - sizePt, y)
    .lineTo(x + sizePt, y)
    .stroke();
  doc
    .moveTo(x, y - sizePt)
    .lineTo(x, y + sizePt)
    .stroke();

  // dot
  doc.circle(x, y, 1.2).fill();

  // label
  doc.font("Helvetica").fontSize(fontSize);
  doc.text(label, x + labelDxPt, y + labelDyPt);

  doc.restore();
}

const WAYBILL_LAYOUT = {
  accountNumber: { x: 1.2, y: 3.2, opts: { fontSize: 9 } },
  billingReference: { x: 6.0, y: 3.2, opts: { fontSize: 9 } },
  dRNumber: { x: 23.0, y: 2.8, opts: { fontSize: 11 } },

  waybillPickupSiteContactPerson: { x: 1.2, y: 6.2, opts: { fontSize: 9 } },
  waybillPickupSiteContactNumber: { x: 11.2, y: 6.2, opts: { fontSize: 9 } },
  waybillPickupSite: { x: 1.2, y: 7.6, opts: { fontSize: 9, widthCm: 12 } },
  waybillPickupSiteAddress: {
    x: 1.2,
    y: 9.0,
    opts: { fontSize: 9, widthCm: 12 },
  },

  // These three currently share same coordinates in your snippet
  waybillPickupSiteCity: {
    x: 1.2,
    y: 10.4,
    opts: { fontSize: 9, widthCm: 12 },
  },
  waybillPickupSiteCountry: {
    x: 6.7,
    y: 10.4,
    opts: { fontSize: 9, widthCm: 12 },
  },
  waybillPickupsitePostCode: {
    x: 12.2,
    y: 10.4,
    opts: { fontSize: 9, widthCm: 12 },
  },

  waybillDeliverySiteContactPerson: { x: 15.2, y: 6.2, opts: { fontSize: 9 } },
  waybillDeliverySiteContactNumber: { x: 24.0, y: 6.2, opts: { fontSize: 9 } },
  waybillDeliverySite: { x: 15.2, y: 7.6, opts: { fontSize: 9, widthCm: 12 } },
  waybillDeliverySiteAddress: {
    x: 15.2,
    y: 9.0,
    opts: { fontSize: 9, widthCm: 12 },
  },
  waybillDeliverySiteCity: {
    x: 15.2,
    y: 10.4,
    opts: { fontSize: 9, widthCm: 12 },
  },

  // These two are set to x:1.2 in your snippet (likely should be 15.2 area)
  waybillDeliverySiteCountry: {
    x: 20.7,
    y: 10.4,
    opts: { fontSize: 9, widthCm: 12 },
  },
  waybillDeliverySitePostalCode: {
    x: 26.2,
    y: 10.4,
    opts: { fontSize: 9, widthCm: 12 },
  },

  // These share y:13.4 in your snippet
  waybillTypeOfCargo: { x: 1.2, y: 13.4, opts: { fontSize: 9, widthCm: 26 } },
  waybillStorageTemperature: {
    x: 15.2,
    y: 13.4,
    opts: { fontSize: 9, widthCm: 26 },
  },
  waybillCountryOrigin: { x: 1.2, y: 15.2, opts: { fontSize: 9, widthCm: 26 } },

  noOfPcs: { x: 1.2, y: 14.2, opts: { fontSize: 9 } },
  weight: { x: 5.0, y: 14.2, opts: { fontSize: 9 } },
  dimension: { x: 9.0, y: 14.2, opts: { fontSize: 9 } },
  waybillDeclaredValue: {
    x: 15.2,
    y: 15.2,
    opts: { fontSize: 9, widthCm: 26 },
  },
};
function createDoc({ pageWidthCm, pageHeightCm }) {
  const pageWidthPt = cmToPt(pageWidthCm);
  const pageHeightPt = cmToPt(pageHeightCm);

  const doc = new PDFDocument({
    size: [pageWidthPt, pageHeightPt],
    margin: 0,
  });

  return { doc, pageWidthPt, pageHeightPt };
}

function renderOverlayValues(doc, pageWidthPt, pageHeightPt, fields) {
  for (const [key, layout] of Object.entries(WAYBILL_LAYOUT)) {
    drawTextTopLeft(
      doc,
      pageWidthPt,
      pageHeightPt,
      layout.x,
      layout.y,
      fields?.[key],
      layout.opts
    );
  }
}

app.post("/api/waybill/pdf", (req, res) => {
  try {
    const { pageWidthCm, pageHeightCm, fields } = req.body || {};
    if (!pageWidthCm || !pageHeightCm) {
      return res
        .status(400)
        .json({ error: "pageWidthCm and pageHeightCm are required (cm)." });
    }

    const { doc, pageWidthPt, pageHeightPt } = createDoc({
      pageWidthCm,
      pageHeightCm,
    });
    renderOverlayValues(doc, pageWidthPt, pageHeightPt, fields);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="waybill-overlay.pdf"'
    );
    doc.pipe(res);
    doc.end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to generate overlay PDF." });
  }
});

app.use("/api/invoices", invoiceRoutes);
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Document Service listening on port ${PORT}`);
});

const express = require("express");
const PDFDocument = require("pdfkit");
const cors = require("cors");
const app = express();
app.use(express.json({ limit: "2mb" }));
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

function renderDebugMarkers(doc, pageHeightPt) {
  // Put title at top-left for sanity check
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .text(
      "WAYBILL DEBUG MARKERS (top-left cm coords)",
      cmToPt(0.8),
      pageHeightPt - cmToPt(0.8)
    );

  // Draw marker for each field
  for (const [key, layout] of Object.entries(WAYBILL_LAYOUT)) {
    drawMarkerTopLeft(doc, pageHeightPt, layout.x, layout.y, key);
  }

  // Optional: add a simple border so you can see page edges
  doc.rect(0.5, 0.5, doc.page.width - 1, doc.page.height - 1).stroke();
}

// ---- Core generator ----
function generateWaybillOverlayPDF({ pageWidthCm, pageHeightCm, fields }) {
  const pageWpt = cmToPt(pageWidthCm);
  const pageHpt = cmToPt(pageHeightCm);

  const doc = new PDFDocument({
    size: [pageWpt, pageHpt],
    margin: 0,
  });

  // Optional: keep it transparent-ish (PDF text only)
  // No background image here because you said "values only"
  // (If you later want an optional template image behind, we can add it.)

  // Render fields based on layout
  for (const [key, layout] of Object.entries(WAYBILL_LAYOUT)) {
    const value = fields?.[key];
    drawTextTopLeft(
      doc,
      pageWpt,
      pageHpt,
      layout.x,
      layout.y,
      value,
      layout.opts
    );
  }

  doc.end();
  return doc;
}

// ---- REST Endpoint ----
/**
 * POST /api/waybill/pdf
 * Body:
 * {
 *   "pageWidthCm": 28.0,
 *   "pageHeightCm": 20.0,
 *   "fields": {
 *     "accountNo": "B-2cm",
 *     "billingRef": "2025-58001",
 *     "waybillNo": "0015282",
 *     ...
 *   }
 * }
 */
const backupServerTrigger = true;

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

/**
 * GET /api/waybill/debug?widthCm=28&heightCm=20
 * Returns PDF with CROSSHAIRS + FIELD NAMES at each (x_cm, y_cm).
 */
app.get("/api/waybill/debug", (req, res) => {
  try {
    const widthCm = Number(req.query.widthCm);
    const heightCm = Number(req.query.heightCm);

    if (!widthCm || !heightCm) {
      return res
        .status(400)
        .json({ error: "Provide widthCm and heightCm query params." });
    }

    const { doc, pageHeightPt } = createDoc({
      pageWidthCm: widthCm,
      pageHeightCm: heightCm,
    });
    renderDebugMarkers(doc, pageHeightPt);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'inline; filename="waybill-debug.pdf"'
    );
    doc.pipe(res);
    doc.end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to generate debug PDF." });
  }
});

if (backupServerTrigger) {
  console.log("Running Server");
  https
    .createServer(
      {
        key: fs.readFileSync("/var/www/ssl/api2.kodanda.cloud.2026.key"),
        cert: fs.readFileSync("/var/www/ssl/api2.kodanda.cloud.2026.crt"),
        ca: fs.readFileSync("/var/www/ssl/api2.kodanda.cloud.2026.ca-bundle"),
        //passphrase: 'asdf'
      },
      app
    )
    .listen(8080);
} else {
  console.log("Running Locally");
  app.listen(8080);
}

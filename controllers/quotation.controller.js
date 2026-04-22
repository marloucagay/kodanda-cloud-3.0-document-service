const {
  generateQuotationPdfBuffer,
} = require("../services/quotation.service.js");
const { money, safeText } = require("../utils/format.js");
const { ensureDataUriLogo } = require("../utils/logoUri.js");
const { SERVICE_SECTION_CONFIG } = require("../utils/quotationSectionConfig.js");

/**
 * POST /api/quotation/:quotationID/pdf
 * Body: Quotation object
 */

const alwaysZeroKeys = [
    "first5Kilos",
    "excess5Kilos",
    "first10Kilos",
    "excess10Kilos"
];
const sectionsWithTotals = ["charges", "optionalCharges", "warehouseHandlingCharges"];
// const totalKeys = ["total", "estimatedCost", "estimatedProfit"];
const totalKeys = ["total"];

const preprocessServices = (servicesObj) => {
  if (!servicesObj || typeof servicesObj !== "object") return [];
  return Object.entries(servicesObj).map(([serviceName, serviceData]) => {
    const config = SERVICE_SECTION_CONFIG[serviceName] || {};
    const sections = Object.entries(serviceData)
      .filter(([key, value]) => Array.isArray(value) && value.length > 0)
      .map(([sectionName, rows]) => {
        const sectionConfig = config[sectionName] || {};
        const displayName = sectionConfig.displayName;
        const columns = sectionConfig.columns || (
          rows.length > 0
            ? Object.keys(rows[0]).map(key => ({ key, label: formatSectionName(key) }))
            : []
        );
        // Format and process rows
        const processedRows = rows.map(row =>
            columns.map(col => {
                // if (col.key === "isSupplies") {
                //     return `<input type="checkbox" ${row[col.key] ? "checked" : ""} disabled />`;
                // }
                if (alwaysZeroKeys.includes(col.key)) {
                return money(row[col.key] || 0);
                }
                if (
                ["ratePHP", "total", "rate", "amount", "estimatedCost", "estimatedProfit"].includes(col.key) &&
                row[col.key] !== undefined &&
                row[col.key] !== ""
                ) {
                return money(row[col.key]);
                }
                return row[col.key] !== undefined ? row[col.key] : "";
            })
        );
        // Calculate totals for charges section, aligned with columns
        let totals = null;
        const firstTotalIdx = columns.findIndex(col => totalKeys.includes(col.key));   

        if (sectionsWithTotals.includes(sectionName)) {
            const sum = key =>
                rows.reduce((acc, row) => acc + (parseFloat(row[key]) || 0), 0);
            totals = columns.map((col, idx) => {
                if (idx === firstTotalIdx - 1) return "Total:";
                if (col.key === "total") return money(sum("total"));
                // if (col.key === "estimatedCost") return money(sum("estimatedCost"));
                // if (col.key === "estimatedProfit") return money(sum("estimatedProfit"));
                return "";
            });
        }
        return {
          sectionName: displayName,
          columns,
          rows: processedRows,
          totals,
          isCharges: sectionsWithTotals.includes(sectionName)
        };
      });
    return { serviceName, sections };
  });
}

async function generateQuotationPdf(req, res) {
  try {
    const quotation = req.body;

    if (!quotation || typeof quotation !== "object") {
      return res.status(400).json({ message: "Invalid Quotation payload" });
    }

    quotation.logoSrcDataUri = await ensureDataUriLogo(quotation.logoSrc);

    if (
      quotation.transportCharges &&
      quotation.services &&
      quotation.services.Distribution
    ) {
      quotation.services.Distribution.transportCharges = quotation.transportCharges;
    }

    if (quotation.services) {
        quotation.servicesArray = preprocessServices(quotation.services);
    }

    if (quotation.incedentalCharges) {
        quotation.incedentalCharges = quotation.incedentalCharges.map(item => ({
            ...item,
            rate: money(item.rate)
        }));
    }

    if (quotation.signature) {
        let signatureUrl = "";
        if (typeof quotation.signature === "string") {
            signatureUrl = quotation.signature;
        } else if (typeof quotation.signature === "object" && quotation.signature.file_name) {
            signatureUrl = `https://storage.googleapis.com/documents-service-assets-prod/${quotation.signature.file_name}`;
        }
        quotation.signatureDataUri = signatureUrl ? await ensureDataUriLogo(signatureUrl) : "";
    }

    const pdfBuffer = await generateQuotationPdfBuffer(quotation);

    res.setHeader("Content-Type", "application/pdf");
    res.status(200).send(pdfBuffer);
  } catch (err) {
    console.error("generateQuotationPdf error:", err);
    res.status(500).json({ message: "Failed to generate Quotation PDF" });
  }
}

module.exports = {
  generateQuotationPdf,
};

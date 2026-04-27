const axios = require("axios");
const ExcelJS = require("exceljs");

async function generateConsolidatedBillingBuffer(viewModel) {
  const workbook = new ExcelJS.Workbook();
  const billings = Array.isArray(viewModel.billings) ? viewModel.billings : [];

  const mediumGrayBorder = {
    top: { style: "thin", color: { argb: "FF888888" } },
    left: { style: "thin", color: { argb: "FF888888" } },
    bottom: { style: "thin", color: { argb: "FF888888" } },
    right: { style: "thin", color: { argb: "FF888888" } },
  };
  const allCols = ["A", "B", "C", "D", "E", "F", "G", "H"];

  if (billings.length === 0) {
    const ws = workbook.addWorksheet("No Billings");
    const row = ws.addRow(["No billing records found."]);
    allCols.forEach((col) => {
      ws.getCell(`${col}${row.number}`).border = mediumGrayBorder;
    });
    return workbook.xlsx.writeBuffer();
  }

  for (const billing of billings) {
    const sheetName = `${billing.billing} (${billing.vatType})`.replace(
      /\s+/g,
      "-",
    );
    const ws = workbook.addWorksheet(sheetName.substring(0, 31));

    const isInvoice = billing.billing === "Invoice";

    ws.columns = [
      { width: 14 }, // A
      { width: 14 }, // B
      { width: 18 }, // C
      { width: 18 }, // D
      { width: 14 }, // E
      { width: 14 }, // F
      { width: 14 }, // G
      { width: 14 }, // H
    ];

    const itemsTitleRowNum = (ws.lastRow ? ws.lastRow.number : 0) + 1;
    const itemsRow = ws.addRow(["Items to Bill"]);
    itemsRow.height = 24;
    ws.mergeCells(`A${itemsTitleRowNum}:H${itemsTitleRowNum}`);
    ws.getCell(`A${itemsTitleRowNum}`).font = { name: "Arial", size: 10, bold: true };
    ws.getCell(`A${itemsTitleRowNum}`).alignment = { horizontal: "left", vertical: "middle" };

    // Table header
    const headerRowNumber = (ws.lastRow ? ws.lastRow.number : 0) + 1;
    let headerRow;
    if (isInvoice) {
      headerRow = [
        "Charge Code",
        "",
        "Description",
        "",
        "Basis",
        "",
        "Amount",
        "VAT",
      ];
    } else {
      headerRow = [
        "Charge Code",
        "",
        "Description",
        "",
        "Basis",
        "",
        "Amount",
        "",
      ];
    }
    ws.addRow(headerRow);

    ws.mergeCells(`A${headerRowNumber}:B${headerRowNumber}`);
    ws.mergeCells(`C${headerRowNumber}:D${headerRowNumber}`);
    ws.mergeCells(`E${headerRowNumber}:F${headerRowNumber}`);
    if (isInvoice) {
    } else {
      ws.mergeCells(`G${headerRowNumber}:H${headerRowNumber}`);
    }
    allCols.forEach((col) => {
      ws.getCell(`${col}${headerRowNumber}`).border = mediumGrayBorder;
    });
    ["A", "C", "E", "G"].forEach((col) => {
      ws.getCell(`${col}${headerRowNumber}`).font = {
        name: "Arial",
        size: 10,
        bold: true,
      };
      ws.getCell(`${col}${headerRowNumber}`).alignment = {
        horizontal: "center",
        vertical: "middle",
      };
    });
    ws.getCell(`B${headerRowNumber}`).font = {
      name: "Arial",
      size: 10,
      bold: true,
    };
    ws.getCell(`D${headerRowNumber}`).font = {
      name: "Arial",
      size: 10,
      bold: true,
    };
    ws.getCell(`F${headerRowNumber}`).font = {
      name: "Arial",
      size: 10,
      bold: true,
    };
    if (isInvoice) {
      ws.getCell(`H${headerRowNumber}`).font = {
        name: "Arial",
        size: 10,
        bold: true,
      };
      ws.getCell(`H${headerRowNumber}`).alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      ws.getCell(`G${headerRowNumber}`).font = {
        name: "Arial",
        size: 10,
        bold: true,
      };
      ws.getCell(`G${headerRowNumber}`).alignment = {
        horizontal: "center",
        vertical: "middle",
      };
    } else {
      ws.getCell(`H${headerRowNumber}`).font = {
        name: "Arial",
        size: 10,
        bold: true,
      };
      ws.getCell(`H${headerRowNumber}`).alignment = {
        horizontal: "center",
        vertical: "middle",
      };
    }

    // Charges
    if (Array.isArray(billing.charges) && billing.charges.length > 0) {
      billing.charges.forEach((charge) => {
        const rowNum = (ws.lastRow ? ws.lastRow.number : 0) + 1;
        let rowData;
        if (isInvoice) {
          rowData = [
            charge.chargeCode || "",
            "",
            charge.description || "",
            "",
            charge.rateBasis || "",
            "",
            charge.rate || "",
            charge.vat || "",
          ];
        } else {
          rowData = [
            charge.chargeCode || "",
            "",
            charge.description || "",
            "",
            charge.rateBasis || "",
            "",
            charge.rate || "",
            "",
          ];
        }
        ws.addRow(rowData);

        ws.mergeCells(`A${rowNum}:B${rowNum}`);
        ws.mergeCells(`C${rowNum}:D${rowNum}`);
        ws.mergeCells(`E${rowNum}:F${rowNum}`);
        if (isInvoice) {
        } else {
          ws.mergeCells(`G${rowNum}:H${rowNum}`);
        }
        allCols.forEach((col) => {
          ws.getCell(`${col}${rowNum}`).font = { name: "Arial", size: 9 };
          ws.getCell(`${col}${rowNum}`).alignment = {
            vertical: "middle",
            horizontal: col === "G" || col === "H" ? "right" : "left",
          };
          ws.getCell(`${col}${rowNum}`).border = mediumGrayBorder;
        });
      });
    } else {
      const notFoundRow = ws.addRow(["No charges found for this billing."]);
      ws.mergeCells(`A${notFoundRow.number}:F${notFoundRow.number}`);
      ws.mergeCells(`G${notFoundRow.number}:H${notFoundRow.number}`);
      allCols.forEach((col) => {
        ws.getCell(`${col}${notFoundRow.number}`).border = mediumGrayBorder;
      });
      notFoundRow.font = { name: "Arial", size: 8, italic: true };
      notFoundRow.height = 20;
      notFoundRow.getCell(1).alignment = {
        horizontal: "center",
        vertical: "middle",
      };
    }

    // Summary
    if (billing.summary) {
      const summaryRowNum = (ws.lastRow ? ws.lastRow.number : 0) + 1;
      // Vatable Sales / Total Sales
      ws.addRow([
        "Vatable Sales",
        "",
        billing.summary.vatableSales || "",
        "",
        "Total Sales",
        "",
        billing.summary.totalSales || "",
        "",
      ]);
      ws.mergeCells(`A${summaryRowNum}:B${summaryRowNum}`);
      ws.mergeCells(`C${summaryRowNum}:D${summaryRowNum}`);
      ws.mergeCells(`E${summaryRowNum}:F${summaryRowNum}`);
      ws.mergeCells(`G${summaryRowNum}:H${summaryRowNum}`);
      allCols.forEach((col) => {
        ws.getCell(`${col}${summaryRowNum}`).border = mediumGrayBorder;
      });
      ws.getCell(`A${summaryRowNum}`).alignment = {
        horizontal: "right",
        vertical: "middle",
      };
      ws.getCell(`E${summaryRowNum}`).alignment = {
        horizontal: "right",
        vertical: "middle",
      };
      ws.getCell(`A${summaryRowNum}`).font = { bold: true };
      ws.getCell(`E${summaryRowNum}`).font = { bold: true };

      // VAT / Less VAT
      const vatRowNum = summaryRowNum + 1;
      ws.addRow([
        "VAT",
        "",
        billing.summary.vat || "",
        "",
        "Less VAT",
        "",
        billing.summary.lessVat || "",
        "",
      ]);
      ws.mergeCells(`A${vatRowNum}:B${vatRowNum}`);
      ws.mergeCells(`C${vatRowNum}:D${vatRowNum}`);
      ws.mergeCells(`E${vatRowNum}:F${vatRowNum}`);
      ws.mergeCells(`G${vatRowNum}:H${vatRowNum}`);
      allCols.forEach((col) => {
        ws.getCell(`${col}${vatRowNum}`).border = mediumGrayBorder;
      });
      ws.getCell(`A${vatRowNum}`).alignment = {
        horizontal: "right",
        vertical: "middle",
      };
      ws.getCell(`E${vatRowNum}`).alignment = {
        horizontal: "right",
        vertical: "middle",
      };
      ws.getCell(`A${vatRowNum}`).font = { bold: true };
      ws.getCell(`E${vatRowNum}`).font = { bold: true };

      // Zero Rated Sales / Amount Net of Vat
      const zeroRatedRowNum = vatRowNum + 1;
      ws.addRow([
        "Zero Rated Sales",
        "",
        billing.summary.zeroRatedSales || "",
        "",
        "Amount Net of Vat",
        "",
        billing.summary.netOfVat || "",
        "",
      ]);
      ws.mergeCells(`A${zeroRatedRowNum}:B${zeroRatedRowNum}`);
      ws.mergeCells(`C${zeroRatedRowNum}:D${zeroRatedRowNum}`);
      ws.mergeCells(`E${zeroRatedRowNum}:F${zeroRatedRowNum}`);
      ws.mergeCells(`G${zeroRatedRowNum}:H${zeroRatedRowNum}`);
      allCols.forEach((col) => {
        ws.getCell(`${col}${zeroRatedRowNum}`).border = mediumGrayBorder;
      });
      ws.getCell(`A${zeroRatedRowNum}`).alignment = {
        horizontal: "right",
        vertical: "middle",
      };
      ws.getCell(`E${zeroRatedRowNum}`).alignment = {
        horizontal: "right",
        vertical: "middle",
      };
      ws.getCell(`A${zeroRatedRowNum}`).font = { bold: true };
      ws.getCell(`E${zeroRatedRowNum}`).font = { bold: true };

      // VAT Exempt Sales / Less: Discount
      const vatExemptRowNum = zeroRatedRowNum + 1;
      ws.addRow([
        "VAT Exempt Sales",
        "",
        billing.summary.vatExemptSales || "",
        "",
        "Less: Discount (SC/PWD/NAAC/MOV/SP",
        "",
        billing.summary.discount || "",
        "",
      ]);
      ws.mergeCells(`A${vatExemptRowNum}:B${vatExemptRowNum}`);
      ws.mergeCells(`C${vatExemptRowNum}:D${vatExemptRowNum}`);
      ws.mergeCells(`E${vatExemptRowNum}:F${vatExemptRowNum}`);
      ws.mergeCells(`G${vatExemptRowNum}:H${vatExemptRowNum}`);
      allCols.forEach((col) => {
        ws.getCell(`${col}${vatExemptRowNum}`).border = mediumGrayBorder;
      });
      ws.getCell(`A${vatExemptRowNum}`).alignment = {
        horizontal: "right",
        vertical: "middle",
      };
      ws.getCell(`E${vatExemptRowNum}`).alignment = {
        horizontal: "right",
        vertical: "middle",
      };
      ws.getCell(`A${vatExemptRowNum}`).font = { bold: true };
      ws.getCell(`E${vatExemptRowNum}`).font = { bold: true };

      // Add: VAT
      const addVatRowNum = vatExemptRowNum + 1;
      ws.addRow([
        "",
        "",
        "",
        "",
        "Add: VAT",
        "",
        billing.summary.addVat || "",
        "",
      ]);
      ws.mergeCells(`E${addVatRowNum}:F${addVatRowNum}`);
      ws.mergeCells(`G${addVatRowNum}:H${addVatRowNum}`);
      allCols.forEach((col) => {
        ws.getCell(`${col}${addVatRowNum}`).border = mediumGrayBorder;
      });
      ws.getCell(`E${addVatRowNum}`).alignment = {
        horizontal: "right",
        vertical: "middle",
      };
      ws.getCell(`E${addVatRowNum}`).font = { bold: true };

      // Less: Without Tax
      const lessTaxRowNum = addVatRowNum + 1;
      ws.addRow([
        "",
        "",
        "",
        "",
        "Less: Without Tax",
        "",
        billing.summary.withholdingTax || "",
        "",
      ]);
      ws.mergeCells(`E${lessTaxRowNum}:F${lessTaxRowNum}`);
      ws.mergeCells(`G${lessTaxRowNum}:H${lessTaxRowNum}`);
      allCols.forEach((col) => {
        ws.getCell(`${col}${lessTaxRowNum}`).border = mediumGrayBorder;
      });
      ws.getCell(`E${lessTaxRowNum}`).alignment = {
        horizontal: "right",
        vertical: "middle",
      };
      ws.getCell(`E${lessTaxRowNum}`).font = { bold: true };

      // Withholding Groups
      let currentRow = lessTaxRowNum;
      if (Array.isArray(billing.summary.withholdingGroups)) {
        billing.summary.withholdingGroups.forEach((group) => {
          currentRow += 1;
          ws.addRow([
            "",
            "",
            "",
            "",
            `Withholding Tax ${group.witholdingPercentage || ""}%`,
            "",
            group.totalWithholdingTax || "",
            "",
          ]);
          ws.mergeCells(`E${currentRow}:F${currentRow}`);
          ws.mergeCells(`G${currentRow}:H${currentRow}`);
          allCols.forEach((col) => {
            ws.getCell(`${col}${currentRow}`).border = mediumGrayBorder;
          });
          ws.getCell(`E${currentRow}`).alignment = {
            horizontal: "right",
            vertical: "middle",
          };
          ws.getCell(`E${currentRow}`).font = { bold: true };
        });
      }

      // Total Amount Due
      ws.addRow([
        "",
        "",
        "",
        "",
        `Total Amount Due (${viewModel.clientCurrency || ""})`,
        "",
        (billing.summary.totalSales || 0) + (billing.summary.addVat || 0),
        "",
      ]);
      ws.mergeCells(`E${currentRow + 1}:F${currentRow + 1}`);
      ws.mergeCells(`G${currentRow + 1}:H${currentRow + 1}`);
      allCols.forEach((col) => {
        ws.getCell(`${col}${currentRow + 1}`).border = mediumGrayBorder;
      });
      ws.getCell(`E${currentRow + 1}`).alignment = {
        horizontal: "right",
        vertical: "middle",
      };
      ws.getCell(`E${currentRow + 1}`).font = { bold: true };
    }

    // Enties
    if (Array.isArray(billing.entries) && billing.entries.length > 0) {
        const entriesTitleRowNum = (ws.lastRow ? ws.lastRow.number : 0) + 1;
        const entriesRow = ws.addRow(["Entries"]);
        entriesRow.height = 24;
        ws.mergeCells(`A${entriesTitleRowNum}:H${entriesTitleRowNum}`);
        ws.getCell(`A${entriesTitleRowNum}`).font = { name: "Arial", size: 10, bold: true };
        ws.getCell(`A${entriesTitleRowNum}`).alignment = { horizontal: "left", vertical: "middle" };

        // Header row
        const entriesHeaderRowNum = entriesTitleRowNum + 1;
        ws.addRow(["Account", "", "", "", "Debit", "", "Credit", ""]);
        ws.mergeCells(`A${entriesHeaderRowNum}:D${entriesHeaderRowNum}`);
        ws.mergeCells(`E${entriesHeaderRowNum}:F${entriesHeaderRowNum}`);
        ws.mergeCells(`G${entriesHeaderRowNum}:H${entriesHeaderRowNum}`);
        ["A", "E", "G"].forEach((col) => {
            ws.getCell(`${col}${entriesHeaderRowNum}`).font = { name: "Arial", size: 10, bold: true };
            ws.getCell(`${col}${entriesHeaderRowNum}`).alignment = { horizontal: col === "A" ? "left" : "right", vertical: "middle" };
        });
        ["A", "B", "C", "D", "E", "F", "G", "H"].forEach((col) => {
            ws.getCell(`${col}${entriesHeaderRowNum}`).border = mediumGrayBorder;
        });

        // Entries rows
        billing.entries.forEach((entry, idx) => {
            const entryRowNum = entriesHeaderRowNum + 1 + idx;
            ws.addRow([
                entry.account || "",
                "", "", "",
                entry.debit != null ? Number(entry.debit).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "",
                "",
                entry.credit != null ? Number(entry.credit).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "",
                ""
            ]);
            ws.mergeCells(`A${entryRowNum}:D${entryRowNum}`);
            ws.mergeCells(`E${entryRowNum}:F${entryRowNum}`);
            ws.mergeCells(`G${entryRowNum}:H${entryRowNum}`);
            // Style and border
            ["A", "E", "G"].forEach((col) => {
                ws.getCell(`${col}${entryRowNum}`).font = { name: "Arial", size: 9 };
                ws.getCell(`${col}${entryRowNum}`).alignment = { horizontal: col === "A" ? "left" : "right", vertical: "middle" };
            });
            ["A", "B", "C", "D", "E", "F", "G", "H"].forEach((col) => {
                ws.getCell(`${col}${entryRowNum}`).border = mediumGrayBorder;
            });
        });
    }
  }

  return workbook.xlsx.writeBuffer();
}

module.exports = {
  generateConsolidatedBillingBuffer,
};

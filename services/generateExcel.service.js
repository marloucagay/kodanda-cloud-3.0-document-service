const axios = require("axios");
const ExcelJS = require("exceljs");
const fs = require("fs");

async function generateStockMovementBuffer(viewModel) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Stock Movement Report");

  if (viewModel.logo) {
    let imageBuffer;
    if (/^https?:\/\//.test(viewModel.logo)) {
      const response = await axios.get(viewModel.logo, {
        responseType: "arraybuffer",
      });
      imageBuffer = Buffer.from(response.data, "binary");
    } else {
      imageBuffer = fs.readFileSync(viewModel.logo);
    }
    const imageId = workbook.addImage({
      buffer: imageBuffer,
      extension: "png",
    });
    worksheet.addImage(imageId, {
      tl: { col: 0, row: 0 },
      ext: { width: 120, height: 80 },
    });
    worksheet.getRow(1).height = 80;
  }

  worksheet.addRow([`Stock Movement Report`]).font = {
    name: "Arial",
    size: 14,
    bold: true,
  };
  worksheet.addRow([`Client: ${viewModel?.clientName || ""}`]).font = {
    name: "Arial",
    size: 8,
    bold: true,
  };
  worksheet.addRow([]);

  // Table header
  const tableHeader = [
    "Date",
    "Item Status",
    "Item Code",
    "Item Name",
    "Batch",
    "Location",
    "Price",
    "Currency",
    "Condition",
    "Qty In",
    "Qty Out",
    "Remarks",
  ];
  const tableHeaderRow = worksheet.addRow(tableHeader);
  tableHeaderRow.font = { name: "Arial", size: 8, bold: true };

  tableHeader.forEach((_, idx) => {
    tableHeaderRow.getCell(idx + 1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD3D3D3" },
    };
    tableHeaderRow.getCell(idx + 1).border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  // Table rows
  viewModel.stocks.forEach((vm) => {
    let qtyIn = "";
    let qtyOut = "";
    if (vm.warehouseMode === "Incoming") {
      qtyIn = vm.quantity || "";
    } else if (vm.warehouseMode === "Outgoing") {
      qtyOut = vm.quantity || "";
    }
    const row = worksheet.addRow([
      vm.dateCreated || "",
      vm.warehouseMode || "",
      vm.itemCode || "",
      vm.itemName || "",
      vm.batchNo || "",
      vm.location || "",
      vm.price || "",
      vm.currency || "",
      vm.condition || "",
      qtyIn,
      qtyOut,
      vm.remarks || "",
    ]);
    row.font = { name: "Arial", size: 8 };
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });
  worksheet.addRow([]);
  worksheet.columns.forEach((col) => {
    col.width = 12;
  });
  return workbook.xlsx.writeBuffer();
}

async function generateBillingSummaryBuffer(viewModel) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Billing Summary Report");

  if (viewModel.logo) {
    let imageBuffer;
    if (/^https?:\/\//.test(viewModel.logo)) {
      const response = await axios.get(viewModel.logo, {
        responseType: "arraybuffer",
      });
      imageBuffer = Buffer.from(response.data, "binary");
    } else {
      imageBuffer = fs.readFileSync(viewModel.logo);
    }
    const imageId = workbook.addImage({
      buffer: imageBuffer,
      extension: "png",
    });
    worksheet.addImage(imageId, {
      tl: { col: 0, row: 0 },
      ext: { width: 120, height: 80 },
    });
    worksheet.getRow(1).height = 80;
  }

  worksheet.addRow([`Billing Summary Report`]).font = {
    name: "Arial",
    size: 14,
    bold: true,
  };
  worksheet.addRow([`Client: ${viewModel?.clientName || ""}`]).font = {
    name: "Arial",
    size: 8,
    bold: true,
  };
  worksheet.addRow([]);

  // Table header
  const tableHeader = [
    "Date",
    "Billing Reference",
    "Item Status",
    "Item Code",
    "Item Name",
    "Batch",
    "Location",
    "Price",
    "Currency",
    "Condition",
    "Quantity",
    "Remarks",
  ];
  const tableHeaderRow = worksheet.addRow(tableHeader);
  tableHeaderRow.font = { name: "Arial", size: 8, bold: true };

  tableHeader.forEach((_, idx) => {
    tableHeaderRow.getCell(idx + 1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD3D3D3" },
    };
    tableHeaderRow.getCell(idx + 1).border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  // Table rows
  viewModel.stocks.forEach((vm) => {
    const row = worksheet.addRow([
      vm.summaryDate || "",
      vm.billingReference || "",
      vm.warehouseMode || "",
      vm.itemCode || "",
      vm.itemName || "",
      vm.batchNo || "",
      vm.location || "",
      vm.price || "",
      vm.currency || "",
      vm.condition || "",
      vm.quantity || "",
      vm.remarks || "",
    ]);
    row.font = { name: "Arial", size: 8 };
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });
  worksheet.addRow([]);
  worksheet.columns.forEach((col) => {
    col.width = 12;
  });
  return workbook.xlsx.writeBuffer();
}

async function generateBillingServiceBuffer(viewModel) {
  const workbook = new ExcelJS.Workbook();

  // Helper to add a sheet for a billing type
  async function addBillingSheet(sheetName, billings) {
    const worksheet = workbook.addWorksheet(sheetName);

    // Add logo if present (on every sheet)
    if (viewModel.logo) {
      let imageBuffer;
      if (/^https?:\/\//.test(viewModel.logo)) {
        const response = await axios.get(viewModel.logo, { responseType: "arraybuffer" });
        imageBuffer = Buffer.from(response.data, "binary");
      } else {
        imageBuffer = fs.readFileSync(viewModel.logo);
      }
      const imageId = workbook.addImage({
        buffer: imageBuffer,
        extension: "png",
      });
      worksheet.addImage(imageId, {
        tl: { col: 0, row: 0 },
        ext: { width: 120, height: 80 },
      });
      worksheet.getRow(1).height = 80;
    }

    worksheet.addRow([`${sheetName} Report`]).font = { name: "Arial", size: 14, bold: true };
    worksheet.addRow([`Client: ${viewModel?.clientName || ""}`]).font = { name: "Arial", size: 8, bold: true };
    worksheet.addRow([]);

    // Table header
    const tableHeader = [
      'Invoice Date', 'Billing Reference', 'Invoice No', 'Quotation No.', 'Consignee', 'Shipper', 'Delivery Site',
      'Foreign Currency', 'Credit Term', 'File No', 'Contact Person', 'Contact No.',
      'Currency', 'Total Amount', 'VAT', 'Net Amount', 'Status'
    ];
    const tableHeaderRow = worksheet.addRow(tableHeader);
    tableHeaderRow.font = { name: "Arial", size: 8, bold: true };

    tableHeader.forEach((_, idx) => {
      tableHeaderRow.getCell(idx + 1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD3D3D3" },
      };
      tableHeaderRow.getCell(idx + 1).border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    billings.forEach((vm) => {
      const row = worksheet.addRow([
        vm.invoiceDate || "",
        vm.billing || "",
        vm.invoiceNo || "",
        vm.quotationNo || "",
        vm.consignee || "",
        vm.shipper || "",
        vm.deliverySite || "",
        vm.currency || "",
        vm.creditTerm || "",
        vm.fileNo || "",
        vm.contactPerson || "",
        vm.contactNo || "",
        vm.currency || "",
        vm.totalAmount || 0,
        vm.vat || 0,
        vm.netAmount || 0,
        vm.status || ""
      ]);
      row.font = { name: "Arial", size: 8 };
      row.getCell(13).numFmt = '#,##0.00';
      row.getCell(14).numFmt = '#,##0.00';
      row.getCell(15).numFmt = '#,##0.00';
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    worksheet.addRow([]);
    worksheet.columns.forEach((col) => { col.width = 12; });
  }

  // Separate billings by type
  const invoiceBillings = (viewModel.billings || []).filter(b => b.billing === "Invoice");
  const debitNoteBillings = (viewModel.billings || []).filter(b => b.billing === "Debit Note");

  if (invoiceBillings.length) await addBillingSheet("Invoice", invoiceBillings);
  if (debitNoteBillings.length) await addBillingSheet("Debit Note", debitNoteBillings);

  return workbook.xlsx.writeBuffer();
}

async function generateStorageReportBuffer(viewModel) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Storage Report");

  if (viewModel.logo) {
    let imageBuffer;
    if (/^https?:\/\//.test(viewModel.logo)) {
      const response = await axios.get(viewModel.logo, {
        responseType: "arraybuffer",
      });
      imageBuffer = Buffer.from(response.data, "binary");
    } else {
      imageBuffer = fs.readFileSync(viewModel.logo);
    }
    const imageId = workbook.addImage({
      buffer: imageBuffer,
      extension: "png",
    });
    worksheet.addImage(imageId, {
      tl: { col: 0, row: 0 },
      ext: { width: 120, height: 80 },
    });
    worksheet.getRow(1).height = 80;
  }

  worksheet.addRow([`Storage Report`]).font = {
    name: "Arial",
    size: 14,
    bold: true,
  };
  worksheet.addRow([`Client: ${viewModel?.clientName || ""}`]).font = {
    name: "Arial",
    size: 8,
    bold: true,
  };
  worksheet.addRow([]);

  // Table header
  const tableHeader = [
    "Date",
    "Picklist #",
    "PICKLIST FORM",
    "CUSTOMER",
    "Delivery Site",
    "Customer Ref #",
    "PRODUCT CODE",
    "DESCRIPTION",
    "MFG. Date.",
    "Serial Number",
    "Batch/Lot Number",
    "Expiration",
    "Qty",
    "UQ",
    "Location"
  ];
  const tableHeaderRow = worksheet.addRow(tableHeader);
  tableHeaderRow.font = { name: "Arial", size: 8, bold: true };

  tableHeader.forEach((_, idx) => {
    tableHeaderRow.getCell(idx + 1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD3D3D3" },
    };
    tableHeaderRow.getCell(idx + 1).border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  // Table rows
  viewModel.stocks.forEach((vm) => {
    const row = worksheet.addRow([
      vm.date || "",
      vm.pickListNo || "",
      vm.picklistForm || "",
      vm.customer || "",
      vm.deliverySite || "",
      vm.customerReference || "",
      vm.pickingLists?.[0].itemCode || "",
      vm.pickingLists?.[0].itemDescription || "",
      vm.pickingLists?.[0].manufacturedDate || "",
      vm.pickingLists?.[0].serialNo || "",
      vm.pickingLists?.[0].batchNo || "",
      vm.pickingLists?.[0].expirationDate || "",
      vm.pickingLists?.[0].quantity || 0,
      vm.pickingLists?.[0].uQ || "",
      vm.pickingLists?.[0].location || ""
    ]);
    row.font = { name: "Arial", size: 8 };
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });
  worksheet.addRow([]);
  worksheet.columns.forEach((col) => {
    col.width = 12;
  });
  return workbook.xlsx.writeBuffer();
}

async function generateStockItemsBuffer(viewModel) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Stock Items Report");

  worksheet.addRow([`Stock Items Report`]).font = {
    name: "Arial",
    size: 14,
    bold: true,
  };
  worksheet.addRow([]);

  // Table header
  const tableHeader = [
    "Customer",
    "Product Code",
    "Description",
    "Date Received",
    "Manufacturing Date",
    "Serial No",
    "Batch No",
    "Expiration Date",
    "Location",
    "Quantity",
    "Allocated Quantity",
    "Total Quantity",
    "Unit Quantity",
    "Ageing"
  ];
  const tableHeaderRow = worksheet.addRow(tableHeader);
  tableHeaderRow.font = { name: "Arial", size: 8, bold: true };

  tableHeader.forEach((_, idx) => {
    tableHeaderRow.getCell(idx + 1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD3D3D3" },
    };
    tableHeaderRow.getCell(idx + 1).border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  // Table rows
  viewModel.stocks.forEach((vm) => {
    const row = worksheet.addRow([
      vm.clientName || "",
      vm.itemCode || "",
      vm.itemName || "",
      vm.dateReceived || "",
      vm.manufacturedDate || "",
      vm.serialNo || "",
      vm.batchNo || "",
      vm.expiryDate || "",
      vm.location || "",
      vm.qty || "",
      vm.allocatedQuantity || "",
      vm.totalQuantity || "",
      vm.uQ || "",
      vm.ageing || "",
    ]);
    row.font = { name: "Arial", size: 8 };

    row.getCell(10).numFmt = '#,##0';
    row.getCell(11).numFmt = '#,##0';
    row.getCell(12).numFmt = '#,##0';
    
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });
  worksheet.addRow([]);
  worksheet.columns.forEach((col) => {
    col.width = 12;
  });
  return workbook.xlsx.writeBuffer();
}

module.exports = {
  generateStockMovementBuffer,
  generateBillingSummaryBuffer,
  generateBillingServiceBuffer,
  generateStorageReportBuffer,
  generateStockItemsBuffer
};

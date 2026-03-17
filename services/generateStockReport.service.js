const axios = require('axios');
const ExcelJS = require('exceljs');

async function generateReceivingReportExcelBuffer(viewModel) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Receiving Report');

    if (viewModel.logo) {
        let imageBuffer;
        if (/^https?:\/\//.test(viewModel.logo)) {
            const response = await axios.get(viewModel.logo, { responseType: 'arraybuffer' });
            imageBuffer = Buffer.from(response.data, 'binary');
        } else {
            imageBuffer = fs.readFileSync(viewModel.logo);
        }
        const imageId = workbook.addImage({
            buffer: imageBuffer,
            extension: 'png',
        });
        worksheet.addImage(imageId, {
            tl: { col: 0, row: 0 },
            ext: { width: 120, height: 80 } 
        });
        worksheet.getRow(1).height = 80;
    }

    worksheet.addRow([`Receiving Report`]).font = { name: 'Arial', size: 14, bold: true };
    worksheet.addRow([`Client: ${viewModel?.clientName || ''}`]).font = { name: 'Arial', size: 8 , bold: true};
    worksheet.addRow([`Date Received: ${viewModel?.date || ''}`, `File no.: ${viewModel?.fileNo || ''}`]).font = { name: 'Arial', size: 8 };
    worksheet.addRow([`Supplier: ${viewModel?.supplier || ''}`, `Billing Reference: ${viewModel?.billingReference || ''}`]).font = { name: 'Arial', size: 8 };
    worksheet.addRow([`Delivery Reference no.: ${viewModel?.deliveryPlateNumber || ''}`, `Receiving Reference no: ${viewModel?.incomingStocksNo || ''}`]).font = { name: 'Arial', size: 8 };
    worksheet.addRow([]);

    // Table header
    const tableHeader = [
        'Product code', 'Description', 'Commodity', 'Qty', 'UQ', 'Batch/Lot No.',
        'Expiry Date', 'Serial Number', 'Unit price', 'Currency', 'Storage temp.',
        'Condition', 'WH Location'
    ];
    const tableHeaderRow = worksheet.addRow(tableHeader);
    tableHeaderRow.font = { name: 'Arial', size: 8, bold: true };

    tableHeader.forEach((_, idx) => {
        tableHeaderRow.getCell(idx + 1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD3D3D3' } 
        };
        tableHeaderRow.getCell(idx + 1).border = {
            top:    { style: 'thin' },
            left:   { style: 'thin' },
            bottom: { style: 'thin' },
            right:  { style: 'thin' }
        };
    });

    // Table rows
    viewModel.items.forEach(vm => {
        const row = worksheet.addRow([
            vm.itemCode || '',
            vm.itemName || '',
            vm.commodity || '',
            vm.qty || '',
            vm.uQ || '',
            vm.batchNo || '',
            vm.expiryDate || '',
            vm.serialNo || '',
            vm.unitPrice || '',
            vm.currency || '',
            vm.storageTemperature || '',
            vm.condition || '',
            vm.location || ''
        ]);
        row.font = { name: 'Arial', size: 8 };
        row.eachCell(cell => {
            cell.border = {
                top:    { style: 'thin' },
                left:   { style: 'thin' },
                bottom: { style: 'thin' },
                right:  { style: 'thin' }
            };
        });
    });
    worksheet.addRow([]);
    worksheet.addRow([`Remarks: ${viewModel.remarks || ''}`]).font = { name: 'Arial', size: 8, bold: true };
    worksheet.addRow([]);
    const encodedRow = worksheet.addRow([
        `Encoded by: ${viewModel.encodedBy || ''}`, '', '', '', '', '', '', 'Condition:', `A = Good`
    ]);
    encodedRow.getCell(1).font = { name: 'Arial', size: 8, bold: true };
    encodedRow.getCell(2).font = { name: 'Arial', size: 8, bold: true };
    encodedRow.eachCell((cell, colNumber) => {
        if (colNumber !== 1 && colNumber !== 2) {
            cell.font = { name: 'Arial', size: 8, bold: false };
        }
    });

    const dateRow = worksheet.addRow([
        `Date: ${viewModel.encodedDate || ''}`, '', '', '', '', '', '', '', `B = Damaged (broken, crumpled, dented, torned, wet, etc.)`
    ]);
    dateRow.getCell(1).font = { name: 'Arial', size: 8, bold: true }; // "Date"
    dateRow.getCell(2).font = { name: 'Arial', size: 8, bold: true }; // value
    dateRow.eachCell((cell, colNumber) => {
        if (colNumber !== 1 && colNumber !== 2) {
            cell.font = { name: 'Arial', size: 8, bold: false };
        }
    });
    worksheet.addRow(['', '', '', '', '', '', '', '', 'C = Quarantine/ For client Disposition']).font = { name: 'Arial', size: 8 };
    worksheet.addRow([]);
    worksheet.addRow([`Verified by: ${viewModel.verifiedBy || ''}`]).font = { name: 'Arial', size: 8, bold: true };
    worksheet.addRow([`Date: ${viewModel.verifiedDate || ''}`]).font = { name: 'Arial', size: 8, bold: true };

    worksheet.columns.forEach(col => { col.width = 12; });
    worksheet.getColumn(1).width = 30;
    worksheet.getColumn(2).width = 30;

    return workbook.xlsx.writeBuffer();
}

async function generateOutgoingStockExcelBuffer(viewModel) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Outgoing Report');

    if (viewModel.logo) {
        let imageBuffer;
        if (/^https?:\/\//.test(viewModel.logo)) {
            const response = await axios.get(viewModel.logo, { responseType: 'arraybuffer' });
            imageBuffer = Buffer.from(response.data, 'binary');
        } else {
            imageBuffer = fs.readFileSync(viewModel.logo);
        }
        const imageId = workbook.addImage({
            buffer: imageBuffer,
            extension: 'png',
        });
        worksheet.addImage(imageId, {
            tl: { col: 0, row: 0 },
            ext: { width: 120, height: 80 } 
        });
        worksheet.getRow(1).height = 80;
    }

    worksheet.addRow([`Outgoing Stocks`]).font = { name: 'Arial', size: 14, bold: true };
    worksheet.addRow([`Client: ${viewModel?.clientName || ''}`]).font = { name: 'Arial', size: 8 , bold: true};
    worksheet.addRow([`Customer Reference: ${viewModel?.customer || ''}`]).font = { name: 'Arial', size: 8 };
    worksheet.addRow([`Address: ${viewModel?.address || ''}`]).font = { name: 'Arial', size: 8 };
    worksheet.addRow([`File no.: ${viewModel?.fileNo || ''}`]).font = { name: 'Arial', size: 8 };
    worksheet.addRow([`Billing Reference.: ${viewModel?.billingReference || ''}`]).font = { name: 'Arial', size: 8 };
    worksheet.addRow([`Outgoing Reference no.: ${viewModel?.outgoingStocksNo || ''}`]).font = { name: 'Arial', size: 8 };
    worksheet.addRow([]);

    // Table header
    const tableHeader = [
        'Product code', 'Description', 'Batch/Lot No.',
        'Expiry Date', 'Qty', 'UQ'
    ];
    const tableHeaderRow = worksheet.addRow(tableHeader);
    tableHeaderRow.font = { name: 'Arial', size: 8, bold: true };

    tableHeader.forEach((_, idx) => {
        tableHeaderRow.getCell(idx + 1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD3D3D3' } 
        };
        tableHeaderRow.getCell(idx + 1).border = {
            top:    { style: 'thin' },
            left:   { style: 'thin' },
            bottom: { style: 'thin' },
            right:  { style: 'thin' }
        };
    });

    // Table rows
    viewModel.items.forEach(vm => {
        const row = worksheet.addRow([
            vm.productCode || '',
            vm.description || '',
            vm.batchNo || '',
            vm.expiryDate || '',
            vm.qty || '',
            vm.uQ || '',
        ]);
        row.font = { name: 'Arial', size: 8 };
        row.eachCell(cell => {
            cell.border = {
                top:    { style: 'thin' },
                left:   { style: 'thin' },
                bottom: { style: 'thin' },
                right:  { style: 'thin' }
            };
        });
    });
    worksheet.addRow([]);
    worksheet.addRow([`Remarks: ${viewModel.remarks || ''}`]).font = { name: 'Arial', size: 8, bold: true };
    worksheet.addRow([]);
    worksheet.addRow([`Released by: ${viewModel.encodedBy || ''}`]).font = { name: 'Arial', size: 8, bold: true };
    worksheet.addRow([`Date: ${viewModel.encodedDate || ''}`]).font = { name: 'Arial', size: 8, bold: true };
    worksheet.addRow([]);
    worksheet.addRow([]);
    worksheet.addRow([`Received by: ${viewModel.verifiedBy || ''}`]).font = { name: 'Arial', size: 8, bold: true };
    worksheet.addRow([`Date: ${viewModel.verifiedDate || ''}`]).font = { name: 'Arial', size: 8, bold: true };

    worksheet.columns.forEach(col => { col.width = 12; });
    worksheet.getColumn(1).width = 30;
    worksheet.getColumn(2).width = 30;

    return workbook.xlsx.writeBuffer();
}

async function generateInventorySummaryExcelBuffer(viewModel) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Inventory Summary');

    if (viewModel.logo) {
        let imageBuffer;
        if (/^https?:\/\//.test(viewModel.logo)) {
            const response = await axios.get(viewModel.logo, { responseType: 'arraybuffer' });
            imageBuffer = Buffer.from(response.data, 'binary');
        } else {
            imageBuffer = fs.readFileSync(viewModel.logo);
        }
        const imageId = workbook.addImage({
            buffer: imageBuffer,
            extension: 'png',
        });
        worksheet.addImage(imageId, {
            tl: { col: 0, row: 0 },
            ext: { width: 120, height: 80 }
        });
        worksheet.getRow(1).height = 80;
    }

    worksheet.addRow(['Inventory Summary Report']).font = { name: 'Arial', size: 14, bold: true };
    worksheet.addRow([`Client: ${viewModel?.clientName || ''}`]).font = { name: 'Arial', size: 8, bold: true };
    worksheet.addRow([`Item Code: ${viewModel?.itemCode || ''}`]).font = { name: 'Arial', size: 8, bold: true };
    worksheet.addRow([`Item Name: ${viewModel?.itemName || ''}`]).font = { name: 'Arial', size: 8, bold: true };
    worksheet.addRow([`Quantity: ${Number(viewModel?.quantity) || ''}`]).font = { name: 'Arial', size: 8, bold: true };
    worksheet.addRow([]);

    const items = Array.isArray(viewModel.items) ? viewModel.items : [];

    if (viewModel.onHandItems) {
        worksheet.addRow(['Stocks']).font = { name: 'Arial', size: 12, bold: true };
        const header = [
            'Lot/Batch No.', 'Location', 'Serial No.',
            'Available QTY', 'Allocated Qty', 'Total Qty', 'Price', 'Currency', 'Condition', 'Received Date', 'Manufactured Date', 'Expiry Date'
        ];
        const headerRow = worksheet.addRow(header);
        headerRow.font = { name: 'Arial', size: 8, bold: true };
        header.map((_, idx) => {
            headerRow.getCell(idx + 1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFD3D3D3' }
            };
            headerRow.getCell(idx + 1).border = {
                top:    { style: 'thin' },
                left:   { style: 'thin' },
                bottom: { style: 'thin' },
                right:  { style: 'thin' }
            };
            return null;
        });
        viewModel.onHandItems.map(vm => {
            const row = worksheet.addRow([
                vm.batchNo || '',
                vm.location || '',
                vm.serialNo || '',
                Number(vm.qty) || '',
                Number(vm.allocatedQuantity) || '',
                Number(vm.totalQuantity) || '',
                Number(vm.price) || '',
                vm.currency || '',
                vm.condition || '',
                vm.dateReceived || '',
                vm.manufacturedDate || '',
                vm.expiryDate || ''
            ]);
            row.font = { name: 'Arial', size: 8 };
            row.eachCell(cell => {
                cell.border = {
                    top:    { style: 'thin' },
                    left:   { style: 'thin' },
                    bottom: { style: 'thin' },
                    right:  { style: 'thin' }
                };
            });
            return null;
        });
        worksheet.addRow([]);
    }

    const header = [
        'Date', 'Item Status', 'Reference', 'Item Code', 'Batch', 'Location', 'Price', 'Currency', 'Condition', 'Qty In', 'Qty Out', 'Remarks'
    ];
    worksheet.addRow(['Movement Table']).font = { name: 'Arial', size: 12, bold: true };
    const headerRow = worksheet.addRow(header);
    headerRow.font = { name: 'Arial', size: 8, bold: true };
    header.map((_, idx) => {
        headerRow.getCell(idx + 1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD3D3D3' }
        };
        headerRow.getCell(idx + 1).border = {
            top:    { style: 'thin' },
            left:   { style: 'thin' },
            bottom: { style: 'thin' },
            right:  { style: 'thin' }
        };
    });

    if (items && items.length > 0) {
        items.map(item => {
            const type = item.itemStatus || 'Stock adjustment';
            let qtyIn = '', qtyOut = '', remarks = '';
    
            if (type === 'Stock inbound') {
                qtyIn = Number(item.quantity) || '';
                remarks = item.remarks || '';
            } else if (type === 'Stock outbound') {
                qtyOut = Number(item.quantity) || '';
                remarks = item.remarks || '';
            } else if (type === 'Stock adjustment') {
                if (Array.isArray(item.selectedReasons) && Array.isArray(item.adjustmentValues)) {
                    const reason = item.selectedReasons[0];
                    const adj = item.adjustmentValues.find(av => av.key === reason.key);
                    remarks = adj ? `${adj.type}: ${adj.newValue || ''}` : '';
                }
            }
    
            const row = worksheet.addRow([
                item.dateCreated || item.date || '',
                type,
                item.transactionFile || item.adjustmentID || '',
                item.itemCode || item.parentItemCode || '',
                item.batchNo || '',
                item.location || '',
                Number(item.price) || '',
                item.currency || '',
                item.condition || '',
                qtyIn,
                qtyOut,
                remarks
            ]);
            row.font = { name: 'Arial', size: 8 };
            row.eachCell(cell => {
                cell.border = {
                    top:    { style: 'thin' },
                    left:   { style: 'thin' },
                    bottom: { style: 'thin' },
                    right:  { style: 'thin' }
                };
            });
            return null;
        });
    } else {
        const notFoundRow = worksheet.addRow(['No movement records found for this item.']);
        notFoundRow.font = { name: 'Arial', size: 8, italic: true };
        notFoundRow.height = 20;

        worksheet.mergeCells(`A${notFoundRow.number}:${String.fromCharCode(65 + header.length - 1)}${notFoundRow.number}`);
        notFoundRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    }


    worksheet.columns.forEach(col => { col.width = 15; });
    worksheet.getColumn(1).width = 15;
    worksheet.getColumn(2).width = 15;
    worksheet.getColumn(3).width = 20;

    return workbook.xlsx.writeBuffer();
}

module.exports = {
    generateReceivingReportExcelBuffer,
    generateOutgoingStockExcelBuffer,
    generateInventorySummaryExcelBuffer
};
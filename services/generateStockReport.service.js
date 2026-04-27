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

async function generateBillingReportExcelBuffer(viewModel) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Billing Report');

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

    worksheet.addRow(['Billing Report']).font = { name: 'Arial', size: 14, bold: true };
    worksheet.addRow([`Client: ${viewModel?.clientName || ''}`]).font = { name: 'Arial', size: 8, bold: true };
    worksheet.addRow([`Address: ${viewModel?.clientAddress || ''}`]).font = { name: 'Arial', size: 8, bold: true };
    worksheet.addRow([`TIN: ${viewModel?.clientTIN || ''}`]).font = { name: 'Arial', size: 8, bold: true };
    worksheet.addRow([]);

    const billings = Array.isArray(viewModel.billings) ? viewModel.billings : [];

    const header = [
        'Date Submitted', 'Date Received', 'Transaction ID', 'Type of Booking', 'Booking/Transaction File', 'Quotation No', 'Contact Person', 'Contact No.', 'Transaction Status', 'Received By', 'Invoice Date', 'Invoice No.', 'Invoice Status'
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
    });

    if (billings && billings.length > 0) {
        billings.map(item => {  
            const row = worksheet.addRow([
                item.date|| '',
                item.dateReceived || '',
                item.transactionID,
                item.typeOfBooking || '',
                item.transactionFile || '',
                item.quotationNo || '',
                item.contactPerson || '',
                item.contactNo || '',
                item.status || '',
                item.receivedBy || '',
                item.invoiceDate || '',
                item.invoiceNo || '',
                item.invoiceStatus || ''
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
        const notFoundRow = worksheet.addRow(['No billing records found for the selected client.']);
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

async function generateInvoiceDebitExcelBuffer(viewModel) {
    const workbook = new ExcelJS.Workbook();
    const billings = Array.isArray(viewModel.billings) ? viewModel.billings : [];

    if (billings.length === 0) {
        // Optionally add a default sheet if no billings
        const ws = workbook.addWorksheet('No Billings');
        ws.addRow(['No billing records found.']);
        return workbook.xlsx.writeBuffer();
    }

    for (const billing of billings) {
        // Sheet name: billing + vatType (spaces replaced with dashes for safety)
        const sheetName = `${billing.billing}-${billing.vatType}`.replace(/\s+/g, '-');
        const ws = workbook.addWorksheet(sheetName.substring(0, 31)); // Excel sheet name max 31 chars

        // Header rows (customize as needed)
        ws.addRow([`${billing.billing} ${billing.vatType}`]).font = { name: 'Arial', size: 14, bold: true };
        ws.addRow([`Invoice No.: ${billing.invoiceNo || ''}`, `Status: ${billing.status || ''}`]).font = { name: 'Arial', size: 8 };
        ws.addRow([`Date Created: ${billing.dateCreated || ''}`]).font = { name: 'Arial', size: 8 };
        ws.addRow([]);

        // 7 columns
        ws.columns = Array(7).fill({ width: 18 });

        // Table header
        const headerRowNumber = ws.lastRow.number + 1;
        ws.addRow(['PARTICULARS', '', '', '', '', '', 'AMOUNT']);
        ws.mergeCells(`A${headerRowNumber}:F${headerRowNumber}`);
        ws.getCell(`A${headerRowNumber}`).font = { name: 'Arial', size: 10, bold: true };
        ws.getCell(`G${headerRowNumber}`).font = { name: 'Arial', size: 10, bold: true };
        ws.getCell(`A${headerRowNumber}`).alignment = { horizontal: 'center', vertical: 'middle' };
        ws.getCell(`G${headerRowNumber}`).alignment = { horizontal: 'center', vertical: 'middle' };

        // Charges
        if (Array.isArray(billing.charges) && billing.charges.length > 0) {
            billing.charges.forEach(charge => {
                const descRowNum = ws.lastRow.number + 1;
                ws.addRow([`Description : ${charge.description || ''}`, '', '', '', '', '', `${charge.rate || ''}`]);
                ws.mergeCells(`A${descRowNum}:F${descRowNum}`);
                ws.getCell(`A${descRowNum}`).font = { name: 'Arial', size: 9 };
                ws.getCell(`G${descRowNum}`).font = { name: 'Arial', size: 9 };
                ws.getCell(`A${descRowNum}`).alignment = { vertical: 'middle' };
                ws.getCell(`G${descRowNum}`).alignment = { vertical: 'middle', indent: 2, horizontal: 'right' };

                const basisRowNum = descRowNum + 1;
                ws.addRow([`Basis : ${charge.rateBasis || ''}`, '', '', '', '', '', '']);
                ws.mergeCells(`A${basisRowNum}:F${basisRowNum}`);
                ws.getCell(`A${basisRowNum}`).font = { name: 'Arial', size: 9, italic: true };
                ws.getCell(`A${basisRowNum}`).alignment = { vertical: 'middle', indent: 2 };

                ws.mergeCells(`G${descRowNum}:G${basisRowNum}`);

                // Borders
                ['A', 'B', 'C', 'D', 'E', 'F'].forEach(col => {
                    ws.getCell(`${col}${descRowNum}`).border = {
                        top: { style: 'thin' }, left: { style: 'thin' }, bottom: undefined, right: { style: 'thin' }
                    };
                    ws.getCell(`${col}${basisRowNum}`).border = {
                        top: undefined, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
                    };
                });

                ws.getCell(`G${descRowNum}`).border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
                ws.getCell(`G${basisRowNum}`).border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
        } else {
            const notFoundRow = ws.addRow(['No charges found for this billing.']);
            ws.mergeCells(`A${notFoundRow.number}:G${notFoundRow.number}`);
            notFoundRow.font = { name: 'Arial', size: 8, italic: true };
            notFoundRow.height = 20;
            notFoundRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
        }

        // Optionally, add summary rows here using billing.summary
        // Example:
        if (billing.summary) {
            ws.addRow([]);
            ws.addRow(['Summary', '', '', '', '', '', '']).font = { bold: true };

            // Vatable Sales and Total Sales in one row
            const summaryRowNum = ws.lastRow.number + 1;
            ws.addRow([
                'Vatable Sales', '', '', billing.summary.vatableSales || '',
                'Total Sales', '', billing.summary.totalSales || ''
            ]);
            ws.addRow([
                'VAT', '', '', billing.summary.vat || '',
                'Less VAT', '', billing.summary.lessVat || ''
            ]);
            ws.addRow([
                'Zero Rated Sales', '', '', billing.summary.zeroRatedSales || '',
                'Amount Net of Vat', '', billing.summary.netOfVat || ''
            ]);
            ws.addRow([
                'VAT Exempt Sales', '', '', billing.summary.vatExemptSales || '',
                'Less: Discount (SC/PWD/NAAC/MOV/SP', '', billing.summary.discount || ''
            ]);
            ws.addRow([
                '', '', '', '',
                'Add: VAT', '', billing.summary.addVat || ''
            ]);
            ws.addRow([
                '', '', '', '',
                'Less: Without Tax', '', billing.summary.withholdingTax || ''
            ]);
            if (Array.isArray(billing.summary.withholdingGroups)) {
                billing.summary.withholdingGroups.forEach(group => {
                    ws.addRow([
                        '', '', '', '',
                        `Withholding Tax ${group.witholdingPercentage || ''}%`, '', group.totalWithholdingTax || ''
                    ]);
                });
            }
            ws.addRow([
                '', '', '', '',
                'Total Amount Due (PHP)', '', (billing.summary.totalSales || 0) + (billing.summary.addVat || 0)
            ]);
            ws.mergeCells(`A${summaryRowNum}:C${summaryRowNum}`); // Vatable Sales label
            // D is amount for Vatable Sales
            ws.mergeCells(`E${summaryRowNum}:F${summaryRowNum}`); // Total Sales label
            // G is amount for Total Sales
        }
    }

    return workbook.xlsx.writeBuffer();
}

module.exports = {
    generateReceivingReportExcelBuffer,
    generateOutgoingStockExcelBuffer,
    generateInventorySummaryExcelBuffer,
    generateBillingReportExcelBuffer,
    generateInvoiceDebitExcelBuffer
};
const AIR_SECTION_CONFIG = {
    incoterms: {
      displayName: "Incoterms",
      columns: [
        { key: "incoterms", label: "Incoterm" },
        { key: "description", label: "Description" }
      ]
    },
    charges: {
      displayName: "Charges",
      columns: [
        { key: "chargeCode", label: "Charge Code" },
        { key: "description", label: "Description" },
        { key: "qty", label: "QTY" },
        { key: "otherForeignCurrency", label: "Other Foreign Currency" },
        { key: "exchangeRate", label: "Exchange Rate" },
        { key: "ratesForeignCurr", label: "Rates (Foreign Currency)" },
        { key: "ratePHP", label: "Rates (PHP)" },
        { key: "rateBasis", label: "Basis" },
        { key: "total", label: "Total (PHP)" },
        // { key: "estimatedCost", label: "Est. Cost" },
        // { key: "estimatedProfit", label: "Est. Profit" }
      ]
    },
    sourceAndDestination: {
      displayName: "Source and Destination",
      columns: [
        { key: "sourceCountry", label: "Origin" },
        { key: "sourceAirport", label: "Airport" },
        { key: "destinationCountry", label: "Destination" },
        { key: "destinationAirport", label: "Airport" }
      ]
    }
}

const SERVICE_SECTION_CONFIG = {
    "Air Import": AIR_SECTION_CONFIG,
    "Air Export": AIR_SECTION_CONFIG,
    "Brokerage & Clearance": {
        processingType: {
            displayName: "Processing Type",
            columns: [
            { key: "processingType", label: "Processing Type" },
            { key: "impex", label: "Impex" },
            { key: "modeOfTransport", label: "Mode of Transport" },
            { key: "action", label: "Action" }
            ]
        },
        brokerageCharges: {
            displayName: "Description of Charges",
            columns: [
            { key: "chargeCode", label: "Charge Code" },
            { key: "description", label: "Description" },
            { key: "qty", label: "QTY" },
            { key: "otherForeignCurrency", label: "Other Foreign Currency" },
            { key: "exchangeRate", label: "Exchange Rate" },
            { key: "ratesForeignCurr", label: "Rates (Foreign Currency)" },
            { key: "ratePHP", label: "Rates (PHP)" },
            { key: "rateBasis", label: "Basis" },
            { key: "total", label: "Total (PHP)" },
            // { key: "estimatedCost", label: "Est. Cost" },
            // { key: "estimatedProfit", label: "Est. Profit" }
            ]
        }
    },
    "Distribution": {
        transportCharges: {
            displayName: "Transportation Charges",
            columns: [
                { key: "chargeCode", label: "Charge Code" },
                { key: "description", label: "Desc." },
                { key: "location", label: "Location" },
                { key: "address", label: "Address" },
                { key: "first5Kilos", label: "1st 5 kilos" },
                { key: "excess5Kilos", label: "Excess in 5 Kilos" },
                { key: "first10Kilos", label: "1st 10 kilos" },
                { key: "excess10Kilos", label: "Excess in 10 Kilos" },
                { key: "fsc", label: "FSC" },
                { key: "pickAndPack", label: "Pick and pack" },
                { key: "oda", label: "ODA" },
                { key: "emergency", label: "Emergency" },
                { key: "boq", label: "BOQ" },
                { key: "currency", label: "Curr." },
                { key: "ratesForeignCurr", label: "Rates (Foreign Curr)" }
            ]
        },
        optionalCharges: {
            displayName: "Optional Charges",
            columns: [
            { key: "chargeCode", label: "Charge Code" },
            { key: "description", label: "Desc." },
            { key: "qty", label: "QTY" },
            { key: "uom", label: "UOM" },
            // { key: "isSupplies", label: "Supplies" },
            { key: "supplies", label: "Supplies" },
            { key: "currency", label: "Currency" },
            { key: "ratesForeignCurr", label: "Rates (Foreign Currency)" },
            { key: "ratesUSD", label: "Rates (USD)" },
            { key: "ratePHP", label: "Rates (PHP)" },
            { key: "rateBasis", label: "Basis" },
            { key: "total", label: "Total (PHP)" },
            // { key: "estimatedCost", label: "Est. Cost" },
            // { key: "estimatedProfit", label: "Est. Profit" }
            ]
        },
        handlingCharges: {
            displayName: "Handling Charges",
            columns: [
            { key: "chargeCode", label: "Charge Code" },
            { key: "description", label: "Description" },
            { key: "warehouseActivity", label: "Warehouse Activity" },
            { key: "temperatureRequirement", label: "Temperature" },
            { key: "qty", label: "QTY" },
            { key: "uom", label: "UOM" },
            { key: "currency", label: "Currency" },
            { key: "ratesForeignCurr", label: "Rates (Foreign Currency)" },
            { key: "ratesUSD", label: "Rates (USD)" },
            { key: "ratePHP", label: "Rates (PHP)" },
            { key: "basis", label: "Basis" }
            ]
        }
    },
    "Warehousing": {
        commodityTable: {
            displayName: "Commodities",
            columns: [
            { key: "commodity", label: "Type of Commodity" },
            { key: "location", label: "Location" },
            { key: "temperature", label: "Temperature Requirement" },
            { key: "qty", label: "Volume" },
            { key: "uom", label: "UOM" },
            { key: "description", label: "Description" },
            { key: "basis", label: "Basis" }
            ]
        },
        warehouseHandlingCharges: {
            displayName: "Handling Charges",
            columns: [
            { key: "chargeCode", label: "Charge Code" },
            { key: "description", label: "Description" },
            { key: "warehouseActivity", label: "Warehouse Activity" },
            { key: "temperatureRequirement", label: "Temperature" },
            { key: "qty", label: "QTY" },
            { key: "uom", label: "UOM" },
            { key: "currency", label: "Currency" },
            { key: "ratesForeignCurr", label: "Rates (Foreign Currency)" },
            { key: "ratesUSD", label: "Rates (USD)" },
            { key: "ratePHP", label: "Rates (PHP)" },
            { key: "rateBasis", label: "Basis" },
            { key: "total", label: "Total (PHP)" },
            // { key: "estimatedCost", label: "Est. Cost" },
            // { key: "estimatedProfit", label: "Est. Profit" }
            ]
        },
        optionalCharges: {
            displayName: "Optional Charges",
            columns: [
            { key: "chargeCode", label: "Charge Code" },
            { key: "description", label: "Description" },
            { key: "qty", label: "QTY" },
            { key: "uom", label: "UOM" },
            { key: "currency", label: "Currency" },
            { key: "ratesForeignCurr", label: "Rates (Foreign Currency)" },
            { key: "ratesUSD", label: "Rates (USD)" },
            { key: "ratePHP", label: "Rates (PHP)" },
            { key: "rateBasis", label: "Basis" },
            { key: "total", label: "Total (PHP)" },
            // { key: "estimatedCost", label: "Est. Cost" },
            // { key: "estimatedProfit", label: "Est. Profit" }
            ]
        }
    },
};

module.exports = {
    SERVICE_SECTION_CONFIG
};
/**
 * Google Apps Script for Sabarimala Temple System
 * 
 * Manages 2 Tabs in the Spreadsheet:
 * 1. "Inward Data"  -> For Inward Invoices / Donations / Seva Bookings
 * 2. "Outward Data" -> For Outward Expense Payment Vouchers
 */

// Target Spreadsheet ID (handles standalone scripts gracefully)
var SPREADSHEET_ID = "1vAZ5zr2M3mbd8pgs-MKs4muulTwUE56dVqnezIlP4QY";

function getSpreadsheet() {
  try {
    return SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.openById(SPREADSHEET_ID);
  } catch(e) {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }
}

function doGet(e) {
  var ss = getSpreadsheet();
  var result = [];

  // Helper to read rows from a sheet
  function readSheet(sheet, defaultType) {
    if (!sheet) return;
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return;

    var headers = data[0].map(function(h) { return String(h).trim().toLowerCase(); });
    
    var idIdx = headers.indexOf("id");
    var dateIdx = headers.indexOf("date");
    var timeIdx = headers.indexOf("time");
    var nameIdx = headers.indexOf("devoteename") !== -1 ? headers.indexOf("devoteename") : (headers.indexOf("receivername") !== -1 ? headers.indexOf("receivername") : headers.indexOf("name"));
    var mobileIdx = headers.indexOf("mobile");
    var sevaIdx = headers.indexOf("sevaname") !== -1 ? headers.indexOf("sevaname") : headers.indexOf("reasonforpayment");
    var amountIdx = headers.indexOf("amount");
    var payIdx = headers.indexOf("paymentmode");
    var statusIdx = headers.indexOf("status");

    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var rawId = idIdx !== -1 ? row[idIdx] : "";
      if (rawId !== "" && rawId !== undefined && rawId !== null) {
        result.push({
          id: String(rawId),
          date: dateIdx !== -1 ? row[dateIdx] : "",
          time: timeIdx !== -1 ? row[timeIdx] : "",
          devoteeName: nameIdx !== -1 ? String(row[nameIdx]) : "",
          mobile: mobileIdx !== -1 ? String(row[mobileIdx]) : "",
          sevaName: sevaIdx !== -1 ? String(row[sevaIdx]) : "",
          amount: amountIdx !== -1 ? parseFloat(row[amountIdx] || 0) : 0,
          paymentMode: payIdx !== -1 ? String(row[payIdx]) : "",
          status: statusIdx !== -1 ? String(row[statusIdx]) : "COMPLETED",
          type: defaultType
        });
      }
    }
  }

  // 1. Read Inward Data tab (or fallback to Sheet1)
  var inwardSheet = ss.getSheetByName("Inward Data") || ss.getSheetByName("Sheet1") || ss.getSheets()[0];
  readSheet(inwardSheet, "INWARD");

  // 2. Read Outward Data tab
  var outwardSheet = ss.getSheetByName("Outward Data");
  if (outwardSheet && outwardSheet.getName() !== inwardSheet.getName()) {
    readSheet(outwardSheet, "OUTWARD");
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var ss = getSpreadsheet();
  var params = e.parameter || {};
  var type = String(params.type || "INWARD").toUpperCase();

  var sheetName = (type === "OUTWARD") ? "Outward Data" : "Inward Data";
  var targetSheet = ss.getSheetByName(sheetName);

  // Auto-create sheet tab with headers if missing
  if (!targetSheet) {
    targetSheet = ss.insertSheet(sheetName);
    if (type === "OUTWARD") {
      targetSheet.appendRow(["id", "date", "time", "receiverName", "mobile", "reasonForPayment", "amount", "paymentMode", "status"]);
    } else {
      targetSheet.appendRow(["id", "date", "time", "devoteeName", "mobile", "sevaName", "amount", "paymentMode", "status"]);
    }
  }

  // Ensure headers exist if sheet is empty
  if (targetSheet.getLastRow() === 0) {
    if (type === "OUTWARD") {
      targetSheet.appendRow(["id", "date", "time", "receiverName", "mobile", "reasonForPayment", "amount", "paymentMode", "status"]);
    } else {
      targetSheet.appendRow(["id", "date", "time", "devoteeName", "mobile", "sevaName", "amount", "paymentMode", "status"]);
    }
  }

  // Calculate unique max ID for column A in this target sheet to guarantee no repeats
  var lastRow = targetSheet.getLastRow();
  var rowId = 2;
  if (lastRow >= 2) {
    var idValues = targetSheet.getRange(2, 1, lastRow - 1, 1).getValues();
    var maxVal = 1;
    for (var k = 0; k < idValues.length; k++) {
      var numVal = parseInt(idValues[k][0], 10);
      if (!isNaN(numVal) && numVal > maxVal) {
        maxVal = numVal;
      }
    }
    rowId = Math.max(maxVal + 1, lastRow + 1);
  }

  if (type === "OUTWARD") {
    targetSheet.appendRow([
      rowId,
      params.date || "",
      params.time || "",
      params.receiverName || params.devoteeName || "",
      params.mobile || "",
      params.reasonForPayment || params.sevaName || "",
      parseFloat(params.amount || 0),
      params.paymentMode || "",
      params.status || "COMPLETED"
    ]);
  } else {
    targetSheet.appendRow([
      rowId,
      params.date || "",
      params.time || "",
      params.devoteeName || "",
      params.mobile || "",
      params.sevaName || "",
      parseFloat(params.amount || 0),
      params.paymentMode || "",
      params.status || "COMPLETED"
    ]);
  }

  return ContentService.createTextOutput(JSON.stringify({ status: "success", id: rowId }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * =========================================================================
 * SAAHAS WASTE TRACKER - GOOGLE APPS SCRIPT WEBHOOK CODE
 * =========================================================================
 * 
 * Target Spreadsheet:
 * https://docs.google.com/spreadsheets/d/1qzU1bO5gylHnE31fJPJTKiN5io4eViHupq8Lu3y1PK4
 * 
 * STEP-BY-STEP INSTRUCTIONS TO ACTIVATE:
 * 1. Open the Google Sheet above.
 * 2. In the top menu bar, click: Extensions -> Apps Script.
 * 3. Delete any code in Code.gs and paste this entire file content.
 * 4. Click the "Save" icon (Floppy disk).
 * 5. In the top right corner, click "Deploy" -> "New deployment".
 * 6. Under "Select type" (gear icon), select: "Web app".
 * 7. Set:
 *    - Description: "Saahas Daily Waste Tracker API"
 *    - Execute as: "Me (your google account)"
 *    - Who has access: "Anyone" (Crucial so mobile field workers can submit without Google login prompts)
 * 8. Click "Deploy".
 * 9. Copy the generated "Web App URL" (ends in /exec).
 * 10. Open the web app -> click the Settings gear icon -> paste the URL -> Click "Save Configuration".
 * =========================================================================
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();

    // Check if sheet is blank; if so, create styled headers
    if (sheet.getLastRow() === 0) {
      var headers = [
        "Timestamp",
        "Date",
        "Layout / Area",
        "Worker Name",
        "Worker ID",
        "Total HHs Giving Waste",
        "HHs Giving Segregated Waste",
        "HHs Giving Plastic Waste",
        "HHs Giving Sanitary Waste",
        "Segregation Rate (%)",
        "Notes / Remarks"
      ];
      sheet.appendRow(headers);
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#4C9F38"); // Saahas Green
      headerRange.setFontColor("#FFFFFF");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }

    // Parse incoming data
    var data = {};
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      data = e.parameter;
    }

    var timestamp = data.timestamp || new Date().toISOString();
    var date = data.date || Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyy-MM-dd");
    var layout = data.layout || "Survagnya Nagar";
    var workerName = data.workerName || "Field Worker";
    var workerId = data.workerId || "FW-01";
    var totalHH = Number(data.totalHH || 0);
    var segregatedHH = Number(data.segregatedHH || 0);
    var plasticHH = Number(data.plasticHH || 0);
    var sanitaryHH = Number(data.sanitaryHH || 0);
    var segregationRate = totalHH > 0 ? ((segregatedHH / totalHH) * 100).toFixed(1) + "%" : "0%";
    var notes = data.notes || "";

    // Append entry as a new row
    sheet.appendRow([
      timestamp,
      date,
      layout,
      workerName,
      workerId,
      totalHH,
      segregatedHH,
      plasticHH,
      sanitaryHH,
      segregationRate,
      notes
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({
        status: "success",
        message: "Entry recorded in Google Sheet",
        row: sheet.getLastRow()
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "error",
        message: err.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: "online",
      service: "Saahas Waste Tracker API",
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

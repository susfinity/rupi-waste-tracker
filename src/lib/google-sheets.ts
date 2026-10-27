import { WasteRecord } from "@/types/waste-tracker";

export const TARGET_SHEET_ID = "1qzU1bO5gylHnE31fJPJTKiN5io4eViHupq8Lu3y1PK4";
export const TARGET_SHEET_URL = `https://docs.google.com/spreadsheets/d/${TARGET_SHEET_ID}/edit?usp=sharing`;

/**
 * The exact Google Apps Script code for the user to paste into their sheet:
 * Open Google Sheet -> Extensions -> Apps Script -> Paste -> Deploy as Web App.
 */
export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * Saahas Waste Tracker - Google Apps Script Webhook
 * Sheet: https://docs.google.com/spreadsheets/d/1qzU1bO5gylHnE31fJPJTKiN5io4eViHupq8Lu3y1PK4
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();

    // Initialize headers if sheet is empty
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
      headerRange.setBackground("#4C9F38");
      headerRange.setFontColor("#FFFFFF");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }

    // Parse JSON payload or form parameters
    var data = {};
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      data = e.parameter;
    }

    var timestamp = data.timestamp || new Date().toISOString();
    var date = data.date || Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyy-MM-dd");
    var layout = data.layout || "Survagnya Nagar";
    var workerName = data.workerName || "N/A";
    var workerId = data.workerId || "N/A";
    var totalHH = Number(data.totalHH || 0);
    var segregatedHH = Number(data.segregatedHH || 0);
    var plasticHH = Number(data.plasticHH || 0);
    var sanitaryHH = Number(data.sanitaryHH || 0);
    var segregationRate = totalHH > 0 ? ((segregatedHH / totalHH) * 100).toFixed(1) + "%" : "0%";
    var notes = data.notes || "";

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
        message: "Record added to sheet successfully",
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
      name: "Saahas Waste Tracker API",
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
`;

export async function submitWasteRecord(
  record: WasteRecord,
  customWebhookUrl?: string
): Promise<{ success: boolean; mode: "webhook" | "mock"; message?: string }> {
  try {
    const res = await fetch("/api/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        record,
        webhookUrl: customWebhookUrl || undefined,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || "Failed to submit record");
    }

    return {
      success: true,
      mode: data.mode || "webhook",
      message: data.message,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Network error";
    return {
      success: false,
      mode: "webhook",
      message,
    };
  }
}

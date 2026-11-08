import { WasteRecord } from "@/types/waste-tracker";
import { TARGET_SHEET_ID, TARGET_SHEET_URL } from "./storage";

export { TARGET_SHEET_ID, TARGET_SHEET_URL };

/**
 * Exact Google Apps Script code for the new spreadsheet:
 * Sheet: https://docs.google.com/spreadsheets/d/10OTW8vR9Yu2kmdTcFxEI5acELh0njtckUon8cKyK_8k/edit?gid=0#gid=0
 */
export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * =========================================================================
 * SAAHAS WASTE TRACKER - GOOGLE APPS SCRIPT WEBHOOK CODE
 * Constituency: Sarvagna Nagar
 * 
 * Target Spreadsheet:
 * https://docs.google.com/spreadsheets/d/10OTW8vR9Yu2kmdTcFxEI5acELh0njtckUon8cKyK_8k/edit?gid=0#gid=0
 * 
 * STEP-BY-STEP DEPLOYMENT INSTRUCTIONS:
 * 1. Open your Google Sheet above.
 * 2. In the top menu bar, click: Extensions -> Apps Script.
 * 3. Delete any default code in Code.gs and paste this entire code.
 * 4. Click the "Save" icon (Floppy disk).
 * 5. In the top right corner, click "Deploy" -> "New deployment".
 * 6. Under "Select type" (gear icon), select: "Web app".
 * 7. Set:
 *    - Description: "Saahas Waste Tracker API - Sarvagna Nagar"
 *    - Execute as: "Me (your Google account)"
 *    - Who has access: "Anyone" (Crucial so field supervisors can submit without login popups)
 * 8. Click "Deploy".
 * 9. Copy the generated "Web App URL" (ends in /exec).
 * 10. In the web app, click Settings (gear icon) -> paste the URL -> Click "Save Configuration".
 * =========================================================================
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(15000);

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();

    // Column Headers (Without segregation rate as requested)
    var headers = [
      "Timestamp",
      "Date",
      "Constituency",
      "Ward No & Name",
      "Route / Block",
      "Collection Point",
      "Field Supervisor Name",
      "HHs Giving Waste",
      "HHs Giving Seg Wet Waste",
      "HHs Giving Dry Waste",
      "HHs Giving Sanitary Waste",
      "HHs Giving Special Care Waste",
      "HHs Giving Mixed Waste",
      "Remarks"
    ];

    // If sheet is empty, create formatted headers
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#4C9F38"); // Saahas Green
      headerRange.setFontColor("#FFFFFF");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }

    // Parse incoming payload
    var data = {};
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      data = e.parameter;
    }

    // Support single record or batch records array
    var records = [];
    if (data.records && Array.isArray(data.records)) {
      records = data.records;
    } else {
      records = [data];
    }

    var rows = [];
    for (var i = 0; i < records.length; i++) {
      var item = records[i];
      var timestamp = item.timestamp || new Date().toISOString();
      var date = item.date || Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyy-MM-dd");
      var constituency = item.constituency || "Sarvagna Nagar";
      var ward = item.ward || "";
      var route = item.route || "";
      var pointName = item.pointName || "Point 1";
      var supervisorName = item.supervisorName || "Field Supervisor";
      var givingWaste = Number(item.givingWasteHH || item.totalHH || 0);
      var segWet = Number(item.segregatedHH || 0);
      var dry = Number(item.dryHH || item.plasticHH || 0);
      var sanitary = Number(item.sanitaryHH || 0);
      var specialCare = Number(item.specialCareHH || 0);
      var mixed = Number(item.mixedHH || 0);
      var remarks = item.remarks || item.notes || "";

      rows.push([
        timestamp,
        date,
        constituency,
        ward,
        route,
        pointName,
        supervisorName,
        givingWaste,
        segWet,
        dry,
        sanitary,
        specialCare,
        mixed,
        remarks
      ]);
    }

    if (rows.length > 0) {
      var nextRow = sheet.getLastRow() + 1;
      var range = sheet.getRange(nextRow, 1, rows.length, headers.length);
      range.setValues(rows);
    }

    return ContentService
      .createTextOutput(JSON.stringify({
        status: "success",
        message: "Recorded " + rows.length + " collection point entries in Google Sheet",
        rowCount: sheet.getLastRow()
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
      service: "Saahas Waste Tracker API (Sarvagna Nagar)",
      sheet: "https://docs.google.com/spreadsheets/d/10OTW8vR9Yu2kmdTcFxEI5acELh0njtckUon8cKyK_8k",
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
`;

export async function submitWasteRecords(
  records: WasteRecord[],
  customWebhookUrl?: string
): Promise<{ success: boolean; mode: "webhook" | "mock"; message?: string }> {
  try {
    const res = await fetch("/api/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        records,
        webhookUrl: customWebhookUrl || undefined,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || "Failed to submit records");
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

export async function submitWasteRecord(
  record: WasteRecord,
  customWebhookUrl?: string
): Promise<{ success: boolean; mode: "webhook" | "mock"; message?: string }> {
  return submitWasteRecords([record], customWebhookUrl);
}

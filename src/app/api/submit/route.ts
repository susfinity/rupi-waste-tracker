import { NextRequest, NextResponse } from "next/server";

const DEFAULT_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzFEQRHTk6EeqIhh52CIcpdx1RcmR15zJt1DQjd86pOM54nfS1OgLF7Hd72stCLJoAMUA/exec";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { record, webhookUrl } = body;

    if (!record) {
      return NextResponse.json(
        { success: false, message: "Missing record data" },
        { status: 400 }
      );
    }

    // Determine webhook URL: either passed from client, or from server env, or fallback default
    const targetUrl =
      webhookUrl || process.env.GOOGLE_APPS_SCRIPT_URL || DEFAULT_APPS_SCRIPT_URL;

    // If no webhook URL is configured yet, gracefully return mock success
    if (!targetUrl || targetUrl.trim() === "") {
      return NextResponse.json({
        success: true,
        mode: "mock",
        message: "Saved in Local Preview Mode. Connect Google Sheet Webhook in Settings for live cloud sync.",
      });
    }

    // Send payload to Google Apps Script Web App
    const payload = {
      timestamp: record.timestamp,
      date: record.date,
      layout: record.layout,
      workerName: record.workerName,
      workerId: record.workerId,
      totalHH: record.totalHH,
      segregatedHH: record.segregatedHH,
      plasticHH: record.plasticHH,
      sanitaryHH: record.sanitaryHH,
      notes: record.notes || "",
    };

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      redirect: "follow",
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        {
          success: false,
          mode: "webhook",
          message: `Google Sheets responded with error (${response.status}): ${errText.slice(0, 200)}`,
        },
        { status: 502 }
      );
    }

    const result = await response.json().catch(() => ({ status: "success" }));

    return NextResponse.json({
      success: true,
      mode: "webhook",
      message: result.message || "Entry uploaded to Google Sheet successfully",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("API submit error:", error);
    return NextResponse.json(
      { success: false, mode: "webhook", message },
      { status: 500 }
    );
  }
}

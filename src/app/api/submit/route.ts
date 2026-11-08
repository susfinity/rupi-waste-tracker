import { NextRequest, NextResponse } from "next/server";

const DEFAULT_APPS_SCRIPT_URL =
  process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL ||
  "https://script.google.com/macros/s/AKfycbx_GtgYlJ7El9rQMYysK9dfu3--jVbUZG7MWtwYb8NVQseF2PPWzSZ7k8KSFNxO5D7m/exec";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { record, records, webhookUrl } = body;

    const items = records ? records : record ? [record] : [];

    if (items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Missing record data" },
        { status: 400 }
      );
    }

    const targetUrl =
      webhookUrl || process.env.GOOGLE_APPS_SCRIPT_URL || DEFAULT_APPS_SCRIPT_URL;

    if (!targetUrl || targetUrl.trim() === "") {
      return NextResponse.json({
        success: true,
        mode: "mock",
        message: "Saved in Local Preview Mode. Connect Google Sheet Webhook in Settings for live cloud sync.",
      });
    }

    // Format payload items
    const payloadItems = items.map((rec: any) => ({
      timestamp: rec.timestamp || new Date().toISOString(),
      date: rec.date,
      constituency: rec.constituency || "Sarvagna Nagar",
      ward: rec.ward,
      route: rec.route,
      pointName: rec.pointName,
      supervisorName: rec.supervisorName,
      givingWasteHH: Number(rec.givingWasteHH || 0),
      segregatedHH: Number(rec.segregatedHH || 0),
      dryHH: Number(rec.dryHH || 0),
      sanitaryHH: Number(rec.sanitaryHH || 0),
      specialCareHH: Number(rec.specialCareHH || 0),
      mixedHH: Number(rec.mixedHH || 0),
      remarks: rec.remarks || "",
    }));

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payloadItems.length === 1 ? payloadItems[0] : { records: payloadItems }),
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
      message: result.message || "Entries uploaded to Google Sheet successfully",
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

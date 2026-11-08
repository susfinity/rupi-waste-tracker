# Saahas Daily Waste Tracker (Sarvagna Nagar)

A mobile-first web application designed for on-field waste collection supervisors and coordinators at **Saahas**. The app replaces error-prone paper tally sheets with a high-contrast, touch-optimized daily recorder that uploads directly to Google Sheets.

Built for **Vercel** deployment with Next.js 16 (App Router), TypeScript, and Tailwind CSS. Adheres to the brand guidelines of [saahas.org](https://saahas.org/).

Live deployment: [https://rupi-waste-tracker.vercel.app/](https://rupi-waste-tracker.vercel.app/)

---

## 🌟 Administrative Structure & Hierarchy

* **Constituency**: **Sarvagna Nagar** (ಸರ್ವಜ್ಞ ನಗರ)
* **Wards**:
  * **Ward 28 - Kammanahalli** (ಕಮ್ಮನಹಳ್ಳಿ)
  * **Ward 29 - Kacharakanahalli** (ಕಾಚರಕನಹಳ್ಳಿ)
* **Routes / Blocks**:
  * *Under Ward 28*:
    1. Janaki Ram Layout - Route 1
    2. Janaki Ram Layout - Route 2
  * *Under Ward 29*:
    1. AK Colony - Route 1
    2. AK Colony - Route 2
* **Collection Points**:
  * Default 6 collection points (`Point 1` to `Point 6`) per route.
  * Option for the Field Supervisor to add more collection points (`+ Add Point`) as needed.

---

## 📊 6 Waste Data Collection Streams & Color Codes

Matches the exact spreadsheet styling:

1. **HHs Giving Waste** (ಒಟ್ಟು ತ್ಯಾಜ್ಯ ನೀಡಿದ ಮನೆಗಳು) — Cream (`#FFF2CC`)
2. **HHs Giving Segregated Wastes** (ವಿಂಗಡಿಸಲಾದ ಹಸಿ ತ್ಯಾಜ್ಯ ನೀಡಿದ ಮನೆಗಳು) — Pastel Green (`#D9EAD3`)
3. **HHs Giving Dry Waste** (ಒಣ ತ್ಯಾಜ್ಯ ನೀಡಿದ ಮನೆಗಳು) — Sky Blue (`#C9DAF8`)
4. **HHs Giving Sanitary Waste** (ಸ್ಯಾನಿಟರಿ ತ್ಯಾಜ್ಯ ನೀಡಿದ ಮನೆಗಳು) — Coral Salmon (`#E69185`)
5. **HHs Giving Special Care Waste** (ವಿಶೇಷ ಕಾಳಜಿ ತ್ಯಾಜ್ಯ ನೀಡಿದ ಮನೆಗಳು) — Slate Grey (`#B7B7B7`)
6. **HHs Giving Mixed Waste** (ಮಿಶ್ರ ತ್ಯಾಜ್ಯ ನೀಡಿದ ಮನೆಗಳು) — Crimson Brick Red (`#CC4125`)

---

## 🔄 Sequential Field Workflow

1. Field Supervisor logs in once with **Name (ಹೆಸರು)**, **Ward**, and **Route / Block** (routes assigned to the supervisor can be switched daily).
2. Supervisor starts at **Point 1**, records counts, and taps **Save & Next: Point 2 (ಉಳಿಸಿ ಮುಂದಕ್ಕೆ)**.
3. Steps sequentially through all collection points.
4. Taps **Review & Submit Whole Day** to inspect the aggregate totals and granular points table before final upload to Google Sheets.

---

## 📈 Coordinator Daily Dashboard

* **Constituency Level**: Total visited households and counts for all 6 waste categories.
* **Ward-Wise Breakdown**: Side-by-side comparison of Ward 28 vs Ward 29.
* **Route-Wise Breakdown**: Detailed summary for each active route.
* **Granular Collection Point Inspector**: Click to expand and inspect point-by-point data with remarks.

---

## 📋 Google Sheets Webhook Deployment

Target Spreadsheet: [`Daily Waste tracker (web app) - Google Sheets`](https://docs.google.com/spreadsheets/d/10OTW8vR9Yu2kmdTcFxEI5acELh0njtckUon8cKyK_8k/edit?gid=0#gid=0)

1. Open the spreadsheet above.
2. Click **Extensions > Apps Script**.
3. Copy the script from `google_apps_script.js` and paste it into `Code.gs`.
4. Click **Save** (Floppy disk icon).
5. Click **Deploy > New deployment**:
   - Type: **Web app**
   - Description: `Saahas Waste Tracker API - Sarvagna Nagar`
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Click **Deploy** and copy the **Web App URL** (ends in `/exec`).
7. In the web app, tap the **Settings (gear icon)** at the top right, paste the URL, and click **Save Configuration**.

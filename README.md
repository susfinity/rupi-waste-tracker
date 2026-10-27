# Saahas Daily Waste Tracker (Field Web App)

A mobile-first web application designed for on-field waste collection workers and supervisors at **Saahas**. The app replaces error-prone paper tally sheets with a high-contrast, touch-optimized daily recorder that uploads directly to Google Sheets.

Built for **Vercel** deployment with Next.js 16 (App Router), TypeScript, and Tailwind CSS. Adheres to the brand guidelines of [saahas.org](https://saahas.org/).

---

## 🌟 Key Features

1. **Zero-Friction Daily Entry**:
   - **4 Core Metrics**:
     - Daily households (HHs) giving waste
     - HHs giving segregated waste (with live % segregation indicator)
     - HHs giving plastic wastes
     - HHs giving sanitary wastes
   - **Area / Layout Switcher**:
     - `Survagnya Nagar` (ಸರ್ವಜ್ಞ ನಗರ)
     - `Layout 1` (ಲೇಔಟ್ 1)
     - `Layout 2` (ಲೇಔಟ್ 2)
   - **Bilingual Context**: English labels accompanied by Kannada subtitles for Bengaluru field staff.

2. **Automatic Default Login**:
   - As requested, workers set their Name and Worker ID once. The app remembers their credentials on their phone for every subsequent visit.

3. **Built-in Error Reduction**:
   - Logical sanity checks prevent typos (e.g. Segregated HHs cannot exceed Total HHs).
   - "Review & Confirm" modal displays a high-contrast summary sheet before final submission.
   - Quick increment stepper buttons (`+1`, `+5`, `+10`, `+50`) and direct numeric keypad entry.

4. **Offline Resilience & Queue**:
   - When field workers lose internet connectivity, records are automatically queued in local storage (`Pending Sync`).
   - 1-click sync uploads pending entries once network connectivity resumes.

5. **Coordinator Daily Dashboard**:
   - Real-time aggregation of today's total households visited, average segregation rate, and layout-by-layout performance comparison.

6. **Target Google Sheets Integration**:
   - Target Sheet: [`Waste tracker (web app)`](https://docs.google.com/spreadsheets/d/1qzU1bO5gylHnE31fJPJTKiN5io4eViHupq8Lu3y1PK4/edit?usp=sharing)
   - Synchronizes via Google Apps Script Webhook.

---

## 🚀 Quick Setup & Local Run

```bash
# 1. Install dependencies
npm install

# 2. Run development server
npm run dev

# 3. Open in your browser
http://localhost:3000
```

---

## ☁️ Deploying to Vercel

1. Push this repository to GitHub or GitLab.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Select your repository.
4. (Optional) In **Environment Variables**, set:
   - `GOOGLE_APPS_SCRIPT_URL`: Your deployed Google Apps Script URL.
5. Click **Deploy**. Vercel will build and deploy the Next.js app in under 1 minute.

---

## 📊 Connecting the Google Sheet (2 Minutes)

1. Open the [Google Sheet](https://docs.google.com/spreadsheets/d/1qzU1bO5gylHnE31fJPJTKiN5io4eViHupq8Lu3y1PK4/edit?usp=sharing).
2. Click **Extensions > Apps Script**.
3. Copy the script from `google_apps_script.js` (or copy it directly inside the app's Settings modal) and paste it into `Code.gs`.
4. Click **Save** (Floppy icon).
5. Click **Deploy > New deployment**:
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Click **Deploy** and copy the resulting **Web App URL** (ends in `/exec`).
7. In the web app, tap the **Settings (gear icon)** at the top right, paste the URL, and click **Save Configuration**.

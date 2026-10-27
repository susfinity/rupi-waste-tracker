"use client";

import React, { useState, useEffect } from "react";
import {
  Home,
  Recycle,
  Package,
  ShieldCheck,
  Send,
  Sparkles,
  FileText,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { Header } from "@/components/Header";
import { LayoutSelector } from "@/components/LayoutSelector";
import { NumberCounterCard } from "@/components/NumberCounterCard";
import { ReviewModal } from "@/components/ReviewModal";
import { WorkerLoginModal } from "@/components/WorkerLoginModal";
import { GoogleSheetSetupModal } from "@/components/GoogleSheetSetupModal";
import { RecentSubmissions } from "@/components/RecentSubmissions";
import { CoordinatorSummary } from "@/components/CoordinatorSummary";
import {
  WorkerProfile,
  WasteRecord,
  WasteRecordInput,
  LayoutOption,
} from "@/types/waste-tracker";
import {
  DEFAULT_WORKER,
  getStoredWorkerProfile,
  saveWorkerProfile,
  getStoredHistory,
  addRecordToHistory,
  getPendingQueue,
  addToPendingQueue,
  removeFromPendingQueue,
  getStoredWebhookUrl,
} from "@/lib/storage";
import { submitWasteRecord } from "@/lib/google-sheets";

const QUICK_NOTES = [
  "All households covered",
  "Awareness on segregation done",
  "Rain delayed collection",
  "Some houses locked",
];

export default function WasteTrackerApp() {
  // Worker Profile State
  const [worker, setWorker] = useState<WorkerProfile>(DEFAULT_WORKER);
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<"form" | "history" | "summary">("form");

  // Form State
  const [date, setDate] = useState<string>("");
  const [layout, setLayout] = useState<LayoutOption>("Survagnya Nagar");
  const [totalHH, setTotalHH] = useState<number>(0);
  const [segregatedHH, setSegregatedHH] = useState<number>(0);
  const [plasticHH, setPlasticHH] = useState<number>(0);
  const [sanitaryHH, setSanitaryHH] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");

  // Submissions & Queue State
  const [history, setHistory] = useState<WasteRecord[]>([]);
  const [pendingQueue, setPendingQueue] = useState<WasteRecord[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "success" | "error" | "info";
  } | null>(null);

  // Load Initial Data & Online listener
  useEffect(() => {
    const today = (() => {
      const d = new Date();
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    })();
    setDate(today);

    // 1. Worker Profile
    const savedProfile = getStoredWorkerProfile();
    if (savedProfile) {
      setWorker(savedProfile);
      if (savedProfile.defaultLayout) {
        setLayout(savedProfile.defaultLayout);
      }
    } else {
      // First time user: open modal to enter their name & ID
      setIsWorkerModalOpen(true);
    }

    // 2. Submissions History & Pending Queue
    setHistory(getStoredHistory());
    setPendingQueue(getPendingQueue());

    // 3. Online status
    setIsOnline(typeof navigator !== "undefined" ? navigator.onLine : true);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // 4. Restore active draft if available
    try {
      const draft = localStorage.getItem("saahas_waste_tracker_draft");
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed.date === today) {
          setTotalHH(parsed.totalHH || 0);
          setSegregatedHH(parsed.segregatedHH || 0);
          setPlasticHH(parsed.plasticHH || 0);
          setSanitaryHH(parsed.sanitaryHH || 0);
          if (parsed.layout) setLayout(parsed.layout);
          if (parsed.notes) setNotes(parsed.notes);
        }
      }
    } catch (e) {
      console.error(e);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Auto-save form draft to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const draft = {
        date,
        layout,
        totalHH,
        segregatedHH,
        plasticHH,
        sanitaryHH,
        notes,
      };
      localStorage.setItem("saahas_waste_tracker_draft", JSON.stringify(draft));
    }
  }, [date, layout, totalHH, segregatedHH, plasticHH, sanitaryHH, notes]);

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSaveProfile = (profile: WorkerProfile) => {
    setWorker(profile);
    saveWorkerProfile(profile);
    if (profile.defaultLayout) {
      setLayout(profile.defaultLayout);
    }
    showToast(`Logged in as ${profile.name} (${profile.workerId})`, "success");
  };

  // Reset form numbers
  const handleResetForm = () => {
    if (window.confirm("Are you sure you want to reset all counts to 0? (ಎಲ್ಲಾ ಸಂಖ್ಯೆಗಳನ್ನು 0 ಗೆ ಮರುಹೊಂದಿಸಬೇಕೇ?)")) {
      setTotalHH(0);
      setSegregatedHH(0);
      setPlasticHH(0);
      setSanitaryHH(0);
      setNotes("");
      if (typeof window !== "undefined") {
        localStorage.removeItem("saahas_waste_tracker_draft");
      }
    }
  };

  // Submit Record
  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);

    const calculatedRate =
      totalHH > 0 ? parseFloat(((segregatedHH / totalHH) * 100).toFixed(1)) : 0;

    const newRecord: WasteRecord = {
      id: "rec_" + Date.now(),
      timestamp: new Date().toISOString(),
      date,
      layout,
      workerName: worker.name,
      workerId: worker.workerId,
      totalHH,
      segregatedHH,
      plasticHH,
      sanitaryHH,
      notes: notes.trim(),
      segregationRate: calculatedRate,
      syncStatus: "pending",
    };

    const webhookUrl = getStoredWebhookUrl();

    // If offline, directly queue
    if (!navigator.onLine) {
      addToPendingQueue(newRecord);
      setPendingQueue(getPendingQueue());
      setIsReviewModalOpen(false);
      setIsSubmitting(false);
      showToast("Offline: Entry saved to Pending Queue. Will sync once connected.", "info");
      // Reset form
      setTotalHH(0);
      setSegregatedHH(0);
      setPlasticHH(0);
      setSanitaryHH(0);
      setNotes("");
      localStorage.removeItem("saahas_waste_tracker_draft");
      return;
    }

    try {
      const result = await submitWasteRecord(newRecord, webhookUrl);

      if (result.success) {
        newRecord.syncStatus = result.mode === "mock" ? "mock" : "synced";
        addRecordToHistory(newRecord);
        setHistory(getStoredHistory());

        setIsReviewModalOpen(false);
        showToast(
          result.mode === "mock"
            ? "Saved in Preview Mode! Connect Webhook in Settings for live cloud sync."
            : "Successfully uploaded to Google Sheets! (ದಾಖಲಿಸಲಾಗಿದೆ)",
          "success"
        );

        // Reset form
        setTotalHH(0);
        setSegregatedHH(0);
        setPlasticHH(0);
        setSanitaryHH(0);
        setNotes("");
        localStorage.removeItem("saahas_waste_tracker_draft");
      } else {
        // Failed to send, queue for retry
        addToPendingQueue(newRecord);
        setPendingQueue(getPendingQueue());
        setIsReviewModalOpen(false);
        showToast(result.message || "Failed to reach Google Sheet. Saved to Pending Queue.", "error");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error saving";
      addToPendingQueue(newRecord);
      setPendingQueue(getPendingQueue());
      setIsReviewModalOpen(false);
      showToast(`Error: ${msg}. Saved to Pending Queue.`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sync Pending Queue
  const handleSyncAllPending = async () => {
    if (pendingQueue.length === 0 || isSyncing) return;
    setIsSyncing(true);

    const webhookUrl = getStoredWebhookUrl();
    let successCount = 0;

    for (const record of pendingQueue) {
      try {
        const res = await submitWasteRecord(record, webhookUrl);
        if (res.success) {
          removeFromPendingQueue(record.id);
          record.syncStatus = "synced";
          addRecordToHistory(record);
          successCount++;
        }
      } catch (err) {
        console.error("Failed to sync record", record.id, err);
      }
    }

    setPendingQueue(getPendingQueue());
    setHistory(getStoredHistory());
    setIsSyncing(false);

    if (successCount > 0) {
      showToast(`Synced ${successCount} entries to Google Sheets!`, "success");
    } else {
      showToast("Sync failed. Check your internet connection or webhook settings.", "error");
    }
  };

  // Live Segregation Rate
  const liveSegregationRate =
    totalHH > 0 ? ((segregatedHH / totalHH) * 100).toFixed(1) : "0.0";

  // Sanity check
  const hasErrors =
    totalHH <= 0 ||
    segregatedHH > totalHH ||
    plasticHH > totalHH ||
    sanitaryHH > totalHH;

  const currentFormInput: WasteRecordInput = {
    date,
    layout,
    workerName: worker.name,
    workerId: worker.workerId,
    totalHH,
    segregatedHH,
    plasticHH,
    sanitaryHH,
    notes,
  };

  return (
    <div className="min-h-full flex flex-col bg-[#F8F9F5]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-sm animate-in fade-in slide-in-from-top-4 duration-200">
          <div
            className={`px-4 py-3 rounded-2xl shadow-lg border text-xs font-bold flex items-center gap-2 ${
              toastMessage.type === "success"
                ? "bg-[#187547] text-white border-[#27945E]"
                : toastMessage.type === "error"
                ? "bg-[#D9381E] text-white border-red-500"
                : "bg-[#1F4514] text-white border-[#3E7D2D]"
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span className="flex-1">{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Header Component */}
      <Header
        worker={worker}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenWorkerModal={() => setIsWorkerModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        pendingCount={pendingQueue.length}
        onSyncPending={handleSyncAllPending}
        isOnline={isOnline}
        isSyncing={isSyncing}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 py-4 space-y-4 pb-28">
        {/* TAB 1: FORM */}
        {activeTab === "form" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Layout & Date Selector */}
            <LayoutSelector
              selectedLayout={layout}
              onSelectLayout={setLayout}
              selectedDate={date}
              onSelectDate={setDate}
              maxDate={date}
            />

            {/* FIELD 1: Total Households */}
            <NumberCounterCard
              id="totalHH"
              title="1. Total HHs Giving Waste"
              kannadaTitle="ಒಟ್ಟು ತ್ಯಾಜ್ಯ ನೀಡಿದ ಮನೆಗಳು"
              value={totalHH}
              onChange={setTotalHH}
              themeColor="green"
              icon={<Home className="w-4 h-4" />}
            />

            {/* FIELD 2: Segregated Households */}
            <NumberCounterCard
              id="segregatedHH"
              title="2. HHs Giving Segregated Waste"
              kannadaTitle="ವಿಂಗಡಿಸಲಾದ ತ್ಯಾಜ್ಯ ನೀಡಿದ ಮನೆಗಳು"
              value={segregatedHH}
              onChange={setSegregatedHH}
              themeColor="emerald"
              icon={<Recycle className="w-4 h-4" />}
              maxLimit={totalHH}
              showQuickMax={true}
              badgeText={`${liveSegregationRate}% Segregated`}
            />

            {/* FIELD 3: Plastic Waste */}
            <NumberCounterCard
              id="plasticHH"
              title="3. HHs Giving Plastic Wastes"
              kannadaTitle="ಪ್ಲಾಸ್ಟಿಕ್ ತ್ಯಾಜ್ಯ ನೀಡಿದ ಮನೆಗಳು"
              value={plasticHH}
              onChange={setPlasticHH}
              themeColor="blue"
              icon={<Package className="w-4 h-4" />}
              maxLimit={totalHH}
            />

            {/* FIELD 4: Sanitary Waste */}
            <NumberCounterCard
              id="sanitaryHH"
              title="4. HHs Giving Sanitary Wastes"
              kannadaTitle="ಸ್ಯಾನಿಟರಿ ತ್ಯಾಜ್ಯ ನೀಡಿದ ಮನೆಗಳು"
              value={sanitaryHH}
              onChange={setSanitaryHH}
              themeColor="amber"
              icon={<ShieldCheck className="w-4 h-4" />}
              maxLimit={totalHH}
            />

            {/* Optional Notes Section */}
            <div className="bg-white rounded-2xl p-4 border border-[#E1EAD9] shadow-xs space-y-2.5">
              <label className="text-xs font-bold text-[#192613] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#4C9F38]" />
                  <span>Field Notes / Remarks</span>
                </span>
                <span className="text-[10px] font-normal text-[#7A8E74]">
                  ಐಚ್ಛಿಕ (Optional)
                </span>
              </label>

              {/* Quick Note Chips */}
              <div className="flex flex-wrap gap-1.5">
                {QUICK_NOTES.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setNotes((prev) => (prev ? `${prev}, ${chip}` : chip))}
                    className="text-[11px] font-semibold bg-[#F4F8F1] hover:bg-[#EAF3E4] text-[#345927] border border-[#D5E6CF] px-2.5 py-1 rounded-full transition"
                  >
                    + {chip}
                  </button>
                ))}
              </div>

              <textarea
                rows={2}
                placeholder="Any roadblocks, awareness held, or remarks..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs p-2.5 bg-[#F9FAF6] border border-[#CFDFC5] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#4C9F38]"
              />
            </div>

            {/* Reset Form button */}
            {(totalHH > 0 || segregatedHH > 0 || plasticHH > 0 || sanitaryHH > 0) && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="text-xs font-bold text-[#8A9C84] hover:text-[#B33B14] flex items-center gap-1 py-1 px-2 rounded-lg transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Fields (ಮರುಹೊಂದಿಸಿ)</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: HISTORY */}
        {activeTab === "history" && (
          <div className="animate-in fade-in duration-150">
            <RecentSubmissions
              records={history}
              pendingRecords={pendingQueue}
              onSyncAllPending={handleSyncAllPending}
              isSyncing={isSyncing}
            />
          </div>
        )}

        {/* TAB 3: COORDINATOR SUMMARY */}
        {activeTab === "summary" && (
          <div className="animate-in fade-in duration-150">
            <CoordinatorSummary records={[...pendingQueue, ...history]} />
          </div>
        )}
      </main>

      {/* Floating Bottom Action Bar (When in Form tab) */}
      {activeTab === "form" && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#E3EBDC] p-3 shadow-lg">
          <div className="max-w-md mx-auto flex items-center gap-2">
            <button
              type="button"
              disabled={hasErrors}
              onClick={() => setIsReviewModalOpen(true)}
              className="flex-1 py-3.5 px-4 bg-gradient-to-r from-[#4C9F38] via-[#3E8D2C] to-[#347823] hover:from-[#3F872C] hover:to-[#2B681C] text-white font-extrabold rounded-2xl text-sm flex items-center justify-center gap-2 shadow-md disabled:opacity-40 disabled:pointer-events-none active:scale-98 transition"
            >
              <Send className="w-4 h-4" />
              <span>Review & Submit Record (ಪರಿಶೀಲಿಸಿ)</span>
            </button>
          </div>
          {totalHH === 0 && (
            <p className="text-[11px] text-center text-[#7F937B] mt-1 font-medium">
              Enter total households visited to submit
            </p>
          )}
        </div>
      )}

      {/* Modals */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        data={currentFormInput}
        onConfirmSubmit={handleConfirmSubmit}
        isSubmitting={isSubmitting}
      />

      <WorkerLoginModal
        isOpen={isWorkerModalOpen}
        onClose={() => setIsWorkerModalOpen(false)}
        currentProfile={worker}
        onSaveProfile={handleSaveProfile}
      />

      <GoogleSheetSetupModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onWebhookUpdated={() => {
          showToast("Webhook URL updated successfully!", "success");
        }}
      />
    </div>
  );
}

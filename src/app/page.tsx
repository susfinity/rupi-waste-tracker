"use client";

import React, { useState, useEffect } from "react";
import {
  Home,
  Recycle,
  Package,
  ShieldCheck,
  AlertTriangle,
  Send,
  Sparkles,
  FileText,
  RotateCcw,
  ArrowRight,
  Flame,
} from "lucide-react";
import { Header } from "@/components/Header";
import { RoutePointSelector } from "@/components/RoutePointSelector";
import { NumberCounterCard } from "@/components/NumberCounterCard";
import { ReviewModal } from "@/components/ReviewModal";
import { WorkerLoginModal } from "@/components/WorkerLoginModal";
import { GoogleSheetSetupModal } from "@/components/GoogleSheetSetupModal";
import { CoordinatorSummary } from "@/components/CoordinatorSummary";
import {
  WorkerProfile,
  WasteRecord,
  WardOption,
  RouteOption,
  CollectionPointEntry,
  CONSTITUENCY_NAME,
  WARD_ROUTES,
  getWardForRoute,
} from "@/types/waste-tracker";
import {
  DEFAULT_WORKER,
  getStoredWorkerProfile,
  saveWorkerProfile,
  getStoredHistory,
  addRecordsToHistory,
  getPendingQueue,
  addToPendingQueue,
  removeFromPendingQueue,
  getStoredWebhookUrl,
  getStoredDailyDraft,
  saveDailyDraft,
  clearDailyDraft,
  getLastProfilePromptDate,
  saveLastProfilePromptDate,
} from "@/lib/storage";
import { submitWasteRecords } from "@/lib/google-sheets";

const INITIAL_POINTS = ["Point 1", "Point 2", "Point 3", "Point 4", "Point 5", "Point 6"];

function createEmptyPoint(pointName: string): CollectionPointEntry {
  return {
    pointName,
    givingWasteHH: 0,
    segregatedHH: 0,
    dryHH: 0,
    sanitaryHH: 0,
    specialCareHH: 0,
    mixedHH: 0,
    remarks: "",
    isCompleted: false,
  };
}

export default function WasteTrackerApp() {
  // Supervisor Profile State
  const [worker, setWorker] = useState<WorkerProfile>(DEFAULT_WORKER);
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Tab State (Only 2 tabs: form and summary)
  const [activeTab, setActiveTab] = useState<"form" | "summary">("form");

  // Daily Hierarchy State
  const [date, setDate] = useState<string>("");
  const [ward, setWard] = useState<WardOption>("Ward 28 - Kammanahalli");
  const [route, setRoute] = useState<RouteOption>("Janaki Ram Layout - Route 1");
  const [collectionPoints, setCollectionPoints] = useState<string[]>(INITIAL_POINTS);
  const [activePointIndex, setActivePointIndex] = useState<number>(0);
  const [pointsData, setPointsData] = useState<CollectionPointEntry[]>(() =>
    INITIAL_POINTS.map(createEmptyPoint)
  );

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

  // Load Initial Data & Daily First-Visit Check
  useEffect(() => {
    const today = (() => {
      const d = new Date();
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    })();
    setDate(today);

    // 1. Supervisor Profile & Daily First-Visit Modal
    const savedProfile = getStoredWorkerProfile();
    if (savedProfile) {
      setWorker(savedProfile);
      const w = savedProfile.assignedWard || "Ward 28 - Kammanahalli";
      setWard(w);
      const validRoutes = WARD_ROUTES[w];
      setRoute(validRoutes.includes(savedProfile.assignedRoute) ? savedProfile.assignedRoute : validRoutes[0]);
    }

    // Check if user has already visited/confirmed profile today
    const lastPromptDate = getLastProfilePromptDate();
    if (lastPromptDate !== today) {
      // First visit of the day -> Pop up profile modal so supervisor can confirm/update today's route
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

    // 4. Restore active daily draft if available
    const savedDraft = getStoredDailyDraft();
    if (savedDraft && savedDraft.date === today) {
      const draftWard = savedDraft.ward || "Ward 28 - Kammanahalli";
      setWard(draftWard);
      const validRoutes = WARD_ROUTES[draftWard];
      setRoute(validRoutes.includes(savedDraft.route) ? savedDraft.route : validRoutes[0]);

      if (savedDraft.points && savedDraft.points.length > 0) {
        setPointsData(savedDraft.points);
        setCollectionPoints(savedDraft.points.map((p) => p.pointName));
      }
      if (typeof savedDraft.activePointIndex === "number") {
        setActivePointIndex(savedDraft.activePointIndex);
      }
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Auto-save form draft to localStorage
  useEffect(() => {
    if (date) {
      saveDailyDraft({
        date,
        ward,
        route,
        activePointIndex,
        points: pointsData,
      });
    }
  }, [date, ward, route, activePointIndex, pointsData]);

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSelectWard = (newWard: WardOption) => {
    setWard(newWard);
    const validRoutes = WARD_ROUTES[newWard];
    if (!validRoutes.includes(route)) {
      setRoute(validRoutes[0]);
    }
  };

  const handleSelectRoute = (newRoute: RouteOption) => {
    setRoute(newRoute);
    setWard(getWardForRoute(newRoute));
  };

  const handleSaveProfile = (profile: WorkerProfile) => {
    setWorker(profile);
    saveWorkerProfile(profile);
    setWard(profile.assignedWard);
    setRoute(profile.assignedRoute);
    if (date) {
      saveLastProfilePromptDate(date);
    }
    showToast(`Logged in as ${profile.name} (${profile.assignedRoute})`, "success");
  };

  // Add more collection points (Point 7, 8...)
  const handleAddPoint = () => {
    const nextNumber = collectionPoints.length + 1;
    const newPointName = `Point ${nextNumber}`;
    const updatedNames = [...collectionPoints, newPointName];
    const updatedData = [...pointsData, createEmptyPoint(newPointName)];
    setCollectionPoints(updatedNames);
    setPointsData(updatedData);
    setActivePointIndex(updatedNames.length - 1);
    showToast(`Added ${newPointName}!`, "info");
  };

  // Current active point getters and updaters
  const currentPoint = pointsData[activePointIndex] || createEmptyPoint(collectionPoints[activePointIndex] || "Point 1");

  const updateCurrentPointField = <K extends keyof CollectionPointEntry>(
    field: K,
    value: CollectionPointEntry[K]
  ) => {
    setPointsData((prev) => {
      const next = [...prev];
      next[activePointIndex] = {
        ...next[activePointIndex],
        [field]: value,
      };
      return next;
    });
  };

  // Check if a point has any data entered
  const isPointFilled = (point: CollectionPointEntry) => {
    return (
      (point.givingWasteHH || 0) > 0 ||
      (point.segregatedHH || 0) > 0 ||
      (point.dryHH || 0) > 0 ||
      (point.sanitaryHH || 0) > 0 ||
      (point.specialCareHH || 0) > 0 ||
      (point.mixedHH || 0) > 0
    );
  };

  const completedPointsMap = pointsData.reduce((acc, p, idx) => {
    acc[idx] = p.isCompleted || isPointFilled(p);
    return acc;
  }, {} as Record<number, boolean>);

  const completedCount = Object.values(completedPointsMap).filter(Boolean).length;

  // Move to next point and scroll to top
  const handleSaveAndNext = () => {
    // Mark current point as completed
    setPointsData((prev) => {
      const next = [...prev];
      next[activePointIndex] = {
        ...next[activePointIndex],
        isCompleted: true,
      };
      return next;
    });

    if (activePointIndex < collectionPoints.length - 1) {
      const nextIndex = activePointIndex + 1;
      setActivePointIndex(nextIndex);
      showToast(`Saved ${collectionPoints[activePointIndex]}! Moving to ${collectionPoints[nextIndex]}.`, "success");

      // Reset scroll to top to eliminate need to swipe
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        if (document.documentElement) document.documentElement.scrollTop = 0;
        if (document.body) document.body.scrollTop = 0;
      }
    } else {
      // Reached the end of collection points, open review modal
      setIsReviewModalOpen(true);
    }
  };

  // Reset current point
  const handleResetCurrentPoint = () => {
    if (window.confirm(`Reset all counts for ${collectionPoints[activePointIndex]}? (ಈ ಸ್ಥಳದ ಸಂಖ್ಯೆಗಳನ್ನು 0 ಗೆ ಮರುಹೊಂದಿಸಬೇಕೇ?)`)) {
      setPointsData((prev) => {
        const next = [...prev];
        next[activePointIndex] = createEmptyPoint(collectionPoints[activePointIndex]);
        return next;
      });
    }
  };

  // Submit All Collection Points for the Day
  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);

    // Filter points that have data entered, or submit all configured points
    const pointsToSubmit = pointsData.filter((p) => isPointFilled(p));
    const finalPoints = pointsToSubmit.length > 0 ? pointsToSubmit : pointsData;

    const actualWard = getWardForRoute(route);

    const records: WasteRecord[] = finalPoints.map((p) => ({
      id: "rec_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      timestamp: new Date().toISOString(),
      date,
      constituency: CONSTITUENCY_NAME,
      ward: actualWard,
      route,
      supervisorName: worker.name,
      pointName: p.pointName,
      givingWasteHH: p.givingWasteHH,
      segregatedHH: p.segregatedHH,
      dryHH: p.dryHH,
      sanitaryHH: p.sanitaryHH,
      specialCareHH: p.specialCareHH,
      mixedHH: p.mixedHH,
      remarks: p.remarks.trim(),
      syncStatus: "pending",
    }));

    const webhookUrl = getStoredWebhookUrl();

    // If offline, directly queue
    if (!navigator.onLine) {
      addToPendingQueue(records);
      setPendingQueue(getPendingQueue());
      setIsReviewModalOpen(false);
      setIsSubmitting(false);
      showToast("Offline: All points saved to Pending Queue. Will sync once connected.", "info");

      // Reset daily points draft
      setPointsData(INITIAL_POINTS.map(createEmptyPoint));
      setCollectionPoints(INITIAL_POINTS);
      setActivePointIndex(0);
      clearDailyDraft();
      return;
    }

    try {
      const result = await submitWasteRecords(records, webhookUrl);

      if (result.success) {
        records.forEach((r) => {
          r.syncStatus = result.mode === "mock" ? "mock" : "synced";
        });
        addRecordsToHistory(records);
        setHistory(getStoredHistory());

        setIsReviewModalOpen(false);
        showToast(
          result.mode === "mock"
            ? `Saved ${records.length} points in Preview Mode! Connect Webhook in Settings for live cloud sync.`
            : `Successfully uploaded ${records.length} collection points to Google Sheets! (ದಾಖಲಿಸಲಾಗಿದೆ)`,
          "success"
        );

        // Reset daily points draft
        setPointsData(INITIAL_POINTS.map(createEmptyPoint));
        setCollectionPoints(INITIAL_POINTS);
        setActivePointIndex(0);
        clearDailyDraft();
      } else {
        addToPendingQueue(records);
        setPendingQueue(getPendingQueue());
        setIsReviewModalOpen(false);
        showToast(result.message || "Failed to reach Google Sheet. Saved to Pending Queue.", "error");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error saving";
      addToPendingQueue(records);
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
    try {
      const res = await submitWasteRecords(pendingQueue, webhookUrl);
      if (res.success) {
        const synced = pendingQueue.map((r) => ({ ...r, syncStatus: "synced" as const }));
        addRecordsToHistory(synced);
        removeFromPendingQueue(pendingQueue.map((r) => r.id));
        setPendingQueue(getPendingQueue());
        setHistory(getStoredHistory());
        showToast(`Synced ${synced.length} entries to Google Sheets!`, "success");
      } else {
        showToast(res.message || "Sync failed. Check webhook or network.", "error");
      }
    } catch (err) {
      console.error("Failed to sync queue", err);
      showToast("Sync failed. Check connection.", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  const isCurrentPointFilled = isPointFilled(currentPoint);
  const isLastPoint = activePointIndex === collectionPoints.length - 1;

  // Live Records for Coordinator (Combines in-progress points + pending queue + history)
  const actualWard = getWardForRoute(route);
  const liveActivePointsRecords: WasteRecord[] = pointsData
    .filter((p) => isPointFilled(p))
    .map((p) => ({
      id: `draft_${p.pointName}`,
      timestamp: new Date().toISOString(),
      date,
      constituency: CONSTITUENCY_NAME,
      ward: actualWard,
      route,
      supervisorName: worker.name,
      pointName: p.pointName,
      givingWasteHH: p.givingWasteHH || 0,
      segregatedHH: p.segregatedHH || 0,
      dryHH: p.dryHH || 0,
      sanitaryHH: p.sanitaryHH || 0,
      specialCareHH: p.specialCareHH || 0,
      mixedHH: p.mixedHH || 0,
      remarks: p.remarks || "",
      syncStatus: "pending" as const,
    }));

  const coordinatorRecords: WasteRecord[] = [
    ...liveActivePointsRecords,
    ...pendingQueue.filter(
      (pq) =>
        !liveActivePointsRecords.some(
          (lp) => lp.pointName === pq.pointName && lp.route === pq.route && lp.date === pq.date
        )
    ),
    ...history.filter(
      (h) =>
        !liveActivePointsRecords.some(
          (lp) => lp.pointName === h.pointName && lp.route === h.route && lp.date === h.date
        )
    ),
  ];

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
      <main className="flex-1 max-w-md w-full mx-auto px-4 py-4 space-y-4 pb-32">
        {/* TAB 1: FORM */}
        {activeTab === "form" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Route & Collection Point Selector */}
            <RoutePointSelector
              selectedDate={date}
              onSelectDate={setDate}
              maxDate={date}
              selectedWard={ward}
              onSelectWard={handleSelectWard}
              selectedRoute={route}
              onSelectRoute={handleSelectRoute}
              collectionPoints={collectionPoints}
              activePointIndex={activePointIndex}
              onSelectPointIndex={setActivePointIndex}
              onAddPoint={handleAddPoint}
              completedPointsMap={completedPointsMap}
            />

            {/* Current Point Header Banner */}
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-black text-[#192613] uppercase tracking-wide">
                Recording: <span className="text-[#2563EB]">{collectionPoints[activePointIndex]}</span>
              </span>
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(true)}
                className="text-[11px] font-bold text-[#4C9F38] hover:underline"
              >
                Review Whole Day ({completedCount}/{collectionPoints.length})
              </button>
            </div>

            {/* FIELD 1: HHs Giving Waste (Cream - #FFF2CC) */}
            <NumberCounterCard
              id="givingWasteHH"
              title="1. HHs Giving Waste"
              kannadaTitle="ತ್ಯಾಜ್ಯ ನೀಡಿದ ಒಟ್ಟು ಮನೆಗಳು"
              value={currentPoint.givingWasteHH}
              onChange={(val) => updateCurrentPointField("givingWasteHH", val)}
              themeColor="cream"
              icon={<Home className="w-4 h-4" />}
            />

            {/* FIELD 2: HHs Giving Segregated Wastes (Pastel Green - #D9EAD3) */}
            <NumberCounterCard
              id="segregatedHH"
              title="2. HHs Giving Segregated Wastes"
              kannadaTitle="ವಿಂಗಡಿಸಲಾದ ಹಸಿ ತ್ಯಾಜ್ಯ ನೀಡಿದ ಮನೆಗಳು"
              value={currentPoint.segregatedHH}
              onChange={(val) => updateCurrentPointField("segregatedHH", val)}
              themeColor="green"
              icon={<Recycle className="w-4 h-4" />}
              maxLimit={currentPoint.givingWasteHH}
            />

            {/* FIELD 3: HHs Giving Dry Waste (Sky Blue - #C9DAF8) */}
            <NumberCounterCard
              id="dryHH"
              title="3. HHs Giving Dry Waste"
              kannadaTitle="ಒಣ ತ್ಯಾಜ್ಯ ನೀಡಿದ ಮನೆಗಳು"
              value={currentPoint.dryHH}
              onChange={(val) => updateCurrentPointField("dryHH", val)}
              themeColor="blue"
              icon={<Package className="w-4 h-4" />}
              maxLimit={currentPoint.givingWasteHH}
            />

            {/* FIELD 4: HHs Giving Sanitary Waste (Coral Salmon - #E69185) */}
            <NumberCounterCard
              id="sanitaryHH"
              title="4. HHs Giving Sanitary Waste"
              kannadaTitle="ಸ್ಯಾನಿಟರಿ ತ್ಯಾಜ್ಯ ನೀಡಿದ ಮನೆಗಳು"
              value={currentPoint.sanitaryHH}
              onChange={(val) => updateCurrentPointField("sanitaryHH", val)}
              themeColor="salmon"
              icon={<ShieldCheck className="w-4 h-4" />}
              maxLimit={currentPoint.givingWasteHH}
            />

            {/* FIELD 5: HHs Giving Special Care Waste (Slate Grey - #B7B7B7) */}
            <NumberCounterCard
              id="specialCareHH"
              title="5. HHs Giving Special Care Waste"
              kannadaTitle="ವಿಶೇಷ ಕಾಳಜಿ ತ್ಯಾಜ್ಯ ನೀಡಿದ ಮನೆಗಳು"
              value={currentPoint.specialCareHH}
              onChange={(val) => updateCurrentPointField("specialCareHH", val)}
              themeColor="slate"
              icon={<AlertTriangle className="w-4 h-4" />}
              maxLimit={currentPoint.givingWasteHH}
            />

            {/* FIELD 6: HHs Giving Mixed Waste (Crimson - #CC4125) */}
            <NumberCounterCard
              id="mixedHH"
              title="6. HHs Giving Mixed Waste"
              kannadaTitle="ಮಿಶ್ರ ತ್ಯಾಜ್ಯ ನೀಡಿದ ಮನೆಗಳು"
              value={currentPoint.mixedHH}
              onChange={(val) => updateCurrentPointField("mixedHH", val)}
              themeColor="crimson"
              icon={<Flame className="w-4 h-4" />}
              maxLimit={currentPoint.givingWasteHH}
            />

            {/* Clean Remarks Section (No suggestions chips, clean textarea) */}
            <div className="bg-white rounded-2xl p-4 border border-[#E1EAD9] shadow-xs space-y-2">
              <label className="text-xs font-bold text-[#192613] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#4C9F38]" />
                  <span>Remarks</span>
                  <span className="text-[10px] text-[#71856C] font-normal">(ಷರಾ / ಟೀಕೆ)</span>
                </span>
                <span className="text-[10px] font-normal text-[#7A8E74]">
                  ಐಚ್ಛಿಕ (Optional)
                </span>
              </label>

              <textarea
                rows={2}
                placeholder="Remarks for this collection point..."
                value={currentPoint.remarks}
                onChange={(e) => updateCurrentPointField("remarks", e.target.value)}
                className="w-full text-xs p-2.5 bg-[#F9FAF6] border border-[#CFDFC5] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#4C9F38]"
              />
            </div>

            {/* Reset Point button */}
            {isCurrentPointFilled && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleResetCurrentPoint}
                  className="text-xs font-bold text-[#8A9C84] hover:text-[#B33B14] flex items-center gap-1 py-1 px-2 rounded-lg transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset {collectionPoints[activePointIndex]} (ಮರುಹೊಂದಿಸಿ)</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: COORDINATOR SUMMARY */}
        {activeTab === "summary" && (
          <div className="animate-in fade-in duration-150">
            <CoordinatorSummary records={coordinatorRecords} />
          </div>
        )}
      </main>

      {/* Floating Bottom Action Bar (When in Form tab) */}
      {activeTab === "form" && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#E3EBDC] p-3 shadow-lg">
          <div className="max-w-md mx-auto flex items-center gap-2">
            {!isLastPoint ? (
              <button
                type="button"
                onClick={handleSaveAndNext}
                className="flex-1 py-3.5 px-4 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] text-white font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md active:scale-98 transition"
              >
                <span>Save & Next: {collectionPoints[activePointIndex + 1]} (ಉಳಿಸಿ ಮುಂದಕ್ಕೆ)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(true)}
                className="flex-1 py-3.5 px-4 bg-gradient-to-r from-[#4C9F38] via-[#3E8D2C] to-[#347823] hover:from-[#3F872C] hover:to-[#2B681C] text-white font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md active:scale-98 transition"
              >
                <Send className="w-4 h-4" />
                <span>Review & Submit Whole Day ({completedCount}/{collectionPoints.length} Points)</span>
              </button>
            )}

            {!isLastPoint && completedCount > 0 && (
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(true)}
                className="py-3 px-3 bg-[#F4F8F1] hover:bg-[#EAF3E4] text-[#295F1A] border border-[#CDE1C4] font-bold rounded-2xl text-xs active:scale-98 transition whitespace-nowrap"
                title="Review entire day now"
              >
                Review ({completedCount})
              </button>
            )}
          </div>
          <p className="text-[10px] text-center text-[#7F937B] mt-1 font-medium">
            {collectionPoints[activePointIndex]}: {currentPoint.givingWasteHH} HHs visited • {completedCount} of {collectionPoints.length} points completed
          </p>
        </div>
      )}

      {/* Modals */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        date={date}
        ward={actualWard}
        route={route}
        supervisorName={worker.name}
        points={pointsData}
        onConfirmSubmit={handleConfirmSubmit}
        isSubmitting={isSubmitting}
      />

      <WorkerLoginModal
        isOpen={isWorkerModalOpen}
        onClose={() => {
          setIsWorkerModalOpen(false);
          if (date) saveLastProfilePromptDate(date);
        }}
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

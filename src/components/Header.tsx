"use client";

import React from "react";
import { User, Settings, Wifi, WifiOff, FileSpreadsheet, RefreshCw } from "lucide-react";
import { WorkerProfile } from "@/types/waste-tracker";
import { TARGET_SHEET_URL } from "@/lib/google-sheets";

interface HeaderProps {
  worker: WorkerProfile;
  activeTab: "form" | "history" | "summary";
  setActiveTab: (tab: "form" | "history" | "summary") => void;
  onOpenWorkerModal: () => void;
  onOpenSettingsModal: () => void;
  pendingCount: number;
  onSyncPending?: () => void;
  isOnline: boolean;
  isSyncing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  worker,
  activeTab,
  setActiveTab,
  onOpenWorkerModal,
  onOpenSettingsModal,
  pendingCount,
  onSyncPending,
  isOnline,
  isSyncing,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E3EBDC] shadow-xs">
      {/* Top Brand Bar */}
      <div className="max-w-md mx-auto px-4 py-2.5 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4C9F38] to-[#367526] flex items-center justify-center shadow-xs text-white font-black text-lg">
            S
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-[#192613] tracking-tight text-base">
                SAAHAS
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-[#EDF7E8] text-[#377527] px-1.5 py-0.5 rounded-md border border-[#CBE6BF]">
                Field
              </span>
            </div>
            <p className="text-[11px] font-medium text-[#5B6B56] leading-none">
              Waste Tracker • ತ್ಯಾಜ್ಯ ಟ್ರ್ಯಾಕರ್
            </p>
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1.5">
          {/* Target Sheet Link */}
          <a
            href={TARGET_SHEET_URL}
            target="_blank"
            rel="noopener noreferrer"
            title="Open Google Sheet"
            className="p-2 text-[#4C9F38] hover:bg-[#EDF7E8] rounded-lg transition-colors"
          >
            <FileSpreadsheet className="w-5 h-5" />
          </a>

          {/* Settings / Webhook button */}
          <button
            onClick={onOpenSettingsModal}
            title="Google Sheet Settings"
            className="p-2 text-[#5B6B56] hover:bg-[#F2F5ED] rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Worker Profile & Connectivity Strip */}
      <div className="bg-[#F8FAF4] border-t border-[#EAEFE4] px-4 py-2">
        <div className="max-w-md mx-auto flex items-center justify-between text-xs">
          {/* Worker Info Pill */}
          <button
            onClick={onOpenWorkerModal}
            className="flex items-center gap-1.5 bg-white border border-[#D5E4CC] text-[#192613] px-2.5 py-1 rounded-full font-medium shadow-2xs hover:bg-[#F4F9F0] transition"
          >
            <div className="w-4 h-4 rounded-full bg-[#4C9F38] text-white flex items-center justify-center text-[10px]">
              <User className="w-2.5 h-2.5" />
            </div>
            <span className="font-semibold max-w-[120px] truncate">{worker.name}</span>
            <span className="text-[10px] text-[#5B6B56] bg-[#EDF7E8] px-1.5 py-0.2 rounded-sm font-mono">
              {worker.workerId}
            </span>
          </button>

          {/* Sync & Connectivity Status */}
          <div className="flex items-center gap-2">
            {pendingCount > 0 ? (
              <button
                onClick={onSyncPending}
                disabled={isSyncing}
                className="flex items-center gap-1 bg-[#F15B2B] text-white px-2 py-0.5 rounded-full font-medium text-[11px] shadow-xs animate-pulse"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`} />
                <span>Sync {pendingCount} Pending</span>
              </button>
            ) : (
              <div className="flex items-center gap-1 text-[11px] text-[#4C9F38] font-medium">
                {isOnline ? (
                  <>
                    <Wifi className="w-3.5 h-3.5 text-[#4C9F38]" />
                    <span>Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3.5 h-3.5 text-[#F15B2B]" />
                    <span className="text-[#F15B2B]">Offline Mode</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-md mx-auto px-4 pt-1 flex border-b border-[#E3EBDC] bg-white">
        <button
          onClick={() => setActiveTab("form")}
          className={`flex-1 py-2 text-center text-xs font-bold border-b-2 transition-all ${
            activeTab === "form"
              ? "border-[#4C9F38] text-[#377527]"
              : "border-transparent text-[#6F7F6A] hover:text-[#192613]"
          }`}
        >
          Daily Entry
          <span className="block text-[10px] font-normal text-[#8A9B85]">ದೈನಂದಿನ ದಾಖಲೆ</span>
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 py-2 text-center text-xs font-bold border-b-2 transition-all ${
            activeTab === "history"
              ? "border-[#4C9F38] text-[#377527]"
              : "border-transparent text-[#6F7F6A] hover:text-[#192613]"
          }`}
        >
          Today's History
          <span className="block text-[10px] font-normal text-[#8A9B85]">ಇಂದಿನ ಪಟ್ಟಿ</span>
        </button>

        <button
          onClick={() => setActiveTab("summary")}
          className={`flex-1 py-2 text-center text-xs font-bold border-b-2 transition-all ${
            activeTab === "summary"
              ? "border-[#4C9F38] text-[#377527]"
              : "border-transparent text-[#6F7F6A] hover:text-[#192613]"
          }`}
        >
          Coordinator
          <span className="block text-[10px] font-normal text-[#8A9B85]">ಸಾರಾಂಶ</span>
        </button>
      </div>
    </header>
  );
};

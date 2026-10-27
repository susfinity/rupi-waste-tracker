"use client";

import React from "react";
import { WasteRecord } from "@/types/waste-tracker";
import {
  Calendar,
  MapPin,
  CheckCircle2,
  Clock,
  CloudOff,
  ExternalLink,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { TARGET_SHEET_URL } from "@/lib/google-sheets";

interface RecentSubmissionsProps {
  records: WasteRecord[];
  pendingRecords: WasteRecord[];
  onSyncAllPending: () => void;
  isSyncing: boolean;
}

export const RecentSubmissions: React.FC<RecentSubmissionsProps> = ({
  records,
  pendingRecords,
  onSyncAllPending,
  isSyncing,
}) => {
  return (
    <div className="space-y-4">
      {/* Offline Pending Queue Notice */}
      {pendingRecords.length > 0 && (
        <div className="bg-[#FFF8E6] border border-[#FAD68A] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#F7C500] text-[#694E03] flex items-center justify-center font-bold">
                <CloudOff className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-[#694E03]">
                  {pendingRecords.length} Offline Entry Waiting to Sync
                </h4>
                <p className="text-[11px] text-[#8C6D12]">
                  ಇಂಟರ್ನೆಟ್ ಸಂಪರ್ಕಗೊಂಡಾಗ ಸಿಂಕ್ ಮಾಡಿ
                </p>
              </div>
            </div>
            <button
              onClick={onSyncAllPending}
              disabled={isSyncing}
              className="px-3 py-1.5 bg-[#F15B2B] hover:bg-[#DE4F20] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "Syncing..." : "Sync Now"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Target Sheet banner */}
      <div className="bg-white border border-[#E1EAD9] rounded-2xl p-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#EDF7E8] text-[#377527] flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#192613] block">
              Google Sheets Master
            </span>
            <span className="text-[10px] text-[#697E64]">
              View all live entries in real-time
            </span>
          </div>
        </div>
        <a
          href={TARGET_SHEET_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold text-[#4C9F38] hover:text-[#377527] flex items-center gap-1 py-1 px-2 hover:bg-[#EDF7E8] rounded-lg transition"
        >
          <span>Open Sheet</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Records list */}
      {records.length === 0 && pendingRecords.length === 0 ? (
        <div className="bg-white border border-[#E1EAD9] rounded-2xl p-8 text-center space-y-2">
          <Clock className="w-8 h-8 mx-auto text-[#A5B9A0]" />
          <h4 className="font-bold text-sm text-[#192613]">No Entries Recorded Yet</h4>
          <p className="text-xs text-[#71856C]">
            Use the "Daily Entry" tab to record today's waste collection numbers.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#697E64] px-1">
            Recent Records on this Device ({records.length + pendingRecords.length})
          </h4>

          {/* Pending records first */}
          {pendingRecords.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-amber-300 p-3.5 shadow-xs space-y-2.5 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 bg-[#F7C500] text-[#553E00] text-[10px] font-black px-2.5 py-0.5 rounded-bl-lg">
                QUEUED OFFLINE
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#F15B2B]" />
                  <span className="font-extrabold text-sm text-[#192613]">
                    {item.layout}
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-[#71856C] flex items-center gap-1 mr-24">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{item.date}</span>
                </div>
              </div>

              {/* 4 Numbers Grid */}
              <div className="grid grid-cols-4 gap-1.5 pt-1 text-center">
                <div className="bg-[#F8FAF4] p-1.5 rounded-xl border border-[#E3EDDD]">
                  <span className="text-[9px] font-semibold text-[#6C7E67] block">Total HH</span>
                  <span className="font-black text-sm text-[#2F6D1F]">{item.totalHH}</span>
                </div>
                <div className="bg-[#EDF9F1] p-1.5 rounded-xl border border-[#C5E8D3]">
                  <span className="text-[9px] font-semibold text-[#187547] block">Segregated</span>
                  <span className="font-black text-sm text-[#187547]">{item.segregatedHH}</span>
                </div>
                <div className="bg-[#EFF8FC] p-1.5 rounded-xl border border-[#C7E7F6]">
                  <span className="text-[9px] font-semibold text-[#136C95] block">Plastic</span>
                  <span className="font-black text-sm text-[#136C95]">{item.plasticHH}</span>
                </div>
                <div className="bg-[#FEF6EE] p-1.5 rounded-xl border border-[#FADFC7]">
                  <span className="text-[9px] font-semibold text-[#B33B14] block">Sanitary</span>
                  <span className="font-black text-sm text-[#B33B14]">{item.sanitaryHH}</span>
                </div>
              </div>
            </div>
          ))}

          {/* Synced records */}
          {records.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-[#E1EAD9] p-3.5 shadow-xs space-y-2.5 transition hover:border-[#4C9F38]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#4C9F38]" />
                  <span className="font-extrabold text-sm text-[#192613]">
                    {item.layout}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-[11px] font-semibold text-[#71856C] flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{item.date}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.syncStatus === "synced"
                        ? "bg-[#EDF7E8] text-[#2F6D1F] border border-[#CFE4C5]"
                        : "bg-[#F3F5F0] text-[#556950] border border-[#DEE5DA]"
                    }`}
                  >
                    {item.syncStatus === "synced" ? "Synced to Sheets" : "Local Record"}
                  </span>
                </div>
              </div>

              {/* 4 Numbers Grid */}
              <div className="grid grid-cols-4 gap-1.5 pt-1 text-center">
                <div className="bg-[#F8FAF4] p-1.5 rounded-xl border border-[#E3EDDD]">
                  <span className="text-[9px] font-semibold text-[#6C7E67] block">Total HH</span>
                  <span className="font-black text-sm text-[#2F6D1F]">{item.totalHH}</span>
                </div>
                <div className="bg-[#EDF9F1] p-1.5 rounded-xl border border-[#C5E8D3]">
                  <span className="text-[9px] font-semibold text-[#187547] block">Segregated</span>
                  <span className="font-black text-sm text-[#187547]">{item.segregatedHH}</span>
                </div>
                <div className="bg-[#EFF8FC] p-1.5 rounded-xl border border-[#C7E7F6]">
                  <span className="text-[9px] font-semibold text-[#136C95] block">Plastic</span>
                  <span className="font-black text-sm text-[#136C95]">{item.plasticHH}</span>
                </div>
                <div className="bg-[#FEF6EE] p-1.5 rounded-xl border border-[#FADFC7]">
                  <span className="text-[9px] font-semibold text-[#B33B14] block">Sanitary</span>
                  <span className="font-black text-sm text-[#B33B14]">{item.sanitaryHH}</span>
                </div>
              </div>

              {/* Footer info */}
              <div className="flex items-center justify-between text-[11px] text-[#71856C] pt-1 border-t border-[#F0F4EC]">
                <span>By: {item.workerName} ({item.workerId})</span>
                <span className="font-bold text-[#2F6D1F] flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#4C9F38]" />
                  {item.segregationRate}% Segregation
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

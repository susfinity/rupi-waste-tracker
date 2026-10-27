"use client";

import React from "react";
import { WasteRecord } from "@/types/waste-tracker";
import {
  TrendingUp,
  Home,
  CheckCircle2,
  Package,
  ShieldAlert,
  BarChart3,
  Calendar,
} from "lucide-react";

interface CoordinatorSummaryProps {
  records: WasteRecord[];
}

export const CoordinatorSummary: React.FC<CoordinatorSummaryProps> = ({ records }) => {
  // Calculate aggregate metrics
  const totalHH = records.reduce((sum, r) => sum + (r.totalHH || 0), 0);
  const segregatedHH = records.reduce((sum, r) => sum + (r.segregatedHH || 0), 0);
  const plasticHH = records.reduce((sum, r) => sum + (r.plasticHH || 0), 0);
  const sanitaryHH = records.reduce((sum, r) => sum + (r.sanitaryHH || 0), 0);

  const avgSegregationRate =
    totalHH > 0 ? ((segregatedHH / totalHH) * 100).toFixed(1) : "0.0";
  const numAvgRate = parseFloat(avgSegregationRate);

  // Layout-wise breakdown
  const layoutGroups = records.reduce((acc, r) => {
    const key = r.layout || "Other";
    if (!acc[key]) {
      acc[key] = { total: 0, segregated: 0, plastic: 0, sanitary: 0, count: 0 };
    }
    acc[key].total += r.totalHH || 0;
    acc[key].segregated += r.segregatedHH || 0;
    acc[key].plastic += r.plasticHH || 0;
    acc[key].sanitary += r.sanitaryHH || 0;
    acc[key].count += 1;
    return acc;
  }, {} as Record<string, { total: number; segregated: number; plastic: number; sanitary: number; count: number }>);

  return (
    <div className="space-y-4">
      {/* Overview Banner */}
      <div className="bg-gradient-to-br from-[#1C2A18] to-[#2E4527] rounded-3xl p-4 text-white shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#4C9F38] rounded-xl text-white">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm leading-tight">Coordinator Daily Dashboard</h3>
              <p className="text-[11px] text-[#A2B89B]">ಯೋಜನಾ ಸಂಯೋಜಕರ ಸಾರಾಂಶ</p>
            </div>
          </div>
          <span className="text-[11px] bg-white/10 px-2.5 py-1 rounded-full font-mono">
            {records.length} {records.length === 1 ? "Entry" : "Entries"}
          </span>
        </div>

        {/* Primary Big Metric: Segregation Rate */}
        <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase font-bold text-[#C5DEC0] block">
              Average Segregation Compliance
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="font-black text-3xl tracking-tight text-[#EAF5E5]">
                {avgSegregationRate}%
              </span>
              <span className="text-xs text-[#BED8B8] font-medium">
                ({segregatedHH} of {totalHH} HHs)
              </span>
            </div>
          </div>
          <div className="text-right">
            <span
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                numAvgRate >= 80
                  ? "bg-[#4C9F38] text-white"
                  : numAvgRate >= 50
                  ? "bg-[#F7C500] text-[#4F3B02]"
                  : "bg-[#F15B2B] text-white"
              }`}
            >
              {numAvgRate >= 80 ? "Target Met" : numAvgRate >= 50 ? "Moderate" : "Action Needed"}
            </span>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white rounded-2xl border border-[#DCE8D4] p-3 shadow-2xs">
          <div className="flex items-center gap-1.5 text-[#5B6D55] text-xs font-semibold">
            <Home className="w-4 h-4 text-[#4C9F38]" />
            <span>Total HHs Visited</span>
          </div>
          <span className="font-black text-2xl text-[#192613] block mt-1">{totalHH}</span>
          <span className="text-[10px] text-[#71856C]">ಮನೆಗಳ ಒಟ್ಟು ಸಂಖ್ಯೆ</span>
        </div>

        <div className="bg-white rounded-2xl border border-[#C5E8D3] p-3 shadow-2xs">
          <div className="flex items-center gap-1.5 text-[#187547] text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-[#1E8A54]" />
            <span>Segregated HHs</span>
          </div>
          <span className="font-black text-2xl text-[#187547] block mt-1">{segregatedHH}</span>
          <span className="text-[10px] text-[#71856C]">ವಿಂಗಡಿಸಲಾದ ತ್ಯಾಜ್ಯ</span>
        </div>

        <div className="bg-white rounded-2xl border border-[#C7E7F6] p-3 shadow-2xs">
          <div className="flex items-center gap-1.5 text-[#136C95] text-xs font-semibold">
            <Package className="w-4 h-4 text-[#1D9ED9]" />
            <span>Plastic Waste HHs</span>
          </div>
          <span className="font-black text-2xl text-[#136C95] block mt-1">{plasticHH}</span>
          <span className="text-[10px] text-[#71856C]">ಪ್ಲಾಸ್ಟಿಕ್ ತ್ಯಾಜ್ಯ ನೀಡಿದವರು</span>
        </div>

        <div className="bg-white rounded-2xl border border-[#FADFC7] p-3 shadow-2xs">
          <div className="flex items-center gap-1.5 text-[#B33B14] text-xs font-semibold">
            <ShieldAlert className="w-4 h-4 text-[#F15B2B]" />
            <span>Sanitary Waste HHs</span>
          </div>
          <span className="font-black text-2xl text-[#B33B14] block mt-1">{sanitaryHH}</span>
          <span className="text-[10px] text-[#71856C]">ಸ್ಯಾನಿಟರಿ ತ್ಯಾಜ್ಯ ನೀಡಿದವರು</span>
        </div>
      </div>

      {/* Layout Breakdown Section */}
      <div className="bg-white rounded-2xl border border-[#DCE8D4] p-4 shadow-2xs space-y-3">
        <h4 className="font-bold text-xs text-[#192613] flex items-center justify-between">
          <span>Layout-Wise Segregation Breakdown</span>
          <span className="text-[11px] font-normal text-[#6B7F66]">ಬಡಾವಣೆವಾರು ವಿವರ</span>
        </h4>

        {Object.keys(layoutGroups).length === 0 ? (
          <p className="text-xs text-[#71856C] text-center py-4">
            No entries recorded yet to display layout comparison.
          </p>
        ) : (
          <div className="space-y-3">
            {Object.entries(layoutGroups).map(([layoutName, data]) => {
              const segPct =
                data.total > 0 ? ((data.segregated / data.total) * 100).toFixed(1) : "0.0";
              const numSegPct = parseFloat(segPct);

              return (
                <div key={layoutName} className="p-3 bg-[#FAFBF8] rounded-xl border border-[#E4ECE0] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-[#192613]">{layoutName}</span>
                    <span className="font-black text-sm text-[#2F6D1F]">
                      {segPct}% <span className="text-[10px] font-normal text-[#6B7F66]">segregated</span>
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-[#E5EDE0] rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        numSegPct >= 80 ? "bg-[#4C9F38]" : numSegPct >= 50 ? "bg-[#F7C500]" : "bg-[#F15B2B]"
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, numSegPct))}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#697D64]">
                    <span>Total: {data.total} HHs</span>
                    <span>Plastic: {data.plastic} HHs</span>
                    <span>Sanitary: {data.sanitary} HHs</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

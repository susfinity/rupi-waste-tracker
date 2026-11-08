"use client";

import React, { useState } from "react";
import { WasteRecord, WardOption, RouteOption, ALL_ROUTES, getWardForRoute, CONSTITUENCY_NAME } from "@/types/waste-tracker";
import {
  BarChart3,
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  User,
} from "lucide-react";

interface CoordinatorSummaryProps {
  records: WasteRecord[];
}

export const CoordinatorSummary: React.FC<CoordinatorSummaryProps> = ({ records }) => {
  const [selectedWardFilter, setSelectedWardFilter] = useState<string>("All");
  const [expandedRoutes, setExpandedRoutes] = useState<Record<string, boolean>>({});

  const toggleRouteExpanded = (routeName: string) => {
    setExpandedRoutes((prev) => ({
      ...prev,
      [routeName]: !prev[routeName],
    }));
  };

  // Group records strictly by route, normalizing ward based on the route
  const recordsByRoute = records.reduce((acc, r) => {
    const routeKey = r.route || "";
    if (!routeKey) return acc;
    if (!acc[routeKey]) {
      acc[routeKey] = [];
    }
    acc[routeKey].push(r);
    return acc;
  }, {} as Record<string, WasteRecord[]>);

  // Filter routes based on selected ward filter
  const visibleRoutes = ALL_ROUTES.filter((item) => {
    if (selectedWardFilter !== "All" && item.ward !== selectedWardFilter) {
      return false;
    }
    return true;
  });

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
              <h3 className="font-extrabold text-sm leading-tight">Coordinator Dashboard</h3>
              <p className="text-[11px] text-[#A2B89B]">
                {CONSTITUENCY_NAME} • ಯೋಜನಾ ಸಂಯೋಜಕರ ಸಾರಾಂಶ
              </p>
            </div>
          </div>
          <span className="text-[11px] bg-white/10 px-2.5 py-1 rounded-full font-mono">
            {records.length} Points Recorded
          </span>
        </div>

        {/* Ward Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          {["All", "Ward 28 - Kammanahalli", "Ward 29 - Kacharakanahalli"].map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setSelectedWardFilter(w)}
              className={`text-[11px] font-bold px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
                selectedWardFilter === w
                  ? "bg-[#4C9F38] text-white shadow-xs"
                  : "bg-white/10 text-[#CBE0C4] hover:bg-white/20"
              }`}
            >
              {w === "All" ? "All Wards" : w.split(" - ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Route-Level Cards (Tappable accordions showing route & point level data) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-[#192613] uppercase tracking-wide">
            Routes & Blocks (ಟ್ಯಾಪ್ ಮಾಡಿ ವಿವರ ನೋಡಿ)
          </span>
          <span className="text-[10px] text-[#6B7F66]">
            Tap any route to view details
          </span>
        </div>

        {visibleRoutes.map((routeItem) => {
          const routeName = routeItem.route;
          const routeWard = routeItem.ward;
          const routeRecords = recordsByRoute[routeName] || [];
          const isExpanded = !!expandedRoutes[routeName];

          // Compute waste totals (excluding HHs count)
          const segTotal = routeRecords.reduce(
            (sum, r) => sum + Number(r.segregatedHH || 0),
            0
          );
          const dryTotal = routeRecords.reduce(
            (sum, r) => sum + Number(r.dryHH ?? (r as any).plasticHH ?? 0),
            0
          );
          const sanitaryTotal = routeRecords.reduce(
            (sum, r) => sum + Number(r.sanitaryHH || 0),
            0
          );
          const specialCareTotal = routeRecords.reduce(
            (sum, r) => sum + Number(r.specialCareHH || 0),
            0
          );
          const mixedTotal = routeRecords.reduce(
            (sum, r) => sum + Number(r.mixedHH || 0),
            0
          );

          const hasData = routeRecords.length > 0;
          const latestSupervisor = routeRecords[0]?.supervisorName || "Assigned Supervisor";
          const latestDate = routeRecords[0]?.date || "";

          return (
            <div
              key={routeName}
              className={`bg-white rounded-2xl border transition-all shadow-2xs overflow-hidden ${
                isExpanded ? "border-[#2563EB] ring-2 ring-[#2563EB]/15" : "border-[#DCE8D4] hover:border-[#2563EB]"
              }`}
            >
              {/* Tappable Card Header */}
              <button
                type="button"
                onClick={() => toggleRouteExpanded(routeName)}
                className="w-full p-4 flex items-center justify-between text-left transition hover:bg-[#F9FAF6]"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#EFF6FF] text-[#1D4ED8]">
                      {routeWard.split(" - ")[0]}
                    </span>
                    <h4 className="font-extrabold text-sm text-[#192613] leading-tight">
                      {routeName}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[#6B7F66]">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-[#4C9F38]" />
                      <span>{latestSupervisor}</span>
                    </span>
                    <span>•</span>
                    <span>{hasData ? `${routeRecords.length} Points` : "No entries yet"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Mini Waste Pills Preview (No HHs) */}
                  {hasData && !isExpanded && (
                    <div className="hidden sm:flex items-center gap-1 text-[10px] font-bold">
                      <span className="bg-[#D9EAD3] text-[#274E13] px-1.5 py-0.5 rounded-sm" title="Seg Wet">
                        Seg: {segTotal}
                      </span>
                      <span className="bg-[#C9DAF8] text-[#0B5394] px-1.5 py-0.5 rounded-sm" title="Dry">
                        Dry: {dryTotal}
                      </span>
                      <span className="bg-[#F8D7DA] text-[#8A1A10] px-1.5 py-0.5 rounded-sm" title="Mixed">
                        Mix: {mixedTotal}
                      </span>
                    </div>
                  )}

                  <div className="p-1 rounded-lg bg-[#F4F7F2] text-[#4C6445]">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-[#2563EB]" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </button>

              {/* Expanded Route Details */}
              {isExpanded && (
                <div className="p-4 pt-0 border-t border-[#EAEFE6] bg-[#FCFDFB] space-y-3 animate-in fade-in duration-150">
                  {/* Route Waste Category Totals (5 Waste Streams, No HHs) */}
                  <div className="pt-3">
                    <span className="text-[10px] uppercase font-bold text-[#6D8068] block mb-1.5">
                      Route Waste Collected (5 Categories)
                    </span>
                    <div className="grid grid-cols-5 gap-1.5 text-center font-bold text-xs">
                      {/* 1. Segregated Wet Waste */}
                      <div className="bg-[#F9FCF8] border border-[#B6D7A8] p-2 rounded-xl">
                        <span className="text-[9px] text-[#274E13] block">Seg Wet</span>
                        <span className="text-base text-[#274E13] font-black">{segTotal}</span>
                      </div>

                      {/* 2. Dry Waste */}
                      <div className="bg-[#F7FAFE] border border-[#A4C2F4] p-2 rounded-xl">
                        <span className="text-[9px] text-[#0B5394] block">Dry</span>
                        <span className="text-base text-[#0B5394] font-black">{dryTotal}</span>
                      </div>

                      {/* 3. Sanitary Waste */}
                      <div className="bg-[#FEF8F7] border border-[#E69185] p-2 rounded-xl">
                        <span className="text-[9px] text-[#783F04] block">Sanitary</span>
                        <span className="text-base text-[#D9534F] font-black">{sanitaryTotal}</span>
                      </div>

                      {/* 4. Special Care Waste */}
                      <div className="bg-[#FAFAFA] border border-[#B7B7B7] p-2 rounded-xl">
                        <span className="text-[9px] text-[#333333] block">Sp. Care</span>
                        <span className="text-base text-[#424242] font-black">{specialCareTotal}</span>
                      </div>

                      {/* 5. Mixed Waste */}
                      <div className="bg-[#FFF6F5] border border-[#CC4125] p-2 rounded-xl">
                        <span className="text-[9px] text-[#8A1A10] block">Mixed</span>
                        <span className="text-base text-[#CC4125] font-black">{mixedTotal}</span>
                      </div>
                    </div>
                  </div>

                  {/* Granular Collection Points for this Route */}
                  <div className="border border-[#E2EBDD] rounded-xl overflow-hidden bg-white">
                    <div className="bg-[#F3F8EE] px-3 py-2 text-xs font-bold text-[#192613] flex items-center justify-between">
                      <span>Collection Points in this Route ({routeRecords.length})</span>
                      <span className="text-[10px] text-[#697E64]">ಸ್ಥಳವಾರು ವಿವರ</span>
                    </div>

                    {!hasData ? (
                      <p className="text-xs text-[#71856C] text-center py-4">
                        No collection points recorded yet for this route today.
                      </p>
                    ) : (
                      <div className="divide-y divide-[#EBF1E8] max-h-60 overflow-y-auto">
                        {routeRecords.map((pt) => {
                          const isLive = pt.id?.startsWith("draft_");
                          return (
                            <div key={pt.id} className="p-2.5 space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-extrabold text-[#2563EB]">{pt.pointName}</span>
                                  {isLive && (
                                    <span className="text-[9px] font-bold bg-[#E8F5E9] text-[#2E7D32] px-1.5 py-0.2 rounded-sm border border-[#C8E6C9]">
                                      Live Today
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-[#6B7F66]">{pt.date}</span>
                              </div>

                              {/* 5 Waste Counts (No HHs) */}
                              <div className="grid grid-cols-5 gap-1 text-[9px] text-center font-bold">
                                <span className="bg-[#D9EAD3] text-[#274E13] py-0.5 rounded-sm">
                                  Seg: {pt.segregatedHH || 0}
                                </span>
                                <span className="bg-[#C9DAF8] text-[#0B5394] py-0.5 rounded-sm">
                                  Dry: {pt.dryHH ?? (pt as any).plasticHH ?? 0}
                                </span>
                                <span className="bg-[#F4CCCC] text-[#783F04] py-0.5 rounded-sm">
                                  San: {pt.sanitaryHH || 0}
                                </span>
                                <span className="bg-[#E0E0E0] text-[#333333] py-0.5 rounded-sm">
                                  Spc: {pt.specialCareHH || 0}
                                </span>
                                <span className="bg-[#F8D7DA] text-[#8A1A10] py-0.5 rounded-sm">
                                  Mix: {pt.mixedHH || 0}
                                </span>
                              </div>

                              {pt.remarks && (
                                <p className="text-[10px] text-[#55694E] italic bg-[#F7F9F5] px-2 py-0.5 rounded-md">
                                  Remarks: {pt.remarks}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

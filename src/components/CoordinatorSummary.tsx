"use client";

import React, { useState } from "react";
import { WasteRecord, CONSTITUENCY_NAME } from "@/types/waste-tracker";
import {
  BarChart3,
  Layers,
  ChevronDown,
  ChevronUp,
  MapPin,
  Eye,
  Calendar,
} from "lucide-react";

interface CoordinatorSummaryProps {
  records: WasteRecord[];
}

export const CoordinatorSummary: React.FC<CoordinatorSummaryProps> = ({ records }) => {
  const [selectedWardFilter, setSelectedWardFilter] = useState<string>("All");
  const [selectedRouteFilter, setSelectedRouteFilter] = useState<string>("All");
  const [showPointInspector, setShowPointInspector] = useState(true);

  // Filter records
  const filteredRecords = records.filter((r) => {
    if (selectedWardFilter !== "All" && r.ward !== selectedWardFilter) return false;
    if (selectedRouteFilter !== "All" && r.route !== selectedRouteFilter) return false;
    return true;
  });

  // Calculate totals across filtered records defensively
  const totalGivingWaste = filteredRecords.reduce(
    (sum, r) => sum + Number(r.givingWasteHH ?? (r as any).totalHH ?? 0),
    0
  );

  // Group by Ward
  const wardGroups = records.reduce((acc, r) => {
    const wardKey = r.ward || "Ward 28 - Kammanahalli";
    if (!acc[wardKey]) {
      acc[wardKey] = {
        givingWaste: 0,
        segregated: 0,
        dry: 0,
        sanitary: 0,
        specialCare: 0,
        mixed: 0,
        pointsCount: 0,
        routes: new Set<string>(),
      };
    }
    acc[wardKey].givingWaste += Number(r.givingWasteHH ?? (r as any).totalHH ?? 0);
    acc[wardKey].segregated += Number(r.segregatedHH ?? 0);
    acc[wardKey].dry += Number(r.dryHH ?? (r as any).plasticHH ?? 0);
    acc[wardKey].sanitary += Number(r.sanitaryHH ?? 0);
    acc[wardKey].specialCare += Number(r.specialCareHH ?? 0);
    acc[wardKey].mixed += Number(r.mixedHH ?? 0);
    acc[wardKey].pointsCount += 1;
    if (r.route) acc[wardKey].routes.add(r.route);
    return acc;
  }, {} as Record<string, { givingWaste: number; segregated: number; dry: number; sanitary: number; specialCare: number; mixed: number; pointsCount: number; routes: Set<string> }>);

  // Group by Route
  const routeGroups = records.reduce((acc, r) => {
    const routeKey = r.route || "Janaki Ram Layout - Route 1";
    if (!acc[routeKey]) {
      acc[routeKey] = {
        ward: r.ward || "",
        supervisor: r.supervisorName || "Field Supervisor",
        date: r.date || "",
        givingWaste: 0,
        segregated: 0,
        dry: 0,
        sanitary: 0,
        specialCare: 0,
        mixed: 0,
        points: [] as WasteRecord[],
      };
    }
    acc[routeKey].givingWaste += Number(r.givingWasteHH ?? (r as any).totalHH ?? 0);
    acc[routeKey].segregated += Number(r.segregatedHH ?? 0);
    acc[routeKey].dry += Number(r.dryHH ?? (r as any).plasticHH ?? 0);
    acc[routeKey].sanitary += Number(r.sanitaryHH ?? 0);
    acc[routeKey].specialCare += Number(r.specialCareHH ?? 0);
    acc[routeKey].mixed += Number(r.mixedHH ?? 0);
    acc[routeKey].points.push(r);
    return acc;
  }, {} as Record<string, { ward: string; supervisor: string; date: string; givingWaste: number; segregated: number; dry: number; sanitary: number; specialCare: number; mixed: number; points: WasteRecord[] }>);

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
          <div className="text-right">
            <span className="text-xs font-black text-[#FFE599] block">
              {totalGivingWaste} Total HHs
            </span>
            <span className="text-[10px] text-[#A2B89B]">
              {filteredRecords.length} {filteredRecords.length === 1 ? "Point" : "Points"} in View
            </span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-2.5 space-y-2">
          {/* Ward Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            {["All", "Ward 28 - Kammanahalli", "Ward 29 - Kacharakanahalli"].map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => {
                  setSelectedWardFilter(w);
                  setSelectedRouteFilter("All");
                }}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg whitespace-nowrap transition ${
                  selectedWardFilter === w
                    ? "bg-[#4C9F38] text-white shadow-xs"
                    : "bg-white/10 text-[#CBE0C4] hover:bg-white/20"
                }`}
              >
                {w === "All" ? "All Wards" : w.split(" - ")[0]}
              </button>
            ))}
          </div>

          {/* Route Filter Dropdown */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#A2B89B] text-[10px] uppercase font-bold shrink-0">Route:</span>
            <select
              value={selectedRouteFilter}
              onChange={(e) => setSelectedRouteFilter(e.target.value)}
              className="w-full text-xs font-semibold bg-[#1F331A] text-white border border-white/20 rounded-lg px-2 py-1 focus:outline-hidden"
            >
              <option value="All">All Routes in View</option>
              {Object.keys(routeGroups).map((rt) => (
                <option key={rt} value={rt}>
                  {rt}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Ward-Wise Summary Cards */}
      <div className="bg-white rounded-2xl border border-[#DCE8D4] p-4 shadow-2xs space-y-3">
        <h4 className="font-bold text-xs text-[#192613] flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#4C9F38]" />
            <span>Ward-Wise Waste Summary</span>
          </span>
          <span className="text-[10px] font-normal text-[#6B7F66]">ವಾರ್ಡ್‌ವಾರು ವಿವರ</span>
        </h4>

        {Object.keys(wardGroups).length === 0 ? (
          <p className="text-xs text-[#71856C] text-center py-4">
            No entries recorded yet. Enter counts in the "Daily Entry" tab to see live breakdown.
          </p>
        ) : (
          <div className="space-y-2.5">
            {Object.entries(wardGroups).map(([wardName, data]) => (
              <div key={wardName} className="p-3 bg-[#F9FAF6] border border-[#DEECDA] rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-extrabold text-xs text-[#192613]">{wardName}</h5>
                    <p className="text-[10px] text-[#6B7F66]">
                      {data.routes.size} Routes • {data.pointsCount} Collection Points
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-[#7A5A00]">
                      {data.givingWaste} HHs Visited
                    </span>
                  </div>
                </div>

                {/* 6 Mini Metric Badges (Matching Palette Colors) */}
                <div className="grid grid-cols-6 gap-1 text-[10px] text-center font-bold">
                  <div className="bg-[#FFF2CC] text-[#7A5A00] py-1 rounded-sm" title="Giving Waste">
                    <span className="block text-[8px] opacity-75">Waste</span>
                    {data.givingWaste}
                  </div>
                  <div className="bg-[#D9EAD3] text-[#274E13] py-1 rounded-sm" title="Seg Wet Waste">
                    <span className="block text-[8px] opacity-75">Seg</span>
                    {data.segregated}
                  </div>
                  <div className="bg-[#C9DAF8] text-[#0B5394] py-1 rounded-sm" title="Dry Waste">
                    <span className="block text-[8px] opacity-75">Dry</span>
                    {data.dry}
                  </div>
                  <div className="bg-[#F4CCCC] text-[#783F04] py-1 rounded-sm" title="Sanitary Waste">
                    <span className="block text-[8px] opacity-75">Sanitary</span>
                    {data.sanitary}
                  </div>
                  <div className="bg-[#E0E0E0] text-[#333333] py-1 rounded-sm" title="Special Care Waste">
                    <span className="block text-[8px] opacity-75">Sp. Care</span>
                    {data.specialCare}
                  </div>
                  <div className="bg-[#F8D7DA] text-[#8A1A10] py-1 rounded-sm" title="Mixed Waste">
                    <span className="block text-[8px] opacity-75">Mixed</span>
                    {data.mixed}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Route-Wise Breakdown */}
      <div className="bg-white rounded-2xl border border-[#DCE8D4] p-4 shadow-2xs space-y-3">
        <h4 className="font-bold text-xs text-[#192613] flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#2563EB]" />
            <span>Route / Block Summary</span>
          </span>
          <span className="text-[10px] font-normal text-[#6B7F66]">ಮಾರ್ಗವಾರು ವಿವರ</span>
        </h4>

        {Object.keys(routeGroups).length === 0 ? (
          <p className="text-xs text-[#71856C] text-center py-4">
            No route data available yet.
          </p>
        ) : (
          <div className="space-y-3">
            {Object.entries(routeGroups).map(([routeName, data]) => (
              <div
                key={routeName}
                className="p-3 bg-white border border-[#DCE8D4] rounded-xl shadow-2xs space-y-2 hover:border-[#2563EB] transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] text-[#2563EB] font-bold block">{data.ward}</span>
                    <h5 className="font-extrabold text-xs text-[#192613]">{routeName}</h5>
                    <p className="text-[10px] text-[#6B7F66]">
                      Supervisor: <span className="font-semibold text-[#192613]">{data.supervisor}</span> • {data.points.length} Points
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-[#7A5A00] block">{data.givingWaste} HHs</span>
                    <span className="text-[9px] text-[#6B7F66]">{data.date}</span>
                  </div>
                </div>

                {/* 6 mini pills */}
                <div className="grid grid-cols-6 gap-1 text-[10px] text-center font-bold">
                  <div className="bg-[#FFF2CC] text-[#7A5A00] py-0.5 rounded-sm" title="Giving Waste">
                    {data.givingWaste}
                  </div>
                  <div className="bg-[#D9EAD3] text-[#274E13] py-0.5 rounded-sm" title="Seg Wet Waste">
                    {data.segregated}
                  </div>
                  <div className="bg-[#C9DAF8] text-[#0B5394] py-0.5 rounded-sm" title="Dry Waste">
                    {data.dry}
                  </div>
                  <div className="bg-[#F4CCCC] text-[#783F04] py-0.5 rounded-sm" title="Sanitary Waste">
                    {data.sanitary}
                  </div>
                  <div className="bg-[#E0E0E0] text-[#333333] py-0.5 rounded-sm" title="Special Care">
                    {data.specialCare}
                  </div>
                  <div className="bg-[#F8D7DA] text-[#8A1A10] py-0.5 rounded-sm" title="Mixed Waste">
                    {data.mixed}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Collection Point Granular Inspection Section */}
      <div className="bg-white rounded-2xl border border-[#DCE8D4] overflow-hidden shadow-2xs">
        <button
          type="button"
          onClick={() => setShowPointInspector((prev) => !prev)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-[#F9FAF6] transition"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#EFF6FF] rounded-lg text-[#2563EB]">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-[#192613]">
                Inspect Collection Point Wise Data ({filteredRecords.length})
              </h4>
              <p className="text-[10px] text-[#6B7F66]">ಸಂಗ್ರಹಣಾ ಸ್ಥಳವಾರು ವಿವರವಾದ ಪರಿಶೀಲನೆ</p>
            </div>
          </div>
          {showPointInspector ? (
            <ChevronUp className="w-4 h-4 text-[#6B7F66]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#6B7F66]" />
          )}
        </button>

        {showPointInspector && (
          <div className="p-4 pt-0 border-t border-[#EAEFE6] space-y-2">
            {filteredRecords.length === 0 ? (
              <p className="text-xs text-[#71856C] text-center py-4">No collection points to display.</p>
            ) : (
              <div className="divide-y divide-[#EAEFE6] max-h-80 overflow-y-auto">
                {filteredRecords.map((pt) => {
                  const givingWaste = Number(pt.givingWasteHH ?? (pt as any).totalHH ?? 0);
                  const segregated = Number(pt.segregatedHH ?? 0);
                  const dry = Number(pt.dryHH ?? (pt as any).plasticHH ?? 0);
                  const sanitary = Number(pt.sanitaryHH ?? 0);
                  const specialCare = Number(pt.specialCareHH ?? 0);
                  const mixed = Number(pt.mixedHH ?? 0);
                  const isDraft = pt.id?.startsWith("draft_");

                  return (
                    <div key={pt.id} className="py-2.5 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-[#2563EB]">{pt.pointName}</span>
                          <span className="text-[10px] text-[#6B7F66] font-medium">
                            {pt.route}
                          </span>
                          {isDraft && (
                            <span className="text-[9px] font-bold bg-[#E8F5E9] text-[#2E7D32] px-1.5 py-0.2 rounded-sm border border-[#C8E6C9]">
                              Live Today
                            </span>
                          )}
                        </div>
                        <span className="font-bold text-[#7A5A00]">{givingWaste} HHs</span>
                      </div>

                      <div className="grid grid-cols-6 gap-1 text-[9px] text-center font-bold">
                        <span className="bg-[#FFF2CC] text-[#7A5A00] py-0.5 rounded-sm">
                          W: {givingWaste}
                        </span>
                        <span className="bg-[#D9EAD3] text-[#274E13] py-0.5 rounded-sm">
                          Seg: {segregated}
                        </span>
                        <span className="bg-[#C9DAF8] text-[#0B5394] py-0.5 rounded-sm">
                          Dry: {dry}
                        </span>
                        <span className="bg-[#F4CCCC] text-[#783F04] py-0.5 rounded-sm">
                          San: {sanitary}
                        </span>
                        <span className="bg-[#E0E0E0] text-[#333333] py-0.5 rounded-sm">
                          Spc: {specialCare}
                        </span>
                        <span className="bg-[#F8D7DA] text-[#8A1A10] py-0.5 rounded-sm">
                          Mix: {mixed}
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
        )}
      </div>
    </div>
  );
};

"use client";

import React, { useState } from "react";
import { WasteRecord, WardOption, RouteOption, CONSTITUENCY_NAME } from "@/types/waste-tracker";
import {
  BarChart3,
  Filter,
  Layers,
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar,
  Eye,
} from "lucide-react";

interface CoordinatorSummaryProps {
  records: WasteRecord[];
}

export const CoordinatorSummary: React.FC<CoordinatorSummaryProps> = ({ records }) => {
  const [selectedWardFilter, setSelectedWardFilter] = useState<string>("All");
  const [selectedRouteFilter, setSelectedRouteFilter] = useState<string>("All");
  const [showPointInspector, setShowPointInspector] = useState(false);

  // Filter records
  const filteredRecords = records.filter((r) => {
    if (selectedWardFilter !== "All" && r.ward !== selectedWardFilter) return false;
    if (selectedRouteFilter !== "All" && r.route !== selectedRouteFilter) return false;
    return true;
  });

  // Calculate totals across filtered records
  const totalGivingWaste = filteredRecords.reduce((sum, r) => sum + (r.givingWasteHH || 0), 0);
  const totalSegregated = filteredRecords.reduce((sum, r) => sum + (r.segregatedHH || 0), 0);
  const totalDry = filteredRecords.reduce((sum, r) => sum + (r.dryHH || 0), 0);
  const totalSanitary = filteredRecords.reduce((sum, r) => sum + (r.sanitaryHH || 0), 0);
  const totalSpecialCare = filteredRecords.reduce((sum, r) => sum + (r.specialCareHH || 0), 0);
  const totalMixed = filteredRecords.reduce((sum, r) => sum + (r.mixedHH || 0), 0);

  // Group by Ward
  const wardGroups = records.reduce((acc, r) => {
    const wardKey = r.ward || "Other";
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
    acc[wardKey].givingWaste += r.givingWasteHH || 0;
    acc[wardKey].segregated += r.segregatedHH || 0;
    acc[wardKey].dry += r.dryHH || 0;
    acc[wardKey].sanitary += r.sanitaryHH || 0;
    acc[wardKey].specialCare += r.specialCareHH || 0;
    acc[wardKey].mixed += r.mixedHH || 0;
    acc[wardKey].pointsCount += 1;
    if (r.route) acc[wardKey].routes.add(r.route);
    return acc;
  }, {} as Record<string, { givingWaste: number; segregated: number; dry: number; sanitary: number; specialCare: number; mixed: number; pointsCount: number; routes: Set<string> }>);

  // Group by Route
  const routeGroups = records.reduce((acc, r) => {
    const routeKey = r.route || "Other";
    if (!acc[routeKey]) {
      acc[routeKey] = {
        ward: r.ward,
        supervisor: r.supervisorName,
        date: r.date,
        givingWaste: 0,
        segregated: 0,
        dry: 0,
        sanitary: 0,
        specialCare: 0,
        mixed: 0,
        points: [] as WasteRecord[],
      };
    }
    acc[routeKey].givingWaste += r.givingWasteHH || 0;
    acc[routeKey].segregated += r.segregatedHH || 0;
    acc[routeKey].dry += r.dryHH || 0;
    acc[routeKey].sanitary += r.sanitaryHH || 0;
    acc[routeKey].specialCare += r.specialCareHH || 0;
    acc[routeKey].mixed += r.mixedHH || 0;
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
          <span className="text-[11px] bg-white/10 px-2.5 py-1 rounded-full font-mono">
            {filteredRecords.length} {filteredRecords.length === 1 ? "Point" : "Points"}
          </span>
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

      {/* 6 Waste Data Metric Cards (Matching the user color reference) */}
      <div>
        <h4 className="font-extrabold text-xs text-[#192613] mb-2 flex items-center justify-between">
          <span>Total Waste Collected By Category</span>
          <span className="text-[10px] font-normal text-[#6B7F66]">ಒಟ್ಟು ಸಂಗ್ರಹಣಾ ವಿವರ</span>
        </h4>

        <div className="grid grid-cols-2 gap-2">
          {/* 1. HHs Giving Waste (Cream - #FFF2CC) */}
          <div className="bg-[#FFFDF6] border-2 border-[#FFE599] rounded-2xl p-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#7A5A00]">1. HHs Giving Waste</span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFE599]" />
            </div>
            <span className="font-black text-2xl text-[#7A5A00] block mt-1">{totalGivingWaste}</span>
            <span className="text-[10px] text-[#A67C00]">ತ್ಯಾಜ್ಯ ನೀಡಿದ ಒಟ್ಟು ಮನೆಗಳು</span>
          </div>

          {/* 2. HHs Giving Segregated Wastes (Pastel Green - #D9EAD3) */}
          <div className="bg-[#F9FCF8] border-2 border-[#B6D7A8] rounded-2xl p-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#274E13]">2. Giving Seg Wastes</span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#B6D7A8]" />
            </div>
            <span className="font-black text-2xl text-[#274E13] block mt-1">{totalSegregated}</span>
            <span className="text-[10px] text-[#427A23]">ವಿಂಗಡಿಸಲಾದ ಹಸಿ ತ್ಯಾಜ್ಯ</span>
          </div>

          {/* 3. HHs Giving Dry Waste (Sky Blue - #C9DAF8) */}
          <div className="bg-[#F7FAFE] border-2 border-[#A4C2F4] rounded-2xl p-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#0B5394]">3. Giving Dry Waste</span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#A4C2F4]" />
            </div>
            <span className="font-black text-2xl text-[#0B5394] block mt-1">{totalDry}</span>
            <span className="text-[10px] text-[#2563EB]">ಒಣ ತ್ಯಾಜ್ಯ ನೀಡಿದ ಮನೆಗಳು</span>
          </div>

          {/* 4. HHs Giving Sanitary Waste (Salmon - #E69185) */}
          <div className="bg-[#FEF8F7] border-2 border-[#E69185] rounded-2xl p-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#783F04]">4. Giving Sanitary Waste</span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#E69185]" />
            </div>
            <span className="font-black text-2xl text-[#D9534F] block mt-1">{totalSanitary}</span>
            <span className="text-[10px] text-[#A03D39]">ಸ್ಯಾನಿಟರಿ ತ್ಯಾಜ್ಯ ನೀಡಿದ ಮನೆಗಳು</span>
          </div>

          {/* 5. HHs Giving Special Care Waste (Slate Grey - #B7B7B7) */}
          <div className="bg-[#FAFAFA] border-2 border-[#B7B7B7] rounded-2xl p-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#333333]">5. Giving Special Care</span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#B7B7B7]" />
            </div>
            <span className="font-black text-2xl text-[#424242] block mt-1">{totalSpecialCare}</span>
            <span className="text-[10px] text-[#616161]">ವಿಶೇಷ ಕಾಳಜಿ ತ್ಯಾಜ್ಯ</span>
          </div>

          {/* 6. HHs Giving Mixed Waste (Crimson - #CC4125) */}
          <div className="bg-[#FFF6F5] border-2 border-[#CC4125] rounded-2xl p-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#8A1A10]">6. Giving Mixed Waste</span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#CC4125]" />
            </div>
            <span className="font-black text-2xl text-[#CC4125] block mt-1">{totalMixed}</span>
            <span className="text-[10px] text-[#B32415]">ಮಿಶ್ರ ತ್ಯಾಜ್ಯ ನೀಡಿದ ಮನೆಗಳು</span>
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
          <p className="text-xs text-[#71856C] text-center py-3">No records submitted yet.</p>
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
                      {data.givingWaste} Total HHs
                    </span>
                  </div>
                </div>

                {/* 6 Mini Metric Badges */}
                <div className="grid grid-cols-6 gap-1 text-[10px] text-center font-bold">
                  <div className="bg-[#FFF2CC] text-[#7A5A00] py-1 rounded-sm" title="Giving Waste">
                    <span className="block text-[8px] opacity-75">Waste</span>
                    {data.givingWaste}
                  </div>
                  <div className="bg-[#D9EAD3] text-[#274E13] py-1 rounded-sm" title="Segregated">
                    <span className="block text-[8px] opacity-75">Seg</span>
                    {data.segregated}
                  </div>
                  <div className="bg-[#C9DAF8] text-[#0B5394] py-1 rounded-sm" title="Dry">
                    <span className="block text-[8px] opacity-75">Dry</span>
                    {data.dry}
                  </div>
                  <div className="bg-[#F4CCCC] text-[#783F04] py-1 rounded-sm" title="Sanitary">
                    <span className="block text-[8px] opacity-75">Sanitary</span>
                    {data.sanitary}
                  </div>
                  <div className="bg-[#E0E0E0] text-[#333333] py-1 rounded-sm" title="Special Care">
                    <span className="block text-[8px] opacity-75">Sp. Care</span>
                    {data.specialCare}
                  </div>
                  <div className="bg-[#F8D7DA] text-[#8A1A10] py-1 rounded-sm" title="Mixed">
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
          <p className="text-xs text-[#71856C] text-center py-3">No routes submitted yet.</p>
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
                  <div className="bg-[#D9EAD3] text-[#274E13] py-0.5 rounded-sm" title="Segregated">
                    {data.segregated}
                  </div>
                  <div className="bg-[#C9DAF8] text-[#0B5394] py-0.5 rounded-sm" title="Dry">
                    {data.dry}
                  </div>
                  <div className="bg-[#F4CCCC] text-[#783F04] py-0.5 rounded-sm" title="Sanitary">
                    {data.sanitary}
                  </div>
                  <div className="bg-[#E0E0E0] text-[#333333] py-0.5 rounded-sm" title="Special Care">
                    {data.specialCare}
                  </div>
                  <div className="bg-[#F8D7DA] text-[#8A1A10] py-0.5 rounded-sm" title="Mixed">
                    {data.mixed}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Collection Point Granular Inspection Toggle */}
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
                Inspect Collection Point Wise Data
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
              <p className="text-xs text-[#71856C] text-center py-4">No points to display.</p>
            ) : (
              <div className="divide-y divide-[#EAEFE6] max-h-72 overflow-y-auto">
                {filteredRecords.map((pt) => (
                  <div key={pt.id} className="py-2.5 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-extrabold text-[#2563EB]">{pt.pointName}</span>
                        <span className="text-[10px] text-[#6B7F66] ml-2 font-medium">
                          {pt.route} ({pt.ward?.split(" - ")[0]})
                        </span>
                      </div>
                      <span className="font-bold text-[#7A5A00]">{pt.givingWasteHH} HHs</span>
                    </div>

                    <div className="grid grid-cols-6 gap-1 text-[9px] text-center font-bold">
                      <span className="bg-[#FFF2CC] text-[#7A5A00] py-0.5 rounded-sm">
                        W: {pt.givingWasteHH}
                      </span>
                      <span className="bg-[#D9EAD3] text-[#274E13] py-0.5 rounded-sm">
                        Seg: {pt.segregatedHH}
                      </span>
                      <span className="bg-[#C9DAF8] text-[#0B5394] py-0.5 rounded-sm">
                        Dry: {pt.dryHH}
                      </span>
                      <span className="bg-[#F4CCCC] text-[#783F04] py-0.5 rounded-sm">
                        San: {pt.sanitaryHH}
                      </span>
                      <span className="bg-[#E0E0E0] text-[#333333] py-0.5 rounded-sm">
                        Spc: {pt.specialCareHH}
                      </span>
                      <span className="bg-[#F8D7DA] text-[#8A1A10] py-0.5 rounded-sm">
                        Mix: {pt.mixedHH}
                      </span>
                    </div>

                    {pt.remarks && (
                      <p className="text-[10px] text-[#55694E] italic bg-[#F7F9F5] px-2 py-0.5 rounded-md mt-1">
                        Remarks: {pt.remarks}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

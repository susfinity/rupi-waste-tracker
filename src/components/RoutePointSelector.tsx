"use client";

import React from "react";
import { Calendar, MapPin, Plus, CheckCircle2, Navigation } from "lucide-react";
import {
  WardOption,
  RouteOption,
  WARD_ROUTES,
  CONSTITUENCY_NAME,
} from "@/types/waste-tracker";

interface RoutePointSelectorProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  maxDate?: string;
  selectedWard: WardOption;
  onSelectWard: (ward: WardOption) => void;
  selectedRoute: RouteOption;
  onSelectRoute: (route: RouteOption) => void;
  collectionPoints: string[];
  activePointIndex: number;
  onSelectPointIndex: (index: number) => void;
  onAddPoint: () => void;
  completedPointsMap: Record<number, boolean>;
}

export const RoutePointSelector: React.FC<RoutePointSelectorProps> = ({
  selectedDate,
  onSelectDate,
  maxDate,
  selectedWard,
  onSelectWard,
  selectedRoute,
  onSelectRoute,
  collectionPoints,
  activePointIndex,
  onSelectPointIndex,
  onAddPoint,
  completedPointsMap,
}) => {
  const availableRoutes = WARD_ROUTES[selectedWard] || [];

  return (
    <div className="bg-white rounded-2xl p-4 border border-[#E1EAD9] shadow-xs space-y-3.5">
      {/* Row 1: Date & Constituency */}
      <div className="flex items-center justify-between gap-2 border-b border-[#EAF0E5] pb-2.5">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-[#4C9F38]" />
          <div>
            <span className="text-xs font-bold text-[#192613] block leading-none">Record Date</span>
            <span className="text-[10px] text-[#7F917A] leading-none">(ದಿನಾಂಕ)</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold bg-[#EAF5E5] text-[#295F1A] px-2 py-0.5 rounded-md">
            {CONSTITUENCY_NAME}
          </span>
          <input
            type="date"
            value={selectedDate}
            max={maxDate}
            onChange={(e) => onSelectDate(e.target.value)}
            className="text-xs font-semibold text-[#192613] bg-[#F4F8F1] border border-[#CFDFC5] rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-[#4C9F38]"
          />
        </div>
      </div>

      {/* Row 2: Ward & Route Selectors */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[#192613] flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#4C9F38]" />
            <span>Ward & Route / Block</span>
            <span className="text-[#7F917A] font-normal text-[10px]">(ವಾರ್ಡ್ ಮತ್ತು ಮಾರ್ಗ)</span>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Ward Select */}
          <div>
            <label className="text-[10px] uppercase font-bold text-[#6D8068] block mb-1">Ward</label>
            <select
              value={selectedWard}
              onChange={(e) => {
                const newWard = e.target.value as WardOption;
                onSelectWard(newWard);
                const nextRoute = WARD_ROUTES[newWard][0];
                onSelectRoute(nextRoute);
              }}
              className="w-full text-xs font-bold text-[#192613] bg-[#F4F8F1] border border-[#CFDFC5] rounded-xl px-2.5 py-2 focus:outline-hidden focus:ring-2 focus:ring-[#4C9F38]"
            >
              <option value="Ward 28 - Kammanahalli">Ward 28 - Kammanahalli</option>
              <option value="Ward 29 - Kacharakanahalli">Ward 29 - Kacharakanahalli</option>
            </select>
          </div>

          {/* Route Select */}
          <div>
            <label className="text-[10px] uppercase font-bold text-[#6D8068] block mb-1">Route / Block</label>
            <select
              value={selectedRoute}
              onChange={(e) => onSelectRoute(e.target.value as RouteOption)}
              className="w-full text-xs font-bold text-[#192613] bg-[#F4F8F1] border border-[#CFDFC5] rounded-xl px-2.5 py-2 focus:outline-hidden focus:ring-2 focus:ring-[#4C9F38]"
            >
              {availableRoutes.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Row 3: Collection Point Stepper (Points 1 - 6+) */}
      <div className="pt-2 border-t border-[#EAF0E5]">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-[#192613] flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Collection Point</span>
            <span className="text-[#7F917A] font-normal text-[10px]">(ಸಂಗ್ರಹಣಾ ಸ್ಥಳ 1-6+)</span>
          </label>
          <span className="text-[11px] font-bold text-[#2563EB]">
            {collectionPoints[activePointIndex]} ({activePointIndex + 1}/{collectionPoints.length})
          </span>
        </div>

        {/* Stepper horizontal pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {collectionPoints.map((pointName, idx) => {
            const isActive = idx === activePointIndex;
            const isCompleted = !!completedPointsMap[idx];

            return (
              <button
                key={pointName}
                type="button"
                onClick={() => onSelectPointIndex(idx)}
                className={`relative flex items-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-[#2563EB] text-white border-[#1D4ED8] shadow-sm ring-2 ring-[#2563EB]/25"
                    : isCompleted
                    ? "bg-[#EAF7E8] text-[#205C16] border-[#B6DDAF]"
                    : "bg-[#F9FAF6] text-[#3E5136] border-[#DCE8D4] hover:bg-[#F0F5EC]"
                }`}
              >
                <span>{pointName}</span>
                {isCompleted && (
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-[#3E8D2C]"}`}
                  />
                )}
              </button>
            );
          })}

          {/* Add More Collection Points Button */}
          <button
            type="button"
            onClick={onAddPoint}
            className="flex items-center gap-1 py-2 px-2.5 rounded-xl border border-dashed border-[#4C9F38] bg-[#F4F9F1] text-[#347823] hover:bg-[#EAF5E5] text-xs font-bold whitespace-nowrap active:scale-95 transition"
            title="Add another collection point (Point 7, 8...)"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Point</span>
          </button>
        </div>
      </div>
    </div>
  );
};

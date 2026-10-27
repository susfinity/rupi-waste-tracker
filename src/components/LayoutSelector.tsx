"use client";

import React from "react";
import { MapPin, Calendar, CheckCircle2 } from "lucide-react";
import { LayoutOption } from "@/types/waste-tracker";

interface LayoutSelectorProps {
  selectedLayout: LayoutOption;
  onSelectLayout: (layout: LayoutOption) => void;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  maxDate?: string;
}

const PRESET_LAYOUTS: { id: string; label: string; kannada: string }[] = [
  { id: "Survagnya Nagar", label: "Survagnya Nagar", kannada: "ಸರ್ವಜ್ಞ ನಗರ" },
  { id: "Layout 1", label: "Layout 1", kannada: "ಲೇಔಟ್ 1" },
  { id: "Layout 2", label: "Layout 2", kannada: "ಲೇಔಟ್ 2" },
];

export const LayoutSelector: React.FC<LayoutSelectorProps> = ({
  selectedLayout,
  onSelectLayout,
  selectedDate,
  onSelectDate,
  maxDate,
}) => {
  return (
    <div className="bg-white rounded-2xl p-4 border border-[#E1EAD9] shadow-xs space-y-3.5">
      {/* Date Selector Row */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-[#192613] flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-[#4C9F38]" />
          <span>Record Date</span>
          <span className="text-[#7F917A] font-normal text-[11px]">(ದಿನಾಂಕ)</span>
        </label>
        <input
          type="date"
          value={selectedDate}
          max={maxDate}
          onChange={(e) => onSelectDate(e.target.value)}
          className="text-xs font-semibold text-[#192613] bg-[#F4F8F1] border border-[#CFDFC5] rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-[#4C9F38]"
        />
      </div>

      {/* Layout Selection Segmented Cards */}
      <div>
        <label className="block text-xs font-bold text-[#192613] mb-1.5 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-[#4C9F38]" />
          <span>Select Layout / Area</span>
          <span className="text-[#7F917A] font-normal text-[11px]">(ಬಡಾವಣೆ ಆಯ್ಕೆ)</span>
        </label>

        <div className="grid grid-cols-3 gap-2">
          {PRESET_LAYOUTS.map((item) => {
            const isSelected = selectedLayout === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectLayout(item.id)}
                className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border text-center transition-all ${
                  isSelected
                    ? "bg-[#4C9F38] border-[#4C9F38] text-white shadow-sm ring-2 ring-[#4C9F38]/30"
                    : "bg-[#F9FAF6] border-[#DCE8D4] text-[#293822] hover:bg-[#F0F6EB]"
                }`}
              >
                <div className="flex items-center gap-1">
                  <span className="font-bold text-xs leading-tight">{item.label}</span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </div>
                <span
                  className={`text-[10px] mt-0.5 leading-none ${
                    isSelected ? "text-[#EAF5E5]" : "text-[#7B8C76]"
                  }`}
                >
                  {item.kannada}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

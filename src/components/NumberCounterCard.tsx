"use client";

import React, { useState } from "react";
import { Plus, Minus, RotateCcw, AlertCircle, Check } from "lucide-react";

interface NumberCounterCardProps {
  id: string;
  title: string;
  kannadaTitle: string;
  value: number;
  onChange: (val: number) => void;
  icon: React.ReactNode;
  themeColor: "green" | "emerald" | "blue" | "amber";
  maxLimit?: number; // Total HHs to check against
  showQuickMax?: boolean; // For segregated: sets value = maxLimit
  badgeText?: string;
}

export const NumberCounterCard: React.FC<NumberCounterCardProps> = ({
  id,
  title,
  kannadaTitle,
  value,
  onChange,
  icon,
  themeColor,
  maxLimit,
  showQuickMax,
  badgeText,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editInput, setEditInput] = useState(value.toString());

  const handleStep = (step: number) => {
    const nextVal = Math.max(0, value + step);
    onChange(nextVal);
  };

  const handleDirectInputBlur = () => {
    setIsEditing(false);
    const parsed = parseInt(editInput, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      onChange(parsed);
    } else {
      setEditInput(value.toString());
    }
  };

  const handleDirectInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleDirectInputBlur();
    }
  };

  const isExceeded = maxLimit !== undefined && maxLimit > 0 && value > maxLimit;

  // Theme stylings
  const themeStyles = {
    green: {
      border: "border-[#CCE4C1]",
      bg: "bg-white",
      headerBg: "bg-[#F3F8EE]",
      iconBg: "bg-[#4C9F38] text-white",
      highlightText: "text-[#2B661D]",
      pillBg: "bg-[#EAF5E5] text-[#2F6D1F] hover:bg-[#DDF0D6] border border-[#C5E3BA]",
      buttonActive: "active:bg-[#3D852B]",
    },
    emerald: {
      border: "border-[#C5E8D3]",
      bg: "bg-white",
      headerBg: "bg-[#EDF9F1]",
      iconBg: "bg-[#1E8A54] text-white",
      highlightText: "text-[#156B40]",
      pillBg: "bg-[#E2F5E9] text-[#166F42] hover:bg-[#D0EFDC] border border-[#BCE4CC]",
      buttonActive: "active:bg-[#166E41]",
    },
    blue: {
      border: "border-[#C7E7F6]",
      bg: "bg-white",
      headerBg: "bg-[#EFF8FC]",
      iconBg: "bg-[#1D9ED9] text-white",
      highlightText: "text-[#126B94]",
      pillBg: "bg-[#E3F4FC] text-[#136C95] hover:bg-[#D0EEFA] border border-[#BDE3F4]",
      buttonActive: "active:bg-[#1581B2]",
    },
    amber: {
      border: "border-[#FADFC7]",
      bg: "bg-white",
      headerBg: "bg-[#FEF6EE]",
      iconBg: "bg-[#F15B2B] text-white",
      highlightText: "text-[#B33B14]",
      pillBg: "bg-[#FDECE3] text-[#B33B14] hover:bg-[#FCDFD0] border border-[#F9CCA8]",
      buttonActive: "active:bg-[#C9471E]",
    },
  }[themeColor];

  return (
    <div
      className={`rounded-2xl border ${
        isExceeded ? "border-red-400 ring-2 ring-red-200" : themeStyles.border
      } ${themeStyles.bg} overflow-hidden shadow-xs transition-all`}
    >
      {/* Card Header */}
      <div className={`px-3.5 py-2.5 ${themeStyles.headerBg} border-b ${themeStyles.border} flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-xl ${themeStyles.iconBg} shadow-2xs`}>
            {icon}
          </div>
          <div>
            <h4 className="font-bold text-xs text-[#192613] leading-tight flex items-center gap-1.5">
              <span>{title}</span>
            </h4>
            <p className="text-[11px] font-medium text-[#657960] leading-none mt-0.5">
              {kannadaTitle}
            </p>
          </div>
        </div>

        {/* Optional Badge (e.g. Segregation %) */}
        {badgeText && (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white border border-[#CFE4C5] text-[#2F6D1F] shadow-2xs">
            {badgeText}
          </span>
        )}
      </div>

      {/* Main Counter Display */}
      <div className="p-3.5 space-y-3">
        <div className="flex items-center justify-between gap-3">
          {/* Minus Steppers */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleStep(-10)}
              disabled={value === 0}
              className="w-9 h-11 rounded-xl bg-[#F4F7F1] border border-[#D8E4D1] text-[#34442F] font-bold text-xs disabled:opacity-30 disabled:pointer-events-none hover:bg-[#EAEFE6]"
            >
              -10
            </button>
            <button
              type="button"
              onClick={() => handleStep(-1)}
              disabled={value === 0}
              className="w-10 h-11 rounded-xl bg-[#F4F7F1] border border-[#D8E4D1] text-[#34442F] font-bold flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none hover:bg-[#EAEFE6]"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>

          {/* Large Digit Center Tap-to-Edit */}
          <div className="flex-1 text-center">
            {isEditing ? (
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                autoFocus
                value={editInput}
                onChange={(e) => setEditInput(e.target.value)}
                onBlur={handleDirectInputBlur}
                onKeyDown={handleDirectInputKeyDown}
                className="w-24 text-center font-black text-3xl text-[#192613] bg-[#EAF5E5] border-2 border-[#4C9F38] rounded-xl py-1 outline-hidden"
              />
            ) : (
              <div
                onClick={() => {
                  setEditInput(value.toString());
                  setIsEditing(true);
                }}
                className="cursor-pointer group select-none py-0.5"
                title="Tap to type number directly"
              >
                <span className={`font-black text-3xl tracking-tight ${themeStyles.highlightText}`}>
                  {value}
                </span>
                <span className="block text-[10px] text-[#7F937B] font-medium group-hover:text-[#4C9F38]">
                  tap to type
                </span>
              </div>
            )}
          </div>

          {/* Plus Steppers */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleStep(1)}
              className="w-10 h-11 rounded-xl bg-[#4C9F38] text-white font-bold flex items-center justify-center hover:bg-[#3E862C] shadow-xs active:scale-95 transition"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={() => handleStep(10)}
              className="w-9 h-11 rounded-xl bg-[#4C9F38] text-white font-bold text-xs hover:bg-[#3E862C] shadow-xs active:scale-95 transition"
            >
              +10
            </button>
          </div>
        </div>

        {/* Quick Increment Row & Action Shortcuts */}
        <div className="flex items-center justify-between gap-1.5 pt-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => handleStep(5)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold ${themeStyles.pillBg} transition`}
            >
              +5
            </button>
            <button
              type="button"
              onClick={() => handleStep(25)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold ${themeStyles.pillBg} transition`}
            >
              +25
            </button>
            <button
              type="button"
              onClick={() => handleStep(50)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold ${themeStyles.pillBg} transition`}
            >
              +50
            </button>

            {/* Quick Set All button if applicable */}
            {showQuickMax && maxLimit !== undefined && maxLimit > 0 && (
              <button
                type="button"
                onClick={() => onChange(maxLimit)}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#EAF5E5] text-[#2F6D1F] hover:bg-[#DDF0D6] border border-[#BBDFA9] flex items-center gap-1"
                title="Set to 100% of Total HHs"
              >
                <Check className="w-3 h-3" />
                <span>All ({maxLimit})</span>
              </button>
            )}
          </div>

          {/* Reset button */}
          {value > 0 && (
            <button
              type="button"
              onClick={() => onChange(0)}
              title="Reset to 0"
              className="p-1.5 text-[#8A9C84] hover:text-[#B33B14] rounded-md transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Validation Warning if exceeded */}
        {isExceeded && (
          <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-700 px-2.5 py-1.5 rounded-xl text-xs font-medium animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>
              Cannot exceed Total HHs ({maxLimit}). ಒಟ್ಟು ಮನೆಗಳ ಸಂಖ್ಯೆಯನ್ನು ಮೀರಬಾರದು.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

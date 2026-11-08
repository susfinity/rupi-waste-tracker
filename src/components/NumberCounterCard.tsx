"use client";

import React, { useState } from "react";
import { Plus, Minus, RotateCcw } from "lucide-react";

export type ThemeColorKey = "cream" | "green" | "blue" | "salmon" | "slate" | "crimson";

interface NumberCounterCardProps {
  id: string;
  title: string;
  kannadaTitle: string;
  value: number;
  onChange: (val: number) => void;
  icon: React.ReactNode;
  themeColor: ThemeColorKey;
  maxLimit?: number;
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

  // Exact color styles matching user reference image
  const themeStyles: Record<
    ThemeColorKey,
    {
      border: string;
      bg: string;
      headerBg: string;
      iconBg: string;
      highlightText: string;
      pillBg: string;
      buttonActive: string;
      accentBorder: string;
    }
  > = {
    // 1. HHs Giving Waste (Warm Cream / Pale Yellow - #FFF2CC)
    cream: {
      border: "border-[#FFE599]",
      bg: "bg-[#FFFDF6]",
      headerBg: "bg-[#FFF2CC]",
      iconBg: "bg-[#C49200] text-white",
      highlightText: "text-[#7A5A00]",
      pillBg: "bg-[#FFF8E1] text-[#7A5A00] hover:bg-[#FFEEC0] border border-[#FFE082]",
      buttonActive: "active:bg-[#F3C742]",
      accentBorder: "border-[#FFE599]",
    },
    // 2. HHs Giving Segregated Wastes (Pastel Green - #D9EAD3 / #B6D7A8)
    green: {
      border: "border-[#B6D7A8]",
      bg: "bg-[#F9FCF8]",
      headerBg: "bg-[#D9EAD3]",
      iconBg: "bg-[#4C9F38] text-white",
      highlightText: "text-[#274E13]",
      pillBg: "bg-[#EAF5E5] text-[#274E13] hover:bg-[#DCF0D5] border border-[#B6D7A8]",
      buttonActive: "active:bg-[#3D852B]",
      accentBorder: "border-[#B6D7A8]",
    },
    // 3. HHs Giving Dry Waste (Soft Sky Blue - #C9DAF8)
    blue: {
      border: "border-[#A4C2F4]",
      bg: "bg-[#F7FAFE]",
      headerBg: "bg-[#C9DAF8]",
      iconBg: "bg-[#3B82F6] text-white",
      highlightText: "text-[#0B5394]",
      pillBg: "bg-[#E6EFFD] text-[#0B5394] hover:bg-[#D4E3FB] border border-[#A4C2F4]",
      buttonActive: "active:bg-[#2563EB]",
      accentBorder: "border-[#A4C2F4]",
    },
    // 4. HHs Giving Sanitary Waste (Coral / Salmon - #E69185 / #F4CCCC)
    salmon: {
      border: "border-[#E69185]",
      bg: "bg-[#FEF8F7]",
      headerBg: "bg-[#F4CCCC]",
      iconBg: "bg-[#D9534F] text-white",
      highlightText: "text-[#783F04]",
      pillBg: "bg-[#FCEAE8] text-[#783F04] hover:bg-[#F9D7D3] border border-[#E69185]",
      buttonActive: "active:bg-[#C9302C]",
      accentBorder: "border-[#E69185]",
    },
    // 5. HHs Giving Special Care Waste (Medium Slate / Neutral Grey - #B7B7B7)
    slate: {
      border: "border-[#B7B7B7]",
      bg: "bg-[#FAFAFA]",
      headerBg: "bg-[#E0E0E0]",
      iconBg: "bg-[#616161] text-white",
      highlightText: "text-[#333333]",
      pillBg: "bg-[#EEEEEE] text-[#333333] hover:bg-[#E0E0E0] border border-[#BDBDBD]",
      buttonActive: "active:bg-[#424242]",
      accentBorder: "border-[#B7B7B7]",
    },
    // 6. HHs Giving Mixed Waste (Crimson / Deep Brick Red - #CC4125)
    crimson: {
      border: "border-[#CC4125]",
      bg: "bg-[#FFF6F5]",
      headerBg: "bg-[#E67C73]/30",
      iconBg: "bg-[#CC4125] text-white",
      highlightText: "text-[#8A1A10]",
      pillBg: "bg-[#FCEAE7] text-[#8A1A10] hover:bg-[#F9D4CF] border border-[#F19C8E]",
      buttonActive: "active:bg-[#B32415]",
      accentBorder: "border-[#CC4125]",
    },
  };

  const style = themeStyles[themeColor];

  return (
    <div
      className={`rounded-2xl border-2 transition-all ${
        isExceeded ? "border-red-500 ring-2 ring-red-200" : style.border
      } ${style.bg} shadow-xs overflow-hidden`}
    >
      {/* Card Header */}
      <div className={`px-3.5 py-2.5 flex items-center justify-between border-b ${style.accentBorder} ${style.headerBg}`}>
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${style.iconBg} shadow-xs`}>{icon}</div>
          <div>
            <h4 className="text-xs font-extrabold text-[#192613] leading-tight">{title}</h4>
            <p className="text-[10px] text-[#55694E] font-medium leading-none mt-0.5">{kannadaTitle}</p>
          </div>
        </div>

        {badgeText && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 border border-black/10 text-[#2C4A1D]">
            {badgeText}
          </span>
        )}
      </div>

      {/* Main Counter Body */}
      <div className="p-3.5 space-y-3">
        <div className="flex items-center justify-between gap-3">
          {/* Quick Decrement */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={value === 0}
              onClick={() => handleStep(-1)}
              className="w-10 h-10 rounded-xl bg-white border border-[#D0DED0] flex items-center justify-center text-[#2A4020] hover:bg-gray-50 active:scale-95 disabled:opacity-30 disabled:pointer-events-none shadow-2xs font-bold transition"
            >
              <Minus className="w-5 h-5" />
            </button>
            {value >= 5 && (
              <button
                type="button"
                onClick={() => handleStep(-5)}
                className="w-8 h-8 rounded-lg bg-white border border-[#D0DED0] flex items-center justify-center text-xs font-bold text-[#4B6540] hover:bg-gray-50 active:scale-95 shadow-2xs transition"
              >
                -5
              </button>
            )}
          </div>

          {/* Central Big Number Display (Click to type) */}
          <div className="flex-1 text-center">
            {isEditing ? (
              <input
                id={id}
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                autoFocus
                value={editInput}
                onChange={(e) => setEditInput(e.target.value)}
                onBlur={handleDirectInputBlur}
                onKeyDown={handleDirectInputKeyDown}
                className="w-24 text-center font-black text-3xl py-0.5 bg-white border-2 border-[#4C9F38] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#4C9F38]/30 shadow-inner"
              />
            ) : (
              <button
                type="button"
                onClick={() => {
                  setEditInput(value.toString());
                  setIsEditing(true);
                }}
                className="group inline-flex flex-col items-center justify-center py-0.5 px-3 rounded-xl hover:bg-white/80 transition"
              >
                <span className={`font-black text-3xl tracking-tight leading-none ${style.highlightText}`}>
                  {value}
                </span>
                <span className="text-[9px] font-semibold text-[#8B9F85] uppercase tracking-wider mt-0.5 group-hover:text-[#4C9F38]">
                  tap to type
                </span>
              </button>
            )}
          </div>

          {/* Quick Increment */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleStep(1)}
              className="w-10 h-10 rounded-xl bg-[#4C9F38] hover:bg-[#3F882C] text-white flex items-center justify-center shadow-xs active:scale-95 font-bold transition"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => handleStep(5)}
              className="w-8 h-8 rounded-lg bg-white border border-[#D0DED0] flex items-center justify-center text-xs font-bold text-[#4B6540] hover:bg-gray-50 active:scale-95 shadow-2xs transition"
            >
              +5
            </button>
          </div>
        </div>

        {/* Quick Stepper Pills */}
        <div className="flex items-center justify-between gap-1 pt-1 border-t border-black/5">
          <div className="flex items-center gap-1">
            {[10, 25, 50, 100].map((step) => (
              <button
                key={step}
                type="button"
                onClick={() => handleStep(step)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${style.pillBg} active:scale-95 transition shadow-2xs`}
              >
                +{step}
              </button>
            ))}
          </div>

          {value > 0 && (
            <button
              type="button"
              onClick={() => onChange(0)}
              className="p-1 rounded-md text-[#889C83] hover:text-red-600 hover:bg-red-50 transition"
              title="Reset to 0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {isExceeded && (
          <p className="text-[10px] font-bold text-red-600 bg-red-50 py-1 px-2 rounded-md">
            ⚠️ Warning: Exceeds total households giving waste ({maxLimit})
          </p>
        )}
      </div>
    </div>
  );
};

"use client";

import React from "react";
import { CheckCircle, ArrowLeft, Send, X, MapPin, Calendar, User } from "lucide-react";
import {
  CollectionPointEntry,
  WardOption,
  RouteOption,
  CONSTITUENCY_NAME,
} from "@/types/waste-tracker";
import confetti from "canvas-confetti";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  ward: WardOption;
  route: RouteOption;
  supervisorName: string;
  points: CollectionPointEntry[];
  onConfirmSubmit: () => Promise<void>;
  isSubmitting: boolean;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  date,
  ward,
  route,
  supervisorName,
  points,
  onConfirmSubmit,
  isSubmitting,
}) => {
  if (!isOpen) return null;

  // Calculate totals across all points
  const totalGivingWaste = points.reduce((sum, p) => sum + (p.givingWasteHH || 0), 0);
  const totalSegregated = points.reduce((sum, p) => sum + (p.segregatedHH || 0), 0);
  const totalDry = points.reduce((sum, p) => sum + (p.dryHH || 0), 0);
  const totalSanitary = points.reduce((sum, p) => sum + (p.sanitaryHH || 0), 0);
  const totalSpecialCare = points.reduce((sum, p) => sum + (p.specialCareHH || 0), 0);
  const totalMixed = points.reduce((sum, p) => sum + (p.mixedHH || 0), 0);

  const completedPointsCount = points.filter(
    (p) =>
      p.givingWasteHH > 0 ||
      p.segregatedHH > 0 ||
      p.dryHH > 0 ||
      p.sanitaryHH > 0 ||
      p.specialCareHH > 0 ||
      p.mixedHH > 0
  ).length;

  const handleConfirm = async () => {
    if (totalGivingWaste <= 0 || isSubmitting) return;

    try {
      await onConfirmSubmit();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#4C9F38", "#F15B2B", "#1D9ED9", "#F7C500"],
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#D5E4CC] overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#4C9F38] to-[#2E681F] text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 rounded-xl">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">Review Day's Route Collection</h3>
              <p className="text-[11px] text-[#E0F2D6]">
                ದಿನದ ಸಂಗ್ರಹಣಾ ದಾಖಲೆ ಪರಿಶೀಲಿಸಿ • {CONSTITUENCY_NAME}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 rounded-full text-white/80 hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-3.5 overflow-y-auto flex-1">
          {/* Metadata banner */}
          <div className="bg-[#F6FAF2] border border-[#DEECDA] rounded-2xl p-3 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#6D8068] block">Ward No & Name</span>
              <span className="font-bold text-[#192613]">{ward}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#6D8068] block">Date</span>
              <span className="font-bold text-[#192613]">{date}</span>
            </div>
            <div className="col-span-2 pt-1 border-t border-[#E8F1E4] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#6D8068] block">Route / Block</span>
                <span className="font-extrabold text-[#2563EB]">{route}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-[#6D8068] block">Supervisor</span>
                <span className="font-bold text-[#285F1B]">{supervisorName}</span>
              </div>
            </div>
          </div>

          {/* Aggregate Totals Summary (Matching palette colors) */}
          <div>
            <h4 className="text-xs font-bold text-[#192613] mb-2 flex items-center justify-between">
              <span>Day's Total Across All Points ({completedPointsCount}/{points.length} filled)</span>
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {/* 1. Giving Waste */}
              <div className="bg-[#FFFDF6] border-2 border-[#FFE599] rounded-xl p-2 text-center">
                <span className="text-[10px] font-bold text-[#7A5A00] block leading-tight">1. Giving Waste</span>
                <span className="font-black text-xl text-[#7A5A00]">{totalGivingWaste}</span>
                <span className="text-[9px] text-[#A67C00] block">ಒಟ್ಟು ತ್ಯಾಜ್ಯ</span>
              </div>

              {/* 2. Segregated Wet Waste */}
              <div className="bg-[#F9FCF8] border-2 border-[#B6D7A8] rounded-xl p-2 text-center">
                <span className="text-[10px] font-bold text-[#274E13] block leading-tight">2. Segregated</span>
                <span className="font-black text-xl text-[#274E13]">{totalSegregated}</span>
                <span className="text-[9px] text-[#427A23] block">ಹಸಿ ತ್ಯಾಜ್ಯ</span>
              </div>

              {/* 3. Dry Waste */}
              <div className="bg-[#F7FAFE] border-2 border-[#A4C2F4] rounded-xl p-2 text-center">
                <span className="text-[10px] font-bold text-[#0B5394] block leading-tight">3. Dry Waste</span>
                <span className="font-black text-xl text-[#0B5394]">{totalDry}</span>
                <span className="text-[9px] text-[#2563EB] block">ಒಣ ತ್ಯಾಜ್ಯ</span>
              </div>

              {/* 4. Sanitary Waste */}
              <div className="bg-[#FEF8F7] border-2 border-[#E69185] rounded-xl p-2 text-center">
                <span className="text-[10px] font-bold text-[#783F04] block leading-tight">4. Sanitary</span>
                <span className="font-black text-xl text-[#D9534F]">{totalSanitary}</span>
                <span className="text-[9px] text-[#A03D39] block">ಸ್ಯಾನಿಟರಿ</span>
              </div>

              {/* 5. Special Care */}
              <div className="bg-[#FAFAFA] border-2 border-[#B7B7B7] rounded-xl p-2 text-center">
                <span className="text-[10px] font-bold text-[#333333] block leading-tight">5. Special Care</span>
                <span className="font-black text-xl text-[#424242]">{totalSpecialCare}</span>
                <span className="text-[9px] text-[#616161] block">ವಿಶೇಷ ಕಾಳಜಿ</span>
              </div>

              {/* 6. Mixed Waste */}
              <div className="bg-[#FFF6F5] border-2 border-[#CC4125] rounded-xl p-2 text-center">
                <span className="text-[10px] font-bold text-[#8A1A10] block leading-tight">6. Mixed Waste</span>
                <span className="font-black text-xl text-[#CC4125]">{totalMixed}</span>
                <span className="text-[9px] text-[#B32415] block">ಮಿಶ್ರ ತ್ಯಾಜ್ಯ</span>
              </div>
            </div>
          </div>

          {/* Granular Collection Point Breakdown Table */}
          <div className="border border-[#E2EBDD] rounded-2xl overflow-hidden text-xs">
            <div className="bg-[#F3F8EE] px-3 py-2 border-b border-[#E2EBDD] font-bold text-[#1E3F13] flex items-center justify-between">
              <span>Collection Point Breakdown</span>
              <span className="text-[11px] font-normal text-[#667E5E]">ಸ್ಥಳವಾರು ವಿವರ</span>
            </div>

            <div className="divide-y divide-[#EBF1E8] max-h-56 overflow-y-auto">
              {points.map((pt, idx) => (
                <div key={pt.pointName} className="p-2.5 bg-white space-y-1">
                  <div className="flex items-center justify-between font-bold text-[#192613]">
                    <span className="text-xs text-[#2563EB]">{pt.pointName}</span>
                    <span className="text-[11px] text-[#7A5A00] font-black">
                      {pt.givingWasteHH} HHs Visited
                    </span>
                  </div>

                  {/* 6 mini pills */}
                  <div className="grid grid-cols-6 gap-1 text-[10px] text-center font-bold">
                    <span className="bg-[#FFF2CC] text-[#7A5A00] py-0.5 rounded-sm" title="Giving Waste">
                      {pt.givingWasteHH}
                    </span>
                    <span className="bg-[#D9EAD3] text-[#274E13] py-0.5 rounded-sm" title="Segregated">
                      {pt.segregatedHH}
                    </span>
                    <span className="bg-[#C9DAF8] text-[#0B5394] py-0.5 rounded-sm" title="Dry">
                      {pt.dryHH}
                    </span>
                    <span className="bg-[#F4CCCC] text-[#783F04] py-0.5 rounded-sm" title="Sanitary">
                      {pt.sanitaryHH}
                    </span>
                    <span className="bg-[#E0E0E0] text-[#333333] py-0.5 rounded-sm" title="Special Care">
                      {pt.specialCareHH}
                    </span>
                    <span className="bg-[#F8D7DA] text-[#8A1A10] py-0.5 rounded-sm" title="Mixed">
                      {pt.mixedHH}
                    </span>
                  </div>

                  {pt.remarks && (
                    <p className="text-[10px] text-[#5A6D53] italic bg-[#F8FAF4] px-2 py-0.5 rounded-md mt-1">
                      Remarks: {pt.remarks}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer CTA */}
        <div className="p-4 bg-[#F8FAF5] border-t border-[#E1EAD9] flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="py-3 px-4 rounded-xl border border-[#D5E2CF] font-bold text-xs text-[#52634E] hover:bg-white active:scale-95 transition flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Edit Points</span>
          </button>

          <button
            type="button"
            disabled={totalGivingWaste <= 0 || isSubmitting}
            onClick={handleConfirm}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-[#4C9F38] via-[#3E8D2C] to-[#347823] hover:from-[#3F872C] hover:to-[#2B681C] text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md disabled:opacity-40 disabled:pointer-events-none active:scale-98 transition"
          >
            {isSubmitting ? (
              <span>Uploading to Google Sheets...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit All {points.length} Points (ದೃಢೀಕರಿಸಿ ಸಲ್ಲಿಸಿ)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

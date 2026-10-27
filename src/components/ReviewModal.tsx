"use client";

import React from "react";
import { CheckCircle, AlertTriangle, ArrowLeft, Send, Sparkles, X } from "lucide-react";
import { WasteRecordInput } from "@/types/waste-tracker";
import confetti from "canvas-confetti";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: WasteRecordInput;
  onConfirmSubmit: () => Promise<void>;
  isSubmitting: boolean;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  data,
  onConfirmSubmit,
  isSubmitting,
}) => {
  if (!isOpen) return null;

  const total = Number(data.totalHH || 0);
  const segregated = Number(data.segregatedHH || 0);
  const plastic = Number(data.plasticHH || 0);
  const sanitary = Number(data.sanitaryHH || 0);

  const rate = total > 0 ? ((segregated / total) * 100).toFixed(1) : "0.0";
  const numRate = parseFloat(rate);

  // Error checks
  const hasErrors =
    total <= 0 ||
    segregated > total ||
    plastic > total ||
    sanitary > total;

  const handleConfirm = async () => {
    if (hasErrors || isSubmitting) return;

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
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-[#D5E4CC] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#4C9F38] to-[#2E681F] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 rounded-xl">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">Review Daily Record</h3>
              <p className="text-[11px] text-[#E0F2D6]">ದಾಖಲೆ ಪರಿಶೀಲಿಸಿ • Verify Numbers</p>
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
        <div className="p-4 space-y-3.5 max-h-[75vh] overflow-y-auto">
          {/* Metadata pill */}
          <div className="bg-[#F6FAF2] border border-[#DEECDA] rounded-2xl p-3 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#6D8068] block">Layout / Area</span>
              <span className="font-extrabold text-[#192613] text-sm">{data.layout}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#6D8068] block">Date</span>
              <span className="font-bold text-[#192613]">{data.date}</span>
            </div>
            <div className="col-span-2 pt-1 border-t border-[#E8F1E4] flex items-center justify-between">
              <span className="text-[11px] text-[#6D8068]">Recorded By:</span>
              <span className="font-semibold text-xs text-[#285F1B]">
                {data.workerName} ({data.workerId})
              </span>
            </div>
          </div>

          {/* Counts Table */}
          <div className="border border-[#E2EBDD] rounded-2xl overflow-hidden divide-y divide-[#EBF1E8] text-xs">
            <div className="p-3 bg-[#FAFDF8] flex items-center justify-between">
              <div>
                <span className="font-bold text-[#192613] block">1. Total HHs Giving Waste</span>
                <span className="text-[10px] text-[#71856C]">ಒಟ್ಟು ತ್ಯಾಜ್ಯ ನೀಡಿದ ಮನೆಗಳು</span>
              </div>
              <span className="font-black text-xl text-[#2F6D1F]">{total}</span>
            </div>

            <div className="p-3 bg-white flex items-center justify-between">
              <div>
                <span className="font-bold text-[#192613] block">2. Segregated Waste HHs</span>
                <span className="text-[10px] text-[#71856C]">ವಿಂಗಡಿಸಲಾದ ತ್ಯಾಜ್ಯ ನೀಡಿದ ಮನೆಗಳು</span>
              </div>
              <div className="text-right">
                <span className="font-black text-xl text-[#187547]">{segregated}</span>
                <span className="block text-[10px] font-bold text-[#187547]">
                  {rate}% Segregation
                </span>
              </div>
            </div>

            <div className="p-3 bg-[#FAFDF8] flex items-center justify-between">
              <div>
                <span className="font-bold text-[#192613] block">3. Plastic Waste HHs</span>
                <span className="text-[10px] text-[#71856C]">ಪ್ಲಾಸ್ಟಿಕ್ ತ್ಯಾಜ್ಯ ನೀಡಿದ ಮನೆಗಳು</span>
              </div>
              <span className="font-black text-xl text-[#136C95]">{plastic}</span>
            </div>

            <div className="p-3 bg-white flex items-center justify-between">
              <div>
                <span className="font-bold text-[#192613] block">4. Sanitary Waste HHs</span>
                <span className="text-[10px] text-[#71856C]">ಸ್ಯಾನಿಟರಿ ತ್ಯಾಜ್ಯ ನೀಡಿದ ಮನೆಗಳು</span>
              </div>
              <span className="font-black text-xl text-[#B33B14]">{sanitary}</span>
            </div>

            {data.notes && (
              <div className="p-3 bg-[#FAFDF8]">
                <span className="text-[10px] uppercase font-bold text-[#6D8068] block">Notes / ಟೀಕೆ:</span>
                <p className="font-medium text-[#2C3B27] mt-0.5">{data.notes}</p>
              </div>
            )}
          </div>

          {/* Segregation Performance Gauge */}
          <div className="bg-[#F0F7EC] border border-[#CDE5C4] rounded-2xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#4C9F38] text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-[#1E4D14]">Segregation Score:</span>
                <span className="font-black text-sm text-[#4C9F38]">{rate}%</span>
              </div>
              <p className="text-[11px] text-[#4E6746]">
                {numRate >= 80
                  ? "🌟 Excellent segregation compliance today!"
                  : numRate >= 50
                  ? "👍 Moderate segregation, scope to improve."
                  : "⚠️ Low segregation rate, awareness recommended."}
              </p>
            </div>
          </div>

          {/* Warnings */}
          {hasErrors && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2 text-xs text-red-700">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Please fix discrepancies before submitting:</span>
                <ul className="list-disc pl-4 mt-1 space-y-0.5 text-[11px]">
                  {total <= 0 && <li>Total HHs must be greater than 0.</li>}
                  {segregated > total && <li>Segregated HHs cannot exceed Total HHs.</li>}
                  {plastic > total && <li>Plastic HHs cannot exceed Total HHs.</li>}
                  {sanitary > total && <li>Sanitary HHs cannot exceed Total HHs.</li>}
                </ul>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex gap-2.5">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="flex-1 py-3 px-3 bg-[#F4F7F1] hover:bg-[#EAF0E6] text-[#34442F] font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Edit Numbers</span>
            </button>

            <button
              type="button"
              disabled={hasErrors || isSubmitting}
              onClick={handleConfirm}
              className="flex-2 py-3 px-4 bg-gradient-to-r from-[#F15B2B] to-[#D9491B] hover:from-[#DE4F20] hover:to-[#C63E14] text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:pointer-events-none transition"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? "Uploading..." : "Confirm & Send"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

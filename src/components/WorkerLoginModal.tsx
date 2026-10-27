"use client";

import React, { useState } from "react";
import { User, Check, ShieldCheck, X } from "lucide-react";
import { WorkerProfile, LayoutOption } from "@/types/waste-tracker";

interface WorkerLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: WorkerProfile;
  onSaveProfile: (profile: WorkerProfile) => void;
}

const LAYOUTS: LayoutOption[] = ["Survagnya Nagar", "Layout 1", "Layout 2"];

export const WorkerLoginModal: React.FC<WorkerLoginModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onSaveProfile,
}) => {
  const [name, setName] = useState(currentProfile.name);
  const [workerId, setWorkerId] = useState(currentProfile.workerId);
  const [defaultLayout, setDefaultLayout] = useState<LayoutOption>(
    currentProfile.defaultLayout || "Survagnya Nagar"
  );
  const [isRemembered, setIsRemembered] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSaveProfile({
      name: name.trim(),
      workerId: workerId.trim() || "FW-" + Math.floor(100 + Math.random() * 900),
      defaultLayout,
      isRemembered,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-[#D5E4CC] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#4C9F38] to-[#377527] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Field Worker Profile</h3>
              <p className="text-[11px] text-[#E0F2D6]">ಕೆಲಸಗಾರರ ಮಾಹಿತಿ • Default Login</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-[#192613] mb-1">
              Worker Full Name <span className="text-[#8A9B85] font-normal">(ನಿಮ್ಮ ಹೆಸರು)</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Kumar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#F9FAF6] border border-[#CDE1C4] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#4C9F38] focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#192613] mb-1">
              Worker ID / Badge Number <span className="text-[#8A9B85] font-normal">(ಐಡಿ ಸಂಖ್ಯೆ)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. SN-04"
              value={workerId}
              onChange={(e) => setWorkerId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#F9FAF6] border border-[#CDE1C4] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#4C9F38] focus:bg-white transition font-mono uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#192613] mb-1">
              Default Area / Layout <span className="text-[#8A9B85] font-normal">(ಪ್ರಮುಖ ಬಡಾವಣೆ)</span>
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {LAYOUTS.map((lay) => (
                <button
                  key={lay}
                  type="button"
                  onClick={() => setDefaultLayout(lay)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold text-left border flex items-center justify-between transition ${
                    defaultLayout === lay
                      ? "bg-[#EDF7E8] border-[#4C9F38] text-[#2F6A20]"
                      : "bg-[#F9FAF6] border-[#D9E6D2] text-[#42503E] hover:bg-[#F2F7EE]"
                  }`}
                >
                  <span>{lay}</span>
                  {defaultLayout === lay && <Check className="w-4 h-4 text-[#4C9F38]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Remember check */}
          <div className="pt-1">
            <label className="flex items-start gap-2 cursor-pointer bg-[#F7FAF4] p-2.5 rounded-xl border border-[#E3EDDD]">
              <input
                type="checkbox"
                checked={isRemembered}
                onChange={(e) => setIsRemembered(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-[#4C9F38] accent-[#4C9F38] rounded-sm focus:ring-0"
              />
              <div className="text-xs">
                <span className="font-bold text-[#192613] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#4C9F38]" />
                  Keep me logged in automatically
                </span>
                <p className="text-[11px] text-[#5B6B56]">
                  ಮುಂದಿನ ಬಾರಿ ನೇರವಾಗಿ ಲಾಗಿನ್ ಆಗಿ (No need to type name again)
                </p>
              </div>
            </label>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-[#4C9F38] hover:bg-[#3D852B] active:bg-[#326E23] text-white rounded-xl font-bold text-sm shadow-md transition"
            >
              Save & Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

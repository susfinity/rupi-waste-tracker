"use client";

import React, { useState } from "react";
import { User, Check, X, MapPin } from "lucide-react";
import {
  WorkerProfile,
  WardOption,
  RouteOption,
  WARD_ROUTES,
  CONSTITUENCY_NAME,
} from "@/types/waste-tracker";

interface WorkerLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: WorkerProfile;
  onSaveProfile: (profile: WorkerProfile) => void;
}

const WARDS: { id: WardOption; label: string; kannada: string }[] = [
  {
    id: "Ward 28 - Kammanahalli",
    label: "Ward 28 - Kammanahalli",
    kannada: "ವಾರ್ಡ್ 28 - ಕಮ್ಮನಹಳ್ಳಿ",
  },
  {
    id: "Ward 29 - Kacharakanahalli",
    label: "Ward 29 - Kacharakanahalli",
    kannada: "ವಾರ್ಡ್ 29 - ಕಾಚರಕನಹಳ್ಳಿ",
  },
];

export const WorkerLoginModal: React.FC<WorkerLoginModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onSaveProfile,
}) => {
  const [name, setName] = useState(currentProfile.name);
  const [ward, setWard] = useState<WardOption>(
    currentProfile.assignedWard || "Ward 28 - Kammanahalli"
  );
  const [route, setRoute] = useState<RouteOption>(() => {
    const currentWard = currentProfile.assignedWard || "Ward 28 - Kammanahalli";
    const available = WARD_ROUTES[currentWard];
    return available.includes(currentProfile.assignedRoute)
      ? currentProfile.assignedRoute
      : available[0];
  });
  const [isRemembered, setIsRemembered] = useState(true);

  if (!isOpen) return null;

  const handleWardChange = (selectedWard: WardOption) => {
    setWard(selectedWard);
    // Auto-select the first route of the new ward
    setRoute(WARD_ROUTES[selectedWard][0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSaveProfile({
      name: name.trim(),
      assignedWard: ward,
      assignedRoute: route,
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
              <h3 className="font-bold text-base leading-tight">Field Supervisor Profile</h3>
              <p className="text-[11px] text-[#E0F2D6]">
                ಮೇಲ್ವಿಚಾರಕರ ಮಾಹಿತಿ • {CONSTITUENCY_NAME}
              </p>
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
          {/* Field 1: Name (ಹೆಸರು) */}
          <div>
            <label className="block text-xs font-bold text-[#192613] mb-1">
              Name <span className="text-[#647C5E] font-normal">(ಹೆಸರು)</span>
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

          {/* Field 2: Ward No */}
          <div>
            <label className="block text-xs font-bold text-[#192613] mb-1">
              Ward No <span className="text-[#647C5E] font-normal">(ವಾರ್ಡ್ ಸಂಖ್ಯೆ)</span>
            </label>
            <div className="space-y-1.5">
              {WARDS.map((w) => {
                const isSelected = ward === w.id;
                return (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => handleWardChange(w.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-left text-xs transition ${
                      isSelected
                        ? "bg-[#4C9F38] border-[#4C9F38] text-white font-bold shadow-xs"
                        : "bg-[#F9FAF6] border-[#DCE8D4] text-[#293822] hover:bg-[#F0F6EB]"
                    }`}
                  >
                    <div>
                      <div className="leading-tight">{w.label}</div>
                      <div
                        className={`text-[10px] ${
                          isSelected ? "text-[#EAF5E5]" : "text-[#7B8C76]"
                        }`}
                      >
                        {w.kannada}
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-white shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Field 3: Route / Block (Dynamic by Ward) */}
          <div>
            <label className="block text-xs font-bold text-[#192613] mb-1">
              Route / Block <span className="text-[#647C5E] font-normal">(ಮಾರ್ಗ / ಬ್ಲಾಕ್)</span>
            </label>
            <div className="space-y-1.5">
              {WARD_ROUTES[ward].map((r) => {
                const isSelected = route === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRoute(r)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-left text-xs transition ${
                      isSelected
                        ? "bg-[#2563EB] border-[#2563EB] text-white font-bold shadow-xs"
                        : "bg-[#F9FAF6] border-[#DCE8D4] text-[#293822] hover:bg-[#F0F6EB]"
                    }`}
                  >
                    <span className="leading-tight">{r}</span>
                    {isSelected && <Check className="w-4 h-4 text-white shrink-0" />}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-[#71856C] mt-1">
              * Assigned route can be confirmed or changed each day on the main screen.
            </p>
          </div>

          {/* Remember Switch */}
          <div className="flex items-center gap-2 pt-1 border-t border-[#EAEFE6]">
            <input
              type="checkbox"
              id="rememberSupervisor"
              checked={isRemembered}
              onChange={(e) => setIsRemembered(e.target.checked)}
              className="w-4 h-4 text-[#4C9F38] rounded-sm focus:ring-[#4C9F38]"
            />
            <label htmlFor="rememberSupervisor" className="text-xs text-[#4A5D44]">
              Keep me logged in on this phone (ಲಾಗಿನ್ ವಿವರ ಉಳಿಸಿ)
            </label>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            className="w-full py-2.5 bg-[#4C9F38] hover:bg-[#3D852B] active:scale-98 text-white font-bold rounded-xl text-sm transition shadow-sm"
          >
            Save Profile (ಉಳಿಸಿ)
          </button>
        </form>
      </div>
    </div>
  );
};

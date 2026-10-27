"use client";

import React, { useState } from "react";
import {
  FileSpreadsheet,
  Copy,
  Check,
  ExternalLink,
  HelpCircle,
  X,
  Play,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { TARGET_SHEET_URL, GOOGLE_APPS_SCRIPT_CODE } from "@/lib/google-sheets";
import { getStoredWebhookUrl, saveWebhookUrl } from "@/lib/storage";

interface GoogleSheetSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWebhookUpdated?: () => void;
}

export const GoogleSheetSetupModal: React.FC<GoogleSheetSetupModalProps> = ({
  isOpen,
  onClose,
  onWebhookUpdated,
}) => {
  const [webhookUrl, setWebhookUrl] = useState(() => getStoredWebhookUrl());
  const [isCopied, setIsCopied] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [testMessage, setTestMessage] = useState("");

  if (!isOpen) return null;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = () => {
    saveWebhookUrl(webhookUrl);
    if (onWebhookUpdated) onWebhookUpdated();
    onClose();
  };

  const handleTestConnection = async () => {
    if (!webhookUrl || !webhookUrl.startsWith("http")) {
      setTestStatus("error");
      setTestMessage("Please enter a valid Google Apps Script Web App URL starting with https://");
      return;
    }

    setTestStatus("testing");
    setTestMessage("Testing connection to Apps Script...");

    try {
      const res = await fetch(webhookUrl, {
        method: "GET",
        mode: "no-cors", // Apps script often redirects
      });

      setTestStatus("success");
      setTestMessage("Webhook is reachable! Ready for live data sync.");
      saveWebhookUrl(webhookUrl);
      if (onWebhookUpdated) onWebhookUpdated();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Connection failed";
      setTestStatus("error");
      setTestMessage("Could not connect: " + msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#D5E4CC] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#1C2A18] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#4C9F38] rounded-xl text-white">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">Google Sheet Integration</h3>
              <p className="text-[11px] text-[#A2B89B]">Google Apps Script Webhook Setup</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Target Sheet Link */}
          <div className="bg-[#F4F8F1] border border-[#CFDFC5] rounded-2xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-[#4C9F38]" />
              <div>
                <span className="font-bold text-[#192613] block">Target Spreadsheet</span>
                <span className="text-[11px] text-[#556950]">Waste tracker (web app)</span>
              </div>
            </div>
            <a
              href={TARGET_SHEET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 bg-[#4C9F38] text-white font-bold rounded-lg text-xs flex items-center gap-1 hover:bg-[#3D852B]"
            >
              <span>Open</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Setup Steps */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-[#192613] flex items-center gap-1 text-xs">
              <HelpCircle className="w-4 h-4 text-[#4C9F38]" />
              <span>3-Step Quick Connection (2 mins)</span>
            </h4>

            <div className="space-y-2 text-[#3D4C3A]">
              <div className="p-2.5 bg-[#FAFBF9] border border-[#E1EAD9] rounded-xl flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#EDF7E8] text-[#377527] font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-[#192613]">Copy the Apps Script Code</p>
                  <p className="text-[11px] text-[#697E64] mb-1.5">
                    Handles automatic column headers, date formatting, and row appending.
                  </p>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="flex items-center gap-1.5 bg-white border border-[#C5DABA] text-[#295F1C] px-3 py-1.5 rounded-lg font-bold shadow-2xs hover:bg-[#EDF7E8] transition"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#4C9F38]" />
                        <span className="text-[#4C9F38]">Code Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Apps Script Snippet</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-2.5 bg-[#FAFBF9] border border-[#E1EAD9] rounded-xl flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#EDF7E8] text-[#377527] font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-[#192613]">Paste in Google Sheet & Deploy</p>
                  <p className="text-[11px] text-[#697E64]">
                    Open Sheet → Menu <span className="font-bold">Extensions &gt; Apps Script</span> → Replace default code with copied script → Click <span className="font-bold">Deploy &gt; New deployment &gt; Select type: Web App</span> → Set <span className="font-bold">Who has access: Anyone</span> → Deploy.
                  </p>
                </div>
              </div>

              <div className="p-2.5 bg-[#FAFBF9] border border-[#E1EAD9] rounded-xl flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#EDF7E8] text-[#377527] font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-[#192613]">Paste Deployed Web App URL Here</p>
                  <input
                    type="url"
                    placeholder="https://script.google.com/macros/s/.../exec"
                    value={webhookUrl}
                    onChange={(e) => {
                      setWebhookUrl(e.target.value);
                      setTestStatus("idle");
                    }}
                    className="w-full mt-1.5 px-3 py-2 text-xs bg-white border border-[#C5DABA] rounded-lg font-mono focus:outline-hidden focus:ring-2 focus:ring-[#4C9F38]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Test Status feedback */}
          {testStatus !== "idle" && (
            <div
              className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                testStatus === "testing"
                  ? "bg-blue-50 border-blue-200 text-blue-700"
                  : testStatus === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}
            >
              {testStatus === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : testStatus === "error" ? (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              ) : (
                <Play className="w-4 h-4 shrink-0 animate-spin" />
              )}
              <span className="text-[11px] font-medium">{testMessage}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testStatus === "testing" || !webhookUrl}
              className="px-3 py-2.5 bg-[#F2F6ED] hover:bg-[#E5EEE0] text-[#2F6120] font-bold rounded-xl text-xs flex items-center justify-center gap-1 border border-[#CCE0C4] transition disabled:opacity-40"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Test Ping</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="flex-1 py-2.5 bg-[#4C9F38] hover:bg-[#3D852B] text-white font-bold rounded-xl text-xs shadow-md transition"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

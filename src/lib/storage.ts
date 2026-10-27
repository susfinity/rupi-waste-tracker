import { WorkerProfile, WasteRecord } from "@/types/waste-tracker";

const WORKER_PROFILE_KEY = "saahas_worker_profile";
const SUBMISSIONS_HISTORY_KEY = "saahas_submissions_history";
const PENDING_QUEUE_KEY = "saahas_pending_queue";
const WEBHOOK_URL_KEY = "saahas_google_apps_script_url";

export const DEFAULT_WEBHOOK_URL =
  "https://script.google.com/macros/s/AKfycbzFEQRHTk6EeqIhh52CIcpdx1RcmR15zJt1DQjd86pOM54nfS1OgLF7Hd72stCLJoAMUA/exec";

export const DEFAULT_WORKER: WorkerProfile = {
  name: "Field Worker",
  workerId: "FW-01",
  defaultLayout: "Survagnya Nagar",
  isRemembered: true,
};

// Worker Profile
export function getStoredWorkerProfile(): WorkerProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(WORKER_PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error("Failed to read worker profile", e);
    return null;
  }
}

export function saveWorkerProfile(profile: WorkerProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(WORKER_PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error("Failed to save worker profile", e);
  }
}

export function clearWorkerProfile(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(WORKER_PROFILE_KEY);
}

// Submissions History (Last 100 entries)
export function getStoredHistory(): WasteRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SUBMISSIONS_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to read history", e);
    return [];
  }
}

export function addRecordToHistory(record: WasteRecord): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getStoredHistory();
    // Prepend new record, keep up to 100
    const updated = [record, ...existing.filter((r) => r.id !== record.id)].slice(0, 100);
    localStorage.setItem(SUBMISSIONS_HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to add record to history", e);
  }
}

// Offline Pending Queue
export function getPendingQueue(): WasteRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PENDING_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to read pending queue", e);
    return [];
  }
}

export function addToPendingQueue(record: WasteRecord): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getPendingQueue();
    const updated = [...existing.filter((r) => r.id !== record.id), record];
    localStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to add to pending queue", e);
  }
}

export function removeFromPendingQueue(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getPendingQueue();
    const updated = existing.filter((r) => r.id !== id);
    localStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to remove from pending queue", e);
  }
}

// Google Apps Script Webhook URL
export function getStoredWebhookUrl(): string {
  if (typeof window === "undefined") return DEFAULT_WEBHOOK_URL;
  try {
    return localStorage.getItem(WEBHOOK_URL_KEY) || DEFAULT_WEBHOOK_URL;
  } catch (e) {
    console.error("Failed to read webhook URL", e);
    return DEFAULT_WEBHOOK_URL;
  }
}

export function saveWebhookUrl(url: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(WEBHOOK_URL_KEY, url.trim());
  } catch (e) {
    console.error("Failed to save webhook URL", e);
  }
}

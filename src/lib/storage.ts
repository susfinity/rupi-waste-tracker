import {
  WorkerProfile,
  WasteRecord,
  CollectionPointEntry,
  WardOption,
  RouteOption,
} from "@/types/waste-tracker";

const WORKER_PROFILE_KEY = "saahas_supervisor_profile";
const SUBMISSIONS_HISTORY_KEY = "saahas_submissions_history_v2";
const PENDING_QUEUE_KEY = "saahas_pending_queue_v2";
const WEBHOOK_URL_KEY = "saahas_google_apps_script_url";
const DRAFT_KEY = "saahas_daily_points_draft";

export const DEFAULT_WORKER: WorkerProfile = {
  name: "Field Supervisor",
  assignedWard: "Ward 28 - Kammanahalli",
  assignedRoute: "Janaki Ram Layout - Route 1",
  isRemembered: true,
};

// Target Google Sheet ID & URL
export const TARGET_SHEET_ID = "10OTW8vR9Yu2kmdTcFxEI5acELh0njtckUon8cKyK_8k";
export const TARGET_SHEET_URL = `https://docs.google.com/spreadsheets/d/${TARGET_SHEET_ID}/edit?gid=0#gid=0`;

export const DEFAULT_WEBHOOK_URL =
  "https://script.google.com/macros/s/AKfycbx_GtgYlJ7El9rQMYysK9dfu3--jVbUZG7MWtwYb8NVQseF2PPWzSZ7k8KSFNxO5D7m/exec";

// Webhook URL
export function getStoredWebhookUrl(): string {
  if (typeof window === "undefined") return DEFAULT_WEBHOOK_URL;
  try {
    return localStorage.getItem(WEBHOOK_URL_KEY) || DEFAULT_WEBHOOK_URL;
  } catch (e) {
    console.error("Failed to read webhook url", e);
    return DEFAULT_WEBHOOK_URL;
  }
}

export function saveWebhookUrl(url: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(WEBHOOK_URL_KEY, url.trim());
  } catch (e) {
    console.error("Failed to save webhook url", e);
  }
}

// Supervisor Profile
export function getStoredWorkerProfile(): WorkerProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(WORKER_PROFILE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        name: parsed.name || DEFAULT_WORKER.name,
        assignedWard: parsed.assignedWard || DEFAULT_WORKER.assignedWard,
        assignedRoute: parsed.assignedRoute || DEFAULT_WORKER.assignedRoute,
        isRemembered: parsed.isRemembered ?? true,
      };
    }
    // Check legacy key
    const legacy = localStorage.getItem("saahas_worker_profile");
    if (legacy) {
      const parsedLegacy = JSON.parse(legacy);
      return {
        name: parsedLegacy.name || DEFAULT_WORKER.name,
        assignedWard: DEFAULT_WORKER.assignedWard,
        assignedRoute: DEFAULT_WORKER.assignedRoute,
        isRemembered: true,
      };
    }
    return null;
  } catch (e) {
    console.error("Failed to read supervisor profile", e);
    return null;
  }
}

export function saveWorkerProfile(profile: WorkerProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(WORKER_PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error("Failed to save supervisor profile", e);
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

export function addRecordsToHistory(records: WasteRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getStoredHistory();
    const updated = [...records, ...existing.filter((e) => !records.some((r) => r.id === e.id))].slice(0, 200);
    localStorage.setItem(SUBMISSIONS_HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to add records to history", e);
  }
}

export function addRecordToHistory(record: WasteRecord): void {
  addRecordsToHistory([record]);
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

export function addToPendingQueue(records: WasteRecord | WasteRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    const incoming = Array.isArray(records) ? records : [records];
    const existing = getPendingQueue();
    const updated = [...existing.filter((e) => !incoming.some((r) => r.id === e.id)), ...incoming];
    localStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to add to pending queue", e);
  }
}

export function removeFromPendingQueue(ids: string | string[]): void {
  if (typeof window === "undefined") return;
  try {
    const removeSet = new Set(Array.isArray(ids) ? ids : [ids]);
    const existing = getPendingQueue();
    const updated = existing.filter((r) => !removeSet.has(r.id));
    localStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to remove from pending queue", e);
  }
}

// Daily Draft State (stores working collection points for the day)
export interface DailyDraftState {
  date: string;
  ward: WardOption;
  route: RouteOption;
  activePointIndex: number;
  points: CollectionPointEntry[];
}

export function getStoredDailyDraft(): DailyDraftState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error("Failed to read daily draft", e);
    return null;
  }
}

export function saveDailyDraft(draft: DailyDraftState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch (e) {
    console.error("Failed to save daily draft", e);
  }
}

export function clearDailyDraft(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DRAFT_KEY);
}

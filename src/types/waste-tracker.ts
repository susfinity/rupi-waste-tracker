export type LayoutOption = "Survagnya Nagar" | "Layout 1" | "Layout 2" | string;

export interface WorkerProfile {
  name: string;
  workerId: string;
  phone?: string;
  defaultLayout: LayoutOption;
  isRemembered: boolean;
}

export interface WasteRecordInput {
  date: string; // YYYY-MM-DD
  layout: LayoutOption;
  workerName: string;
  workerId: string;
  totalHH: number;
  segregatedHH: number;
  plasticHH: number;
  sanitaryHH: number;
  notes: string;
}

export interface WasteRecord extends WasteRecordInput {
  id: string;
  timestamp: string; // ISO string
  segregationRate: number; // percentage (0 - 100)
  syncStatus: "synced" | "pending" | "failed" | "mock";
  syncError?: string;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: {
    totalHH?: string;
    segregatedHH?: string;
    plasticHH?: string;
    sanitaryHH?: string;
    worker?: string;
    layout?: string;
  };
  warnings: string[];
}

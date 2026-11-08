export type WardOption = "Ward 28 - Kammanahalli" | "Ward 29 - Kacharakanahalli";

export type RouteOption =
  | "Janaki Ram Layout - Route 1"
  | "Janaki Ram Layout - Route 2"
  | "AK Colony - Route 1"
  | "AK Colony - Route 2";

export const CONSTITUENCY_NAME = "Sarvagna Nagar";

export const WARD_ROUTES: Record<WardOption, RouteOption[]> = {
  "Ward 28 - Kammanahalli": [
    "Janaki Ram Layout - Route 1",
    "Janaki Ram Layout - Route 2",
  ],
  "Ward 29 - Kacharakanahalli": [
    "AK Colony - Route 1",
    "AK Colony - Route 2",
  ],
};

export const ALL_ROUTES: { ward: WardOption; route: RouteOption }[] = [
  { ward: "Ward 28 - Kammanahalli", route: "Janaki Ram Layout - Route 1" },
  { ward: "Ward 28 - Kammanahalli", route: "Janaki Ram Layout - Route 2" },
  { ward: "Ward 29 - Kacharakanahalli", route: "AK Colony - Route 1" },
  { ward: "Ward 29 - Kacharakanahalli", route: "AK Colony - Route 2" },
];

export function getWardForRoute(route: string): WardOption {
  if (route && (route.includes("Janaki Ram") || route.includes("Ward 28"))) {
    return "Ward 28 - Kammanahalli";
  }
  return "Ward 29 - Kacharakanahalli";
}

export interface WorkerProfile {
  name: string; // Name (ಹೆಸರು)
  assignedWard: WardOption;
  assignedRoute: RouteOption;
  isRemembered: boolean;
}

// 6 Waste Data Collection streams for a collection point
export interface WasteCounts {
  givingWasteHH: number; // 1. HHs Giving Waste (ಒಟ್ಟು ತ್ಯಾಜ್ಯ ನೀಡಿದ ಮನೆಗಳು)
  segregatedHH: number; // 2. HHs Giving Segregated Wastes (ವಿಂಗಡಿಸಲಾದ ಹಸಿ ತ್ಯಾಜ್ಯ ನೀಡಿದ ಮನೆಗಳು)
  dryHH: number; // 3. HHs Giving Dry Waste (ಒಣ ತ್ಯಾಜ್ಯ ನೀಡಿದ ಮನೆಗಳು)
  sanitaryHH: number; // 4. HHs Giving Sanitary Waste (ಸ್ಯಾನಿಟರಿ ತ್ಯಾಜ್ಯ ನೀಡಿದ ಮನೆಗಳು)
  specialCareHH: number; // 5. HHs Giving Special Care Waste (ವಿಶೇಷ ಕಾಳಜಿ ತ್ಯಾಜ್ಯ ನೀಡಿದ ಮನೆಗಳು)
  mixedHH: number; // 6. HHs Giving Mixed Waste (ಮಿಶ್ರ ತ್ಯಾಜ್ಯ ನೀಡಿದ ಮನೆಗಳು)
}

export interface CollectionPointEntry extends WasteCounts {
  pointName: string; // e.g. "Point 1", "Point 2", ...
  remarks: string;
  isCompleted?: boolean;
}

export interface WasteRecordInput {
  date: string; // YYYY-MM-DD
  constituency: string; // "Sarvagna Nagar"
  ward: WardOption;
  route: RouteOption;
  supervisorName: string;
  pointName: string; // e.g. "Point 1"
  givingWasteHH: number;
  segregatedHH: number;
  dryHH: number;
  sanitaryHH: number;
  specialCareHH: number;
  mixedHH: number;
  remarks: string;
}

export interface WasteRecord extends WasteRecordInput {
  id: string;
  timestamp: string; // ISO string
  syncStatus: "synced" | "pending" | "failed" | "mock";
  syncError?: string;
}

// Aggregated summary for a route submission
export interface DailyRouteSubmission {
  id: string;
  timestamp: string;
  date: string;
  constituency: string;
  ward: WardOption;
  route: RouteOption;
  supervisorName: string;
  points: CollectionPointEntry[];
  totalHH: number;
  segregatedHH: number;
  dryHH: number;
  sanitaryHH: number;
  specialCareHH: number;
  mixedHH: number;
}

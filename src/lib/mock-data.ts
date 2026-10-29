import type { Assignment, Person, ShiftTypeId } from "./types";

export const PEOPLE: Person[] = [
  { id: "nai", name: "นาย", color: "#4f46e5", role: "admin" },
  { id: "arm", name: "อาร์ม", color: "#f59e0b", role: "member" },
  { id: "chompoo", name: "ชมพู่", color: "#f04438", role: "member" },
];

export function personById(id: string): Person | undefined {
  return PEOPLE.find((p) => p.id === id);
}

// Compact August 2026 schedule captured from the original app.
// Each row: day-of-month -> [ [personId, shift], ... ]
const AUGUST_2026: Record<number, [string, ShiftTypeId][]> = {
  1: [["nai", "night"], ["arm", "wfh"]],
  2: [["nai", "night"]],
  3: [["chompoo", "night"]],
  4: [],
  5: [["arm", "tdpk"]],
  6: [["nai", "tdpk"], ["arm", "night"]],
  7: [["arm", "night"], ["chompoo", "wfh"]],
  8: [["arm", "night"], ["chompoo", "wfh"]],
  9: [["nai", "wfh"], ["chompoo", "night"]],
  10: [["nai", "night"]],
  11: [["nai", "night"]],
  12: [["nai", "night"], ["arm", "wfh"]],
  13: [["arm", "tdpk"], ["chompoo", "tdpk"]],
  14: [["arm", "tdpk"], ["chompoo", "tdpk"]],
  15: [["arm", "wfh"], ["chompoo", "night"]],
  16: [["nai", "wfh"], ["chompoo", "night"]],
  17: [["nai", "tdpk"], ["chompoo", "night"]],
  18: [["nai", "tdpk"]],
  19: [["nai", "night"], ["arm", "tdpk"]],
  20: [["arm", "tdpk"], ["chompoo", "tdpk"]],
  21: [["arm", "tdpk"], ["chompoo", "tdpk"]],
  22: [["arm", "night"], ["chompoo", "night"]],
  23: [["nai", "wfh"], ["chompoo", "night"]],
  24: [["nai", "night"]],
  25: [["nai", "night"]],
  26: [["arm", "night"], ["chompoo", "tdpk"]],
  27: [["arm", "night"], ["chompoo", "tdpk"]],
  28: [["arm", "night"], ["chompoo", "wfh"]],
  29: [["nai", "wfh"], ["arm", "night"]],
  30: [["nai", "wfh"]],
  31: [["nai", "tdpk"], ["chompoo", "night"]],
};

function expand(
  year: number,
  month1: number,
  table: Record<number, [string, ShiftTypeId][]>,
): Assignment[] {
  const out: Assignment[] = [];
  for (const [dayStr, entries] of Object.entries(table)) {
    const dd = String(dayStr).padStart(2, "0");
    const mm = String(month1).padStart(2, "0");
    const date = `${year}-${mm}-${dd}`;
    for (const [personId, shift] of entries) {
      out.push({ date, personId, shift });
    }
  }
  return out;
}

export const MOCK_ASSIGNMENTS: Assignment[] = expand(2026, 8, AUGUST_2026);

/** Default month the app opens on (matches the seeded data). */
export const DEFAULT_YEAR = 2026;
export const DEFAULT_MONTH0 = 7; // August (0-indexed)

/** The signed-in user for this mock session. */
export const CURRENT_USER_ID = "nai";

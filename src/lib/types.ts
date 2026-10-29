// Domain model for the shift scheduler.
// Kept framework-agnostic so it can later map 1:1 to Supabase tables.

export type ShiftTypeId = "wfh" | "tdpk" | "night";

export interface ShiftType {
  id: ShiftTypeId;
  /** Short label shown on calendar chips, e.g. "WFH" */
  short: string;
  /** Full Thai label, e.g. "กะเช้า (WFH)" */
  label: string;
  /** When the shift happens, for sorting/grouping */
  period: "morning" | "night";
  /** CSS custom-property color token name, e.g. "wfh" -> var(--shift-wfh) */
  token: "wfh" | "tdpk" | "night";
}

export interface Person {
  id: string;
  name: string;
  /** Dot/accent color (any CSS color) used to identify the person */
  color: string;
  role: "admin" | "member";
  email?: string;
}

export interface Assignment {
  /** ISO date, "YYYY-MM-DD" */
  date: string;
  personId: string;
  shift: ShiftTypeId;
}

export interface Holiday {
  /** ISO date, "YYYY-MM-DD" */
  date: string;
  name: string;
}

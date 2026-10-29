import type { ShiftType, ShiftTypeId } from "./types";

export const SHIFT_TYPES: Record<ShiftTypeId, ShiftType> = {
  wfh: {
    id: "wfh",
    short: "WFH",
    label: "กะเช้า (WFH)",
    period: "morning",
    token: "wfh",
  },
  tdpk: {
    id: "tdpk",
    short: "TDPK",
    label: "กะเช้า (TDPK)",
    period: "morning",
    token: "tdpk",
  },
  night: {
    id: "night",
    short: "ดึก",
    label: "กะดึก",
    period: "night",
    token: "night",
  },
};

export const SHIFT_ORDER: ShiftTypeId[] = ["wfh", "tdpk", "night"];

/** CSS variable for a shift type's solid color. */
export function shiftColor(id: ShiftTypeId): string {
  return `var(--shift-${SHIFT_TYPES[id].token})`;
}

/** CSS variable for a shift type's soft/background color. */
export function shiftSoftColor(id: ShiftTypeId): string {
  return `var(--shift-${SHIFT_TYPES[id].token}-soft)`;
}

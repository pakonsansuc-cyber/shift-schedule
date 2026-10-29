import type { Assignment, ShiftTypeId } from "./types";
import { daysInMonth, toISODate } from "./calendar";

/** All assignments on a given ISO date. */
export function assignmentsOn(
  assignments: Assignment[],
  iso: string,
): Assignment[] {
  return assignments.filter((a) => a.date === iso);
}

/**
 * Weekdays (Mon–Fri) in the month that have no morning (wfh/tdpk) coverage.
 * Weekends are excluded — morning cover isn't expected on Sat/Sun.
 */
export function morningGaps(
  assignments: Assignment[],
  year: number,
  month0: number,
): number[] {
  const total = daysInMonth(year, month0);
  const gaps: number[] = [];
  for (let day = 1; day <= total; day++) {
    const weekday = new Date(year, month0, day).getDay();
    if (weekday === 0 || weekday === 6) continue; // skip weekends
    const iso = toISODate(year, month0, day);
    const hasMorning = assignments.some(
      (a) => a.date === iso && (a.shift === "wfh" || a.shift === "tdpk"),
    );
    if (!hasMorning) gaps.push(day);
  }
  return gaps;
}

export interface NightStreak {
  personId: string;
  startDay: number;
  endDay: number;
}

/** Runs of 2+ consecutive night shifts per person within the month. */
export function consecutiveNightStreaks(
  assignments: Assignment[],
  year: number,
  month0: number,
  personIds: string[],
): NightStreak[] {
  const total = daysInMonth(year, month0);
  const streaks: NightStreak[] = [];

  for (const personId of personIds) {
    let runStart: number | null = null;
    for (let day = 1; day <= total + 1; day++) {
      const iso = toISODate(year, month0, day);
      const isNight =
        day <= total &&
        assignments.some(
          (a) => a.date === iso && a.personId === personId && a.shift === "night",
        );
      if (isNight) {
        if (runStart === null) runStart = day;
      } else {
        if (runStart !== null && day - 1 - runStart >= 1) {
          streaks.push({ personId, startDay: runStart, endDay: day - 1 });
        }
        runStart = null;
      }
    }
  }
  return streaks;
}

export type ShiftBreakdown = Record<ShiftTypeId, number>;

/** Count each shift type for a person within the month. */
export function breakdownForPerson(
  assignments: Assignment[],
  personId: string,
  year: number,
  month0: number,
): ShiftBreakdown {
  const prefix = `${year}-${String(month0 + 1).padStart(2, "0")}`;
  const b: ShiftBreakdown = { wfh: 0, tdpk: 0, night: 0 };
  for (const a of assignments) {
    if (a.personId === personId && a.date.startsWith(prefix)) b[a.shift]++;
  }
  return b;
}

export function totalForPerson(
  assignments: Assignment[],
  personId: string,
  year: number,
  month0: number,
): number {
  const b = breakdownForPerson(assignments, personId, year, month0);
  return b.wfh + b.tdpk + b.night;
}

/** The next upcoming assignment for a person on/after a reference date. */
export function nextShiftFor(
  assignments: Assignment[],
  personId: string,
  fromIso: string,
): Assignment | undefined {
  return assignments
    .filter((a) => a.personId === personId && a.date >= fromIso)
    .sort((a, b) => a.date.localeCompare(b.date))[0];
}

/**
 * Find the next long break (>= 3 consecutive days off) for a person,
 * scanning the given month. Returns the ISO start date of the break.
 */
export function nextLongBreak(
  assignments: Assignment[],
  personId: string,
  year: number,
  month0: number,
  fromDay = 1,
): { startIso: string; length: number } | undefined {
  const total = daysInMonth(year, month0);
  let runStart: number | null = null;
  for (let day = fromDay; day <= total + 1; day++) {
    const iso = toISODate(year, month0, day);
    const working =
      day <= total &&
      assignments.some((a) => a.date === iso && a.personId === personId);
    if (!working) {
      if (runStart === null) runStart = day;
    } else {
      if (runStart !== null) {
        const length = day - runStart;
        if (length >= 3) {
          return { startIso: toISODate(year, month0, runStart), length };
        }
      }
      runStart = null;
    }
  }
  return undefined;
}

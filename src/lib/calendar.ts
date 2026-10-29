import type { Holiday } from "./types";

export const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

/** Short Thai weekday headers, Sunday first. */
export const THAI_WEEKDAYS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

/** Convert a Gregorian year to the Thai Buddhist year. */
export function buddhistYear(gregorianYear: number): number {
  return gregorianYear + 543;
}

/** Zero-padded ISO date string in local time (no timezone drift). */
export function toISODate(year: number, month0: number, day: number): string {
  const mm = String(month0 + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

export interface CalendarCell {
  date: string; // ISO
  day: number;
  inMonth: boolean;
  weekday: number; // 0 = Sun
  isToday: boolean;
}

/**
 * Build a 6-row calendar grid (42 cells) for the given month,
 * padded with leading/trailing days from adjacent months.
 */
export function buildMonthGrid(year: number, month0: number): CalendarCell[] {
  const first = new Date(year, month0, 1);
  const startWeekday = first.getDay(); // 0 = Sun
  const gridStart = new Date(year, month0, 1 - startWeekday);

  const todayIso = toISODate(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate(),
  );

  const cells: CalendarCell[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    const iso = toISODate(d.getFullYear(), d.getMonth(), d.getDate());
    cells.push({
      date: iso,
      day: d.getDate(),
      inMonth: d.getMonth() === month0,
      weekday: d.getDay(),
      isToday: iso === todayIso,
    });
  }
  return cells;
}

/** Number of days in a month. */
export function daysInMonth(year: number, month0: number): number {
  return new Date(year, month0 + 1, 0).getDate();
}

// A small set of Thai public holidays. Extendable / later DB-backed.
export const HOLIDAYS: Holiday[] = [
  { date: "2026-08-12", name: "วันแม่แห่งชาติ" },
  { date: "2026-01-01", name: "วันขึ้นปีใหม่" },
  { date: "2026-04-13", name: "วันสงกรานต์" },
  { date: "2026-04-14", name: "วันสงกรานต์" },
  { date: "2026-04-15", name: "วันสงกรานต์" },
  { date: "2026-12-05", name: "วันพ่อแห่งชาติ" },
  { date: "2026-12-10", name: "วันรัฐธรรมนูญ" },
  { date: "2026-12-31", name: "วันสิ้นปี" },
];

export function holidayFor(iso: string): Holiday | undefined {
  return HOLIDAYS.find((h) => h.date === iso);
}

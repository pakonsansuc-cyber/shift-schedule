import type { Assignment, Person } from "./types";
import { SHIFT_TYPES } from "./shifts";

type Resolve = (id: string) => Person | undefined;

/** Trigger a browser download of text content. */
export function downloadText(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function csvField(v: string): string {
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

/** CSV of a single month's assignments (date, name, shift). Excel-friendly. */
export function monthCSV(
  assignments: Assignment[],
  personById: Resolve,
  year: number,
  month0: number,
): string {
  const prefix = `${year}-${String(month0 + 1).padStart(2, "0")}`;
  const rows = assignments
    .filter((a) => a.date.startsWith(prefix))
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) ||
        (personById(a.personId)?.name ?? "").localeCompare(
          personById(b.personId)?.name ?? "",
        ),
    );
  const lines = ["วันที่,ชื่อ,กะ"];
  for (const a of rows) {
    lines.push(
      [
        a.date,
        csvField(personById(a.personId)?.name ?? ""),
        csvField(SHIFT_TYPES[a.shift].label),
      ].join(","),
    );
  }
  // BOM so Excel reads Thai UTF-8 correctly.
  return "﻿" + lines.join("\n");
}

function nextDayCompact(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(y, m - 1, d + 1);
  return `${dt.getFullYear()}${String(dt.getMonth() + 1).padStart(2, "0")}${String(dt.getDate()).padStart(2, "0")}`;
}

/** iCalendar (.ics) with an all-day event per assignment. */
export function assignmentsICS(
  assignments: Assignment[],
  personById: Resolve,
): string {
  const stamp =
    new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Shift Schedule//TH//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:ตารางกะ",
  ];
  for (const a of assignments) {
    const start = a.date.replace(/-/g, "");
    const name = personById(a.personId)?.name ?? "";
    lines.push(
      "BEGIN:VEVENT",
      `UID:${a.date}-${a.personId}@shift-schedule`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${start}`,
      `DTEND;VALUE=DATE:${nextDayCompact(a.date)}`,
      `SUMMARY:${name} · ${SHIFT_TYPES[a.shift].label}`,
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

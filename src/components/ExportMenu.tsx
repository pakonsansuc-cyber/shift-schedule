"use client";

import { useEffect, useRef, useState } from "react";
import { useSchedule } from "./ScheduleProvider";
import { assignmentsICS, downloadText, monthCSV } from "@/lib/export";
import { THAI_MONTHS } from "@/lib/calendar";

interface Props {
  year: number;
  month0: number;
  /** id of the DOM element to snapshot for PNG export */
  captureId: string;
}

export function ExportMenu({ year, month0, captureId }: Props) {
  const { assignments, personById } = useSchedule();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const monthLabel = `${THAI_MONTHS[month0]}-${year + 543}`;

  function exportCSV() {
    downloadText(
      `ตารางกะ-${monthLabel}.csv`,
      monthCSV(assignments, personById, year, month0),
      "text/csv;charset=utf-8",
    );
    setOpen(false);
  }

  function exportICS() {
    downloadText(
      "ตารางกะ.ics",
      assignmentsICS(assignments, personById),
      "text/calendar;charset=utf-8",
    );
    setOpen(false);
  }

  async function exportPNG() {
    setBusy(true);
    try {
      const el = document.getElementById(captureId);
      if (!el) return;
      const { toPng } = await import("html-to-image");
      const bg =
        getComputedStyle(document.body).getPropertyValue("--surface") ||
        "#ffffff";
      const dataUrl = await toPng(el, { pixelRatio: 2, backgroundColor: bg.trim() });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `ตารางกะ-${monthLabel}.png`;
      a.click();
    } finally {
      setBusy(false);
      setOpen(false);
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={busy}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-surface-2 hover:text-text disabled:opacity-50"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
        </svg>
        <span className="hidden sm:inline">{busy ? "กำลังสร้าง…" : "ส่งออก"}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-1.5 w-56 animate-fade-in overflow-hidden rounded-xl border border-border bg-surface py-1 shadow-lg">
          <MenuItem onClick={exportPNG} label="เซฟเป็นรูป (PNG)" />
          <MenuItem onClick={exportCSV} label="ส่งออก Excel (CSV)" />
          <MenuItem onClick={exportICS} label="ไฟล์ปฏิทิน (.ics)" />
        </div>
      )}
    </div>
  );
}

function MenuItem({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="block w-full px-4 py-2 text-left text-sm text-text transition-colors hover:bg-surface-2"
    >
      {label}
    </button>
  );
}

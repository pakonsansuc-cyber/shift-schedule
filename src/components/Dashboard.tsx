"use client";

import { useState } from "react";
import type { ShiftTypeId } from "@/lib/types";
import { useSchedule } from "./ScheduleProvider";
import { Header } from "./Header";
import { MonthNav } from "./MonthNav";
import { PersonalCards } from "./PersonalCards";
import { Alerts } from "./Alerts";
import { PersonFilter } from "./PersonFilter";
import { Legend } from "./Legend";
import { Calendar } from "./Calendar";
import { SearchBox } from "./SearchBox";
import { DayEditor } from "./DayEditor";
import { StatsPanel } from "./StatsPanel";
import { ExportMenu } from "./ExportMenu";
import { SwapPanel } from "./SwapPanel";
import { ScanPanel } from "./ScanPanel";
import { BuddiesPanel } from "./BuddiesPanel";

/** Pick the month to open on: the most recent month that has data, else today. */
function initialMonth(dates: string[]): { year: number; month0: number } {
  if (dates.length === 0) {
    const now = new Date();
    return { year: now.getFullYear(), month0: now.getMonth() };
  }
  const latest = dates.reduce((a, b) => (a > b ? a : b));
  const [y, m] = latest.split("-").map(Number);
  return { year: y, month0: m - 1 };
}

export function Dashboard() {
  const { assignments, currentMemberId, isAdmin } = useSchedule();
  const [{ year, month0 }, setMonth] = useState(() =>
    initialMonth(assignments.map((a) => a.date)),
  );
  const [personFilter, setPersonFilter] = useState<string | "all">("all");
  const [shiftFilter, setShiftFilter] = useState<ShiftTypeId | null>(null);
  const [search, setSearch] = useState("");
  const [editDate, setEditDate] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [showSwap, setShowSwap] = useState(false);
  const [showScan, setShowScan] = useState(false);
  const [showBuddies, setShowBuddies] = useState(false);

  function shiftMonth(delta: number) {
    const d = new Date(year, month0 + delta, 1);
    setMonth({ year: d.getFullYear(), month0: d.getMonth() });
  }

  function goToday() {
    const now = new Date();
    setMonth({ year: now.getFullYear(), month0: now.getMonth() });
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      <Header />

      <div className="mt-6 space-y-5">
        <PersonalCards
          assignments={assignments}
          userId={currentMemberId}
          year={year}
          month0={month0}
        />

        <Alerts assignments={assignments} year={year} month0={month0} />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <MonthNav
            year={year}
            month0={month0}
            onPrev={() => shiftMonth(-1)}
            onNext={() => shiftMonth(1)}
            onToday={goToday}
          />
          <div className="flex items-center gap-2">
            <SearchBox value={search} onChange={setSearch} />
            <button
              onClick={() => setShowStats(true)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-surface-2 hover:text-text"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18M7 16v-5M12 16V8M17 16v-9" />
              </svg>
              <span className="hidden sm:inline">สถิติ</span>
            </button>
            {currentMemberId && (
              <button
                onClick={() => setShowBuddies(true)}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-surface-2 hover:text-text"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span className="hidden sm:inline">เข้ากับใคร</span>
              </button>
            )}
            <button
              onClick={() => setShowSwap(true)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-surface-2 hover:text-text"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 10l-4 4 4 4M3 14h14M17 14l4-4-4-4M21 10H7" />
              </svg>
              <span className="hidden sm:inline">แลกกะ</span>
            </button>
            {isAdmin && (
              <button
                onClick={() => setShowScan(true)}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-accent/40 bg-accent-soft px-3 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent-soft/70"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10" />
                </svg>
                <span className="hidden sm:inline">สแกน AI</span>
              </button>
            )}
            <ExportMenu year={year} month0={month0} captureId="calendar-capture" />
          </div>
        </div>

        <PersonFilter value={personFilter} onChange={setPersonFilter} />
        <div className="flex items-center justify-between gap-2">
          <Legend value={shiftFilter} onChange={setShiftFilter} />
          {isAdmin && (
            <span className="shrink-0 text-xs text-text-subtle">
              คลิกวันเพื่อแก้กะ
            </span>
          )}
        </div>

        <div id="calendar-capture">
          <Calendar
            assignments={assignments}
            year={year}
            month0={month0}
            personFilter={personFilter}
            shiftFilter={shiftFilter}
            nameQuery={search}
            onDayClick={isAdmin ? setEditDate : undefined}
          />
        </div>
      </div>

      {editDate && (
        <DayEditor date={editDate} onClose={() => setEditDate(null)} />
      )}
      {showStats && (
        <StatsPanel
          year={year}
          month0={month0}
          onClose={() => setShowStats(false)}
        />
      )}
      {showSwap && <SwapPanel onClose={() => setShowSwap(false)} />}
      {showBuddies && (
        <BuddiesPanel
          year={year}
          month0={month0}
          onClose={() => setShowBuddies(false)}
        />
      )}
      {showScan && (
        <ScanPanel
          year={year}
          month0={month0}
          onClose={() => setShowScan(false)}
        />
      )}

      <footer className="mt-8 text-center text-xs text-text-subtle">
        สร้างด้วย Next.js + Supabase · ข้อมูลเรียลไทม์
      </footer>
    </main>
  );
}

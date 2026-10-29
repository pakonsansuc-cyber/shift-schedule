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
  const { assignments, currentMemberId } = useSchedule();
  const [{ year, month0 }, setMonth] = useState(() =>
    initialMonth(assignments.map((a) => a.date)),
  );
  const [personFilter, setPersonFilter] = useState<string | "all">("all");
  const [shiftFilter, setShiftFilter] = useState<ShiftTypeId | null>(null);
  const [search, setSearch] = useState("");

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
          <SearchBox value={search} onChange={setSearch} />
        </div>

        <PersonFilter value={personFilter} onChange={setPersonFilter} />
        <Legend value={shiftFilter} onChange={setShiftFilter} />

        <Calendar
          assignments={assignments}
          year={year}
          month0={month0}
          personFilter={personFilter}
          shiftFilter={shiftFilter}
          nameQuery={search}
        />
      </div>

      <footer className="mt-8 text-center text-xs text-text-subtle">
        สร้างด้วย Next.js + Supabase · ข้อมูลเรียลไทม์
      </footer>
    </main>
  );
}

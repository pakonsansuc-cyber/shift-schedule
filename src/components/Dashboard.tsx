"use client";

import { useState } from "react";
import type { ShiftTypeId } from "@/lib/types";
import {
  CURRENT_USER_ID,
  DEFAULT_MONTH0,
  DEFAULT_YEAR,
  MOCK_ASSIGNMENTS,
} from "@/lib/mock-data";
import { Header } from "./Header";
import { MonthNav } from "./MonthNav";
import { PersonalCards } from "./PersonalCards";
import { Alerts } from "./Alerts";
import { PersonFilter } from "./PersonFilter";
import { Legend } from "./Legend";
import { Calendar } from "./Calendar";
import { SearchBox } from "./SearchBox";

export function Dashboard() {
  const [year, setYear] = useState(DEFAULT_YEAR);
  const [month0, setMonth0] = useState(DEFAULT_MONTH0);
  const [personFilter, setPersonFilter] = useState<string | "all">("all");
  const [shiftFilter, setShiftFilter] = useState<ShiftTypeId | null>(null);
  const [search, setSearch] = useState("");

  function shiftMonth(delta: number) {
    const d = new Date(year, month0 + delta, 1);
    setYear(d.getFullYear());
    setMonth0(d.getMonth());
  }

  function goToday() {
    const now = new Date();
    setYear(now.getFullYear());
    setMonth0(now.getMonth());
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      <Header />

      <div className="mt-6 space-y-5">
        <PersonalCards
          assignments={MOCK_ASSIGNMENTS}
          userId={CURRENT_USER_ID}
          year={year}
          month0={month0}
        />

        <Alerts assignments={MOCK_ASSIGNMENTS} year={year} month0={month0} />

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
          assignments={MOCK_ASSIGNMENTS}
          year={year}
          month0={month0}
          personFilter={personFilter}
          shiftFilter={shiftFilter}
          nameQuery={search}
        />
      </div>

      <footer className="mt-8 text-center text-xs text-text-subtle">
        สร้างใหม่ด้วย Next.js · ขณะนี้เป็นข้อมูลตัวอย่าง (ยังไม่เชื่อมฐานข้อมูล)
      </footer>
    </main>
  );
}

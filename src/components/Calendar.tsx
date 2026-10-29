import type { Assignment, ShiftTypeId } from "@/lib/types";
import {
  buildMonthGrid,
  holidayFor,
  THAI_WEEKDAYS,
} from "@/lib/calendar";
import { assignmentsOn } from "@/lib/stats";
import { SHIFT_ORDER } from "@/lib/shifts";
import { personById } from "@/lib/mock-data";
import { ShiftChip } from "./ShiftChip";
import { cn } from "@/lib/cn";

interface Props {
  assignments: Assignment[];
  year: number;
  month0: number;
  personFilter: string | "all";
  shiftFilter: ShiftTypeId | null;
  nameQuery?: string;
  onDayClick?: (iso: string) => void;
}

export function Calendar({
  assignments,
  year,
  month0,
  personFilter,
  shiftFilter,
  nameQuery = "",
  onDayClick,
}: Props) {
  const query = nameQuery.trim().toLowerCase();
  const cells = buildMonthGrid(year, month0);

  return (
    <div className="overflow-hidden rounded-card border border-border bg-surface shadow-sm">
      {/* Weekday header */}
      <div className="grid grid-cols-7 border-b border-border bg-surface-2">
        {THAI_WEEKDAYS.map((d, i) => (
          <div
            key={d}
            className={cn(
              "py-2.5 text-center text-xs font-semibold",
              i === 0 || i === 6 ? "text-danger/70" : "text-text-muted",
            )}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7">
        {cells.map((cell, idx) => {
          const dayAssignments = cell.inMonth
            ? assignmentsOn(assignments, cell.date).sort(
                (a, b) =>
                  SHIFT_ORDER.indexOf(a.shift) - SHIFT_ORDER.indexOf(b.shift),
              )
            : [];
          const holiday = cell.inMonth ? holidayFor(cell.date) : undefined;
          const isWeekend = cell.weekday === 0 || cell.weekday === 6;
          const empty = cell.inMonth && dayAssignments.length === 0;

          return (
            <button
              key={cell.date + idx}
              type="button"
              onClick={() => cell.inMonth && onDayClick?.(cell.date)}
              className={cn(
                "group relative flex min-h-[104px] flex-col gap-1 border-b border-r border-border p-1.5 text-left transition-colors",
                (idx + 1) % 7 === 0 && "border-r-0",
                idx >= 35 && "border-b-0",
                !cell.inMonth && "bg-surface-2/40",
                cell.inMonth && "hover:bg-accent-soft/60",
                cell.inMonth && isWeekend && "bg-surface-2/30",
              )}
            >
              {/* Day number + holiday */}
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "inline-flex size-6 items-center justify-center rounded-full text-xs font-semibold",
                    !cell.inMonth && "text-text-subtle",
                    cell.inMonth && isWeekend && "text-danger/80",
                    cell.inMonth && !isWeekend && "text-text",
                    cell.isToday && "bg-accent text-accent-contrast",
                  )}
                >
                  {cell.day}
                </span>
                {empty && (
                  <span className="size-1.5 rounded-full bg-shift-gap" title="ไม่มีคนเข้ากะ" />
                )}
              </div>

              {holiday && (
                <span className="truncate rounded bg-shift-gap-soft px-1 py-0.5 text-[10px] font-medium text-danger">
                  {holiday.name}
                </span>
              )}

              {/* Assignments */}
              <div className="flex flex-col gap-1">
                {dayAssignments.map((a, i) => {
                  const name = personById(a.personId)?.name.toLowerCase() ?? "";
                  const dimmed =
                    (personFilter !== "all" && a.personId !== personFilter) ||
                    (shiftFilter !== null && a.shift !== shiftFilter) ||
                    (query !== "" && !name.includes(query));
                  return (
                    <ShiftChip key={i} assignment={a} dimmed={dimmed} />
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

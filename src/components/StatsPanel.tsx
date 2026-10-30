"use client";

import { Modal } from "./Modal";
import { DonutChart } from "./DonutChart";
import { useSchedule } from "./ScheduleProvider";
import { SHIFT_ORDER, SHIFT_TYPES, shiftColor } from "@/lib/shifts";
import {
  breakdownForPerson,
  consecutiveNightStreaks,
  morningGaps,
} from "@/lib/stats";
import { buddhistYear, THAI_MONTHS } from "@/lib/calendar";

interface Props {
  year: number;
  month0: number;
  onClose: () => void;
}

export function StatsPanel({ year, month0, onClose }: Props) {
  const { members, assignments, personById } = useSchedule();
  const gaps = morningGaps(assignments, year, month0);
  const streaks = consecutiveNightStreaks(
    assignments,
    year,
    month0,
    members.map((m) => m.id),
  );

  return (
    <Modal
      title={`สถิติ · ${THAI_MONTHS[month0]} ${buddhistYear(year)}`}
      onClose={onClose}
      maxWidth="max-w-2xl"
    >
      {/* Workload donuts */}
      <h3 className="mb-2 text-sm font-semibold text-text">
        สัดส่วนกะต่อคน
      </h3>
      <div className="grid gap-3 sm:grid-cols-3">
        {members.map((m) => {
          const b = breakdownForPerson(assignments, m.id, year, month0);
          const segments = SHIFT_ORDER.map((id) => ({
            value: b[id],
            color: shiftColor(id),
            label: SHIFT_TYPES[id].short,
          }));
          return (
            <div
              key={m.id}
              className="flex flex-col items-center rounded-card border border-border bg-surface p-3"
            >
              <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-text">
                <span className="size-2.5 rounded-full" style={{ background: m.color }} />
                {m.name}
              </div>
              <DonutChart segments={segments} />
              <div className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-text-muted">
                {SHIFT_ORDER.map((id) => (
                  <span key={id} className="inline-flex items-center gap-1">
                    <span className="size-2 rounded-full" style={{ background: shiftColor(id) }} />
                    {SHIFT_TYPES[id].short} {b[id]}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Alerts */}
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-card border border-shift-gap/30 bg-shift-gap-soft/50 p-3.5">
          <div className="text-sm font-semibold text-danger">
            วันที่ไม่มีคนเข้ากะเช้า ({gaps.length})
          </div>
          <p className="mt-1.5 text-sm text-text-muted">
            {gaps.length ? `วันที่ ${gaps.join(", ")}` : "ครบทุกวันทำงาน 🎉"}
          </p>
        </div>
        <div className="rounded-card border border-warning/30 bg-shift-tdpk-soft/40 p-3.5">
          <div className="text-sm font-semibold text-warning">
            เข้ากะดึกติดกัน ({streaks.length})
          </div>
          <p className="mt-1.5 text-sm text-text-muted">
            {streaks.length
              ? streaks
                  .map(
                    (s) =>
                      `${personById(s.personId)?.name ?? s.personId} (${s.startDay}-${s.endDay})`,
                  )
                  .join(", ")
              : "ไม่มีใครเข้าดึกติดกัน 👍"}
          </p>
        </div>
      </div>
    </Modal>
  );
}

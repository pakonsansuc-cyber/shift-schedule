import type { Assignment } from "@/lib/types";
import { useSchedule } from "./ScheduleProvider";
import { SHIFT_TYPES, shiftColor } from "@/lib/shifts";
import {
  nextLongBreak,
  nextShiftFor,
  totalForPerson,
} from "@/lib/stats";
import { daysInMonth, THAI_MONTHS, toISODate } from "@/lib/calendar";

interface Props {
  assignments: Assignment[];
  userId: string | null;
  year: number;
  month0: number;
}

function thaiDate(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  return `${d} ${THAI_MONTHS[m - 1]}`;
}

export function PersonalCards({ assignments, userId, year, month0 }: Props) {
  const { personById } = useSchedule();
  const person = userId ? personById(userId) : undefined;

  if (!userId || !person) {
    return (
      <div className="rounded-card border border-border bg-surface p-4 text-sm text-text-muted shadow-sm">
        บัญชีของคุณยังไม่ได้ผูกกับสมาชิกในทีม — ให้แอดมินเพิ่มอีเมลของคุณในรายชื่อสมาชิก
        แล้วการ์ดสรุปส่วนตัวจะปรากฏที่นี่
      </div>
    );
  }
  const monthStart = toISODate(year, month0, 1);
  const next = nextShiftFor(assignments, userId, monthStart);
  const worked = totalForPerson(assignments, userId, year, month0);
  const total = daysInMonth(year, month0);
  const pct = Math.round((worked / total) * 100);
  const longBreak = nextLongBreak(assignments, userId, year, month0);

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {/* Next shift */}
      <div className="rounded-card border border-border bg-surface p-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-medium text-text-muted">
          <span className="size-2 rounded-full" style={{ background: person?.color }} />
          กะถัดไปของคุณ
        </div>
        {next ? (
          <>
            <div className="mt-2 text-xl font-bold text-text">{thaiDate(next.date)}</div>
            <span
              className="mt-2 inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold"
              style={{
                background: `color-mix(in srgb, ${shiftColor(next.shift)} 14%, transparent)`,
                color: shiftColor(next.shift),
              }}
            >
              {SHIFT_TYPES[next.shift].label}
            </span>
          </>
        ) : (
          <div className="mt-2 text-sm text-text-muted">ไม่มีกะที่กำลังจะมาถึง</div>
        )}
      </div>

      {/* Days worked */}
      <div className="rounded-card border border-border bg-surface p-4 shadow-sm">
        <div className="text-xs font-medium text-text-muted">วันทำงานเดือนนี้</div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-2xl font-bold text-text">{worked}</span>
          <span className="text-sm text-text-muted">/ {total} วัน</span>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Upcoming long break */}
      <div className="rounded-card border border-border bg-surface p-4 shadow-sm">
        <div className="text-xs font-medium text-text-muted">หยุดยาวครั้งถัดไป</div>
        {longBreak ? (
          <>
            <div className="mt-2 text-xl font-bold text-text">
              {thaiDate(longBreak.startIso)}
            </div>
            <span className="mt-2 inline-flex items-center rounded-md bg-success/12 px-2 py-1 text-xs font-semibold text-success">
              หยุด {longBreak.length} วันติด
            </span>
          </>
        ) : (
          <div className="mt-2 text-sm text-text-muted">ยังไม่มีช่วงหยุดยาว</div>
        )}
      </div>
    </div>
  );
}

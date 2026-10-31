"use client";

import { useState } from "react";
import { Modal } from "./Modal";
import { useSchedule } from "./ScheduleProvider";
import { SHIFT_TYPES, shiftColor } from "@/lib/shifts";
import { compareWithFriend, shiftmatesOn } from "@/lib/stats";
import { buddhistYear, daysInMonth, THAI_MONTHS, toISODate } from "@/lib/calendar";
import { cn } from "@/lib/cn";

interface Props {
  year: number;
  month0: number;
  onClose: () => void;
}

function ShiftTag({ shift }: { shift: keyof typeof SHIFT_TYPES }) {
  return (
    <span
      className="inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-semibold"
      style={{
        background: `color-mix(in srgb, ${shiftColor(shift)} 16%, transparent)`,
        color: shiftColor(shift),
      }}
    >
      {SHIFT_TYPES[shift].short}
    </span>
  );
}

export function BuddiesPanel({ year, month0, onClose }: Props) {
  const { members, assignments, currentMemberId, personById } = useSchedule();
  const [friendId, setFriendId] = useState<string | null>(null);

  if (!currentMemberId) {
    return (
      <Modal title="เข้ากะกับใคร" onClose={onClose}>
        <p className="text-sm text-text-muted">
          บัญชีของคุณยังไม่ได้ผูกกับสมาชิก จึงยังดูไม่ได้
        </p>
      </Modal>
    );
  }

  const me = personById(currentMemberId);
  const monthLabel = `${THAI_MONTHS[month0]} ${buddhistYear(year)}`;
  const total = daysInMonth(year, month0);

  // Current user's shift days this month + who shares each.
  const myDays: { day: number; date: string }[] = [];
  for (let d = 1; d <= total; d++) {
    const date = toISODate(year, month0, d);
    if (assignments.some((a) => a.personId === currentMemberId && a.date === date)) {
      myDays.push({ day: d, date });
    }
  }

  const cmp = friendId
    ? compareWithFriend(assignments, currentMemberId, friendId, year, month0)
    : null;

  return (
    <Modal title={`เข้ากะกับใคร · ${monthLabel}`} onClose={onClose} maxWidth="max-w-xl">
      {/* Friend selector */}
      <div className="mb-4">
        <div className="mb-1.5 text-xs font-medium text-text-muted">
          เทียบกับเพื่อน (เลือกเพื่อดูวันที่ตรงกัน)
        </div>
        <div className="flex flex-wrap gap-1.5">
          {members
            .filter((m) => m.id !== currentMemberId)
            .map((m) => {
              const active = friendId === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setFriendId(active ? null : m.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "border-accent bg-accent-soft text-accent"
                      : "border-border text-text-muted hover:bg-surface-2",
                  )}
                >
                  <span className="size-2 rounded-full" style={{ background: m.color }} />
                  {m.name}
                </button>
              );
            })}
        </div>
      </div>

      {cmp ? (
        /* ---- Compare with a chosen friend ---- */
        <div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-card border border-shift-wfh/30 bg-shift-wfh-soft/50 p-3 text-center">
              <div className="text-2xl font-bold text-success">{cmp.together}</div>
              <div className="text-xs text-text-muted">วันเข้ากะด้วยกัน</div>
            </div>
            <div className="rounded-card border border-border bg-surface-2/50 p-3 text-center">
              <div className="text-2xl font-bold text-text">{cmp.bothOff}</div>
              <div className="text-xs text-text-muted">วันหยุดตรงกัน</div>
            </div>
          </div>

          <h3 className="mb-2 mt-4 text-sm font-semibold text-text">
            วันที่เข้ากะด้วยกัน
          </h3>
          <div className="space-y-1.5">
            {cmp.days.filter((d) => d.status === "together").length === 0 && (
              <p className="text-sm text-text-muted">เดือนนี้ไม่มีวันเข้าตรงกัน</p>
            )}
            {cmp.days
              .filter((d) => d.status === "together")
              .map((d) => (
                <div
                  key={d.date}
                  className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <span className="w-20 font-medium text-text">
                    {d.day} {THAI_MONTHS[month0]}
                  </span>
                  <span className="flex items-center gap-1.5 text-text-muted">
                    {me?.name} {d.mine && <ShiftTag shift={d.mine} />}
                    <span className="text-text-subtle">·</span>
                    {personById(friendId!)?.name}{" "}
                    {d.theirs && <ShiftTag shift={d.theirs} />}
                  </span>
                </div>
              ))}
          </div>
        </div>
      ) : (
        /* ---- Default: your shifts + who's on each ---- */
        <div>
          <h3 className="mb-2 text-sm font-semibold text-text">
            กะของคุณเดือนนี้ · เข้ากับใครบ้าง
          </h3>
          {myDays.length === 0 && (
            <p className="text-sm text-text-muted">เดือนนี้คุณยังไม่มีกะ</p>
          )}
          <div className="space-y-1.5">
            {myDays.map(({ day, date }) => {
              const info = shiftmatesOn(assignments, currentMemberId, date);
              if (!info) return null;
              return (
                <div
                  key={date}
                  className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <span className="w-16 shrink-0 font-medium text-text">
                    {day} {THAI_MONTHS[month0]}
                  </span>
                  <ShiftTag shift={info.shift} />
                  <span className="text-text-subtle">เข้ากับ</span>
                  {info.mates.length === 0 ? (
                    <span className="text-text-muted">— เข้าคนเดียว</span>
                  ) : (
                    <span className="flex flex-wrap items-center gap-1.5">
                      {info.mates.map((mate) => (
                        <span
                          key={mate.personId}
                          className="inline-flex items-center gap-1 text-text"
                        >
                          <span
                            className="size-2 rounded-full"
                            style={{ background: personById(mate.personId)?.color }}
                          />
                          {personById(mate.personId)?.name}
                          <ShiftTag shift={mate.shift} />
                        </span>
                      ))}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Modal>
  );
}

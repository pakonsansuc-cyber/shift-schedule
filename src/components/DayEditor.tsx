"use client";

import { useState } from "react";
import { Modal } from "./Modal";
import { useSchedule } from "./ScheduleProvider";
import { createClient } from "@/lib/supabase/client";
import { SHIFT_ORDER, SHIFT_TYPES, shiftColor } from "@/lib/shifts";
import { THAI_MONTHS } from "@/lib/calendar";
import type { ShiftTypeId } from "@/lib/types";
import { cn } from "@/lib/cn";

interface Props {
  date: string; // ISO
  onClose: () => void;
}

function thaiFullDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${THAI_MONTHS[m - 1]} ${y + 543}`;
}

export function DayEditor({ date, onClose }: Props) {
  const { members, assignments, personById, refresh, holidays } = useSchedule();
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const holiday = holidays.find((h) => h.date === date);

  function shiftOf(memberId: string): ShiftTypeId | null {
    const a = assignments.find(
      (x) => x.date === date && x.personId === memberId,
    );
    return a ? a.shift : null;
  }

  async function setShift(memberId: string, shift: ShiftTypeId | null) {
    setSaving(memberId);
    setError(null);
    const supabase = createClient();
    try {
      if (shift === null) {
        const { error } = await supabase
          .from("assignments")
          .delete()
          .eq("date", date)
          .eq("member_id", memberId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("assignments")
          .upsert(
            { date, member_id: memberId, shift_type_id: shift },
            { onConflict: "date,member_id" },
          );
        if (error) throw error;
      }
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(null);
    }
  }

  return (
    <Modal title={thaiFullDate(date)} onClose={onClose}>
      {holiday && (
        <div className="mb-3 rounded-lg bg-shift-gap-soft px-3 py-2 text-sm font-medium text-danger">
          {holiday.name}
        </div>
      )}

      <p className="mb-3 text-sm text-text-muted">
        เลือกกะของแต่ละคนในวันนี้
      </p>

      <div className="space-y-3">
        {members.map((m) => {
          const current = shiftOf(m.id);
          const isSaving = saving === m.id;
          return (
            <div key={m.id} className="rounded-xl border border-border p-3">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-text">
                <span className="size-2.5 rounded-full" style={{ background: m.color }} />
                {m.name}
                {isSaving && (
                  <span className="ml-auto text-xs font-normal text-text-subtle">
                    กำลังบันทึก…
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SHIFT_ORDER.map((id) => {
                  const active = current === id;
                  return (
                    <button
                      key={id}
                      disabled={isSaving}
                      onClick={() => setShift(m.id, active ? null : id)}
                      className={cn(
                        "rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-50",
                        active
                          ? "text-accent-contrast"
                          : "border-border bg-surface text-text-muted hover:bg-surface-2",
                      )}
                      style={
                        active
                          ? { background: shiftColor(id), borderColor: shiftColor(id) }
                          : undefined
                      }
                    >
                      {SHIFT_TYPES[id].short}
                    </button>
                  );
                })}
                <button
                  disabled={isSaving || current === null}
                  onClick={() => setShift(m.id, null)}
                  className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-text-muted transition-colors hover:bg-surface-2 disabled:opacity-40"
                >
                  ไม่เข้า
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-shift-gap-soft px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}
    </Modal>
  );
}

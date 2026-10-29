import type { ShiftTypeId } from "@/lib/types";
import { SHIFT_ORDER, SHIFT_TYPES, shiftColor } from "@/lib/shifts";
import { cn } from "@/lib/cn";

interface Props {
  value: ShiftTypeId | null;
  onChange: (value: ShiftTypeId | null) => void;
}

export function Legend({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-1 text-xs">
      {SHIFT_ORDER.map((id) => {
        const active = value === id;
        return (
          <button
            key={id}
            onClick={() => onChange(active ? null : id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 font-medium transition-colors",
              active ? "bg-surface-2 text-text" : "text-text-muted hover:text-text",
            )}
          >
            <span
              className="size-2.5 rounded-full"
              style={{ background: shiftColor(id) }}
            />
            {SHIFT_TYPES[id].label}
          </button>
        );
      })}
      <span className="inline-flex items-center gap-1.5 px-1.5 py-1 text-text-muted">
        <span className="size-2.5 rounded-full bg-shift-gap" />
        ไม่มีคนเข้ากะ
      </span>
      {value && (
        <button
          onClick={() => onChange(null)}
          className="ml-1 rounded-md px-2 py-1 text-accent hover:underline"
        >
          ล้างตัวกรอง
        </button>
      )}
    </div>
  );
}

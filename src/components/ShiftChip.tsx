import type { Assignment } from "@/lib/types";
import { SHIFT_TYPES, shiftColor, shiftSoftColor } from "@/lib/shifts";
import { personById } from "@/lib/mock-data";
import { cn } from "@/lib/cn";

interface Props {
  assignment: Assignment;
  dimmed?: boolean;
  size?: "sm" | "md";
}

export function ShiftChip({ assignment, dimmed, size = "sm" }: Props) {
  const person = personById(assignment.personId);
  const shift = SHIFT_TYPES[assignment.shift];
  if (!person) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border font-medium leading-none transition-opacity",
        size === "sm" ? "px-1.5 py-1 text-[11px]" : "px-2.5 py-1.5 text-sm",
        dimmed && "opacity-25",
      )}
      style={{
        background: shiftSoftColor(assignment.shift),
        borderColor: `color-mix(in srgb, ${shiftColor(assignment.shift)} 35%, transparent)`,
        color: "var(--text)",
      }}
      title={`${person.name} · ${shift.label}`}
    >
      <span
        className="size-1.5 shrink-0 rounded-full"
        style={{ background: person.color }}
      />
      <span className="truncate">{person.name}</span>
      <span
        className="shrink-0 font-semibold"
        style={{ color: shiftColor(assignment.shift) }}
      >
        {shift.short}
      </span>
    </span>
  );
}

import { useSchedule } from "./ScheduleProvider";
import { cn } from "@/lib/cn";

interface Props {
  value: string | "all";
  onChange: (value: string | "all") => void;
}

export function PersonFilter({ value, onChange }: Props) {
  const { members } = useSchedule();
  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-surface p-1.5 shadow-sm">
      {members.map((p) => {
        const active = value === p.id;
        return (
          <button
            key={p.id}
            onClick={() => onChange(active ? "all" : p.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-surface-2 text-text"
                : "text-text-muted hover:text-text hover:bg-surface-2/60",
            )}
          >
            <span
              className="size-2 rounded-full"
              style={{ background: p.color }}
            />
            {p.name}
          </button>
        );
      })}
      <button
        onClick={() => onChange("all")}
        className={cn(
          "ml-auto rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors",
          value === "all"
            ? "bg-accent text-accent-contrast"
            : "text-text-muted hover:text-text hover:bg-surface-2/60",
        )}
      >
        รวมทุกคน
      </button>
    </div>
  );
}

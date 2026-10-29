import type { Assignment } from "@/lib/types";
import { PEOPLE, personById } from "@/lib/mock-data";
import { consecutiveNightStreaks, morningGaps } from "@/lib/stats";

interface Props {
  assignments: Assignment[];
  year: number;
  month0: number;
}

export function Alerts({ assignments, year, month0 }: Props) {
  const gaps = morningGaps(assignments, year, month0);
  const streaks = consecutiveNightStreaks(
    assignments,
    year,
    month0,
    PEOPLE.map((p) => p.id),
  );

  if (gaps.length === 0 && streaks.length === 0) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {gaps.length > 0 && (
        <div className="rounded-card border border-shift-gap/30 bg-shift-gap-soft/60 p-3.5">
          <div className="flex items-center gap-2 text-sm font-semibold text-danger">
            <Dot className="bg-shift-gap" />
            วันที่ไม่มีคนเข้ากะเช้า ({gaps.length} วัน)
          </div>
          <p className="mt-1.5 text-sm text-text-muted">
            วันที่ {gaps.join(", ")}
          </p>
        </div>
      )}

      {streaks.length > 0 && (
        <div className="rounded-card border border-warning/30 bg-shift-tdpk-soft/50 p-3.5">
          <div className="flex items-center gap-2 text-sm font-semibold text-warning">
            <Dot className="bg-warning" />
            เข้ากะดึกติดกัน ({streaks.length} ช่วง)
          </div>
          <p className="mt-1.5 text-sm text-text-muted">
            {streaks
              .map((s) => {
                const name = personById(s.personId)?.name ?? s.personId;
                return `${name} (วันที่ ${s.startDay}-${s.endDay})`;
              })
              .join(", ")}
          </p>
        </div>
      )}
    </div>
  );
}

function Dot({ className }: { className: string }) {
  return <span className={`size-2 rounded-full ${className}`} />;
}

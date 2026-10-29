import { buddhistYear, THAI_MONTHS } from "@/lib/calendar";

interface Props {
  year: number;
  month0: number;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function MonthNav({ year, month0, onPrev, onNext, onToday }: Props) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1">
        <NavButton onClick={onPrev} label="เดือนก่อนหน้า">
          <path d="M15 18l-6-6 6-6" />
        </NavButton>
        <NavButton onClick={onNext} label="เดือนถัดไป">
          <path d="M9 18l6-6-6-6" />
        </NavButton>
      </div>
      <h2 className="text-lg font-bold text-text sm:text-xl">
        {THAI_MONTHS[month0]} {buddhistYear(year)}
      </h2>
      <button
        onClick={onToday}
        className="rounded-lg border border-border bg-surface px-2.5 py-1 text-xs font-medium text-text-muted transition-colors hover:text-text hover:bg-surface-2"
      >
        วันนี้
      </button>
    </div>
  );
}

function NavButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-surface text-text-muted transition-colors hover:text-text hover:bg-surface-2"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
    </button>
  );
}

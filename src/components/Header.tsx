import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-contrast shadow-sm">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2.5" />
            <path d="M3 9h18M8 2v4M16 2v4" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-text">
            Shift Schedule
          </h1>
          <p className="text-sm text-text-muted">ตารางกะงานของทีม</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium text-text-muted sm:inline">
          ข้อมูลตัวอย่าง
        </span>
        <ThemeToggle />
      </div>
    </header>
  );
}

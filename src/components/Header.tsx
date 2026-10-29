"use client";

import { useSchedule } from "./ScheduleProvider";
import { ThemeToggle } from "./ThemeToggle";
import { SignOutButton } from "./SignOutButton";

export function Header() {
  const { currentMemberId, isAdmin, personById } = useSchedule();
  const me = currentMemberId ? personById(currentMemberId) : undefined;

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
          <p className="text-sm text-text-muted">
            {me ? (
              <>
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ background: me.color }} />
                  {me.name}
                </span>
                {isAdmin && (
                  <span className="ml-2 rounded bg-accent-soft px-1.5 py-0.5 text-[11px] font-semibold text-accent">
                    แอดมิน
                  </span>
                )}
              </>
            ) : (
              "ตารางกะงานของทีม"
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <SignOutButton />
      </div>
    </header>
  );
}

"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";

function LoginCard() {
  const params = useSearchParams();
  const hasError = params.get("error");
  const [loading, setLoading] = useState(false);

  async function signInWithGoogle() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
    if (error) setLoading(false);
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-7 shadow-lg animate-fade-in">
      <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-accent text-accent-contrast shadow-sm">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2.5" />
          <path d="M3 9h18M8 2v4M16 2v4" />
        </svg>
      </div>

      <h1 className="mt-5 text-center text-xl font-bold text-text">
        Shift Schedule
      </h1>
      <p className="mt-1.5 text-center text-sm text-text-muted">
        เข้าสู่ระบบด้วยบัญชี Google เพื่อดูและจัดตารางกะของทีม
      </p>

      {hasError && (
        <p className="mt-4 rounded-lg bg-shift-gap-soft px-3 py-2 text-center text-sm text-danger">
          เข้าสู่ระบบไม่สำเร็จ ลองอีกครั้ง
        </p>
      )}

      <button
        onClick={signInWithGoogle}
        disabled={loading}
        className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-border-strong bg-surface px-4 py-3 text-sm font-semibold text-text transition-colors hover:bg-surface-2 disabled:opacity-60"
      >
        <GoogleIcon />
        {loading ? "กำลังพาไป Google…" : "เข้าสู่ระบบด้วย Google"}
      </button>

      <p className="mt-5 text-center text-xs text-text-subtle">
        ระบบจัดตารางกะงานของทีมแบบออนไลน์
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="relative flex min-h-dvh items-center justify-center px-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <Suspense>
        <LoginCard />
      </Suspense>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { Modal } from "./Modal";
import { useSchedule } from "./ScheduleProvider";
import { createClient } from "@/lib/supabase/client";
import { SHIFT_TYPES } from "@/lib/shifts";
import { THAI_MONTHS } from "@/lib/calendar";
import type { Database } from "@/lib/supabase/database.types";
import { cn } from "@/lib/cn";

type SwapRow = Database["public"]["Tables"]["swap_requests"]["Row"];

interface Props {
  onClose: () => void;
}

function thaiDate(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  return `${d} ${THAI_MONTHS[m - 1]}`;
}

export function SwapPanel({ onClose }: Props) {
  const { members, assignments, currentMemberId, isAdmin, personById, refresh } =
    useSchedule();
  const [swaps, setSwaps] = useState<SwapRow[]>([]);
  const [targetId, setTargetId] = useState("");
  const [myDate, setMyDate] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const supabase = createClient();

  const loadSwaps = useCallback(async () => {
    const { data } = await supabase
      .from("swap_requests")
      .select("*")
      .order("created_at", { ascending: false });
    setSwaps(data ?? []);
  }, [supabase]);

  useEffect(() => {
    void loadSwaps();
  }, [loadSwaps]);

  const myAssignments = assignments
    .filter((a) => a.personId === currentMemberId)
    .sort((a, b) => a.date.localeCompare(b.date));
  const targetAssignments = assignments
    .filter((a) => a.personId === targetId)
    .sort((a, b) => a.date.localeCompare(b.date));

  function shiftLabelOn(memberId: string, date: string): string {
    const a = assignments.find(
      (x) => x.personId === memberId && x.date === date,
    );
    return a ? SHIFT_TYPES[a.shift].short : "";
  }

  async function createSwap() {
    if (!currentMemberId || !myDate || !targetId || !targetDate) return;
    setBusy(true);
    setError(null);
    try {
      const { error } = await supabase.from("swap_requests").insert({
        requester_id: currentMemberId,
        requester_date: myDate,
        target_id: targetId,
        target_date: targetDate,
      });
      if (error) throw error;
      setMyDate("");
      setTargetDate("");
      setTargetId("");
      await loadSwaps();
    } catch (e) {
      setError(e instanceof Error ? e.message : "ส่งคำขอไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  async function accept(id: string) {
    setBusy(true);
    setError(null);
    try {
      const { error } = await supabase.rpc("accept_swap", { swap_id: id });
      if (error) throw error;
      await Promise.all([loadSwaps(), refresh()]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "รับแลกไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  async function setStatus(id: string, status: "declined" | "cancelled") {
    setBusy(true);
    setError(null);
    try {
      const { error } = await supabase
        .from("swap_requests")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
      await loadSwaps();
    } catch (e) {
      setError(e instanceof Error ? e.message : "อัปเดตไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  const canCreate = currentMemberId && myDate && targetId && targetDate;

  return (
    <Modal title="แลกกะ" onClose={onClose} maxWidth="max-w-xl">
      {/* Create */}
      {currentMemberId ? (
        <div className="rounded-xl border border-border p-3.5">
          <h3 className="mb-2.5 text-sm font-semibold text-text">
            ขอแลกกะ
          </h3>
          <div className="grid gap-2.5 sm:grid-cols-2">
            <label className="text-xs font-medium text-text-muted">
              กะของฉัน
              <select
                value={myDate}
                onChange={(e) => setMyDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-surface px-2.5 py-2 text-sm text-text"
              >
                <option value="">เลือกวัน…</option>
                {myAssignments.map((a) => (
                  <option key={a.date} value={a.date}>
                    {thaiDate(a.date)} · {SHIFT_TYPES[a.shift].short}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs font-medium text-text-muted">
              แลกกับ
              <select
                value={targetId}
                onChange={(e) => {
                  setTargetId(e.target.value);
                  setTargetDate("");
                }}
                className="mt-1 w-full rounded-lg border border-border bg-surface px-2.5 py-2 text-sm text-text"
              >
                <option value="">เลือกคน…</option>
                {members
                  .filter((m) => m.id !== currentMemberId)
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
              </select>
            </label>

            {targetId && (
              <label className="text-xs font-medium text-text-muted sm:col-span-2">
                กะของ {personById(targetId)?.name}
                <select
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-surface px-2.5 py-2 text-sm text-text"
                >
                  <option value="">เลือกวัน…</option>
                  {targetAssignments.map((a) => (
                    <option key={a.date} value={a.date}>
                      {thaiDate(a.date)} · {SHIFT_TYPES[a.shift].short}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
          <button
            onClick={createSwap}
            disabled={!canCreate || busy}
            className="mt-3 w-full rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-contrast transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            ส่งคำขอแลกกะ
          </button>
        </div>
      ) : (
        <p className="rounded-lg bg-surface-2 px-3 py-2 text-sm text-text-muted">
          บัญชีของคุณยังไม่ได้ผูกกับสมาชิก จึงยังขอแลกกะไม่ได้
        </p>
      )}

      {error && (
        <p className="mt-3 rounded-lg bg-shift-gap-soft px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      {/* List */}
      <h3 className="mb-2 mt-5 text-sm font-semibold text-text">คำขอแลกกะ</h3>
      <div className="space-y-2">
        {swaps.length === 0 && (
          <p className="text-sm text-text-muted">ยังไม่มีคำขอ</p>
        )}
        {swaps.map((s) => {
          const requester = personById(s.requester_id)?.name ?? "—";
          const target = s.target_id ? personById(s.target_id)?.name ?? "—" : "—";
          const amTarget = s.target_id === currentMemberId;
          const amRequester = s.requester_id === currentMemberId;
          const pending = s.status === "pending";
          return (
            <div
              key={s.id}
              className="flex flex-wrap items-center gap-2 rounded-xl border border-border p-3 text-sm"
            >
              <div className="flex-1">
                <span className="font-medium text-text">{requester}</span>{" "}
                <span className="text-text-muted">
                  ({thaiDate(s.requester_date)}
                  {s.requester_date &&
                    ` · ${shiftLabelOn(s.requester_id, s.requester_date)}`}
                  )
                </span>{" "}
                <span className="text-text-subtle">⇄</span>{" "}
                <span className="font-medium text-text">{target}</span>
                {s.target_date && (
                  <span className="text-text-muted">
                    {" "}
                    ({thaiDate(s.target_date)}
                    {s.target_id &&
                      ` · ${shiftLabelOn(s.target_id, s.target_date)}`}
                    )
                  </span>
                )}
              </div>

              <StatusBadge status={s.status} />

              {pending && (amTarget || isAdmin) && (
                <div className="flex gap-1.5">
                  <button
                    onClick={() => accept(s.id)}
                    disabled={busy}
                    className="rounded-lg bg-success px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    รับแลก
                  </button>
                  <button
                    onClick={() => setStatus(s.id, "declined")}
                    disabled={busy}
                    className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-text-muted hover:bg-surface-2 disabled:opacity-50"
                  >
                    ปฏิเสธ
                  </button>
                </div>
              )}
              {pending && amRequester && !amTarget && (
                <button
                  onClick={() => setStatus(s.id, "cancelled")}
                  disabled={busy}
                  className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-text-muted hover:bg-surface-2 disabled:opacity-50"
                >
                  ยกเลิก
                </button>
              )}
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending: { label: "รอดำเนินการ", cls: "bg-shift-tdpk-soft text-warning" },
    accepted: { label: "แลกแล้ว", cls: "bg-shift-wfh-soft text-success" },
    declined: { label: "ปฏิเสธ", cls: "bg-shift-gap-soft text-danger" },
    cancelled: { label: "ยกเลิก", cls: "bg-surface-2 text-text-muted" },
  };
  const s = map[status] ?? map.pending;
  return (
    <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium", s.cls)}>
      {s.label}
    </span>
  );
}

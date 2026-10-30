"use client";

import { useState } from "react";
import { Modal } from "./Modal";
import { useSchedule } from "./ScheduleProvider";
import { createClient } from "@/lib/supabase/client";
import { SHIFT_TYPES } from "@/lib/shifts";
import { THAI_MONTHS } from "@/lib/calendar";
import type { ShiftTypeId } from "@/lib/types";

interface Props {
  year: number;
  month0: number;
  onClose: () => void;
}

interface Parsed {
  date: string;
  memberId: string;
  shift: ShiftTypeId;
}

function thaiDate(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  return `${d} ${THAI_MONTHS[m - 1]}`;
}

export function ScanPanel({ year, month0, onClose }: Props) {
  const { personById, refresh } = useSchedule();
  const [image, setImage] = useState<string | null>(null);
  const [parsed, setParsed] = useState<Parsed[] | null>(null);
  const [status, setStatus] = useState<"idle" | "scanning" | "saving">("idle");
  const [error, setError] = useState<string | null>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      setParsed(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  }

  async function scan() {
    if (!image) return;
    setStatus("scanning");
    setError(null);
    try {
      const res = await fetch("/api/scan-schedule", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          image,
          monthHint: `${year}-${String(month0 + 1).padStart(2, "0")}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "สแกนไม่สำเร็จ");
      setParsed(data.assignments ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "สแกนไม่สำเร็จ");
    } finally {
      setStatus("idle");
    }
  }

  async function save() {
    if (!parsed || parsed.length === 0) return;
    setStatus("saving");
    setError(null);
    const supabase = createClient();
    try {
      const rows = parsed.map((p) => ({
        date: p.date,
        member_id: p.memberId,
        shift_type_id: p.shift,
      }));
      const { error } = await supabase
        .from("assignments")
        .upsert(rows, { onConflict: "date,member_id" });
      if (error) throw error;
      await refresh();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "บันทึกไม่สำเร็จ");
      setStatus("idle");
    }
  }

  return (
    <Modal title="สแกนตารางด้วย AI" onClose={onClose} maxWidth="max-w-lg">
      <p className="mb-3 text-sm text-text-muted">
        อัปโหลดรูปตาราง (ภาพถ่าย/สกรีนช็อต) แล้ว AI จะอ่านแล้วแปลงเป็นข้อมูล
        — ตรวจก่อนกดบันทึกได้
      </p>

      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border-strong bg-surface-2/40 px-4 py-6 text-sm text-text-muted transition-colors hover:bg-surface-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
        </svg>
        {image ? "เลือกรูปอื่น" : "เลือกรูปตาราง"}
        <input type="file" accept="image/*" onChange={onFile} className="hidden" />
      </label>

      {image && (
        <div className="mt-3 overflow-hidden rounded-xl border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="ตารางที่อัปโหลด" className="max-h-56 w-full object-contain bg-surface-2" />
        </div>
      )}

      {image && !parsed && (
        <button
          onClick={scan}
          disabled={status === "scanning"}
          className="mt-3 w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-contrast transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {status === "scanning" ? "กำลังสแกน…" : "สแกนด้วย AI"}
        </button>
      )}

      {error && (
        <p className="mt-3 rounded-lg bg-shift-gap-soft px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      {parsed && (
        <div className="mt-4">
          <h3 className="mb-2 text-sm font-semibold text-text">
            ตรวจผลลัพธ์ ({parsed.length} รายการ)
          </h3>
          {parsed.length === 0 ? (
            <p className="text-sm text-text-muted">
              AI อ่านไม่เจอข้อมูลที่แปลงได้ ลองรูปที่ชัดกว่านี้
            </p>
          ) : (
            <div className="max-h-56 overflow-y-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-surface-2 text-xs text-text-muted">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">วันที่</th>
                    <th className="px-3 py-2 text-left font-medium">ชื่อ</th>
                    <th className="px-3 py-2 text-left font-medium">กะ</th>
                  </tr>
                </thead>
                <tbody>
                  {parsed.map((p, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="px-3 py-1.5">{thaiDate(p.date)}</td>
                      <td className="px-3 py-1.5">{personById(p.memberId)?.name ?? "—"}</td>
                      <td className="px-3 py-1.5">{SHIFT_TYPES[p.shift].label}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {parsed.length > 0 && (
            <button
              onClick={save}
              disabled={status === "saving"}
              className="mt-3 w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-contrast transition-colors hover:bg-accent-hover disabled:opacity-50"
            >
              {status === "saving" ? "กำลังบันทึก…" : `ยืนยันบันทึก ${parsed.length} รายการ`}
            </button>
          )}
        </div>
      )}
    </Modal>
  );
}

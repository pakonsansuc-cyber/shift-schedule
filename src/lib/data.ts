import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./supabase/database.types";
import type { Assignment, Holiday, Person, ShiftTypeId } from "./types";

export type DB = SupabaseClient<Database>;

export interface ScheduleData {
  members: Person[];
  assignments: Assignment[];
  holidays: Holiday[];
}

/** Fetch the full schedule dataset from Supabase and map it to domain types. */
export async function fetchSchedule(supabase: DB): Promise<ScheduleData> {
  const [membersRes, assignmentsRes, holidaysRes] = await Promise.all([
    supabase.from("members").select("*").order("sort_order"),
    supabase.from("assignments").select("date, member_id, shift_type_id"),
    supabase.from("holidays").select("*"),
  ]);

  const members: Person[] = (membersRes.data ?? []).map((m) => ({
    id: m.id,
    name: m.name,
    color: m.color,
    role: m.role === "admin" ? "admin" : "member",
    email: m.email ?? undefined,
  }));

  const assignments: Assignment[] = (assignmentsRes.data ?? []).map((a) => ({
    date: a.date,
    personId: a.member_id,
    shift: a.shift_type_id as ShiftTypeId,
  }));

  const holidays: Holiday[] = (holidaysRes.data ?? []).map((h) => ({
    date: h.date,
    name: h.name,
  }));

  return { members, assignments, holidays };
}

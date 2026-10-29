"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { fetchSchedule, type ScheduleData } from "@/lib/data";
import type { Person } from "@/lib/types";

interface ScheduleContextValue extends ScheduleData {
  currentMemberId: string | null;
  isAdmin: boolean;
  personById: (id: string) => Person | undefined;
  refresh: () => Promise<void>;
}

const ScheduleContext = createContext<ScheduleContextValue | null>(null);

interface Props {
  initial: ScheduleData;
  currentMemberId: string | null;
  isAdmin: boolean;
  children: React.ReactNode;
}

export function ScheduleProvider({
  initial,
  currentMemberId,
  isAdmin,
  children,
}: Props) {
  const [data, setData] = useState<ScheduleData>(initial);
  const supabaseRef = useRef(createClient());

  const refresh = useCallback(async () => {
    const next = await fetchSchedule(supabaseRef.current);
    setData(next);
  }, []);

  // Realtime: refetch when assignments or members change.
  useEffect(() => {
    const supabase = supabaseRef.current;
    const channel = supabase
      .channel("schedule-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "assignments" },
        () => void refresh(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "members" },
        () => void refresh(),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refresh]);

  const value = useMemo<ScheduleContextValue>(() => {
    const index = new Map(data.members.map((m) => [m.id, m]));
    return {
      ...data,
      currentMemberId,
      isAdmin,
      personById: (id: string) => index.get(id),
      refresh,
    };
  }, [data, currentMemberId, isAdmin, refresh]);

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule(): ScheduleContextValue {
  const ctx = useContext(ScheduleContext);
  if (!ctx) {
    throw new Error("useSchedule must be used within <ScheduleProvider>");
  }
  return ctx;
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchSchedule } from "@/lib/data";
import { ScheduleProvider } from "@/components/ScheduleProvider";
import { Dashboard } from "@/components/Dashboard";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Link this auth user to a team member by matching email (idempotent).
  await supabase.rpc("claim_member");

  const [data, memberRes] = await Promise.all([
    fetchSchedule(supabase),
    supabase
      .from("members")
      .select("id, role")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const currentMemberId = memberRes.data?.id ?? null;
  const isAdmin = memberRes.data?.role === "admin";

  return (
    <ScheduleProvider
      initial={data}
      currentMemberId={currentMemberId}
      isAdmin={isAdmin}
    >
      <Dashboard />
    </ScheduleProvider>
  );
}

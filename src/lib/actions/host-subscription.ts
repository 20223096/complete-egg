"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function enableDemoProForHost(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "host") return;

  const { error } = await supabase.from("host_subscriptions").upsert(
    {
      host_id: user.id,
      plan: "pro",
      status: "active",
      started_at: new Date().toISOString(),
      ended_at: null,
    },
    { onConflict: "host_id" }
  );
  if (error) return;
  revalidatePath("/host/mypage");
  revalidatePath("/host");
}

export async function setDemoFreePlan(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const { error } = await supabase
    .from("host_subscriptions")
    .update({ plan: "free", status: "active", ended_at: null })
    .eq("host_id", user.id);
  if (error) return;
  revalidatePath("/host/mypage");
  revalidatePath("/host");
}

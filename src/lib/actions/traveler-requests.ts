"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { AccommodationType, RequestStatus } from "@/lib/types/database";

export type CreateRequestInput = {
  traveler_name: string;
  region: string;
  detail_region: string;
  check_in_date: string;
  check_out_date: string;
  people_count: number;
  room_count: number;
  budget_min: number;
  budget_max: number;
  accommodation_type: AccommodationType | string;
  required_options: string[];
  preferred_mood: string[];
  message: string;
  natural_language?: string | null;
  is_tonight_flash?: boolean;
  ai_summary?: string | null;
};

export async function createTravelerRequest(input: CreateRequestInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const { data: profile, error: pe } = await supabase
    .from("profiles")
    .select("role,name")
    .eq("id", user.id)
    .single();
  if (pe || !profile || profile.role !== "traveler") {
    return { error: "여행객 계정만 요청서를 작성할 수 있습니다." };
  }

  const payload = {
    traveler_id: user.id,
    traveler_name: input.traveler_name || profile.name,
    region: input.region,
    detail_region: input.detail_region || null,
    check_in_date: input.check_in_date,
    check_out_date: input.check_out_date,
    people_count: input.people_count,
    room_count: input.room_count,
    budget_min: input.budget_min,
    budget_max: input.budget_max,
    accommodation_type: input.accommodation_type,
    required_options: input.required_options,
    preferred_mood: input.preferred_mood,
    message: input.message || null,
    natural_language: input.natural_language?.trim() || null,
    is_tonight_flash: input.is_tonight_flash ?? false,
    ai_summary: input.ai_summary?.trim() || null,
    status: "open" as RequestStatus,
  };

  const { data, error } = await supabase.from("traveler_requests").insert(payload).select("id").single();
  if (error) return { error: error.message };
  revalidatePath("/traveler");
  return { id: data.id as string };
}

export async function cancelTravelerRequest(requestId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("traveler_requests")
    .update({ status: "canceled" })
    .eq("id", requestId);
  if (error) return;
  revalidatePath("/traveler");
  revalidatePath(`/traveler/requests/${requestId}`);
}

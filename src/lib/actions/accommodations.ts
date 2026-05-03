"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AccommodationInput = {
  name: string;
  region: string;
  detail_region: string;
  address: string;
  description: string;
  accommodation_type: string;
  base_price: number;
  max_people: number;
  images: string[];
  options: string[];
  check_in_time: string;
  check_out_time: string;
  phone: string;
  status?: "active" | "inactive";
};

export async function createAccommodation(input: AccommodationInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const { data: profile, error: pe } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (pe || !profile || profile.role !== "host") {
    return { error: "사장님만 숙소를 등록할 수 있습니다." };
  }

  const row = {
    host_id: user.id,
    name: input.name,
    region: input.region,
    detail_region: input.detail_region || null,
    address: input.address || null,
    description: input.description || null,
    accommodation_type: input.accommodation_type,
    base_price: input.base_price,
    max_people: input.max_people,
    images: input.images,
    options: input.options,
    check_in_time: input.check_in_time,
    check_out_time: input.check_out_time,
    phone: input.phone,
    status: input.status ?? "active",
  };

  const { data, error } = await supabase.from("accommodations").insert(row).select("id").single();
  if (error) return { error: error.message };
  revalidatePath("/host");
  return { id: data.id as string };
}

export async function updateAccommodation(id: string, input: AccommodationInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const { error } = await supabase
    .from("accommodations")
    .update({
      name: input.name,
      region: input.region,
      detail_region: input.detail_region || null,
      address: input.address || null,
      description: input.description || null,
      accommodation_type: input.accommodation_type,
      base_price: input.base_price,
      max_people: input.max_people,
      images: input.images,
      options: input.options,
      check_in_time: input.check_in_time,
      check_out_time: input.check_out_time,
      phone: input.phone,
      status: input.status ?? "active",
    })
    .eq("id", id)
    .eq("host_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/host");
  revalidatePath(`/host/accommodations/${id}/edit`);
  return { ok: true };
}

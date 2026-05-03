"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CreateQuoteInput = {
  request_id: string;
  accommodation_id: string;
  title: string;
  price: number;
  original_price?: number | null;
  discount_rate?: number | null;
  included_options: string[];
  message_from_host: string;
  cancellation_policy: string;
  is_auto_generated?: boolean;
};

export async function upsertQuote(input: CreateQuoteInput) {
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
  if (pe || !profile || profile.role !== "host") {
    return { error: "사장님 계정만 견적을 보낼 수 있습니다." };
  }

  const { data: req, error: re } = await supabase
    .from("traveler_requests")
    .select("*")
    .eq("id", input.request_id)
    .single();
  if (re || !req) return { error: "요청서를 찾을 수 없습니다." };

  const { data: acc, error: ae } = await supabase
    .from("accommodations")
    .select("*")
    .eq("id", input.accommodation_id)
    .eq("host_id", user.id)
    .single();
  if (ae || !acc) return { error: "내 숙소만 선택할 수 있습니다." };

  const row = {
    request_id: input.request_id,
    traveler_id: req.traveler_id as string,
    host_id: user.id,
    accommodation_id: acc.id,
    accommodation_name: acc.name as string,
    title: input.title,
    price: input.price,
    original_price: input.original_price ?? null,
    discount_rate: input.discount_rate ?? null,
    check_in_date: req.check_in_date,
    check_out_date: req.check_out_date,
    people_count: req.people_count as number,
    included_options: input.included_options,
    message_from_host: input.message_from_host,
    cancellation_policy: input.cancellation_policy,
    status: "sent" as const,
    is_auto_generated: input.is_auto_generated ?? false,
  };

  const { data, error } = await supabase.from("quotes").insert(row).select("id").single();
  if (error) return { error: error.message };

  if (req.status === "open") {
    await supabase.from("traveler_requests").update({ status: "quoted" }).eq("id", input.request_id);
  }

  revalidatePath("/host/quotes");
  revalidatePath(`/host/requests/${input.request_id}`);
  revalidatePath(`/traveler/requests/${input.request_id}`);
  revalidatePath("/traveler");
  return { id: data.id as string };
}

export async function acceptQuote(quoteId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const { data: quote, error: qe } = await supabase.from("quotes").select("*").eq("id", quoteId).single();
  if (qe || !quote) return { error: "견적을 찾을 수 없습니다." };
  if (quote.traveler_id !== user.id) return { error: "권한이 없습니다." };
  if (quote.status !== "sent") return { error: "수락할 수 없는 견적입니다." };

  const { data: req } = await supabase.from("traveler_requests").select("status").eq("id", quote.request_id).single();
  if (req?.status === "accepted") return { error: "이미 처리된 요청입니다." };

  await supabase
    .from("quotes")
    .update({ status: "rejected" })
    .eq("request_id", quote.request_id as string)
    .neq("id", quoteId)
    .eq("status", "sent");

  const { error: uq } = await supabase.from("quotes").update({ status: "accepted" }).eq("id", quoteId);
  if (uq) return { error: uq.message };

  await supabase.from("traveler_requests").update({ status: "accepted" }).eq("id", quote.request_id as string);

  const { data: resRow, error: re } = await supabase
    .from("reservations")
    .insert({
      request_id: quote.request_id,
      quote_id: quote.id,
      traveler_id: quote.traveler_id,
      host_id: quote.host_id,
      accommodation_id: quote.accommodation_id,
      price: quote.price,
      status: "payment_pending",
      payment_status: "pending",
    })
    .select("id")
    .single();
  if (re || !resRow) return { error: re?.message ?? "예약 생성 실패" };

  await supabase.from("conversations").insert({
    reservation_id: resRow.id as string,
    traveler_id: quote.traveler_id,
    host_id: quote.host_id,
    quote_id: quote.id,
  });

  revalidatePath("/traveler");
  revalidatePath("/traveler/reservations");
  revalidatePath("/host");
  revalidatePath("/host/messages");
  return { reservationId: resRow.id as string };
}

export async function rejectQuote(quoteId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const { data: quote, error: qe } = await supabase.from("quotes").select("traveler_id,status").eq("id", quoteId).single();
  if (qe || !quote) return { error: "견적을 찾을 수 없습니다." };
  if (quote.traveler_id !== user.id) return { error: "권한이 없습니다." };
  if (quote.status !== "sent") return { error: "거절할 수 없는 견적입니다." };

  const { error } = await supabase.from("quotes").update({ status: "rejected" }).eq("id", quoteId);
  if (error) return { error: error.message };
  revalidatePath("/traveler");
  return { ok: true };
}

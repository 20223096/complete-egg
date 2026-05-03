"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AutoQuoteRuleInput = {
  accommodation_id: string;
  enabled: boolean;
  regions: string[];
  min_budget: number | null;
  max_budget: number | null;
  min_people: number | null;
  max_people: number | null;
  available_options: string[];
  base_message: string;
  discount_policy: string;
};

export async function saveAutoQuoteRule(input: AutoQuoteRuleInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const { data: sub } = await supabase.from("host_subscriptions").select("plan,status").eq("host_id", user.id).maybeSingle();
  if (!sub || sub.plan !== "pro" || sub.status !== "active") {
    return { error: "Pro 플랜에서만 자동 견적 규칙을 저장할 수 있습니다." };
  }

  const { data: acc } = await supabase
    .from("accommodations")
    .select("id")
    .eq("id", input.accommodation_id)
    .eq("host_id", user.id)
    .single();
  if (!acc) return { error: "내 숙소만 연결할 수 있습니다." };

  const { data: existing } = await supabase
    .from("auto_quote_rules")
    .select("id")
    .eq("host_id", user.id)
    .eq("accommodation_id", input.accommodation_id)
    .maybeSingle();

  const row = {
    host_id: user.id,
    accommodation_id: input.accommodation_id,
    enabled: input.enabled,
    regions: input.regions,
    min_budget: input.min_budget,
    max_budget: input.max_budget,
    min_people: input.min_people,
    max_people: input.max_people,
    available_options: input.available_options,
    base_message: input.base_message,
    discount_policy: input.discount_policy,
  };

  if (existing?.id) {
    const { error } = await supabase.from("auto_quote_rules").update(row).eq("id", existing.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("auto_quote_rules").insert(row);
    if (error) return { error: error.message };
  }

  revalidatePath("/host/mypage");
  return { ok: true };
}

export type PreviewDraftResult =
  | { ok: true; draft: Record<string, unknown> }
  | { ok: false; error: string };

/** DB에 draft 상태가 없으므로 미리보기 JSON만 반환합니다. 실제 전송은 견적 작성 화면에서 진행하세요. */
export async function previewAutoQuoteDraft(requestId: string, accommodationId: string): Promise<PreviewDraftResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "로그인이 필요합니다." };

  const { data: sub } = await supabase.from("host_subscriptions").select("plan,status").eq("host_id", user.id).maybeSingle();
  if (!sub || sub.plan !== "pro" || sub.status !== "active") {
    return { ok: false, error: "Pro 플랜에서만 미리보기를 사용할 수 있습니다." };
  }

  const { data: rule } = await supabase
    .from("auto_quote_rules")
    .select("*")
    .eq("host_id", user.id)
    .eq("accommodation_id", accommodationId)
    .maybeSingle();

  const { data: req } = await supabase.from("traveler_requests").select("*").eq("id", requestId).single();
  if (!req) return { ok: false, error: "요청서를 찾을 수 없습니다." };

  const { data: acc } = await supabase
    .from("accommodations")
    .select("*")
    .eq("id", accommodationId)
    .eq("host_id", user.id)
    .single();
  if (!acc) return { ok: false, error: "숙소를 찾을 수 없습니다." };

  const matchesRegion =
    !rule?.regions?.length ||
    rule.regions.some((r: string) => req.region.includes(r) || (req.detail_region && String(req.detail_region).includes(r)));

  const budgetOk =
    (rule?.min_budget == null || (req.budget_max != null && req.budget_max >= rule.min_budget)) &&
    (rule?.max_budget == null || (req.budget_min != null && req.budget_min <= rule.max_budget));

  const peopleOk =
    (rule?.min_people == null || req.people_count >= rule.min_people) &&
    (rule?.max_people == null || req.people_count <= rule.max_people);

  if (!matchesRegion || !budgetOk || !peopleOk) {
    return { ok: false, error: "자동 견적 규칙과 요청 조건이 맞지 않습니다. 규칙을 조정해 주세요." };
  }

  const basePrice = (acc.base_price as number) ?? 0;
  let price = basePrice;
  let discountRate: number | null = null;
  if (rule?.discount_policy) {
    const m = /(\d+)%/.exec(rule.discount_policy);
    if (m) {
      discountRate = Number(m[1]);
      price = Math.round(basePrice * (1 - discountRate / 100));
    }
  }

  const draft = {
    title: `${acc.name} 맞춤 제안`,
    price,
    original_price: basePrice,
    discount_rate: discountRate,
    included_options: (rule?.available_options as string[])?.length ? rule.available_options : acc.options,
    message_from_host: `${rule?.base_message ?? ""}\n\n요청하신 ${req.region} 일정에 맞춰 준비했어요.`.trim(),
    cancellation_policy: "MVP 단계: 세부 환불 규정은 메시지로 안내드릴게요.",
  };

  return { ok: true, draft };
}

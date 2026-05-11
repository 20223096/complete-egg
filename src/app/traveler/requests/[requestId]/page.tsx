import Link from "next/link";
import { notFound } from "next/navigation";
import { PageBrandBar } from "@/components/PageBrandBar";
import { Button } from "@/components/Button";
import { REQUEST_STATUS_LABELS } from "@/lib/constants/labels";
import { cancelTravelerRequest } from "@/lib/actions/traveler-requests";
import { createClient } from "@/lib/supabase/server";
import { TravelerQuoteActions } from "./TravelerQuoteActions";

export const dynamic = "force-dynamic";

export default async function TravelerRequestDetailPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: req, error } = await supabase.from("traveler_requests").select("*").eq("id", requestId).single();
  if (error || !req || req.traveler_id !== user.id) notFound();

  const { data: profile } = await supabase.from("profiles").select("name").eq("id", user.id).single();

  const { data: quotes } = await supabase
    .from("quotes")
    .select("*")
    .eq("request_id", requestId)
    .eq("status", "sent")
    .order("created_at", { ascending: false });

  const accIds = [...new Set((quotes ?? []).map((q) => q.accommodation_id).filter((id): id is string => Boolean(id)))];
  const accById: Record<string, { images?: string[] | null; check_in_time?: string | null; check_out_time?: string | null }> = {};
  if (accIds.length) {
    const { data: accs } = await supabase
      .from("accommodations")
      .select("id,images,check_in_time,check_out_time")
      .in("id", accIds);
    (accs ?? []).forEach((a) => {
      accById[a.id as string] = {
        images: a.images as string[] | null,
        check_in_time: a.check_in_time as string | null,
        check_out_time: a.check_out_time as string | null,
      };
    });
  }

  const regionLabel = [req.region, req.detail_region].filter(Boolean).join(" ");

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <PageBrandBar href="/traveler" rightLabel={profile?.name ? `${profile.name}님` : null} />
      <Link href="/traveler" className="text-xs font-semibold text-[var(--color-brown)] underline">
        ← 대시보드
      </Link>
      <h1 className="mt-3 text-xl font-extrabold">견적서 읽어보기</h1>
      <p className="mt-1 text-sm text-slate-500">
        {req.check_in_date} ~ {req.check_out_date} · {req.people_count}명 · {REQUEST_STATUS_LABELS[req.status] ?? req.status}
      </p>

      <div className="mt-5 rounded-[var(--radius-ui)] border-2 border-[var(--color-border)] bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold text-slate-500">요청 요약</p>
        <p className="mt-1 font-bold text-[var(--color-text-dark)]">{regionLabel}</p>
        <p className="mt-1 text-sm text-slate-600">
          예산 {req.budget_min?.toLocaleString()} ~ {req.budget_max?.toLocaleString()}원
        </p>
        {req.message ? <p className="mt-2 text-sm text-slate-600">{req.message}</p> : null}
      </div>

      {req.status === "open" || req.status === "quoted" ? (
        <form action={cancelTravelerRequest.bind(null, requestId)} className="mt-3">
          <Button type="submit" variant="ghost" className="text-xs">
            요청 취소
          </Button>
        </form>
      ) : null}

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-extrabold">받은 견적</h2>
        {!quotes?.length ? (
          <p className="rounded-[var(--radius-ui)] border-2 border-dashed border-[var(--color-border)] bg-white/80 px-4 py-10 text-center text-sm text-slate-600">
            아직 전송된 견적이 없어요. 사장님들의 제안을 기다려 주세요.
          </p>
        ) : (
          <TravelerQuoteActions quotes={quotes} accById={accById} regionLabel={regionLabel} />
        )}
      </section>
    </div>
  );
}

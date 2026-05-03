import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
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

  const { data: quotes } = await supabase
    .from("quotes")
    .select("*")
    .eq("request_id", requestId)
    .eq("status", "sent")
    .order("created_at", { ascending: false });

  const accIds = [...new Set((quotes ?? []).map((q) => q.accommodation_id).filter((id): id is string => Boolean(id)))];
  const imageByAcc: Record<string, string | undefined> = {};
  if (accIds.length) {
    const { data: accs } = await supabase.from("accommodations").select("id,images").in("id", accIds);
    (accs ?? []).forEach((a) => {
      const imgs = a.images as string[] | null;
      imageByAcc[a.id as string] = imgs?.[0];
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/traveler" className="text-sm text-[var(--color-brown)] underline">
            ← 대시보드
          </Link>
          <h1 className="mt-2 text-2xl font-extrabold">
            {req.region} {req.detail_region}
          </h1>
          <p className="text-sm text-slate-600">
            {req.check_in_date} ~ {req.check_out_date} · {req.people_count}명
          </p>
          <div className="mt-2">
            <Badge>{REQUEST_STATUS_LABELS[req.status] ?? req.status}</Badge>
          </div>
        </div>
        {req.status === "open" || req.status === "quoted" ? (
          <form action={cancelTravelerRequest.bind(null, requestId)}>
            <Button type="submit" variant="outline">
              요청 취소
            </Button>
          </form>
        ) : null}
      </div>

      <Card>
        <h2 className="text-lg font-bold text-[var(--color-brown)]">요청 상세</h2>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">예산</dt>
            <dd>
              {req.budget_min?.toLocaleString()} ~ {req.budget_max?.toLocaleString()}원
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">메시지</dt>
            <dd>{req.message || "—"}</dd>
          </div>
        </dl>
      </Card>

      <section>
        <h2 className="mb-3 text-lg font-bold">도착한 견적서 비교</h2>
        {!quotes?.length ? (
          <p className="rounded-3xl border border-dashed border-[var(--color-border)] bg-white/70 px-4 py-10 text-center text-sm text-slate-600">
            아직 전송된 견적이 없어요. 사장님들의 제안을 기다려 주세요.
          </p>
        ) : (
          <TravelerQuoteActions quotes={quotes} imageByAcc={imageByAcc} />
        )}
      </section>
    </div>
  );
}

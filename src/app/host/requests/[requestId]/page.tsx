import Link from "next/link";
import { notFound } from "next/navigation";
import { PageBrandBar } from "@/components/PageBrandBar";
import { Badge } from "@/components/Badge";
import { REQUEST_STATUS_LABELS } from "@/lib/constants/labels";
import { createClient } from "@/lib/supabase/server";
import { HostAutoQuotePanel } from "./HostAutoQuotePanel";

export const dynamic = "force-dynamic";

export default async function HostRequestDetailPage({ params }: { params: Promise<{ requestId: string }> }) {
  const { requestId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: req, error } = await supabase.from("traveler_requests").select("*").eq("id", requestId).single();
  if (error || !req) notFound();

  const [{ data: accs }, { data: firstAcc }, { data: profile }] = await Promise.all([
    supabase.from("accommodations").select("id,name").eq("host_id", user.id).eq("status", "active"),
    supabase.from("accommodations").select("name").eq("host_id", user.id).eq("status", "active").limit(1).maybeSingle(),
    supabase.from("profiles").select("name").eq("id", user.id).single(),
  ]);

  const hostLabel = firstAcc?.name ?? profile?.name ?? "사장님";

  return (
    <div className="mx-auto max-w-md space-y-5 px-4 py-6">
      <PageBrandBar href="/host" rightLabel={hostLabel} />
      <Link href="/host/requests" className="text-xs font-semibold text-[var(--color-brown)] underline">
        ← 요청 목록
      </Link>
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-xl font-extrabold">
          {req.region} · {req.traveler_name}
        </h1>
        <Badge>{REQUEST_STATUS_LABELS[req.status] ?? req.status}</Badge>
      </div>

      <div className="rounded-[var(--radius-ui)] border-[3px] border-[var(--color-primary)] bg-white p-4 shadow-sm">
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-2 border-b border-slate-100 pb-2">
            <dt className="text-slate-500">일정</dt>
            <dd className="font-semibold text-[var(--color-text-dark)]">
              {req.check_in_date} ~ {req.check_out_date}
            </dd>
          </div>
          <div className="flex justify-between gap-2 border-b border-slate-100 pb-2">
            <dt className="text-slate-500">인원 / 예산</dt>
            <dd className="text-right font-semibold">
              {req.people_count}명 · {req.budget_min?.toLocaleString()}~{req.budget_max?.toLocaleString()}원
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">요청 메시지</dt>
            <dd className="mt-1 text-[var(--color-text-dark)]">{req.message || "—"}</dd>
          </div>
        </dl>
      </div>

      <HostAutoQuotePanel requestId={requestId} accommodations={accs ?? []} />
      <Link href={`/host/quotes/new?requestId=${requestId}`} className="block">
        <span className="flex w-full items-center justify-center rounded-2xl bg-[var(--color-primary)] py-3.5 text-base font-extrabold text-[var(--color-text-dark)] shadow-md hover:brightness-95">
          견적서 작성하기
        </span>
      </Link>
    </div>
  );
}

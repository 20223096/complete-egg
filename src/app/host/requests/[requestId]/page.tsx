import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
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

  const { data: accs } = await supabase.from("accommodations").select("id,name").eq("host_id", user.id).eq("status", "active");

  return (
    <div className="space-y-6">
      <Link href="/host/requests" className="text-sm text-[var(--color-brown)] underline">
        ← 목록
      </Link>
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-extrabold">
          {req.region} · {req.traveler_name}
        </h1>
        <Badge>{REQUEST_STATUS_LABELS[req.status] ?? req.status}</Badge>
      </div>
      <Card>
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">일정</dt>
            <dd>
              {req.check_in_date} ~ {req.check_out_date}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">인원/예산</dt>
            <dd>
              {req.people_count}명 / {req.budget_min?.toLocaleString()}~{req.budget_max?.toLocaleString()}원
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-slate-500">요청 메시지</dt>
            <dd>{req.message}</dd>
          </div>
        </dl>
      </Card>
      <HostAutoQuotePanel requestId={requestId} accommodations={accs ?? []} />
      <Link href={`/host/quotes/new?requestId=${requestId}`}>
        <Button type="button">견적서 작성하기</Button>
      </Link>
    </div>
  );
}

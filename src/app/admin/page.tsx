import Link from "next/link";
import { DashboardStatCard } from "@/components/DashboardStatCard";
import { Card } from "@/components/Card";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { count: reqCount },
    { count: quoteCount },
    { count: accCount },
    { count: resCount },
    { count: userCount },
    { count: acceptedQuotes },
    { count: hostCount },
    { count: travelerCount },
  ] = await Promise.all([
    supabase.from("traveler_requests").select("id", { count: "exact", head: true }),
    supabase.from("quotes").select("id", { count: "exact", head: true }),
    supabase.from("accommodations").select("id", { count: "exact", head: true }),
    supabase.from("reservations").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("quotes").select("id", { count: "exact", head: true }).eq("status", "accepted"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "host"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "traveler"),
  ]);

  const { data: openReq } = await supabase.from("traveler_requests").select("id").eq("status", "open");
  const openIds = (openReq ?? []).map((r) => r.id as string);
  let unanswered = 0;
  if (openIds.length) {
    const { data: allQ } = await supabase.from("quotes").select("request_id");
    const withQuotes = new Set((allQ ?? []).map((q) => q.request_id as string));
    unanswered = openIds.filter((id) => !withQuotes.has(id)).length;
  }

  const avgQuotesPerRequest =
    reqCount && quoteCount ? (Number(quoteCount) / Number(reqCount)).toFixed(2) : "0";
  const acceptRate =
    quoteCount && acceptedQuotes
      ? `${((Number(acceptedQuotes) / Number(quoteCount)) * 100).toFixed(1)}%`
      : "0%";

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-extrabold">관리자 · 테스트 현황</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardStatCard title="전체 요청서" value={reqCount ?? 0} />
        <DashboardStatCard title="전체 견적서" value={quoteCount ?? 0} hint={`요청당 평균 ${avgQuotesPerRequest}건`} />
        <DashboardStatCard title="수락된 견적" value={acceptedQuotes ?? 0} hint={`수락률 ${acceptRate}`} />
        <DashboardStatCard title="견적 미응답 요청" value={unanswered} hint="열린 요청 중 견적 0건" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <DashboardStatCard title="숙소" value={accCount ?? 0} />
        <DashboardStatCard title="예약" value={resCount ?? 0} />
        <DashboardStatCard title="사용자" value={userCount ?? 0} hint={`사장님 ${hostCount ?? 0} · 여행객 ${travelerCount ?? 0}`} />
      </div>
      <Card>
        <h2 className="font-bold text-[var(--color-brown)]">데이터 뷰어</h2>
        <ul className="mt-3 flex flex-wrap gap-3 text-sm font-medium">
          <li>
            <Link className="underline" href="/admin/requests">
              요청서
            </Link>
          </li>
          <li>
            <Link className="underline" href="/admin/quotes">
              견적서
            </Link>
          </li>
          <li>
            <Link className="underline" href="/admin/accommodations">
              숙소
            </Link>
          </li>
          <li>
            <Link className="underline" href="/admin/reservations">
              예약
            </Link>
          </li>
          <li>
            <Link className="underline" href="/admin/users">
              사용자
            </Link>
          </li>
        </ul>
      </Card>
    </div>
  );
}

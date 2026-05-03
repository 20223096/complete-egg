import Link from "next/link";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { DashboardStatCard } from "@/components/DashboardStatCard";
import { EmptyState } from "@/components/EmptyState";
import { RequestCard } from "@/components/RequestCard";
import { createClient } from "@/lib/supabase/server";
import type { TravelerRequest } from "@/lib/types/database";

export const dynamic = "force-dynamic";

export default async function TravelerDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: requests, error } = await supabase
    .from("traveler_requests")
    .select("*")
    .eq("traveler_id", user.id)
    .order("created_at", { ascending: false });

  const list = (requests ?? []) as TravelerRequest[];
  const requestIds = list.map((r) => r.id);
  let quoteCounts: Record<string, number> = {};
  if (requestIds.length) {
    const { data: qc } = await supabase
      .from("quotes")
      .select("request_id")
      .in("request_id", requestIds)
      .eq("status", "sent");
    quoteCounts = (qc ?? []).reduce<Record<string, number>>((acc, row) => {
      const id = row.request_id as string;
      acc[id] = (acc[id] ?? 0) + 1;
      return acc;
    }, {});
  }

  const newQuoteAlerts = list
    .filter((r) => (quoteCounts[r.id] ?? 0) > 0 && ["open", "quoted"].includes(r.status))
    .map((r) => ({
      id: r.id,
      label: `${r.region} 요청서에 견적서 ${quoteCounts[r.id]}개가 도착했어요.`,
    }));

  const badgeTotal = newQuoteAlerts.length;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--color-text-dark)]">여행객 대시보드</h1>
          <p className="mt-1 text-sm text-slate-600">요청서와 도착한 견적을 한곳에서 관리해요.</p>
        </div>
        <Link href="/traveler/requests/new">
          <Button type="button">새 요청서 작성</Button>
        </Link>
      </div>

      {newQuoteAlerts.length ? (
        <Card className="border-amber-200 bg-amber-50/80">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="warning">견적 도착</Badge>
            {badgeTotal > 0 ? (
              <span className="rounded-full bg-[var(--color-primary)] px-2 py-0.5 text-xs font-bold text-[var(--color-text-dark)]">
                {badgeTotal}
              </span>
            ) : null}
          </div>
          <p className="mt-2 font-semibold text-[var(--color-text-dark)]">견적서가 도착했습니다</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-800">
            {newQuoteAlerts.map((a) => (
              <li key={a.id}>
                <Link href={`/traveler/requests/${a.id}`} className="underline decoration-[var(--color-brown)]">
                  {a.label}
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <DashboardStatCard title="내 요청서" value={list.length} />
        <DashboardStatCard
          title="도착한 견적(전송)"
          value={Object.values(quoteCounts).reduce((a, b) => a + b, 0)}
        />
        <DashboardStatCard title="진행 중 요청" value={list.filter((r) => r.status !== "canceled" && r.status !== "closed").length} />
      </div>

      <section>
        <h2 className="mb-3 text-lg font-bold text-[var(--color-brown)]">내 요청서</h2>
        {error ? <p className="text-sm text-red-600">불러오기 실패</p> : null}
        {!list.length ? (
          <EmptyState
            title="아직 요청서가 없어요"
            description="첫 여행 조건을 남기면 사장님들의 견적을 받을 수 있어요."
            action={
              <Link href="/traveler/requests/new">
                <Button type="button">요청서 작성하기</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {list.map((r) => (
              <RequestCard key={r.id} request={r} quoteCount={quoteCounts[r.id]} href={`/traveler/requests/${r.id}`} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

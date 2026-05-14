import Link from "next/link";
import { AccommodationCard } from "@/components/AccommodationCard";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { DashboardStatCard } from "@/components/DashboardStatCard";
import { EmptyState } from "@/components/EmptyState";
import { createClient } from "@/lib/supabase/server";
import type { Accommodation } from "@/lib/types/database";

export const dynamic = "force-dynamic";

export default async function HostDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: accs } = await supabase.from("accommodations").select("*").eq("host_id", user.id).order("created_at", { ascending: false });
  const { count: openReq } = await supabase
    .from("traveler_requests")
    .select("id", { count: "exact", head: true })
    .eq("status", "open");
  const { count: myQuotes } = await supabase.from("quotes").select("id", { count: "exact", head: true }).eq("host_id", user.id);
  const { count: accepted } = await supabase.from("quotes").select("id", { count: "exact", head: true }).eq("host_id", user.id).eq("status", "accepted");

  const list = accs ?? [];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">사장님 대시보드</h1>
          <p className="mt-1 text-sm text-slate-600">내 숙소와 들어온 요청, 보낸 견적을 관리해요.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/host/accommodations/new">
            <Button type="button">숙소 등록</Button>
          </Link>
          <Link href="/host/requests">
            <Button type="button" variant="secondary">
              요청 탐색
            </Button>
          </Link>
          <Link href="/host/requests?flash=1">
            <Button type="button" variant="outline">
              오늘 밤 빈 방만
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <DashboardStatCard title="열린 요청서" value={openReq ?? 0} />
        <DashboardStatCard title="내 견적" value={myQuotes ?? 0} />
        <DashboardStatCard title="수락된 견적" value={accepted ?? 0} />
      </div>

      <section>
        <h2 className="mb-3 text-lg font-bold text-[var(--color-brown)]">내 숙소</h2>
        {!list.length ? (
          <EmptyState
            title="등록된 숙소가 없어요"
            description="숙소를 등록하면 요청서에 맞춰 견적을 보낼 수 있어요."
            action={
              <Link href="/host/accommodations/new">
                <Button type="button">숙소 등록하기</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((a) => (
              <AccommodationCard key={a.id} acc={a as Accommodation} href={`/host/accommodations/${a.id}/edit`} />
            ))}
          </div>
        )}
      </section>

      <Card>
        <h3 className="font-bold">빠른 링크</h3>
        <ul className="mt-2 flex flex-wrap gap-3 text-sm">
          <li>
            <Link className="underline" href="/host/quotes">
              내 견적 목록
            </Link>
          </li>
          <li>
            <Link className="underline" href="/host/messages">
              고객 메시지
            </Link>
          </li>
          <li>
            <Link className="underline" href="/host/mypage">
              Pro · 자동견적 설정
            </Link>
          </li>
        </ul>
      </Card>
    </div>
  );
}

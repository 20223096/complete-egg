import Link from "next/link";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function TravelerReservationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: rows } = await supabase
    .from("reservations")
    .select("*")
    .eq("traveler_id", user.id)
    .order("created_at", { ascending: false });

  const list = rows ?? [];
  const quoteIds = list.map((r) => r.quote_id as string).filter(Boolean);
  const quoteMap: Record<string, { title?: string; accommodation_name?: string }> = {};
  if (quoteIds.length) {
    const { data: quotes } = await supabase.from("quotes").select("id,title,accommodation_name").in("id", quoteIds);
    (quotes ?? []).forEach((q) => {
      quoteMap[q.id as string] = q as { title?: string; accommodation_name?: string };
    });
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">수락한 예약</h1>
      {!list.length ? (
        <EmptyState title="예약이 없어요" description="견적을 수락하면 결제 준비 단계로 이동합니다." />
      ) : (
        <div className="grid gap-4">
          {list.map((r) => {
            const q = quoteMap[r.quote_id as string];
            return (
              <Card key={r.id}>
                <p className="text-sm text-[var(--color-brown)]">{q?.accommodation_name}</p>
                <p className="text-lg font-bold">{q?.title}</p>
                <p className="mt-2 text-sm text-slate-600">
                  {Number(r.price).toLocaleString()}원 · {r.status} · 결제 {r.payment_status}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/traveler/reservations/${r.id}/payment`}
                    className="rounded-2xl bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-text-dark)]"
                  >
                    결제·예약 상태 보기
                  </Link>
                  <Link
                    href="/traveler/messages"
                    className="rounded-2xl border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-semibold"
                  >
                    메시지
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

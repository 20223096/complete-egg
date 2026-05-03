import Link from "next/link";
import { Card } from "@/components/Card";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function TravelerMypage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const { data: requests } = await supabase
    .from("traveler_requests")
    .select("id,region,status,created_at")
    .eq("traveler_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);
  const { data: reservations } = await supabase
    .from("reservations")
    .select("id,price,status,quotes(accommodation_name)")
    .eq("traveler_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-extrabold">마이페이지</h1>
      <Card>
        <h2 className="font-bold text-[var(--color-brown)]">내 정보</h2>
        <p className="mt-2 text-sm">이름: {profile?.name}</p>
        <p className="text-sm">이메일: {profile?.email ?? user.email}</p>
      </Card>
      <section>
        <h2 className="mb-2 font-bold">최근 요청서</h2>
        <ul className="space-y-2">
          {(requests ?? []).map((r) => (
            <li key={r.id}>
              <Link href={`/traveler/requests/${r.id}`} className="text-sm underline">
                {r.region} · {r.status}
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="mb-2 font-bold">수락한 예약</h2>
        <ul className="space-y-2">
          {(reservations ?? []).map((r) => {
            const q = r.quotes as { accommodation_name?: string } | null;
            return (
              <li key={r.id}>
                <Link href={`/traveler/reservations/${r.id}/payment`} className="text-sm underline">
                  {q?.accommodation_name} · {Number(r.price).toLocaleString()}원
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

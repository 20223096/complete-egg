import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/Card";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function PaymentPendingPage({
  params,
}: {
  params: Promise<{ reservationId: string }>;
}) {
  const { reservationId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: res, error } = await supabase.from("reservations").select("*").eq("id", reservationId).single();
  if (error || !res || res.traveler_id !== user.id) notFound();

  const { data: quote } = await supabase.from("quotes").select("title,accommodation_name").eq("id", res.quote_id).single();
  const q = quote as { title?: string; accommodation_name?: string } | null;

  return (
    <div className="mx-auto max-w-lg space-y-6 py-4">
      <Card className="border-amber-200 bg-amber-50/90">
        <h1 className="text-xl font-extrabold text-[var(--color-text-dark)]">결제 준비중</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-800">
          현재 MVP 테스트 단계입니다. 예약 확정을 위해 운영자가 연락드릴 예정입니다. 실제 결제는 추후 연동됩니다.
        </p>
        <p className="mt-4 text-sm font-semibold text-[var(--color-brown)]">
          {q?.accommodation_name} · {Number(res.price).toLocaleString()}원
        </p>
      </Card>
      <div className="flex flex-wrap gap-3">
        <Link href="/traveler/reservations" className="text-sm font-semibold text-[var(--color-brown)] underline">
          예약 목록
        </Link>
        <Link href="/traveler/messages" className="text-sm font-semibold text-[var(--color-brown)] underline">
          사장님과 대화하기
        </Link>
      </div>
    </div>
  );
}

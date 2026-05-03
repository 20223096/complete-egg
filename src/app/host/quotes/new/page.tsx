import Link from "next/link";
import { notFound } from "next/navigation";
import { HostQuoteForm } from "./HostQuoteForm";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HostQuoteNewPage({
  searchParams,
}: {
  searchParams: Promise<{ requestId?: string; accommodationId?: string }>;
}) {
  const { requestId, accommodationId } = await searchParams;
  if (!requestId) {
    return (
      <p className="text-sm text-slate-600">
        요청서가 필요합니다.{" "}
        <Link href="/host/requests" className="underline">
          요청 목록
        </Link>
        에서 선택해 주세요.
      </p>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: accs } = await supabase.from("accommodations").select("id,name").eq("host_id", user.id).eq("status", "active");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">견적서 작성</h1>
      <HostQuoteForm requestId={requestId} accommodations={accs ?? []} initialAccommodationId={accommodationId} />
    </div>
  );
}

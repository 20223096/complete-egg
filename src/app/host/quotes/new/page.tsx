import Link from "next/link";
import { notFound } from "next/navigation";
import { PageBrandBar } from "@/components/PageBrandBar";
import { createClient } from "@/lib/supabase/server";
import { HostQuoteForm } from "./HostQuoteForm";

export const dynamic = "force-dynamic";

export default async function HostQuoteNewPage({
  searchParams,
}: {
  searchParams: Promise<{ requestId?: string; accommodationId?: string }>;
}) {
  const { requestId, accommodationId } = await searchParams;
  if (!requestId) {
    return (
      <div className="mx-auto max-w-md px-4 py-6">
        <PageBrandBar href="/host" />
        <p className="text-sm text-slate-600">
          요청서가 필요합니다.{" "}
          <Link href="/host/requests" className="font-semibold text-[var(--color-brown)] underline">
            요청 목록
          </Link>
          에서 선택해 주세요.
        </p>
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: req, error: reqErr } = await supabase.from("traveler_requests").select("*").eq("id", requestId).single();
  if (reqErr || !req) notFound();

  const [{ data: accs }, { data: existingQuotes }, { data: profile }, { data: firstAcc }] = await Promise.all([
    supabase.from("accommodations").select("id,name,options").eq("host_id", user.id).eq("status", "active"),
    supabase.from("quotes").select("accommodation_id").eq("request_id", requestId).eq("host_id", user.id).eq("status", "sent"),
    supabase.from("profiles").select("name").eq("id", user.id).single(),
    supabase.from("accommodations").select("name").eq("host_id", user.id).eq("status", "active").limit(1).maybeSingle(),
  ]);

  const alreadyQuotedAccIds = [...new Set((existingQuotes ?? []).map((q) => q.accommodation_id).filter(Boolean))] as string[];

  const hostLabel = firstAcc?.name ?? profile?.name ?? "사장님";

  return (
    <div className="mx-auto max-w-md px-4 pb-28 pt-4">
      <PageBrandBar href="/host" rightLabel={hostLabel} />
      <h1 className="mb-4 text-xl font-extrabold text-[var(--color-text-dark)]">견적 발송하기</h1>
      <HostQuoteForm
        requestId={requestId}
        request={{
          budget_min: req.budget_min,
          budget_max: req.budget_max,
          people_count: req.people_count,
          required_options: (req.required_options as string[]) ?? [],
          region: req.region,
          detail_region: req.detail_region,
        }}
        accommodations={(accs ?? []).map((a) => ({
          id: a.id as string,
          name: a.name as string,
          options: (a.options as string[]) ?? [],
        }))}
        alreadyQuotedAccIds={alreadyQuotedAccIds}
        initialAccommodationId={accommodationId}
      />
    </div>
  );
}

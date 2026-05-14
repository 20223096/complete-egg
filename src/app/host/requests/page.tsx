import { Suspense } from "react";
import { HostRequestMarketCard } from "@/components/HostRequestMarketCard";
import { createClient } from "@/lib/supabase/server";
import type { TravelerRequest } from "@/lib/types/database";
import { HostRequestFilters } from "./HostRequestFilters";

export const dynamic = "force-dynamic";

export default async function HostRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string; people?: string; budgetMin?: string; flash?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let openQuery = supabase.from("traveler_requests").select("*").eq("status", "open").order("created_at", { ascending: false });

  if (sp.region) {
    openQuery = openQuery.ilike("region", `%${sp.region}%`);
  }
  if (sp.people) {
    const n = Number(sp.people);
    if (!Number.isNaN(n) && n > 0) openQuery = openQuery.gte("people_count", n);
  }
  if (sp.flash === "1") {
    openQuery = openQuery.eq("is_tonight_flash", true);
  }
  if (sp.budgetMin) {
    const n = Number(sp.budgetMin);
    if (!Number.isNaN(n)) openQuery = openQuery.gte("budget_max", n);
  }

  const { data: openRaw, error: openErr } = await openQuery;

  let considering: TravelerRequest[] = [];
  const myPriceByRequest = new Map<string, number>();

  if (user?.id) {
    const { data: myQuotes } = await supabase
      .from("quotes")
      .select("request_id, price")
      .eq("host_id", user.id)
      .eq("status", "sent");

    (myQuotes ?? []).forEach((row) => {
      const rid = row.request_id as string;
      myPriceByRequest.set(rid, row.price as number);
    });

    const ids = [...new Set((myQuotes ?? []).map((q) => q.request_id as string))];
    if (ids.length) {
      const { data: quoted } = await supabase
        .from("traveler_requests")
        .select("*")
        .in("id", ids)
        .eq("status", "quoted")
        .order("updated_at", { ascending: false });
      considering = (quoted ?? []) as TravelerRequest[];
    }
  }

  const freshList = (openRaw ?? []) as TravelerRequest[];

  return (
    <div className="mx-auto max-w-md space-y-8 px-4 py-6">
      <h1 className="text-xl font-extrabold text-[var(--color-text-dark)]">요청서</h1>
      <Suspense fallback={<div className="h-12 animate-pulse rounded-2xl bg-slate-100" />}>
        <HostRequestFilters />
      </Suspense>
      {openErr ? <p className="text-sm text-red-600">불러오기 실패</p> : null}

      <section>
        <h2 className="mb-3 text-lg font-extrabold">따끈따끈한 요청서</h2>
        <div className="space-y-4">
          {freshList.map((r) => (
            <HostRequestMarketCard key={r.id} request={r} variant="fresh" />
          ))}
        </div>
        {!freshList.length ? <p className="text-center text-sm text-slate-500">조건에 맞는 새 요청이 없어요.</p> : null}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-extrabold">고객이 고민 중이에요</h2>
        <div className="space-y-4">
          {considering.map((r) => (
            <HostRequestMarketCard key={r.id} request={r} variant="waiting" myQuotePrice={myPriceByRequest.get(r.id) ?? null} />
          ))}
        </div>
        {!considering.length ? (
          <p className="text-center text-sm text-slate-500">보낸 견적이 있고 고객이 검토 중인 요청이 없어요.</p>
        ) : null}
      </section>
    </div>
  );
}

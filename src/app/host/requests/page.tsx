import { Suspense } from "react";
import { RequestCard } from "@/components/RequestCard";
import { createClient } from "@/lib/supabase/server";
import type { TravelerRequest } from "@/lib/types/database";
import { HostRequestFilters } from "./HostRequestFilters";

export const dynamic = "force-dynamic";

export default async function HostRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string; people?: string; budgetMin?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("traveler_requests").select("*").eq("status", "open").order("created_at", { ascending: false });

  if (sp.region) {
    query = query.ilike("region", `%${sp.region}%`);
  }
  if (sp.people) {
    const n = Number(sp.people);
    if (!Number.isNaN(n) && n > 0) query = query.gte("people_count", n);
  }
  if (sp.budgetMin) {
    const n = Number(sp.budgetMin);
    if (!Number.isNaN(n)) query = query.gte("budget_max", n);
  }

  const { data: requests, error } = await query;
  const list = (requests ?? []) as TravelerRequest[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">여행객 요청서</h1>
      <Suspense fallback={<div className="h-12 animate-pulse rounded-3xl bg-white/60" />}>
        <HostRequestFilters />
      </Suspense>
      {error ? <p className="text-sm text-red-600">불러오기 실패</p> : null}
      <div className="grid gap-4 md:grid-cols-2">
        {list.map((r) => (
          <RequestCard key={r.id} request={r} href={`/host/requests/${r.id}`} />
        ))}
      </div>
      {!list.length ? <p className="text-center text-sm text-slate-600">조건에 맞는 요청이 없어요.</p> : null}
    </div>
  );
}

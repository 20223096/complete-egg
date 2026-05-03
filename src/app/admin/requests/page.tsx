import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminRequestsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("traveler_requests").select("*").order("created_at", { ascending: false }).limit(100);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold">전체 요청서</h1>
      {error ? <p className="text-sm text-red-600">{error.message}</p> : null}
      <pre className="max-h-[70vh] overflow-auto rounded-2xl bg-white p-4 text-xs ring-1 ring-[var(--color-border)]">
        {JSON.stringify(data ?? [], null, 2)}
      </pre>
    </div>
  );
}

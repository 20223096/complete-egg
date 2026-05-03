import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminAccommodationsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("accommodations").select("*").limit(100);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold">전체 숙소</h1>
      {error ? <p className="text-sm text-red-600">{error.message}</p> : null}
      <pre className="max-h-[70vh] overflow-auto rounded-2xl bg-white p-4 text-xs ring-1 ring-[var(--color-border)]">
        {JSON.stringify(data ?? [], null, 2)}
      </pre>
    </div>
  );
}

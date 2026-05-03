import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("profiles").select("*").limit(200);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold">전체 사용자</h1>
      {error ? <p className="text-sm text-red-600">{error.message}</p> : null}
      <pre className="max-h-[70vh] overflow-auto rounded-2xl bg-white p-4 text-xs ring-1 ring-[var(--color-border)]">
        {JSON.stringify(data ?? [], null, 2)}
      </pre>
    </div>
  );
}

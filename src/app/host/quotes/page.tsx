import Link from "next/link";
import { Badge } from "@/components/Badge";
import { Card } from "@/components/Card";
import { QUOTE_STATUS_LABELS } from "@/lib/constants/labels";
import { createClient } from "@/lib/supabase/server";
import type { Quote } from "@/lib/types/database";

export const dynamic = "force-dynamic";

export default async function HostQuotesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: quotes } = await supabase
    .from("quotes")
    .select("*")
    .eq("host_id", user.id)
    .order("created_at", { ascending: false });

  const list = (quotes ?? []) as Quote[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">내가 보낸 견적</h1>
      <div className="space-y-3">
        {list.map((q) => (
          <Card key={q.id} className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-[var(--color-brown)]">{q.accommodation_name}</p>
              <p className="font-bold">{q.title}</p>
              <p className="text-sm text-slate-600">
                {Number(q.price).toLocaleString()}원 · {QUOTE_STATUS_LABELS[q.status] ?? q.status}
              </p>
              <Link href={`/host/requests/${q.request_id}`} className="text-xs underline">
                요청서 보기
              </Link>
            </div>
            <Badge tone={q.status === "accepted" ? "success" : "muted"}>{q.status}</Badge>
          </Card>
        ))}
      </div>
      {!list.length ? <p className="text-sm text-slate-600">아직 보낸 견적이 없어요.</p> : null}
    </div>
  );
}

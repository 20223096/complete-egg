import Link from "next/link";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HostMessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: convs } = await supabase
    .from("conversations")
    .select("id,created_at,traveler_id")
    .eq("host_id", user.id)
    .order("created_at", { ascending: false });

  const list = convs ?? [];
  const travelerIds = [...new Set(list.map((c) => c.traveler_id as string))];
  const names: Record<string, string> = {};
  if (travelerIds.length) {
    const { data: profs } = await supabase.from("profiles").select("id,name").in("id", travelerIds);
    (profs ?? []).forEach((p) => {
      names[p.id as string] = (p.name as string) || "여행객";
    });
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">고객 메시지</h1>
      {!list.length ? (
        <EmptyState title="대화방이 없어요" description="견적이 수락되면 고객과 채팅할 수 있어요." />
      ) : (
        <ul className="space-y-3">
          {list.map((c) => (
            <li key={c.id}>
              <Link href={`/host/messages/${c.id}`}>
                <Card className="transition hover:shadow-md">
                  <p className="font-semibold">{names[c.traveler_id as string] ?? "여행객"}님과의 대화</p>
                  <p className="text-xs text-slate-500">{new Date(c.created_at as string).toLocaleString("ko-KR")}</p>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

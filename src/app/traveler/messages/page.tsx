import Link from "next/link";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function TravelerMessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: convs } = await supabase
    .from("conversations")
    .select("id,created_at,host_id")
    .eq("traveler_id", user.id)
    .order("created_at", { ascending: false });

  const list = convs ?? [];
  const hostIds = [...new Set(list.map((c) => c.host_id as string))];
  const names: Record<string, string> = {};
  if (hostIds.length) {
    const { data: profs } = await supabase.from("profiles").select("id,name").in("id", hostIds);
    (profs ?? []).forEach((p) => {
      names[p.id as string] = (p.name as string) || "사장님";
    });
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">메시지</h1>
      {!list.length ? (
        <EmptyState title="대화방이 없어요" description="견적을 수락하면 사장님과 채팅방이 열려요." />
      ) : (
        <ul className="space-y-3">
          {list.map((c) => (
            <li key={c.id}>
              <Link href={`/traveler/messages/${c.id}`}>
                <Card className="transition hover:shadow-md">
                  <p className="font-semibold">{names[c.host_id as string] ?? "사장님"}과의 대화</p>
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

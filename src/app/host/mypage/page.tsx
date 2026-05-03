import { Card } from "@/components/Card";
import { enableDemoProForHost, setDemoFreePlan } from "@/lib/actions/host-subscription";
import { createClient } from "@/lib/supabase/server";
import { HostMypageClient } from "./HostMypageClient";

export const dynamic = "force-dynamic";

export default async function HostMypage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const { data: sub } = await supabase.from("host_subscriptions").select("*").eq("host_id", user.id).maybeSingle();
  const { data: accs } = await supabase.from("accommodations").select("id,name").eq("host_id", user.id).eq("status", "active");
  const firstAcc = accs?.[0];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-extrabold">사장님 마이페이지</h1>
      <Card>
        <h2 className="font-bold text-[var(--color-brown)]">프로필</h2>
        <p className="mt-2 text-sm">{profile?.name}</p>
        <p className="text-sm">{profile?.email ?? user.email}</p>
      </Card>
      <Card>
        <h2 className="font-bold text-[var(--color-brown)]">구독 상태</h2>
        <p className="mt-2 text-sm">
          현재 플랜: <strong>{sub?.plan ?? "free"}</strong> ({sub?.status ?? "—"})
        </p>
        <p className="mt-2 text-xs text-slate-600">MVP: 아래 버튼으로 Pro 체험을 전환해 자동 견적 규칙·미리보기를 테스트하세요.</p>
        <form className="mt-3 flex flex-wrap gap-2" action={enableDemoProForHost}>
          <button type="submit" className="rounded-2xl bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold">
            Pro 체험 켜기
          </button>
        </form>
        <form className="mt-2" action={setDemoFreePlan}>
          <button type="submit" className="text-xs text-slate-600 underline">
            Free로 되돌리기
          </button>
        </form>
      </Card>
      {firstAcc ? (
        <HostMypageClient accommodationId={firstAcc.id as string} accommodationName={firstAcc.name as string} />
      ) : (
        <Card>
          <p className="text-sm text-slate-600">숙소를 등록하면 자동 견적 규칙을 설정할 수 있어요.</p>
        </Card>
      )}
    </div>
  );
}

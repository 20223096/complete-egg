"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { dashboardPathForRole } from "@/lib/auth/paths";
import { createClient } from "@/lib/supabase/client";

export default function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = useMemo(() => {
    const r = searchParams.get("role");
    return r === "host" ? "host" : "traveler";
  }, [searchParams]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"traveler" | "host">(initialRole);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const emailTrim = email.trim();
      const { data, error: signError } = await supabase.auth.signUp({
        email: emailTrim,
        password,
        options: {
          data: {
            name,
            phone,
            role,
          },
        },
      });
      if (signError) {
        setError(signError.message);
        return;
      }

      const uid = data.user?.id;
      if (uid && data.session) {
        const { error: pe } = await supabase.from("profiles").insert({
          id: uid,
          role,
          name: name.trim() || "사용자",
          phone: phone.trim() || null,
          email: emailTrim,
        });
        if (pe) {
          setError(pe.message);
          return;
        }
        if (role === "host") {
          await supabase.from("host_subscriptions").upsert(
            { host_id: uid, plan: "free", status: "active" },
            { onConflict: "host_id" }
          );
        }
        router.replace(dashboardPathForRole(role));
        router.refresh();
        return;
      }

      if (uid && !data.session) {
        setError(
          "이메일 인증이 필요한 설정이에요. 메일함(스팸함)에서 인증 링크를 누른 뒤 로그인해 주세요. 로컬 개발만 할 때는 Supabase → Authentication → Providers → Email에서 Confirm email을 끄면 인증 없이 바로 쓸 수 있어요."
        );
        return;
      }

      setError("가입 처리 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "가입에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--color-text-dark)]">회원가입</h1>
        <p className="mt-1 text-sm text-slate-600">역할·이름·연락처를 입력하면 profiles 테이블에 저장됩니다.</p>
      </div>
      <Card>
        <form className="space-y-4" onSubmit={onSubmit}>
          <Select label="가입 유형" value={role} onChange={(e) => setRole(e.target.value as "traveler" | "host")}>
            <option value="traveler">여행객으로 가입</option>
            <option value="host">숙소 사장님으로 가입</option>
          </Select>
          <Input label="이름" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="휴대폰 (선택)" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input label="이메일" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="비밀번호" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <p className="text-xs text-slate-500">
            프로젝트에서 이메일 인증을 켜 두었다면, 가입 후 메일의 링크를 눌러야 로그인됩니다. 인증 메일이 없으면 Supabase 대시보드 설정을 확인해 주세요.
          </p>
          <Button type="submit" className="w-full" loading={loading}>
            가입하기
          </Button>
        </form>
      </Card>
      <p className="text-center text-sm text-slate-600">
        이미 계정이 있나요?{" "}
        <Link href="/login" className="font-semibold text-[var(--color-brown)] underline">
          로그인
        </Link>
      </p>
    </div>
  );
}

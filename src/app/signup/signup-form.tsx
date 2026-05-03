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
      const { data, error: signError } = await supabase.auth.signUp({
        email,
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
          email: email.trim(),
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
      }

      router.replace(dashboardPathForRole(role));
      router.refresh();
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
            이메일 인증을 켜 둔 경우, 인증 후 로그인하면 프로필이 없을 때 메타데이터로 자동 생성됩니다.
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

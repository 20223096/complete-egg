"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { resendSignupConfirmation } from "@/lib/auth/resend-signup";
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
  const [info, setInfo] = useState<string | null>(null);
  const [pendingVerify, setPendingVerify] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  async function onResend() {
    const emailTrim = email.trim();
    if (!emailTrim) {
      setError("이메일을 입력한 뒤 다시 보내기를 눌러 주세요.");
      return;
    }
    setError(null);
    setResendLoading(true);
    try {
      const supabase = createClient();
      const { error: re } = await resendSignupConfirmation(supabase, emailTrim);
      if (re) setError(re.message);
      else setInfo("인증 메일을 다시 보냈어요. 스팸함도 확인해 주세요.");
    } finally {
      setResendLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setPendingVerify(false);
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
        setPendingVerify(true);
        setInfo(
          "가입은 되었어요. 이제 메일의 인증 링크만 누르면 로그인할 수 있어요. 메일이 안 오면 아래를 확인하거나 「인증 메일 다시 보내기」를 눌러 주세요."
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
          {info ? <p className="rounded-2xl bg-sky-50 px-3 py-2 text-sm text-sky-900">{info}</p> : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {pendingVerify ? (
            <Button type="button" variant="secondary" className="w-full" loading={resendLoading} onClick={onResend}>
              인증 메일 다시 보내기
            </Button>
          ) : null}
          <p className="text-xs text-slate-500">
            Supabase 기본 메일은 스팸함에 가거나 지연될 수 있어요. 개발 중에는 Authentication → Providers → Email에서
            <strong className="font-semibold"> Confirm email</strong>을 끄면 메일 없이 바로 로그인할 수 있어요.
          </p>
          {!pendingVerify ? (
            <Button type="submit" className="w-full" loading={loading}>
              가입하기
            </Button>
          ) : (
            <p className="text-center text-sm text-slate-600">
              인증 후{" "}
              <Link href="/login" className="font-semibold text-[var(--color-brown)] underline">
                로그인
              </Link>
              으로 이동해 주세요.
            </p>
          )}
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

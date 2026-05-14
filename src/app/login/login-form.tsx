"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { resendSignupConfirmation } from "@/lib/auth/resend-signup";
import { dashboardPathForRole } from "@/lib/auth/paths";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  async function onResendSignup() {
    const em = email.trim();
    if (!em) {
      setError("위에 가입한 이메일을 입력한 뒤 다시 보내기를 눌러 주세요.");
      return;
    }
    setError(null);
    setInfo(null);
    setResendLoading(true);
    try {
      const supabase = createClient();
      const { error: re } = await resendSignupConfirmation(supabase, em);
      if (re) setError(re.message);
      else setInfo("가입 확인 메일을 다시 보냈어요. 스팸·프로모션함도 확인해 주세요.");
    } finally {
      setResendLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signError) {
        const raw = signError.message ?? "";
        const friendly =
          raw === "Invalid login credentials"
            ? "이메일·비밀번호가 맞지 않거나, 아직 이메일 인증을 하지 않은 계정일 수 있어요. 가입 직후라면 메일함(스팸함)의 인증 링크를 먼저 눌러 주세요."
            : raw;
        setError(friendly);
        setLoading(false);
        return;
      }
      const { data: userData } = await supabase.auth.getUser();
      const authed = userData.user;
      if (!authed?.id) {
        setError("사용자 정보를 불러오지 못했습니다.");
        setLoading(false);
        return;
      }

      const { data: existingProf } = await supabase.from("profiles").select("id").eq("id", authed.id).maybeSingle();
      if (!existingProf) {
        const meta = (authed.user_metadata ?? {}) as Record<string, string>;
        const r = meta.role === "host" ? "host" : "traveler";
        const { error: pe } = await supabase.from("profiles").insert({
          id: authed.id,
          role: r,
          name: (meta.name as string)?.trim() || authed.email?.split("@")[0] || "사용자",
          phone: (meta.phone as string)?.trim() || null,
          email: authed.email ?? null,
        });
        if (pe) {
          setError(pe.message);
          setLoading(false);
          return;
        }
        if (r === "host") {
          await supabase.from("host_subscriptions").upsert(
            { host_id: authed.id, plan: "free", status: "active" },
            { onConflict: "host_id" }
          );
        }
      }

      const { data: profile } = await supabase.from("profiles").select("role").eq("id", authed.id).single();
      const role = profile?.role as "traveler" | "host" | "admin" | undefined;
      const fallback = role ? dashboardPathForRole(role) : "/traveler";
      router.replace(next && next.startsWith("/") ? next : fallback);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--color-text-dark)]">로그인</h1>
        <p className="mt-1 text-sm text-slate-600">완숙 계정으로 입장해 주세요.</p>
      </div>
      <Card>
        <form className="space-y-4" onSubmit={onSubmit}>
          <Input label="이메일" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input
            label="비밀번호"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {info ? <p className="rounded-2xl bg-sky-50 px-3 py-2 text-sm text-sky-900">{info}</p> : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" className="w-full" loading={loading}>
            로그인
          </Button>
          <div className="border-t border-slate-100 pt-3">
            <p className="text-xs text-slate-500">가입 직후인데 메일이 안 왔나요?</p>
            <Button
              type="button"
              variant="ghost"
              className="mt-1 w-full text-sm"
              loading={resendLoading}
              onClick={onResendSignup}
            >
              인증(가입 확인) 메일 다시 보내기
            </Button>
          </div>
        </form>
      </Card>
      <p className="text-center text-sm text-slate-600">
        계정이 없으신가요?{" "}
        <Link href="/signup" className="font-semibold text-[var(--color-brown)] underline">
          회원가입
        </Link>
      </p>
    </div>
  );
}

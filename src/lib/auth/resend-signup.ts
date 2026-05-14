import type { SupabaseClient } from "@supabase/supabase-js";

/** Supabase: 가입 확인 메일 재전송 (클라이언트에서만 호출) */
export async function resendSignupConfirmation(supabase: SupabaseClient, email: string) {
  const redirect =
    typeof window !== "undefined" ? `${window.location.origin}/login` : undefined;
  return supabase.auth.resend({
    type: "signup",
    email: email.trim(),
    options: redirect ? { emailRedirectTo: redirect } : undefined,
  });
}

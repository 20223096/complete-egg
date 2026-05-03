import { Suspense } from "react";
import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-sm text-slate-600">불러오는 중…</div>}>
      <LoginForm />
    </Suspense>
  );
}

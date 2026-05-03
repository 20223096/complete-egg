import { Suspense } from "react";
import SignupForm from "./signup-form";

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-sm text-slate-600">불러오는 중…</div>}>
      <SignupForm />
    </Suspense>
  );
}

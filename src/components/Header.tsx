import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";
import { RoleBasedNav } from "@/components/RoleBasedNav";
import type { Profile } from "@/lib/types/database";

export async function Header({ profile }: { profile: Profile | null }) {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-bg)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link
          href="/"
          className="text-xl font-extrabold lowercase tracking-tight text-[var(--color-logo)] sm:text-2xl"
          style={{ fontFamily: "var(--font-nunito), ui-rounded, system-ui" }}
        >
          wansook
        </Link>
        {profile ? (
          <div className="flex flex-1 flex-wrap items-center justify-end gap-3">
            <RoleBasedNav role={profile.role} />
            <span className="hidden text-sm text-slate-600 md:inline">{profile.name}님</span>
            <LogoutButton />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-2xl px-3 py-2 text-sm font-semibold text-[var(--color-brown)] hover:bg-white/70"
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className="rounded-2xl bg-[var(--color-primary)] px-3 py-2 text-sm font-semibold text-[var(--color-text-dark)] shadow-sm hover:bg-[var(--color-primary-dark)]"
            >
              회원가입
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

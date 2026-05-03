import Link from "next/link";
import type { UserRole } from "@/lib/types/database";

const travelerLinks = [
  { href: "/traveler", label: "홈" },
  { href: "/traveler/requests/new", label: "요청" },
  { href: "/traveler/reservations", label: "예약" },
  { href: "/traveler/messages", label: "메시지" },
  { href: "/traveler/mypage", label: "마이" },
];

const hostLinks = [
  { href: "/host", label: "홈" },
  { href: "/host/accommodations/new", label: "숙소" },
  { href: "/host/requests", label: "요청" },
  { href: "/host/quotes", label: "견적" },
  { href: "/host/messages", label: "메시지" },
  { href: "/host/mypage", label: "마이" },
];

const adminLinks = [
  { href: "/admin", label: "대시보드" },
  { href: "/admin/requests", label: "요청" },
  { href: "/admin/quotes", label: "견적" },
  { href: "/admin/users", label: "사용자" },
];

export function RoleBasedNav({ role }: { role: UserRole }) {
  const links =
    role === "traveler" ? travelerLinks : role === "host" ? hostLinks : role === "admin" ? adminLinks : [];
  return (
    <nav className="flex flex-wrap items-center gap-1 text-sm">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className="rounded-xl px-2 py-1 font-medium text-[var(--color-text-dark)] hover:bg-white/80"
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}

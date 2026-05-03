import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/Badge";
import { Card } from "@/components/Card";
import { ACCOMMODATION_TYPE_LABELS } from "@/lib/constants/labels";
import type { Accommodation } from "@/lib/types/database";

export function AccommodationCard({ acc, href }: { acc: Accommodation; href: string }) {
  const img = acc.images?.[0];
  return (
    <Link href={href} className="block h-full">
      <Card className="flex h-full flex-col overflow-hidden p-0 transition hover:-translate-y-0.5 hover:shadow-lg">
        <div className="relative aspect-[5/3] w-full bg-[var(--color-bg)]">
          {img ? (
            <Image src={img} alt="" fill className="object-cover" sizes="(max-width:768px) 100vw,360px" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">이미지 없음</div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="brown">{ACCOMMODATION_TYPE_LABELS[acc.accommodation_type as keyof typeof ACCOMMODATION_TYPE_LABELS] ?? acc.accommodation_type}</Badge>
            <Badge>{acc.status === "active" ? "운영중" : "비공개"}</Badge>
          </div>
          <h3 className="text-lg font-bold text-[var(--color-text-dark)]">{acc.name}</h3>
          <p className="text-sm text-slate-600">
            {acc.region} {acc.detail_region}
          </p>
          <p className="mt-auto text-sm font-semibold text-[var(--color-brown)]">
            기준가 {(acc.base_price ?? 0).toLocaleString()}원 · 최대 {acc.max_people ?? 0}명
          </p>
        </div>
      </Card>
    </Link>
  );
}

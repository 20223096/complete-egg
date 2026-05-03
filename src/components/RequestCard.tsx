import Link from "next/link";
import { Badge } from "@/components/Badge";
import { Card } from "@/components/Card";
import { REQUEST_STATUS_LABELS } from "@/lib/constants/labels";
import type { TravelerRequest } from "@/lib/types/database";

export function RequestCard({
  request,
  quoteCount,
  href,
}: {
  request: TravelerRequest;
  quoteCount?: number;
  href: string;
}) {
  return (
    <Link href={href} className="block">
      <Card className="transition hover:-translate-y-0.5 hover:shadow-lg">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-lg font-bold text-[var(--color-text-dark)]">
              {request.traveler_name ? `${request.traveler_name} · ` : ""}
              {request.region} {request.detail_region ? `· ${request.detail_region}` : ""}
            </p>
            <p className="text-sm text-slate-600">
              {request.check_in_date} ~ {request.check_out_date} · {request.people_count}명
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{REQUEST_STATUS_LABELS[request.status] ?? request.status}</Badge>
            {quoteCount !== undefined && quoteCount > 0 ? (
              <Badge tone="warning">견적 {quoteCount}건</Badge>
            ) : null}
          </div>
        </div>
        {request.message ? (
          <p className="mt-3 line-clamp-2 text-sm text-slate-700">{request.message}</p>
        ) : null}
      </Card>
    </Link>
  );
}

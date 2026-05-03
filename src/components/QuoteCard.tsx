import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { QUOTE_STATUS_LABELS } from "@/lib/constants/labels";
import type { Quote } from "@/lib/types/database";

export function QuoteCard({
  quote,
  imageUrl,
  detailHref,
  onAccept,
  onReject,
  showActions,
}: {
  quote: Quote;
  imageUrl?: string | null;
  detailHref: string;
  onAccept?: () => void;
  onReject?: () => void;
  showActions?: boolean;
}) {
  const discount =
    quote.discount_rate != null && quote.discount_rate > 0
      ? `${Number(quote.discount_rate).toFixed(0)}%`
      : null;

  return (
    <Card className="flex h-full flex-col overflow-hidden p-0">
      <div className="relative aspect-[16/10] w-full bg-[var(--color-bg)]">
        {imageUrl ? (
          <Image src={imageUrl} alt="" fill className="object-cover" sizes="(max-width:768px) 100vw,400px" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">이미지 없음</div>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <Badge tone="brown">{QUOTE_STATUS_LABELS[quote.status] ?? quote.status}</Badge>
          {discount ? <Badge tone="success">-{discount}</Badge> : null}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="text-xs font-medium text-[var(--color-brown)]">{quote.accommodation_name}</p>
          <h3 className="text-lg font-bold text-[var(--color-text-dark)]">{quote.title}</h3>
          <p className="mt-1 text-2xl font-extrabold text-[var(--color-brown)]">
            {quote.price.toLocaleString()}원
            {quote.original_price ? (
              <span className="ml-2 text-sm font-normal text-slate-400 line-through">
                {quote.original_price.toLocaleString()}원
              </span>
            ) : null}
          </p>
        </div>
        {quote.included_options?.length ? (
          <div className="flex flex-wrap gap-1">
            {quote.included_options.slice(0, 4).map((o) => (
              <Badge key={o} tone="muted">
                {o}
              </Badge>
            ))}
          </div>
        ) : null}
        <p className="line-clamp-2 text-sm text-slate-700">{quote.message_from_host}</p>
        <div className="mt-auto flex flex-wrap gap-2">
          <Link href={detailHref} className="flex-1 min-w-[120px]">
            <Button variant="secondary" className="w-full" type="button">
              상세 보기
            </Button>
          </Link>
          {showActions && quote.status === "sent" ? (
            <>
              <Button type="button" className="flex-1 min-w-[100px]" onClick={onAccept}>
                수락
              </Button>
              <Button type="button" variant="danger" className="flex-1 min-w-[100px]" onClick={onReject}>
                거절
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

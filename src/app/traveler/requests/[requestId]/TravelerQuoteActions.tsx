"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/Button";
import { acceptQuote, rejectQuote } from "@/lib/actions/quotes";
import type { Quote } from "@/lib/types/database";

type AccExtra = {
  images?: string[] | null;
  check_in_time?: string | null;
  check_out_time?: string | null;
};

export function TravelerQuoteActions({
  quotes,
  accById,
  regionLabel,
}: {
  quotes: Quote[];
  accById: Record<string, AccExtra | undefined>;
  regionLabel: string;
}) {
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(quotes[0]?.id ?? null);

  return (
    <div className="space-y-3">
      {quotes.map((q) => {
        const acc = q.accommodation_id ? accById[q.accommodation_id] : undefined;
        const open = openId === q.id;
        const discountPct =
          q.discount_rate != null && Number(q.discount_rate) > 0 ? `${Number(q.discount_rate).toFixed(0)}%` : null;
        const checkIn = acc?.check_in_time ?? "15:00";
        const checkOut = acc?.check_out_time ?? "11:00";
        const opts = (q.included_options ?? []).slice(0, 6);

        return (
          <div
            key={q.id}
            className={`overflow-hidden rounded-[var(--radius-ui)] border-[3px] border-[var(--color-primary)] bg-white shadow-sm transition ${
              open ? "ring-2 ring-[var(--color-primary)]/40" : ""
            }`}
          >
            <button
              type="button"
              onClick={() => setOpenId(open ? null : q.id)}
              className="flex w-full items-center justify-between gap-3 p-4 text-left"
            >
              <span className="min-w-0 font-bold text-[var(--color-text-dark)]">
                {regionLabel}: {q.accommodation_name ?? "숙소"}
              </span>
              <span className="shrink-0 text-lg font-extrabold text-[var(--color-text-dark)]">
                {q.price.toLocaleString()}원
              </span>
            </button>
            {open ? (
              <div className="border-t border-slate-100 px-4 pb-4 pt-2">
                <div className="flex flex-wrap gap-1.5">
                  {opts.length ? (
                    opts.map((o, i) => (
                      <span
                        key={`${q.id}-${o}-${i}`}
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          i === opts.length - 1 ? "bg-slate-100 text-slate-600" : "bg-[var(--color-primary)] text-[var(--color-text-dark)]"
                        }`}
                      >
                        {o}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">포함 옵션 정보 없음</span>
                  )}
                </div>
                <p className="mt-3 text-sm text-slate-600">
                  체크인 {checkIn} | 체크아웃 {checkOut}
                </p>
                <p className="mt-2 text-xs text-amber-800">
                  🎁 EGG머니 결제 시 최대 {Math.floor(q.price * 0.022).toLocaleString()}P 적립 (예시)
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="text-slate-500">
                    {q.original_price ? (
                      <>
                        정가 <span className="line-through">{q.original_price.toLocaleString()}원</span>
                      </>
                    ) : (
                      "정가 정보 없음"
                    )}
                  </span>
                  {discountPct ? <span className="font-bold text-red-600">{discountPct} 할인</span> : null}
                </div>
                <p className="mt-2 text-right text-lg font-extrabold text-[var(--color-text-dark)]">
                  💰 사장님 제안가: {q.price.toLocaleString()}원
                </p>
                <div className="mt-4 flex flex-wrap justify-end gap-2">
                  <Link href={`/traveler/quotes/${q.id}`}>
                    <Button type="button" variant="secondary" className="rounded-2xl px-4">
                      자세히 알아보기
                    </Button>
                  </Link>
                  {q.status === "sent" ? (
                    <Button
                      type="button"
                      className="rounded-2xl px-4 font-extrabold"
                      onClick={async () => {
                        const res = await acceptQuote(q.id);
                        if (res.error) {
                          alert(res.error);
                          return;
                        }
                        if (res.reservationId) router.push(`/traveler/reservations/${res.reservationId}/payment`);
                        router.refresh();
                      }}
                    >
                      지금 결제하기
                    </Button>
                  ) : null}
                </div>
                {q.status === "sent" ? (
                  <button
                    type="button"
                    className="mt-3 text-xs text-slate-400 underline"
                    onClick={async () => {
                      if (!confirm("이 견적을 거절할까요?")) return;
                      const res = await rejectQuote(q.id);
                      if (res.error) alert(res.error);
                      router.refresh();
                    }}
                  >
                    이 견적 거절
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        );
      })}
      <div className="rounded-[var(--radius-ui)] border border-[var(--color-primary-soft)] bg-[var(--color-primary-soft)]/50 px-4 py-5 text-center">
        <p className="font-bold text-[var(--color-text-dark)]">아직은 이게 다예요!</p>
        <p className="mt-1 text-sm text-slate-600">알림 설정을 해두면 바로 알려드려요 (준비 중)</p>
      </div>
    </div>
  );
}

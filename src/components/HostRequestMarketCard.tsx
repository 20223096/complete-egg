import Link from "next/link";
import type { ReactNode } from "react";
import { mockCompetitorRows } from "@/lib/mock-competitor-prices";
import { REQUIRED_OPTION_LABELS } from "@/lib/constants/labels";
import type { TravelerRequest } from "@/lib/types/database";

function formatBudget(r: TravelerRequest) {
  if (r.budget_min != null && r.budget_max != null) {
    return `${r.budget_min.toLocaleString()}원 ~ ${r.budget_max.toLocaleString()}원`;
  }
  return "예산 협의";
}

function matchTags(r: TravelerRequest) {
  const opts = (r.required_options as string[]) ?? [];
  return opts.map((k) => REQUIRED_OPTION_LABELS[k as keyof typeof REQUIRED_OPTION_LABELS] ?? k).filter(Boolean);
}

export function HostRequestMarketCard({
  request,
  variant,
  myQuotePrice,
}: {
  request: TravelerRequest;
  variant: "fresh" | "waiting";
  myQuotePrice?: number | null;
}) {
  const tags = matchTags(request);
  const competitor = mockCompetitorRows(request.region);

  return (
    <div className="overflow-hidden rounded-[var(--radius-ui)] border-[3px] border-[var(--color-primary)] bg-white p-4 shadow-sm">
      {request.is_tonight_flash ? (
        <p className="mb-3 inline-block rounded-full bg-red-500 px-3 py-1 text-xs font-extrabold text-white">오늘 밤 빈 방</p>
      ) : null}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-lg font-extrabold text-[var(--color-text-dark)]">{formatBudget(request)}</p>
        <p className="text-sm text-slate-500">인원 {request.people_count}명</p>
      </div>

      <div className="mt-4 flex gap-3 border-t border-slate-100 pt-4">
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <p className="text-xs font-semibold text-slate-700">이건 우리 숙소랑 잘 맞아요 🤩</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {tags.length ? (
                tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-[var(--color-primary)] px-2.5 py-1 text-xs font-semibold text-[var(--color-text-dark)]"
                  >
                    {t}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">특별 옵션 없음</span>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700">이건 우리 숙소랑 잘 안 맞아요 😅</p>
            <p className="mt-1 text-xs text-slate-400">요청서 기준 참고만 해 주세요</p>
          </div>
        </div>
        <div className="w-px shrink-0 bg-slate-200" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-slate-600">다른 숙소 견적가 (참고)</p>
          <ul className="mt-2 space-y-1 text-[11px] text-slate-600">
            {competitor.map((row) => (
              <li key={row.label} className="flex justify-between gap-1">
                <span className="truncate">{row.label}</span>
                <span className="shrink-0">{row.price.toLocaleString()}원</span>
              </li>
            ))}
          </ul>
          <span className="mt-1 inline-block text-[10px] text-slate-400 underline">자세히 보기</span>
        </div>
      </div>

      {variant === "waiting" && myQuotePrice != null ? (
        <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-3">
          <span className="text-sm font-bold text-[var(--color-primary-dark)]">우리 가격 |</span>
          <span className="text-2xl font-extrabold text-[var(--color-primary-dark)]">{myQuotePrice.toLocaleString()}원</span>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {variant === "fresh" ? (
          <>
            <ButtonLike href="#" disabled>
              거절
            </ButtonLike>
            <ButtonLike href={`/host/requests/${request.id}`} secondary>
              자세히 보기
            </ButtonLike>
            <ButtonLike href={`/host/quotes/new?requestId=${request.id}`} primary>
              견적 발송
            </ButtonLike>
          </>
        ) : (
          <Link
            href={`/host/requests/${request.id}`}
            className="block w-full rounded-2xl bg-[var(--color-primary)] py-3 text-center text-sm font-extrabold text-[var(--color-text-dark)] shadow-sm hover:brightness-95"
          >
            견적 업데이트
          </Link>
        )}
      </div>
    </div>
  );
}

function ButtonLike({
  href,
  children,
  primary,
  secondary,
  disabled,
}: {
  href: string;
  children: ReactNode;
  primary?: boolean;
  secondary?: boolean;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <span className="inline-flex flex-1 min-w-[4.5rem] cursor-not-allowed items-center justify-center rounded-2xl border-2 border-slate-200 px-3 py-2 text-center text-xs font-bold text-slate-400">
        {children}
      </span>
    );
  }
  const cls = primary
    ? "flex-1 min-w-[4.5rem] rounded-2xl bg-[var(--color-primary)] px-3 py-2 text-center text-xs font-extrabold text-[var(--color-text-dark)] shadow-sm hover:brightness-95"
    : secondary
      ? "flex-1 min-w-[4.5rem] rounded-2xl bg-[var(--color-primary-soft)] px-3 py-2 text-center text-xs font-bold text-[var(--color-text-dark)] hover:brightness-95"
      : "flex-1 min-w-[4.5rem] rounded-2xl border-2 border-[var(--color-primary)] bg-white px-3 py-2 text-center text-xs font-bold text-[var(--color-text-dark)]";
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

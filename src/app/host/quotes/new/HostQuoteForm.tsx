"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Textarea } from "@/components/Textarea";
import { REQUIRED_OPTION_LABELS } from "@/lib/constants/labels";
import { mockCompetitorRows } from "@/lib/mock-competitor-prices";
import { upsertQuote } from "@/lib/actions/quotes";

type Acc = { id: string; name: string; options: string[]; base_price: number | null };

export function HostQuoteForm({
  requestId,
  request,
  accommodations,
  alreadyQuotedAccIds,
  initialAccommodationId,
}: {
  requestId: string;
  request: {
    budget_min: number | null;
    budget_max: number | null;
    people_count: number;
    required_options: string[];
    region: string;
    detail_region: string | null;
    is_tonight_flash?: boolean;
  };
  accommodations: Acc[];
  alreadyQuotedAccIds: string[];
  initialAccommodationId?: string | null;
}) {
  const router = useRouter();
  const defaultAcc =
    (initialAccommodationId && accommodations.some((a) => a.id === initialAccommodationId)
      ? initialAccommodationId
      : accommodations[0]?.id) ?? "";
  const [accId, setAccId] = useState(defaultAcc);
  const [title, setTitle] = useState("맞춤 견적 제안");
  const [price, setPrice] = useState(
    Math.round((((request.budget_min ?? 100000) + (request.budget_max ?? 200000)) / 2) / 1000) * 1000
  );
  const [originalPrice, setOriginalPrice] = useState<number | "">("");
  const [included, setIncluded] = useState("조식, 주차");
  const [message, setMessage] = useState("감사합니다! 요청 주신 일정에 맞춰 안내드릴게요.");
  const [cancellation, setCancellation] = useState("취소·환불은 메시지로 협의해 주세요.");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedAcc = accommodations.find((a) => a.id === accId);

  useEffect(() => {
    if (!showAdvanced && selectedAcc) {
      setTitle(`${selectedAcc.name} 맞춤 제안`);
    }
  }, [accId, selectedAcc?.name, showAdvanced]);

  const discountRate = useMemo(() => {
    if (!originalPrice || typeof originalPrice !== "number" || originalPrice <= 0) return null;
    return Math.round((1 - price / originalPrice) * 10000) / 100;
  }, [price, originalPrice]);

  const matchLabels = request.required_options
    .map((k) => REQUIRED_OPTION_LABELS[k as keyof typeof REQUIRED_OPTION_LABELS] ?? k)
    .filter(Boolean);

  const competitorRows = useMemo(() => mockCompetitorRows(request.region), [request.region]);

  const otaInsight = useMemo(() => {
    const medianOta =
      competitorRows.length > 0
        ? Math.round(competitorRows.reduce((s, r) => s + r.price, 0) / competitorRows.length / 1000) * 1000
        : 150000;
    const otaRef = selectedAcc?.base_price && selectedAcc.base_price > 0 ? selectedAcc.base_price : medianOta;
    const discountTarget = request.is_tonight_flash ? 0.42 : 0.28;
    const suggested = Math.round((otaRef * (1 - discountTarget)) / 1000) * 1000;
    return { otaRef, suggested, discountPct: Math.round(discountTarget * 100) };
  }, [competitorRows, selectedAcc?.base_price, request.is_tonight_flash]);

  function applyOtaAiPrice() {
    setOriginalPrice(otaInsight.otaRef);
    setPrice(otaInsight.suggested);
  }

  function loadLastMessage() {
    try {
      const v = localStorage.getItem("hostQuoteLastMessage");
      if (v) setMessage(v);
    } catch {
      /* ignore */
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      localStorage.setItem("hostQuoteLastMessage", message);
    } catch {
      /* ignore */
    }
    const res = await upsertQuote({
      request_id: requestId,
      accommodation_id: accId,
      title,
      price,
      original_price: typeof originalPrice === "number" ? originalPrice : null,
      discount_rate: discountRate,
      included_options: included
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      message_from_host: message,
      cancellation_policy: cancellation,
    });
    setLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    router.push("/host/quotes");
    router.refresh();
  }

  if (!accommodations.length) {
    return <p className="text-sm text-red-600">먼저 숙소를 등록한 뒤 견적을 작성할 수 있어요.</p>;
  }

  const budgetLine =
    request.budget_min != null && request.budget_max != null
      ? `${request.budget_min.toLocaleString()}원 ~ ${request.budget_max.toLocaleString()}원`
      : "예산 협의";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="relative rounded-[var(--radius-ui)] border-[3px] border-[var(--color-primary)] bg-white p-4 shadow-sm">
        <Link
          href={`/host/requests/${requestId}`}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)] text-slate-600 shadow-sm ring-2 ring-white"
          aria-label="닫기"
        >
          ✕
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-2 pr-10">
          <p className="text-lg font-extrabold text-[var(--color-text-dark)]">{budgetLine}</p>
          <p className="text-sm text-slate-500">인원 {request.people_count}명</p>
        </div>
        {request.is_tonight_flash ? (
          <p className="mt-2 inline-block rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">오늘 밤 빈 방 요청</p>
        ) : null}

        <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50/80 px-3 py-2 text-xs text-amber-950">
          <strong className="font-bold">OTA 기준 할인 추천</strong>: 시세 참고 {otaInsight.otaRef.toLocaleString()}원 전후를 정가로 두고,{" "}
          {request.is_tonight_flash ? "빈 방" : "직거래"} 각도로 약 <strong>{otaInsight.discountPct}%</strong> 할인 시 제안가{" "}
          <strong>{otaInsight.suggested.toLocaleString()}원</strong> 근처가 경쟁력 있어요. 가격만 넣어도 됩니다.
          <Button type="button" variant="secondary" className="mt-2 w-full text-xs" onClick={applyOtaAiPrice}>
            추천 정가·제안가 적용하기
          </Button>
        </div>

        <div className="mt-4 flex gap-3 border-t border-slate-100 pt-4">
          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <p className="text-xs font-semibold text-slate-700">이건 우리 숙소랑 잘 맞아요 😍</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {matchLabels.length ? (
                  matchLabels.map((label) => (
                    <span
                      key={label}
                      className="rounded-full bg-[var(--color-primary)] px-2.5 py-1 text-xs font-semibold text-[var(--color-text-dark)]"
                    >
                      {label}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">요청에 특별 옵션 없음</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700">이건 우리 숙소랑 잘 안 맞아요 😅</p>
              <p className="mt-1 text-xs text-slate-400">옵션은 요청서 기준이에요</p>
            </div>
          </div>
          <div className="w-px shrink-0 bg-slate-200" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-600">OTA·주변 시세 (참고)</p>
            <ul className="mt-2 space-y-1 text-xs text-slate-600">
              {competitorRows.map((row) => (
                <li key={row.label} className="flex justify-between gap-2">
                  <span className="truncate">{row.label}</span>
                  <span className="shrink-0 font-medium">{row.price.toLocaleString()}원</span>
                </li>
              ))}
            </ul>
            <button type="button" className="mt-2 text-[10px] text-slate-400 underline">
              자세히 보기
            </button>
          </div>
        </div>

        <div className="mt-5">
          <p className="text-sm font-bold text-[var(--color-text-dark)]">요구 사항에 맞는 방들이에요 🛏️</p>
          <p className="mt-0.5 text-xs text-slate-500">연한색은 이미 견적을 보낸 숙소예요</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {accommodations.map((a) => {
              const sent = alreadyQuotedAccIds.includes(a.id);
              const selected = accId === a.id;
              return (
                <button
                  key={a.id}
                  type="button"
                  disabled={sent}
                  onClick={() => setAccId(a.id)}
                  className={`rounded-2xl border-2 px-3 py-2 text-sm font-semibold transition ${
                    sent
                      ? "cursor-not-allowed border-slate-100 bg-slate-100 text-slate-400"
                      : selected
                        ? "border-red-500 bg-[var(--color-primary-soft)] text-[var(--color-text-dark)]"
                        : "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-text-dark)] hover:brightness-95"
                  }`}
                >
                  {a.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5">
          <p className="text-sm font-bold text-[var(--color-text-dark)]">고객님에게 직접 어필해보세요 📣</p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder={
              selectedAcc
                ? `${selectedAcc.name}의 장점을 짧게 어필해 보세요!`
                : "메시지를 입력해 주세요."
            }
            className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none ring-[var(--color-primary)] focus:border-transparent focus:ring-2"
          />
          <button
            type="button"
            onClick={loadLastMessage}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-100 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-200"
          >
            지난 메시지 불러오기
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="mt-3 text-xs font-semibold text-[var(--color-brown)] underline"
        >
          {showAdvanced ? "가격·제목·취소 안내 접기" : "가격·제목·취소 안내 펼치기"}
        </button>
        {showAdvanced ? (
          <div className="mt-3 space-y-3 rounded-2xl bg-slate-50 p-3">
            <Input label="견적 제목" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <Input label="최종 제안 가격(원)" type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} required />
            <Input
              label="정가(원, 선택)"
              type="number"
              value={originalPrice === "" ? "" : originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value === "" ? "" : Number(e.target.value))}
            />
            <Input label="포함 옵션(쉼표 구분)" value={included} onChange={(e) => setIncluded(e.target.value)} />
            <Textarea label="취소·환불 안내" value={cancellation} onChange={(e) => setCancellation(e.target.value)} rows={2} required />
          </div>
        ) : null}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 p-4 backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:p-0">
        <div className="mx-auto max-w-md">
          <Button type="submit" loading={loading} className="w-full rounded-2xl py-3.5 text-base font-extrabold shadow-md">
            견적 보내기
          </Button>
        </div>
      </div>
    </form>
  );
}

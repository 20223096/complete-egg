"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Select } from "@/components/Select";
import { previewAutoQuoteDraft } from "@/lib/actions/auto-quote";

function formatDraftPreview(d: Record<string, unknown>) {
  const title = String(d.title ?? "");
  const price = typeof d.price === "number" ? d.price : Number(d.price);
  const orig = d.original_price != null ? Number(d.original_price) : null;
  const disc = d.discount_rate != null ? Number(d.discount_rate) : null;
  const opts = Array.isArray(d.included_options) ? (d.included_options as string[]).join(", ") : "";
  const msg = String(d.message_from_host ?? "");
  const cancel = String(d.cancellation_policy ?? "");
  return (
    <dl className="space-y-2 text-sm text-slate-800">
      <div>
        <dt className="text-xs text-slate-500">제목</dt>
        <dd className="font-semibold">{title}</dd>
      </div>
      <div>
        <dt className="text-xs text-slate-500">가격</dt>
        <dd>
          {!Number.isNaN(price) ? `${price.toLocaleString()}원` : "—"}
          {orig != null && !Number.isNaN(orig) ? (
            <span className="ml-2 text-xs text-slate-500 line-through">{orig.toLocaleString()}원 정가</span>
          ) : null}
          {disc != null && !Number.isNaN(disc) ? <span className="ml-2 text-xs text-amber-800">{disc}% 할인</span> : null}
        </dd>
      </div>
      {opts ? (
        <div>
          <dt className="text-xs text-slate-500">포함</dt>
          <dd>{opts}</dd>
        </div>
      ) : null}
      {msg ? (
        <div>
          <dt className="text-xs text-slate-500">메시지</dt>
          <dd className="whitespace-pre-wrap text-slate-700">{msg}</dd>
        </div>
      ) : null}
      {cancel ? (
        <div>
          <dt className="text-xs text-slate-500">취소 안내</dt>
          <dd className="text-slate-600">{cancel}</dd>
        </div>
      ) : null}
    </dl>
  );
}

export function HostAutoQuotePanel({
  requestId,
  accommodations,
}: {
  requestId: string;
  accommodations: { id: string; name: string }[];
}) {
  const [accId, setAccId] = useState(accommodations[0]?.id ?? "");
  const [preview, setPreview] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function runPreview() {
    setError(null);
    setLoading(true);
    const res = await previewAutoQuoteDraft(requestId, accId);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      setPreview(null);
      return;
    }
    setPreview(res.draft);
  }

  if (!accommodations.length) {
    return (
      <Card>
        <p className="text-sm text-slate-600">자동 견적 미리보기를 쓰려면 먼저 숙소를 등록해 주세요.</p>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="font-bold text-[var(--color-brown)]">Pro · 자동 견적 미리보기</h3>
      <p className="mt-1 text-xs text-slate-600">규칙에 맞는 초안을 확인한 뒤, 견적서 작성 화면에서 보내 주세요.</p>
      <div className="mt-4 space-y-3">
        <Select label="숙소 선택" value={accId} onChange={(e) => setAccId(e.target.value)}>
          {accommodations.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </Select>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" loading={loading} onClick={runPreview}>
            미리보기
          </Button>
          <Link href={`/host/quotes/new?requestId=${requestId}&accommodationId=${accId}`}>
            <Button type="button">견적서 작성 화면으로</Button>
          </Link>
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {preview ? (
          <div className="max-h-64 overflow-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
            {formatDraftPreview(preview)}
          </div>
        ) : null}
      </div>
    </Card>
  );
}

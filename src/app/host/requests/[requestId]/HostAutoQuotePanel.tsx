"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Select } from "@/components/Select";
import { previewAutoQuoteDraft } from "@/lib/actions/auto-quote";

export function HostAutoQuotePanel({
  requestId,
  accommodations,
}: {
  requestId: string;
  accommodations: { id: string; name: string }[];
}) {
  const [accId, setAccId] = useState(accommodations[0]?.id ?? "");
  const [preview, setPreview] = useState<string | null>(null);
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
    setPreview(JSON.stringify(res.draft, null, 2));
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
      <p className="mt-1 text-xs text-slate-600">
        견적 상태 ENUM에 초안이 없어 DB에는 저장하지 않습니다. 미리보기 후 &quot;견적서 작성&quot;에서 전송하세요.
      </p>
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
          <pre className="max-h-64 overflow-auto rounded-2xl bg-[var(--color-bg)] p-3 text-xs">{preview}</pre>
        ) : null}
      </div>
    </Card>
  );
}

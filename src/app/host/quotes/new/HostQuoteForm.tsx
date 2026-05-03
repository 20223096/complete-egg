"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { Textarea } from "@/components/Textarea";
import { upsertQuote } from "@/lib/actions/quotes";

export function HostQuoteForm({
  requestId,
  accommodations,
  initialAccommodationId,
}: {
  requestId: string;
  accommodations: { id: string; name: string }[];
  initialAccommodationId?: string | null;
}) {
  const router = useRouter();
  const defaultAcc =
    (initialAccommodationId && accommodations.some((a) => a.id === initialAccommodationId)
      ? initialAccommodationId
      : accommodations[0]?.id) ?? "";
  const [accId, setAccId] = useState(defaultAcc);
  const [title, setTitle] = useState("맞춤 견적 제안");
  const [price, setPrice] = useState(200000);
  const [originalPrice, setOriginalPrice] = useState<number | "">("");
  const [included, setIncluded] = useState("조식, 주차");
  const [message, setMessage] = useState("감사합니다! 요청 주신 일정에 맞춰 안내드릴게요.");
  const [cancellation, setCancellation] = useState("MVP 단계: 취소는 메시지로 협의해 주세요.");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const discountRate = useMemo(() => {
    if (!originalPrice || typeof originalPrice !== "number" || originalPrice <= 0) return null;
    return Math.round((1 - price / originalPrice) * 10000) / 100;
  }, [price, originalPrice]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
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

  return (
    <form className="mx-auto max-w-xl space-y-4" onSubmit={onSubmit}>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Select label="숙소" value={accId} onChange={(e) => setAccId(e.target.value)}>
        {accommodations.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </Select>
      <Input label="견적 제목" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <Input label="최종 제안 가격(원)" type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} required />
      <Input
        label="기존 가격(원, 선택)"
        type="number"
        value={originalPrice === "" ? "" : originalPrice}
        onChange={(e) => setOriginalPrice(e.target.value === "" ? "" : Number(e.target.value))}
      />
      <Input label="포함 옵션(쉼표 구분)" value={included} onChange={(e) => setIncluded(e.target.value)} />
      <Textarea label="사장님 메시지" value={message} onChange={(e) => setMessage(e.target.value)} rows={4} />
      <Textarea label="취소·환불 안내" value={cancellation} onChange={(e) => setCancellation(e.target.value)} rows={3} required />
      <Button type="submit" loading={loading}>
        전송하기
      </Button>
    </form>
  );
}

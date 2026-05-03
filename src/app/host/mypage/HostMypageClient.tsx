"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Textarea } from "@/components/Textarea";
import { saveAutoQuoteRule } from "@/lib/actions/auto-quote";

export function HostMypageClient({
  accommodationId,
  accommodationName,
}: {
  accommodationId: string;
  accommodationName: string;
}) {
  const [regions, setRegions] = useState("강릉,속초");
  const [minBudget, setMinBudget] = useState<number | "">("");
  const [maxBudget, setMaxBudget] = useState<number | "">("");
  const [minPeople, setMinPeople] = useState<number | "">("");
  const [maxPeople, setMaxPeople] = useState<number | "">("");
  const [opts, setOpts] = useState("오션뷰,주차");
  const [baseMessage, setBaseMessage] = useState("완숙 자동 초안입니다. 일정에 맞춰 최대한 맞춰 드릴게요.");
  const [discountPolicy, setDiscountPolicy] = useState("10% 할인 적용");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function save() {
    setMsg(null);
    start(async () => {
      const res = await saveAutoQuoteRule({
        accommodation_id: accommodationId,
        enabled: true,
        regions: regions
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        min_budget: minBudget === "" ? null : minBudget,
        max_budget: maxBudget === "" ? null : maxBudget,
        min_people: minPeople === "" ? null : minPeople,
        max_people: maxPeople === "" ? null : maxPeople,
        available_options: opts
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        base_message: baseMessage,
        discount_policy: discountPolicy,
      });
      setMsg(res.error ? res.error : "저장되었습니다.");
    });
  }

  return (
    <Card>
      <h2 className="font-bold text-[var(--color-brown)]">자동 견적 설정 · {accommodationName}</h2>
      <p className="mt-1 text-xs text-slate-600">
        조건에 맞는 요청이 들어오면 자동 견적 생성 예정입니다. MVP에서는 미리보기와 초안 저장만 제공합니다.
      </p>
      <div className="mt-4 space-y-3">
        <Input label="매칭 지역(쉼표)" value={regions} onChange={(e) => setRegions(e.target.value)} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="최소 예산" type="number" value={minBudget === "" ? "" : minBudget} onChange={(e) => setMinBudget(e.target.value === "" ? "" : Number(e.target.value))} />
          <Input label="최대 예산" type="number" value={maxBudget === "" ? "" : maxBudget} onChange={(e) => setMaxBudget(e.target.value === "" ? "" : Number(e.target.value))} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="최소 인원" type="number" value={minPeople === "" ? "" : minPeople} onChange={(e) => setMinPeople(e.target.value === "" ? "" : Number(e.target.value))} />
          <Input label="최대 인원" type="number" value={maxPeople === "" ? "" : maxPeople} onChange={(e) => setMaxPeople(e.target.value === "" ? "" : Number(e.target.value))} />
        </div>
        <Input label="포함 옵션 키워드(쉼표)" value={opts} onChange={(e) => setOpts(e.target.value)} />
        <Textarea label="기본 메시지" value={baseMessage} onChange={(e) => setBaseMessage(e.target.value)} rows={3} />
        <Input label="할인 정책(예: 10% 할인)" value={discountPolicy} onChange={(e) => setDiscountPolicy(e.target.value)} />
        {msg ? <p className="text-sm text-slate-700">{msg}</p> : null}
        <Button type="button" loading={pending} onClick={save}>
          규칙 저장
        </Button>
      </div>
    </Card>
  );
}

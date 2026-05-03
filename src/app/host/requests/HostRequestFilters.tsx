"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";

export function HostRequestFilters() {
  const router = useRouter();
  const sp = useSearchParams();
  const [region, setRegion] = useState(sp.get("region") ?? "");
  const [people, setPeople] = useState(sp.get("people") ?? "");
  const [budgetMin, setBudgetMin] = useState(sp.get("budgetMin") ?? "");

  function apply(e: React.FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams();
    if (region) p.set("region", region);
    if (people) p.set("people", people);
    if (budgetMin) p.set("budgetMin", budgetMin);
    router.push(`/host/requests?${p.toString()}`);
  }

  return (
    <form onSubmit={apply} className="flex flex-wrap items-end gap-3 rounded-3xl border border-[var(--color-border)] bg-white/80 p-4">
      <Input label="지역" value={region} onChange={(e) => setRegion(e.target.value)} className="min-w-[140px]" />
      <Input label="최소 인원 이상" type="number" value={people} onChange={(e) => setPeople(e.target.value)} className="w-32" />
      <Input label="예산 하한(원)" type="number" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} className="w-36" />
      <Button type="submit">필터 적용</Button>
    </form>
  );
}

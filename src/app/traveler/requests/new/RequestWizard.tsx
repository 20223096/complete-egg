"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { StepForm } from "@/components/StepForm";
import { Textarea } from "@/components/Textarea";
import { ACCOMMODATION_TYPE_LABELS, MOOD_KEYS, MOOD_LABELS, REQUIRED_OPTION_KEYS, REQUIRED_OPTION_LABELS } from "@/lib/constants/labels";
import { createTravelerRequest } from "@/lib/actions/traveler-requests";

const steps = ["지역·날짜", "인원·예산", "숙소·옵션", "추가 요청", "제출 완료"];

export default function RequestWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [region, setRegion] = useState("");
  const [detailRegion, setDetailRegion] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [peopleCount, setPeopleCount] = useState(2);
  const [roomCount, setRoomCount] = useState(1);
  const [budgetMin, setBudgetMin] = useState(100000);
  const [budgetMax, setBudgetMax] = useState(300000);
  const [accommodationType, setAccommodationType] = useState<string>("any");
  const [requiredOptions, setRequiredOptions] = useState<string[]>([]);
  const [preferredMood, setPreferredMood] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [travelerName, setTravelerName] = useState("");

  function toggle(arr: string[], v: string, set: (x: string[]) => void) {
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  }

  async function submit() {
    setError(null);
    setSubmitting(true);
    const res = await createTravelerRequest({
      traveler_name: travelerName || "여행객",
      region,
      detail_region: detailRegion,
      check_in_date: checkIn,
      check_out_date: checkOut,
      people_count: peopleCount,
      room_count: roomCount,
      budget_min: budgetMin,
      budget_max: budgetMax,
      accommodation_type: accommodationType,
      required_options: requiredOptions,
      preferred_mood: preferredMood,
      message,
    });
    setSubmitting(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    if (res.id) router.replace(`/traveler/requests/${res.id}`);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">요청서 작성</h1>
        <p className="mt-1 text-sm text-slate-600">단계별로 입력하면 사장님들이 맞춤 견적을 보내 드려요.</p>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <StepForm
        steps={steps}
        current={step}
        onStepChange={setStep}
        onBack={() => setStep((s) => Math.max(0, s - 1))}
        onNext={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
        isLast={step === steps.length - 1}
        onSubmit={submit}
        submitting={submitting}
        submitLabel="요청서 보내기"
        nextLabel="다음 단계"
      >
        {step === 0 ? (
          <div className="space-y-4">
            <Input label="지역" placeholder="예: 강릉" value={region} onChange={(e) => setRegion(e.target.value)} required />
            <Input label="상세 지역" placeholder="예: 경포대 인근" value={detailRegion} onChange={(e) => setDetailRegion(e.target.value)} />
            <Input label="체크인" type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} required />
            <Input label="체크아웃" type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} required />
          </div>
        ) : null}
        {step === 1 ? (
          <div className="space-y-4">
            <Input
              label="인원"
              type="number"
              min={1}
              value={peopleCount}
              onChange={(e) => setPeopleCount(Number(e.target.value))}
              required
            />
            <Input
              label="객실 수"
              type="number"
              min={1}
              value={roomCount}
              onChange={(e) => setRoomCount(Number(e.target.value))}
              required
            />
            <Input
              label="최소 예산(원)"
              type="number"
              value={budgetMin}
              onChange={(e) => setBudgetMin(Number(e.target.value))}
            />
            <Input
              label="최대 예산(원)"
              type="number"
              value={budgetMax}
              onChange={(e) => setBudgetMax(Number(e.target.value))}
            />
          </div>
        ) : null}
        {step === 2 ? (
          <div className="space-y-4">
            <Select label="숙소 타입" value={accommodationType} onChange={(e) => setAccommodationType(e.target.value)}>
              {Object.entries(ACCOMMODATION_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
            <fieldset>
              <legend className="text-sm font-medium text-[var(--color-brown)]">필요 옵션</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {REQUIRED_OPTION_KEYS.map((k) => (
                  <label key={k} className="flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs ring-1 ring-[var(--color-border)]">
                    <input
                      type="checkbox"
                      checked={requiredOptions.includes(k)}
                      onChange={() => toggle(requiredOptions, k, setRequiredOptions)}
                    />
                    {REQUIRED_OPTION_LABELS[k]}
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="text-sm font-medium text-[var(--color-brown)]">분위기</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {MOOD_KEYS.map((k) => (
                  <label key={k} className="flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs ring-1 ring-[var(--color-border)]">
                    <input
                      type="checkbox"
                      checked={preferredMood.includes(k)}
                      onChange={() => toggle(preferredMood, k, setPreferredMood)}
                    />
                    {MOOD_LABELS[k]}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        ) : null}
        {step === 3 ? (
          <div className="space-y-4">
            <Input label="표시 이름" placeholder="견적서에 보여질 이름" value={travelerName} onChange={(e) => setTravelerName(e.target.value)} />
            <Textarea label="추가 요청사항" value={message} onChange={(e) => setMessage(e.target.value)} rows={5} />
          </div>
        ) : null}
        {step === 4 ? (
          <div className="space-y-3 text-sm text-slate-700">
            <p>아래 내용으로 요청서를 전송합니다.</p>
            <ul className="list-inside list-disc space-y-1 rounded-2xl bg-white/80 p-4 ring-1 ring-[var(--color-border)]">
              <li>
                {region} {detailRegion} / {checkIn} ~ {checkOut}
              </li>
              <li>
                {peopleCount}명 · {roomCount}실 · 예산 {budgetMin.toLocaleString()}~{budgetMax.toLocaleString()}원
              </li>
              <li>{ACCOMMODATION_TYPE_LABELS[accommodationType as keyof typeof ACCOMMODATION_TYPE_LABELS] ?? accommodationType}</li>
            </ul>
            <p className="text-xs text-slate-500">전송 후에는 사장님들이 견적을 작성해 보내요.</p>
          </div>
        ) : null}
      </StepForm>
      <Button type="button" variant="ghost" onClick={() => router.back()}>
        대시보드로
      </Button>
    </div>
  );
}

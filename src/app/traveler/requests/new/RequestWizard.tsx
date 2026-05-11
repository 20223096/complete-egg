"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { Textarea } from "@/components/Textarea";
import { PageBrandBar } from "@/components/PageBrandBar";
import { ACCOMMODATION_TYPE_LABELS, MOOD_KEYS, MOOD_LABELS, REQUIRED_OPTION_KEYS, REQUIRED_OPTION_LABELS } from "@/lib/constants/labels";
import { REGION_GROUPS, REGION_SUGGESTIONS } from "@/lib/constants/regions";
import { createTravelerRequest } from "@/lib/actions/traveler-requests";

type SectionId = "region" | "schedule" | "people" | "type" | "extra";

export default function RequestWizard() {
  const router = useRouter();
  const [open, setOpen] = useState<Record<SectionId, boolean>>({
    region: true,
    schedule: false,
    people: false,
    type: false,
    extra: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [province, setProvince] = useState(REGION_GROUPS[0]?.province ?? "강원");
  const areas = useMemo(() => REGION_GROUPS.find((g) => g.province === province)?.areas ?? [], [province]);
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

  function toggleSection(id: SectionId) {
    setOpen((o) => ({ ...o, [id]: !o[id] }));
  }

  const headline = useMemo(() => {
    if (preferredMood.includes("family")) return "가족과 함께하는 여행";
    if (preferredMood.includes("couple")) return "둘만의 여행";
    if (region) return `${region} 여행`;
    return "바다가 보이는 효도여행";
  }, [preferredMood, region]);

  async function submit() {
    if (!region.trim()) {
      setError("지역에서 도시를 선택해 주세요.");
      setOpen((o) => ({ ...o, region: true }));
      return;
    }
    if (!checkIn || !checkOut) {
      setError("체크인·체크아웃 일정을 입력해 주세요.");
      setOpen((o) => ({ ...o, schedule: true }));
      return;
    }
    setError(null);
    setSubmitting(true);
    const res = await createTravelerRequest({
      traveler_name: travelerName || "여행객",
      region: region || province,
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

  function Accordion({
    id,
    title,
    summary,
    children,
  }: {
    id: SectionId;
    title: string;
    summary?: string;
    children: React.ReactNode;
  }) {
    const isOpen = open[id];
    return (
      <div className="overflow-hidden rounded-[var(--radius-ui)] border-[3px] border-[var(--color-primary)] bg-white shadow-sm">
        <button
          type="button"
          onClick={() => toggleSection(id)}
          className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
        >
          <div>
            <p className="font-extrabold text-[var(--color-text-dark)]">{title}</p>
            {!isOpen && summary ? <p className="mt-1 text-xs text-slate-500">{summary}</p> : null}
          </div>
          <span className="text-slate-400">{isOpen ? "⌄" : "›"}</span>
        </button>
        {isOpen ? <div className="border-t border-slate-100 px-4 pb-4 pt-2">{children}</div> : null}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 pb-28 pt-4">
      <PageBrandBar href="/traveler" />
      <h1 className="text-xl font-extrabold text-[var(--color-text-dark)]">요청서 작성하기</h1>

      <div className="mt-4 rounded-[var(--radius-ui)] bg-[var(--color-primary)] px-4 py-3 text-center shadow-sm">
        <p className="text-base font-extrabold text-[var(--color-text-dark)]">{headline}</p>
      </div>
      <p className="mt-2 text-center text-sm font-medium text-slate-600">를 위한 요청서를 작성해보세요!</p>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      <div className="mt-6 space-y-3">
        <Accordion
          id="region"
          title="지역"
          summary={region || province ? `${region || province} ${detailRegion}` : undefined}
        >
          <p className="text-xs font-semibold text-slate-500">완숙의 추천</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {REGION_SUGGESTIONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setRegion(r);
                  setDetailRegion("");
                }}
                className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                {r}
              </button>
            ))}
          </div>
          <div className="mt-4 flex gap-2 rounded-2xl bg-slate-50 p-2">
            <div className="w-2/5 space-y-1 overflow-y-auto text-sm">
              {REGION_GROUPS.map((g) => (
                <button
                  key={g.province}
                  type="button"
                  onClick={() => {
                    setProvince(g.province);
                    setRegion("");
                    setDetailRegion("");
                  }}
                  className={`block w-full rounded-xl px-2 py-2 text-left font-medium ${
                    province === g.province ? "bg-white shadow-sm" : "text-slate-600 hover:bg-white/60"
                  }`}
                >
                  {g.province}
                </button>
              ))}
            </div>
            <div className="max-h-48 flex-1 space-y-1 overflow-y-auto border-l border-slate-200 pl-2 text-sm">
              {areas.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => {
                    setRegion(a);
                    setDetailRegion("");
                  }}
                  className={`block w-full rounded-xl px-2 py-1.5 text-left ${
                    region === a ? "bg-[var(--color-primary-soft)] font-bold" : "text-slate-700 hover:bg-white/80"
                  }`}
                >
                  · {a}
                </button>
              ))}
            </div>
          </div>
          <Input
            className="mt-3"
            label="상세 지역 (선택)"
            placeholder="예: 경포대 인근"
            value={detailRegion}
            onChange={(e) => setDetailRegion(e.target.value)}
          />
        </Accordion>

        <Accordion
          id="schedule"
          title="일정"
          summary={checkIn && checkOut ? `${checkIn} ~ ${checkOut}` : undefined}
        >
          <Input label="체크인" type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} required />
          <Input className="mt-3" label="체크아웃" type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} required />
        </Accordion>

        <Accordion
          id="people"
          title="인원 · 예산"
          summary={
            peopleCount
              ? `${peopleCount}명 · ${budgetMin.toLocaleString()}~${budgetMax.toLocaleString()}원`
              : undefined
          }
        >
          <Input label="인원" type="number" min={1} value={peopleCount} onChange={(e) => setPeopleCount(Number(e.target.value))} required />
          <Input
            className="mt-3"
            label="객실 수"
            type="number"
            min={1}
            value={roomCount}
            onChange={(e) => setRoomCount(Number(e.target.value))}
            required
          />
          <Input
            className="mt-3"
            label="최소 예산(원)"
            type="number"
            value={budgetMin}
            onChange={(e) => setBudgetMin(Number(e.target.value))}
          />
          <Input
            className="mt-3"
            label="최대 예산(원)"
            type="number"
            value={budgetMax}
            onChange={(e) => setBudgetMax(Number(e.target.value))}
          />
        </Accordion>

        <Accordion id="type" title="숙소 유형">
          <Select label="타입" value={accommodationType} onChange={(e) => setAccommodationType(e.target.value)}>
            {Object.entries(ACCOMMODATION_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
          <fieldset className="mt-4">
            <legend className="text-xs font-semibold text-slate-600">필요 옵션</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {REQUIRED_OPTION_KEYS.map((k) => (
                <label
                  key={k}
                  className={`flex cursor-pointer items-center gap-1 rounded-full border-2 px-3 py-1.5 text-xs font-semibold ${
                    requiredOptions.includes(k)
                      ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={requiredOptions.includes(k)}
                    onChange={() => toggle(requiredOptions, k, setRequiredOptions)}
                  />
                  {REQUIRED_OPTION_LABELS[k]}
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="mt-4">
            <legend className="text-xs font-semibold text-slate-600">분위기</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {MOOD_KEYS.map((k) => (
                <label
                  key={k}
                  className={`flex cursor-pointer items-center gap-1 rounded-full border-2 px-3 py-1.5 text-xs font-semibold ${
                    preferredMood.includes(k)
                      ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={preferredMood.includes(k)}
                    onChange={() => toggle(preferredMood, k, setPreferredMood)}
                  />
                  {MOOD_LABELS[k]}
                </label>
              ))}
            </div>
          </fieldset>
        </Accordion>

        <Accordion id="extra" title="추가 요청 · 이름">
          <Input label="표시 이름" placeholder="견적서에 보일 이름" value={travelerName} onChange={(e) => setTravelerName(e.target.value)} />
          <Textarea className="mt-3" label="추가 요청사항" value={message} onChange={(e) => setMessage(e.target.value)} rows={4} />
        </Accordion>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 p-4 backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:px-0 sm:pt-4">
        <div className="mx-auto max-w-md space-y-2">
          <Button
            type="button"
            className="w-full rounded-2xl py-3.5 text-base font-extrabold shadow-md"
            loading={submitting}
            onClick={submit}
          >
            요청서 보내기
          </Button>
          <Button type="button" variant="ghost" className="w-full text-sm" onClick={() => router.back()}>
            대시보드로
          </Button>
        </div>
      </div>
    </div>
  );
}

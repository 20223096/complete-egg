"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { Textarea } from "@/components/Textarea";
import { PageBrandBar } from "@/components/PageBrandBar";
import { parseNaturalTravelRequest } from "@/lib/actions/parse-travel-intent";
import { ACCOMMODATION_TYPE_LABELS, MOOD_KEYS, MOOD_LABELS, REQUIRED_OPTION_KEYS, REQUIRED_OPTION_LABELS } from "@/lib/constants/labels";
import { REGION_GROUPS, REGION_SUGGESTIONS } from "@/lib/constants/regions";
import { createTravelerRequest } from "@/lib/actions/traveler-requests";

type SectionId = "region" | "schedule" | "people" | "type" | "extra";

export default function RequestWizard() {
  const router = useRouter();
  const urlParams = useSearchParams();
  const [open, setOpen] = useState<Record<SectionId, boolean>>({
    region: false,
    schedule: false,
    people: false,
    type: false,
    extra: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const [tonightFlash, setTonightFlash] = useState(false);
  const [naturalText, setNaturalText] = useState("");
  const [aiSummary, setAiSummary] = useState<string | null>(null);

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

  useEffect(() => {
    if (urlParams.get("flash") === "1") {
      setTonightFlash(true);
    }
  }, [urlParams]);

  useEffect(() => {
    if (tonightFlash) {
      const seoulToday = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
      const y = seoulToday.getFullYear();
      const m = String(seoulToday.getMonth() + 1).padStart(2, "0");
      const d = String(seoulToday.getDate()).padStart(2, "0");
      const t = `${y}-${m}-${d}`;
      const tmr = new Date(seoulToday);
      tmr.setDate(tmr.getDate() + 1);
      const y2 = tmr.getFullYear();
      const m2 = String(tmr.getMonth() + 1).padStart(2, "0");
      const d2 = String(tmr.getDate()).padStart(2, "0");
      setCheckIn(t);
      setCheckOut(`${y2}-${m2}-${d2}`);
      setBudgetMin(50000);
      setBudgetMax(160000);
    }
  }, [tonightFlash]);

  function toggle(arr: string[], v: string, set: (x: string[]) => void) {
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  }

  function toggleSection(id: SectionId) {
    setOpen((o) => ({ ...o, [id]: !o[id] }));
  }

  const headline = useMemo(() => {
    if (tonightFlash) return "오늘 밤 빈 방";
    if (preferredMood.includes("family")) return "가족과 함께하는 여행";
    if (preferredMood.includes("couple")) return "둘만의 여행";
    if (region) return `${region} 여행`;
    return "친구에게 말하듯, 한 번에";
  }, [preferredMood, region, tonightFlash]);

  async function runAiFill() {
    setError(null);
    setInfo(null);
    setParsing(true);
    const res = await parseNaturalTravelRequest(naturalText || message, tonightFlash);
    setParsing(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    const p = res.data;
    setRegion(p.region);
    setDetailRegion(p.detail_region);
    setCheckIn(p.check_in_date);
    setCheckOut(p.check_out_date);
    setPeopleCount(p.people_count);
    setRoomCount(p.room_count);
    setBudgetMin(p.budget_min);
    setBudgetMax(p.budget_max);
    setAccommodationType(p.accommodation_type);
    setRequiredOptions(p.required_options);
    setPreferredMood(p.preferred_mood);
    setMessage(p.message);
    setAiSummary(p.ai_summary);
    setInfo("아래에서 조건을 손보신 뒤 요청서를 보내 주세요.");
    setOpen({ region: true, schedule: true, people: true, type: false, extra: false });
  }

  async function submit() {
    if (!region.trim()) {
      setError("지역에서 도시를 선택하거나, 위 자연어 칸에 지역을 적어 AI로 채워 주세요.");
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
      natural_language: naturalText.trim() || null,
      is_tonight_flash: tonightFlash,
      ai_summary: aiSummary,
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
      <p className="mt-1 text-sm text-slate-600">
        편하게 말로 적으면 AI가 요청서 형식으로 정리해요. OTA에 없는 즉흥·빈 방 특가는{" "}
        <strong className="font-semibold text-[var(--color-brown)]">오늘 밤 빈 방</strong>으로 켜 주세요.
      </p>

      <div className="mt-4 rounded-[var(--radius-ui)] bg-[var(--color-primary)] px-4 py-3 text-center shadow-sm">
        <p className="text-base font-extrabold text-[var(--color-text-dark)]">{headline}</p>
      </div>
      <p className="mt-2 text-center text-sm font-medium text-slate-600">
        {tonightFlash ? "빈 방은 손실이라 할인 의지가 가장 큰 요청이에요." : "AI가 정리한 뒤에도 아래에서 언제든 고칠 수 있어요."}
      </p>

      <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-[var(--radius-ui)] border-2 border-red-200 bg-red-50/60 px-4 py-3">
        <input type="checkbox" checked={tonightFlash} onChange={(e) => setTonightFlash(e.target.checked)} className="h-4 w-4" />
        <span className="text-sm font-bold text-red-900">오늘 밤 빈 방 (당일 체크인 · 강한 할인 각도)</span>
      </label>

      <div className="mt-4 rounded-[var(--radius-ui)] border-2 border-[var(--color-brown)]/30 bg-white p-4 shadow-sm">
        <p className="text-sm font-bold text-[var(--color-text-dark)]">친구에게 말하듯 적어 주세요</p>
        <textarea
          value={naturalText}
          onChange={(e) => setNaturalText(e.target.value)}
          rows={5}
          placeholder="예: 이번 주말 강릉 가려는데 가족 4명이고 바다 보이는 데, 스파 있으면 좋겠어. 예산은 한 25만 전후?"
          className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        />
        <Button type="button" className="mt-3 w-full" loading={parsing} onClick={runAiFill}>
          AI로 요청서 채우기
        </Button>
        <p className="mt-2 text-xs text-slate-500">
          OpenAI 키가 없으면 완숙 규칙 엔진으로 초안을 만듭니다. 키는 서버 환경 변수{" "}
          <code className="rounded bg-slate-100 px-1">OPENAI_API_KEY</code> 에 넣을 수 있어요.
        </p>
      </div>

      {aiSummary ? (
        <p className="mt-3 rounded-2xl border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-950">{aiSummary}</p>
      ) : null}
      {info ? <p className="mt-2 text-sm text-emerald-800">{info}</p> : null}
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

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
          <Textarea className="mt-3" label="사장님께 전할 메시지 (AI 초안 수정 가능)" value={message} onChange={(e) => setMessage(e.target.value)} rows={4} />
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

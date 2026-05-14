import { REGION_GROUPS } from "@/lib/constants/regions";
import { MOOD_KEYS, REQUIRED_OPTION_KEYS, REQUIRED_OPTION_LABELS } from "@/lib/constants/labels";
import type { ParsedTravelIntent } from "@/lib/ai/travel-intent-types";

function isoLocal(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** 서울 기준 오늘/내일 날짜 (서버에서도 동일하게) */
function seoulDatePlus(daysFromToday: number) {
  const now = new Date();
  const seoul = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  seoul.setDate(seoul.getDate() + daysFromToday);
  const y = seoul.getFullYear();
  const m = String(seoul.getMonth() + 1).padStart(2, "0");
  const day = String(seoul.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(baseIso: string, days: number) {
  const d = new Date(`${baseIso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return isoLocal(d);
}

const OPTION_KO: { re: RegExp; key: (typeof REQUIRED_OPTION_KEYS)[number] }[] = [
  { re: /오션|바다\s*뷰|바다뷰/i, key: "oceanView" },
  { re: /스파|스파\s*욕/i, key: "spa" },
  { re: /주차/i, key: "parking" },
  { re: /바베큐|BBQ/i, key: "bbq" },
  { re: /수영장|풀/i, key: "pool" },
  { re: /반려|애완/i, key: "pet" },
  { re: /취사/i, key: "cooking" },
];

const MOOD_KO: { re: RegExp; key: (typeof MOOD_KEYS)[number] }[] = [
  { re: /가족|아이|육아/i, key: "family" },
  { re: /커플|신혼|둘이/i, key: "couple" },
  { re: /친구/i, key: "friends" },
  { re: /조용/i, key: "quiet" },
  { re: /럭셔리|고급/i, key: "luxury" },
  { re: /가성비|저렴/i, key: "costEffective" },
];

/** 규칙 기반 한국어 묘사 → 요청서 필드 (OpenAI 없을 때) */
export function heuristicParseTravel(text: string, opts: { tonightFlash: boolean }): ParsedTravelIntent {
  const raw = text.trim();
  const today = seoulDatePlus(0);
  const checkIn = opts.tonightFlash ? today : seoulDatePlus(14);
  const checkOut = opts.tonightFlash ? seoulDatePlus(1) : addDays(checkIn, 2);

  let region = "";
  const flatAreas = REGION_GROUPS.flatMap((g) => g.areas);
  for (const a of flatAreas) {
    if (raw.includes(a)) {
      region = a;
      break;
    }
  }
  if (!region) {
    for (const g of REGION_GROUPS) {
      if (raw.includes(g.province)) {
        region = g.areas[0] ?? g.province;
        break;
      }
    }
  }
  if (!region) region = "강릉";

  const peopleM = raw.match(/(\d+)\s*명/);
  const people_count = peopleM ? Math.min(20, Math.max(1, Number(peopleM[1]))) : 2;

  let budget_min = opts.tonightFlash ? 60000 : 100000;
  let budget_max = opts.tonightFlash ? 180000 : 280000;
  const rangeMan = raw.match(/(\d+)\s*~\s*(\d+)\s*만/);
  if (rangeMan) {
    budget_min = Number(rangeMan[1]) * 10000;
    budget_max = Number(rangeMan[2]) * 10000;
  } else {
    const oneMan = raw.match(/(\d+)\s*만/);
    if (oneMan) {
      const v = Number(oneMan[1]) * 10000;
      budget_min = Math.round(v * 0.7);
      budget_max = Math.round(v * 1.2);
    }
  }

  const required_options: string[] = [];
  for (const { re, key } of OPTION_KO) {
    if (re.test(raw) && !required_options.includes(key)) required_options.push(key);
  }

  const preferred_mood: string[] = [];
  for (const { re, key } of MOOD_KO) {
    if (re.test(raw) && !preferred_mood.includes(key)) preferred_mood.push(key);
  }

  const message = raw
    ? raw.slice(0, 400) + (raw.length > 400 ? "…" : "")
    : opts.tonightFlash
      ? "오늘 밤 급하게 숙소가 필요해요."
      : "여행 일정을 완숙에 맡겨 주세요.";

  const ai_summary = `지역 ${region} · ${people_count}명 · ${checkIn}~${checkOut} · 예산 약 ${budget_min.toLocaleString()}~${budget_max.toLocaleString()}원으로 정리했어요. 아래에서 세부를 손보실 수 있어요.`;

  return {
    region,
    detail_region: "",
    check_in_date: checkIn,
    check_out_date: checkOut,
    people_count,
    room_count: 1,
    budget_min,
    budget_max,
    accommodation_type: "any",
    required_options,
    preferred_mood,
    message,
    ai_summary,
  };
}

"use server";

import type { ParsedTravelIntent } from "@/lib/ai/travel-intent-types";
import { heuristicParseTravel } from "@/lib/ai/heuristic-travel-parse";

const OPENAI_KEY = process.env.OPENAI_API_KEY;

async function openAiParse(text: string, tonightFlash: boolean): Promise<ParsedTravelIntent | null> {
  if (!OPENAI_KEY) return null;
  const sys = `You extract Korean travel intent into JSON only. Schema keys:
region (string city name in Korea e.g. 강릉), detail_region (string, may be empty),
check_in_date, check_out_date (YYYY-MM-DD),
people_count (int), room_count (int),
budget_min, budget_max (KRW int),
accommodation_type (pension|poolvilla|hotel|guesthouse|hanok|any),
required_options (array of: oceanView, bbq, pool, pet, parking, cooking, spa, nearStation),
preferred_mood (array of: quiet, emotional, family, couple, friends, luxury, costEffective),
message (polite Korean summary for hosts, 2-4 sentences),
ai_summary (one Korean sentence for traveler UI).
If tonightFlash is true, prefer check_in_date=today in Asia/Seoul sense and 1-night stay unless user said otherwise. Use tomorrow as checkout if single night implied.`;

  const user = JSON.stringify({ tonightFlash, text });

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: sys },
        { role: "user", content: user },
      ],
    }),
  });

  if (!res.ok) return null;
  const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const raw = body.choices?.[0]?.message?.content;
  if (!raw) return null;
  try {
    const j = JSON.parse(raw) as ParsedTravelIntent;
    if (!j.region || !j.check_in_date || !j.check_out_date) return null;
    return j;
  } catch {
    return null;
  }
}

export async function parseNaturalTravelRequest(
  text: string,
  tonightFlash: boolean
): Promise<{ ok: true; data: ParsedTravelIntent } | { ok: false; error: string }> {
  const trimmed = text.trim();
  if (trimmed.length < 4) {
    return { ok: false, error: "조금만 더 구체적으로 적어 주세요. (4자 이상)" };
  }

  const ai = await openAiParse(trimmed, tonightFlash);
  if (ai) return { ok: true, data: ai };

  return { ok: true, data: heuristicParseTravel(trimmed, { tonightFlash }) };
}

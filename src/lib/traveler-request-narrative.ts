/** 화면에 보여 줄 요청 본문 (중복 필드 하나로 합침) */
export function requestNarrativeText(req: {
  message?: string | null;
  ai_summary?: string | null;
  natural_language?: string | null;
}): string {
  const m = req.message?.trim();
  if (m) return m;
  const a = req.ai_summary?.trim();
  if (a) return a;
  const n = req.natural_language?.trim();
  if (n) return n;
  return "";
}

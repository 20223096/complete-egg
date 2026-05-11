/** 참고용 시세 UI (실제 외부 연동 아님) */
export function mockCompetitorRows(region: string): { label: string; price: number }[] {
  const r = region.trim() || "인근";
  return [
    { label: `${r} 인근 A`, price: 160_000 },
    { label: `${r} 인근 B`, price: 110_000 },
    { label: `${r} 인근 C`, price: 90_000 },
  ];
}

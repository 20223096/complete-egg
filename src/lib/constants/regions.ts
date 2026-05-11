/** Two-column region picker (province → areas) for request form UI */
export const REGION_GROUPS: { province: string; areas: string[] }[] = [
  { province: "강원", areas: ["강릉", "고성", "동해", "삼척", "속초", "양양", "춘천", "평창"] },
  { province: "제주", areas: ["제주시", "서귀포", "성산", "애월"] },
  { province: "부산", areas: ["해운대", "광안리", "송도", "기장"] },
  { province: "인천", areas: ["강화", "을왕리", "영종도"] },
  { province: "전남", areas: ["여수", "담양", "보성"] },
  { province: "경남", areas: ["거제", "남해", "통영"] },
  { province: "충북", areas: ["단양", "제천"] },
];

export const REGION_SUGGESTIONS = ["동해", "강릉", "거제도", "성산"] as const;

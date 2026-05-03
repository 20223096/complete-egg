import type { AccommodationType } from "@/lib/types/database";

export const ACCOMMODATION_TYPE_LABELS: Record<AccommodationType, string> = {
  pension: "펜션",
  poolvilla: "풀빌라",
  hotel: "호텔",
  guesthouse: "게스트하우스",
  hanok: "한옥",
  any: "타입 무관",
};

export const REQUIRED_OPTION_KEYS = [
  "oceanView",
  "bbq",
  "pool",
  "pet",
  "parking",
  "cooking",
  "spa",
  "nearStation",
] as const;

export const REQUIRED_OPTION_LABELS: Record<(typeof REQUIRED_OPTION_KEYS)[number], string> = {
  oceanView: "오션뷰",
  bbq: "바베큐",
  pool: "수영장",
  pet: "반려동물",
  parking: "주차",
  cooking: "취사",
  spa: "스파",
  nearStation: "역세권",
};

export const MOOD_KEYS = [
  "quiet",
  "emotional",
  "family",
  "couple",
  "friends",
  "luxury",
  "costEffective",
] as const;

export const MOOD_LABELS: Record<(typeof MOOD_KEYS)[number], string> = {
  quiet: "조용한",
  emotional: "감성적인",
  family: "가족",
  couple: "커플",
  friends: "친구",
  luxury: "럭셔리",
  costEffective: "가성비",
};

export const REQUEST_STATUS_LABELS: Record<string, string> = {
  open: "접수중",
  quoted: "견적 도착",
  accepted: "예약 확정 진행",
  closed: "마감",
  canceled: "취소됨",
};

export const QUOTE_STATUS_LABELS: Record<string, string> = {
  sent: "전송됨",
  accepted: "수락됨",
  rejected: "거절됨",
  expired: "만료",
  canceled: "취소됨",
};

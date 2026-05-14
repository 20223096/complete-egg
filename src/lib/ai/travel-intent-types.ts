/** AI/룰 엔진이 채우는 요청서 초안 (DB insert 전) */
export type ParsedTravelIntent = {
  region: string;
  detail_region: string;
  check_in_date: string;
  check_out_date: string;
  people_count: number;
  room_count: number;
  budget_min: number;
  budget_max: number;
  accommodation_type: string;
  required_options: string[];
  preferred_mood: string[];
  message: string;
  ai_summary: string;
};

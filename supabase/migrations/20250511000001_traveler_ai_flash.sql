-- 자연어 원문, 오늘 밤 빈 방 플래그, AI 요약(요청서용)
alter table public.traveler_requests
  add column if not exists natural_language text,
  add column if not exists is_tonight_flash boolean not null default false,
  add column if not exists ai_summary text;

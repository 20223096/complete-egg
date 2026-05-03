-- 완숙 Supabase 스키마 (Auth + profiles + ENUM + RLS + Storage)
-- Supabase SQL Editor에서 실행

create extension if not exists "pgcrypto";

create type public.user_role as enum ('traveler', 'host', 'admin');
create type public.request_status as enum ('open', 'quoted', 'accepted', 'closed', 'canceled');
create type public.quote_status as enum ('sent', 'accepted', 'rejected', 'expired', 'canceled');
create type public.reservation_status as enum ('payment_pending', 'confirmed', 'canceled');
create type public.payment_status as enum ('pending', 'paid', 'failed', 'refunded');
create type public.plan_type as enum ('free', 'pro');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null,
  name text not null,
  phone text,
  email text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.accommodations (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  region text not null,
  detail_region text,
  address text,
  description text,
  accommodation_type text,
  base_price int,
  max_people int,
  images text[] default '{}',
  options text[] default '{}',
  check_in_time text,
  check_out_time text,
  phone text,
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.traveler_requests (
  id uuid primary key default gen_random_uuid(),
  traveler_id uuid not null references public.profiles (id) on delete cascade,
  traveler_name text,
  region text not null,
  detail_region text,
  check_in_date date not null,
  check_out_date date not null,
  people_count int not null,
  room_count int default 1,
  budget_min int,
  budget_max int,
  accommodation_type text default 'any',
  required_options text[] default '{}',
  preferred_mood text[] default '{}',
  message text,
  status public.request_status default 'open',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.traveler_requests (id) on delete cascade,
  traveler_id uuid not null references public.profiles (id) on delete cascade,
  host_id uuid not null references public.profiles (id) on delete cascade,
  accommodation_id uuid references public.accommodations (id) on delete set null,
  accommodation_name text,
  title text not null,
  price int not null,
  original_price int,
  discount_rate numeric,
  check_in_date date,
  check_out_date date,
  people_count int,
  included_options text[] default '{}',
  message_from_host text,
  cancellation_policy text,
  status public.quote_status default 'sent',
  is_auto_generated boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.traveler_requests (id) on delete cascade,
  quote_id uuid not null references public.quotes (id) on delete cascade,
  traveler_id uuid not null references public.profiles (id) on delete cascade,
  host_id uuid not null references public.profiles (id) on delete cascade,
  accommodation_id uuid references public.accommodations (id) on delete set null,
  price int not null,
  status public.reservation_status default 'payment_pending',
  payment_status public.payment_status default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (quote_id)
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references public.reservations (id) on delete cascade,
  traveler_id uuid not null references public.profiles (id) on delete cascade,
  host_id uuid not null references public.profiles (id) on delete cascade,
  quote_id uuid references public.quotes (id) on delete set null,
  created_at timestamptz default now(),
  unique (reservation_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  sender_role public.user_role not null,
  text text not null,
  created_at timestamptz default now(),
  constraint messages_sender_role_chat check ((sender_role::text) in ('traveler', 'host'))
);

create table public.host_subscriptions (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.profiles (id) on delete cascade,
  plan public.plan_type default 'free',
  status text default 'active',
  started_at timestamptz default now(),
  ended_at timestamptz,
  unique (host_id)
);

create table public.auto_quote_rules (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.profiles (id) on delete cascade,
  accommodation_id uuid references public.accommodations (id) on delete cascade,
  enabled boolean default false,
  regions text[] default '{}',
  min_budget int,
  max_budget int,
  min_people int,
  max_people int,
  available_options text[] default '{}',
  base_message text,
  discount_policy text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger set_accommodations_updated_at
before update on public.accommodations
for each row execute function public.set_updated_at();

create trigger set_requests_updated_at
before update on public.traveler_requests
for each row execute function public.set_updated_at();

create trigger set_quotes_updated_at
before update on public.quotes
for each row execute function public.set_updated_at();

create trigger set_reservations_updated_at
before update on public.reservations
for each row execute function public.set_updated_at();

create trigger set_auto_quote_rules_updated_at
before update on public.auto_quote_rules
for each row execute function public.set_updated_at();

-- RLS
alter table public.profiles enable row level security;
alter table public.accommodations enable row level security;
alter table public.traveler_requests enable row level security;
alter table public.quotes enable row level security;
alter table public.reservations enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.host_subscriptions enable row level security;
alter table public.auto_quote_rules enable row level security;

-- profiles
create policy "profiles_select_own"
on public.profiles for select
using (auth.uid() = id);

create policy "profiles_select_admin"
on public.profiles for select
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

create policy "profiles_select_conversation_peer"
on public.profiles for select
using (
  exists (
    select 1 from public.conversations c
    where (c.traveler_id = profiles.id or c.host_id = profiles.id)
      and (c.traveler_id = auth.uid() or c.host_id = auth.uid())
  )
);

create policy "profiles_insert_own"
on public.profiles for insert
with check (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles for update
using (auth.uid() = id);

-- accommodations (전체 조회 — 필요 시 host 본인만으로 좁힐 수 있음)
create policy "accommodations_select_all"
on public.accommodations for select
using (true);

create policy "accommodations_select_admin"
on public.accommodations for select
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "accommodations_insert_host"
on public.accommodations for insert
with check (auth.uid() = host_id);

create policy "accommodations_update_own"
on public.accommodations for update
using (auth.uid() = host_id);

create policy "accommodations_delete_own"
on public.accommodations for delete
using (auth.uid() = host_id);

-- traveler_requests
create policy "requests_select_own_or_host"
on public.traveler_requests for select
using (
  auth.uid() = traveler_id
  or exists (
    select 1 from public.profiles pr
    where pr.id = auth.uid()
      and pr.role in ('host', 'admin')
  )
);

create policy "requests_insert_own"
on public.traveler_requests for insert
with check (auth.uid() = traveler_id);

create policy "requests_update_own"
on public.traveler_requests for update
using (auth.uid() = traveler_id);

-- quotes
create policy "quotes_select_related"
on public.quotes for select
using (
  auth.uid() = traveler_id
  or auth.uid() = host_id
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

create policy "quotes_insert_host"
on public.quotes for insert
with check (auth.uid() = host_id);

create policy "quotes_update_related"
on public.quotes for update
using (auth.uid() = traveler_id or auth.uid() = host_id);

-- reservations
create policy "reservations_select_related"
on public.reservations for select
using (
  auth.uid() = traveler_id
  or auth.uid() = host_id
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

create policy "reservations_insert_traveler"
on public.reservations for insert
with check (auth.uid() = traveler_id);

create policy "reservations_update_related"
on public.reservations for update
using (auth.uid() = traveler_id or auth.uid() = host_id);

-- conversations
create policy "conversations_select_related"
on public.conversations for select
using (auth.uid() = traveler_id or auth.uid() = host_id);

create policy "conversations_insert_related"
on public.conversations for insert
with check (auth.uid() = traveler_id or auth.uid() = host_id);

-- messages
create policy "messages_select_related"
on public.messages for select
using (
  exists (
    select 1 from public.conversations c
    where c.id = messages.conversation_id
      and (c.traveler_id = auth.uid() or c.host_id = auth.uid())
  )
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

create policy "messages_insert_related"
on public.messages for insert
with check (
  auth.uid() = sender_id
  and exists (
    select 1 from public.conversations c
    where c.id = messages.conversation_id
      and (c.traveler_id = auth.uid() or c.host_id = auth.uid())
  )
);

-- host_subscriptions
create policy "subscriptions_select_own"
on public.host_subscriptions for select
using (auth.uid() = host_id or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "subscriptions_insert_own"
on public.host_subscriptions for insert
with check (auth.uid() = host_id);

create policy "subscriptions_update_own"
on public.host_subscriptions for update
using (auth.uid() = host_id);

-- auto_quote_rules
create policy "auto_quote_select_own"
on public.auto_quote_rules for select
using (auth.uid() = host_id or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "auto_quote_insert_own"
on public.auto_quote_rules for insert
with check (auth.uid() = host_id);

create policy "auto_quote_update_own"
on public.auto_quote_rules for update
using (auth.uid() = host_id);

-- Storage
insert into storage.buckets (id, name, public)
values ('accommodation-images', 'accommodation-images', true)
on conflict (id) do nothing;

create policy "storage_public_read"
on storage.objects for select
using (bucket_id = 'accommodation-images');

create policy "storage_host_insert"
on storage.objects for insert
with check (
  bucket_id = 'accommodation-images'
  and auth.role() = 'authenticated'
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'host')
);

create policy "storage_host_modify"
on storage.objects for update
using (
  bucket_id = 'accommodation-images'
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'host')
  and owner = auth.uid()
);

create policy "storage_host_delete"
on storage.objects for delete
using (
  bucket_id = 'accommodation-images'
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'host')
  and owner = auth.uid()
);

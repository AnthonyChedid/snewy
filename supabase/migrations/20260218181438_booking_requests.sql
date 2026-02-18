-- Story 08: booking_requests + RLS + reference generation
create extension if not exists pgcrypto;

create table if not exists public.booking_requests (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null,
  shop_id uuid not null references public.shops(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete cascade,
  resort_id uuid not null references public.resorts(id) on delete restrict,
  start_date date not null,
  end_date date not null,
  gear_category text not null check (gear_category in ('ski','snowboard')),
  tier text not null check (tier in ('basic','standard','premium')),
  height_cm int,
  weight_kg int,
  shoe_eu text,
  rider_level text not null check (rider_level in ('beginner','intermediate','advanced')),
  notes text,
  status text not null default 'pending' check (status in ('pending','confirmed','rejected','fulfilled','cancelled')),
  shop_response_notes text,
  created_at timestamptz not null default now(),
  constraint booking_dates_check check (end_date >= start_date)
);

create index if not exists idx_booking_requests_user_id on public.booking_requests(user_id);
create index if not exists idx_booking_requests_shop_id on public.booking_requests(shop_id);
create index if not exists idx_booking_requests_resort_id on public.booking_requests(resort_id);
create index if not exists idx_booking_requests_status on public.booking_requests(status);

create or replace function public.generate_booking_reference(resort_slug text)
returns text
language plpgsql
as $$
declare
  prefix text;
  candidate text;
begin
  prefix := upper(left(coalesce(resort_slug, 'SNW'), 3));
  candidate := prefix || '-' || upper(substr(md5(gen_random_uuid()::text), 1, 6));
  return candidate;
end;
$$;

create or replace function public.set_booking_reference()
returns trigger
language plpgsql
as $$
declare
  rs_slug text;
begin
  if new.reference is null or length(trim(new.reference)) = 0 then
    select slug into rs_slug from public.resorts where id = new.resort_id;
    new.reference := public.generate_booking_reference(rs_slug);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_set_booking_reference on public.booking_requests;
create trigger trg_set_booking_reference
before insert on public.booking_requests
for each row execute function public.set_booking_reference();

alter table public.booking_requests enable row level security;

drop policy if exists booking_insert_own on public.booking_requests;
drop policy if exists booking_select_own on public.booking_requests;

create policy booking_insert_own
on public.booking_requests
for insert
to authenticated
with check (user_id = auth.uid());

create policy booking_select_own
on public.booking_requests
for select
to authenticated
using (user_id = auth.uid());

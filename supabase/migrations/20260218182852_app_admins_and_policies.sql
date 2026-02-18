-- Story 14: app_admins + admin CRUD/view policies
create extension if not exists pgcrypto;

create table if not exists public.app_admins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.app_admins enable row level security;

drop policy if exists app_admins_read_own on public.app_admins;
create policy app_admins_read_own
on public.app_admins
for select
to authenticated
using (user_id = auth.uid());

-- admin helper predicate repeated inline for portability

-- resorts admin CRUD
drop policy if exists resorts_admin_all on public.resorts;
create policy resorts_admin_all
on public.resorts
for all
to authenticated
using (exists (select 1 from public.app_admins a where a.user_id = auth.uid()))
with check (exists (select 1 from public.app_admins a where a.user_id = auth.uid()));

-- shops admin CRUD
drop policy if exists shops_admin_all on public.shops;
create policy shops_admin_all
on public.shops
for all
to authenticated
using (exists (select 1 from public.app_admins a where a.user_id = auth.uid()))
with check (exists (select 1 from public.app_admins a where a.user_id = auth.uid()));

-- price_packages admin CRUD
drop policy if exists price_packages_admin_all on public.price_packages;
create policy price_packages_admin_all
on public.price_packages
for all
to authenticated
using (exists (select 1 from public.app_admins a where a.user_id = auth.uid()))
with check (exists (select 1 from public.app_admins a where a.user_id = auth.uid()));

-- shop_staff admin CRUD
drop policy if exists shop_staff_admin_all on public.shop_staff;
create policy shop_staff_admin_all
on public.shop_staff
for all
to authenticated
using (exists (select 1 from public.app_admins a where a.user_id = auth.uid()))
with check (exists (select 1 from public.app_admins a where a.user_id = auth.uid()));

-- booking_requests admin read all
drop policy if exists booking_admin_read_all on public.booking_requests;
create policy booking_admin_read_all
on public.booking_requests
for select
to authenticated
using (exists (select 1 from public.app_admins a where a.user_id = auth.uid()));

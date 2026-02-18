-- Story 12: shop_staff and shop portal read access
create extension if not exists pgcrypto;

create table if not exists public.shop_staff (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  role text not null default 'staff' check (role in ('owner','staff'))
);

create index if not exists idx_shop_staff_shop_id on public.shop_staff(shop_id);
create index if not exists idx_shop_staff_user_id on public.shop_staff(user_id);

alter table public.shop_staff enable row level security;

drop policy if exists shop_staff_read_own on public.shop_staff;
create policy shop_staff_read_own
on public.shop_staff
for select
to authenticated
using (user_id = auth.uid());

-- shop staff can read bookings for their assigned shop(s)
drop policy if exists booking_select_shop_staff on public.booking_requests;
create policy booking_select_shop_staff
on public.booking_requests
for select
to authenticated
using (
  exists (
    select 1
    from public.shop_staff ss
    where ss.shop_id = booking_requests.shop_id
      and ss.user_id = auth.uid()
  )
);

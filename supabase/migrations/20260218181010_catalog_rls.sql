-- Story 05: RLS for public catalog read (active rows only)

alter table public.resorts enable row level security;
alter table public.shops enable row level security;
alter table public.price_packages enable row level security;

-- Clean re-runs

drop policy if exists resorts_public_read_active on public.resorts;
drop policy if exists shops_public_read_active on public.shops;
drop policy if exists price_packages_public_read_active on public.price_packages;

create policy resorts_public_read_active
on public.resorts
for select
to anon, authenticated
using (is_active = true);

create policy shops_public_read_active
on public.shops
for select
to anon, authenticated
using (is_active = true);

create policy price_packages_public_read_active
on public.price_packages
for select
to anon, authenticated
using (
  is_active = true
  and exists (
    select 1
    from public.shops s
    where s.id = price_packages.shop_id
      and s.is_active = true
  )
);

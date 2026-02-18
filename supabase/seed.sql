-- Story 04 seed data

insert into public.resorts (name, slug)
values
  ('Mzaar', 'mzaar'),
  ('Faraya', 'faraya'),
  ('Laklouk', 'laklouk')
on conflict (slug) do update set name = excluded.name;

-- Shops (2 per resort)
with r as (
  select id, slug from public.resorts
)
insert into public.shops (resort_id, name, address, phone, whatsapp, pickup_notes)
values
  ((select id from r where slug='mzaar'), 'Cedars Ride Shop', 'Mzaar main parking', '+96170000001', '+96170000001', 'next to gondola'),
  ((select id from r where slug='mzaar'), 'Summit Skis', 'Mzaar village square', '+96170000002', '+96170000002', 'blue cabin side'),
  ((select id from r where slug='faraya'), 'Faraya Snow Hub', 'Faraya center', '+96170000003', '+96170000003', 'across ticket office'),
  ((select id from r where slug='faraya'), 'Pine Peaks Rentals', 'Faraya lower lot', '+96170000004', '+96170000004', 'near shuttle stop'),
  ((select id from r where slug='laklouk'), 'Laklouk Board & Ski', 'Laklouk entrance road', '+96170000005', '+96170000005', 'beside ski school'),
  ((select id from r where slug='laklouk'), 'North Snow Gear', 'Laklouk upper parking', '+96170000006', '+96170000006', 'inside lodge annex')
on conflict do nothing;

-- Price packages: basic/standard/premium x day/weekend/week for ski + snowboard
insert into public.price_packages (shop_id, category, tier, duration, price_lbp, price_usd, includes)
select
  s.id,
  c.category,
  t.tier,
  d.duration,
  case
    when t.tier='basic' and d.duration='day' then 2200000
    when t.tier='standard' and d.duration='day' then 2800000
    when t.tier='premium' and d.duration='day' then 3500000
    when t.tier='basic' and d.duration='weekend' then 3900000
    when t.tier='standard' and d.duration='weekend' then 4900000
    when t.tier='premium' and d.duration='weekend' then 6200000
    when t.tier='basic' and d.duration='week' then 9500000
    when t.tier='standard' and d.duration='week' then 12000000
    else 15000000
  end as price_lbp,
  case
    when t.tier='basic' and d.duration='day' then 24.00
    when t.tier='standard' and d.duration='day' then 31.00
    when t.tier='premium' and d.duration='day' then 39.00
    when t.tier='basic' and d.duration='weekend' then 43.00
    when t.tier='standard' and d.duration='weekend' then 55.00
    when t.tier='premium' and d.duration='weekend' then 69.00
    when t.tier='basic' and d.duration='week' then 106.00
    when t.tier='standard' and d.duration='week' then 134.00
    else 168.00
  end as price_usd,
  case
    when c.category='ski' then 'boots+skis+poles'
    else 'boots+board'
  end as includes
from public.shops s
cross join (values ('ski'),('snowboard')) as c(category)
cross join (values ('basic'),('standard'),('premium')) as t(tier)
cross join (values ('day'),('weekend'),('week')) as d(duration)
on conflict do nothing;

-- Story 04: catalog schema (resorts, shops, price_packages)
create extension if not exists pgcrypto;

create table if not exists public.resorts (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  slug text unique not null,
  is_active boolean not null default true
);

create table if not exists public.shops (
  id uuid primary key default gen_random_uuid(),
  resort_id uuid not null references public.resorts(id) on delete restrict,
  name text not null,
  address text,
  phone text,
  whatsapp text,
  pickup_notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.price_packages (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  category text not null check (category in ('ski','snowboard')),
  tier text not null check (tier in ('basic','standard','premium')),
  duration text not null check (duration in ('day','weekend','week')),
  price_lbp integer not null,
  price_usd numeric(10,2),
  includes text,
  is_active boolean not null default true
);

create index if not exists idx_shops_resort_id on public.shops(resort_id);
create index if not exists idx_price_packages_shop_id on public.price_packages(shop_id);

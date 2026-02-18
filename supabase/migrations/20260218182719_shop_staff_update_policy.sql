-- Story 13: shop staff update status + response notes for their shop bookings

drop policy if exists booking_update_shop_staff on public.booking_requests;

create policy booking_update_shop_staff
on public.booking_requests
for update
to authenticated
using (
  exists (
    select 1
    from public.shop_staff ss
    where ss.shop_id = booking_requests.shop_id
      and ss.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.shop_staff ss
    where ss.shop_id = booking_requests.shop_id
      and ss.user_id = auth.uid()
  )
  and status in ('pending','confirmed','rejected','fulfilled','cancelled')
);

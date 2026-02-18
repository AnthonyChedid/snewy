-- Story 11: allow users to cancel their own pending bookings

drop policy if exists booking_update_cancel_own_pending on public.booking_requests;

create policy booking_update_cancel_own_pending
on public.booking_requests
for update
to authenticated
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and status in ('pending', 'cancelled')
);

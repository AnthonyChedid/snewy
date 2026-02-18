import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../auth/useAuth'
import { supabase } from '../lib/supabase'

type Membership = {
  id: string
  shop_id: string
  role: 'owner' | 'staff'
  shops: { name: string } | null
}

type ShopBooking = {
  id: string
  reference: string
  status: 'pending' | 'confirmed' | 'rejected' | 'fulfilled' | 'cancelled'
  created_at: string
  start_date: string
  end_date: string
  rider_level: 'beginner' | 'intermediate' | 'advanced'
  gear_category: 'ski' | 'snowboard'
  tier: 'basic' | 'standard' | 'premium'
  shops: { name: string } | null
}

export function ShopPortalPage() {
  const { session } = useAuth()
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [bookings, setBookings] = useState<ShopBooking[]>([])
  const [statusFilter, setStatusFilter] = useState<'all' | ShopBooking['status']>('all')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!session) return

    const load = async () => {
      setLoading(true)
      setError('')

      const { data: memberRows, error: memberErr } = await supabase
        .from('shop_staff')
        .select('id,shop_id,role,shops(name)')

      if (memberErr) {
        setError(memberErr.message)
        setLoading(false)
        return
      }

      const members = (memberRows ?? []) as unknown as Membership[]
      setMemberships(members)

      if (members.length === 0) {
        setBookings([])
        setLoading(false)
        return
      }

      const { data: bookingRows, error: bookingErr } = await supabase
        .from('booking_requests')
        .select('id,reference,status,created_at,start_date,end_date,rider_level,gear_category,tier,shops(name)')
        .in(
          'shop_id',
          members.map((m) => m.shop_id),
        )
        .order('created_at', { ascending: false })

      if (bookingErr) {
        setError(bookingErr.message)
      } else {
        setBookings((bookingRows ?? []) as unknown as ShopBooking[])
      }

      setLoading(false)
    }

    void load()
  }, [session?.user.id])

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return bookings
    return bookings.filter((b) => b.status === statusFilter)
  }, [bookings, statusFilter])

  if (!session) return <p className="rounded-md bg-amber-50 p-3 text-amber-800">Login required.</p>

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Shop Portal</h2>

      {loading && <p className="text-slate-600">Loading shop data...</p>}
      {error && <p className="rounded-md bg-red-50 p-3 text-red-700">{error}</p>}

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-2 text-lg font-medium">My shop memberships</h3>
        {memberships.length === 0 ? (
          <p className="text-sm text-slate-600">No shop membership found for this account yet.</p>
        ) : (
          <ul className="list-inside list-disc text-sm text-slate-700">
            {memberships.map((m) => (
              <li key={m.id}>
                {m.shops?.name ?? m.shop_id} ({m.role})
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-medium">Incoming requests</h3>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | ShopBooking['status'])}
            className="rounded border border-slate-300 px-2 py-1 text-sm"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="rejected">Rejected</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm text-slate-600">No requests for selected filter.</p>
        ) : (
          <div className="space-y-2">
            {filtered.map((b) => (
              <article key={b.id} className="rounded border border-slate-200 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{b.reference}</p>
                  <span className="rounded bg-slate-100 px-2 py-1 text-xs font-medium">{b.status}</span>
                </div>
                <p className="text-sm text-slate-600">
                  {b.shops?.name ?? 'Shop'} • {b.start_date} → {b.end_date}
                </p>
                <p className="text-sm text-slate-600">
                  {b.gear_category} / {b.tier} / {b.rider_level}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

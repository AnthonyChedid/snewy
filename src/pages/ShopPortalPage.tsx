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
  shop_response_notes: string | null
  shops: { name: string } | null
}

const allowedTransitions: Record<ShopBooking['status'], ShopBooking['status'][]> = {
  pending: ['confirmed', 'rejected', 'cancelled'],
  confirmed: ['fulfilled', 'cancelled'],
  rejected: ['rejected'],
  fulfilled: ['fulfilled'],
  cancelled: ['cancelled'],
}

export function ShopPortalPage() {
  const { session } = useAuth()
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [bookings, setBookings] = useState<ShopBooking[]>([])
  const [statusFilter, setStatusFilter] = useState<'all' | ShopBooking['status']>('all')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [nextStatus, setNextStatus] = useState<ShopBooking['status']>('pending')
  const [responseNotes, setResponseNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    if (!session) return

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
      .select(
        'id,reference,status,created_at,start_date,end_date,rider_level,gear_category,tier,shop_response_notes,shops(name)',
      )
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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user.id])

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return bookings
    return bookings.filter((b) => b.status === statusFilter)
  }, [bookings, statusFilter])

  const selectedBooking = bookings.find((b) => b.id === selectedId) ?? null

  useEffect(() => {
    if (!selectedBooking) return
    setNextStatus(selectedBooking.status)
    setResponseNotes(selectedBooking.shop_response_notes ?? '')
  }, [selectedBooking?.id])

  const saveUpdate = async () => {
    if (!selectedBooking) return
    setSaving(true)
    setError('')

    const { error } = await supabase
      .from('booking_requests')
      .update({ status: nextStatus, shop_response_notes: responseNotes || null })
      .eq('id', selectedBooking.id)

    if (error) {
      setError(error.message)
    } else {
      await load()
    }

    setSaving(false)
  }

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

      <div className="grid gap-4 lg:grid-cols-2">
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
                <button
                  key={b.id}
                  onClick={() => setSelectedId(b.id)}
                  className={`w-full rounded border p-3 text-left ${selectedId === b.id ? 'border-slate-900 bg-slate-50' : 'border-slate-200'}`}
                >
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
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-lg font-medium">Booking action</h3>
          {!selectedBooking ? (
            <p className="text-sm text-slate-600">Select a booking from the left to update status.</p>
          ) : (
            <div className="space-y-3">
              <p className="font-semibold">{selectedBooking.reference}</p>
              <label className="block text-sm">
                Status
                <select
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-1"
                  value={nextStatus}
                  onChange={(e) => setNextStatus(e.target.value as ShopBooking['status'])}
                >
                  {allowedTransitions[selectedBooking.status].map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm">
                Response notes
                <textarea
                  rows={4}
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-1"
                  value={responseNotes}
                  onChange={(e) => setResponseNotes(e.target.value)}
                />
              </label>

              <button
                onClick={() => void saveUpdate()}
                disabled={saving}
                className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save update'}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

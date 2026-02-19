import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../auth/useAuth'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { useToast } from '../components/useToast'
import { logError } from '../lib/logger'

type Booking = {
  id: string
  reference: string
  status: 'pending' | 'confirmed' | 'rejected' | 'fulfilled' | 'cancelled'
  start_date: string
  end_date: string
  created_at: string
  shops: { name: string } | null
  resorts: { name: string } | null
}

const statusClass: Record<Booking['status'], string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-rose-100 text-rose-800',
  fulfilled: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-slate-200 text-slate-700',
}

export function MyBookingsPage() {
  const { session } = useAuth()
  const [rows, setRows] = useState<Booking[]>([])
  const { pushToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!session) return
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('booking_requests')
      .select('id,reference,status,start_date,end_date,created_at,shops(name),resorts(name)')
      .order('created_at', { ascending: false })

    if (error) { setError(error.message); pushToast('Failed to load bookings', 'error'); logError('Load bookings failed', error.message) }
    else setRows((data ?? []) as unknown as Booking[])

    setLoading(false)
  }, [session, pushToast])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load()
  }, [load])

  const cancelBooking = async (id: string) => {
    setError('')
    const { error } = await supabase
      .from('booking_requests')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .eq('status', 'pending')

    if (error) { setError(error.message); pushToast('Failed to load bookings', 'error'); logError('Load bookings failed', error.message) }
    else await load()
  }

  if (!session) {
    return (
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">My Bookings</h2>
        <p className="rounded-md bg-amber-50 p-3 text-amber-800">Login required to view real bookings.</p>
        {!isSupabaseConfigured() && <p className="rounded-md bg-slate-100 p-3 text-slate-700">Demo: after env setup and login, your booking history appears here with cancel actions for pending items.</p>}
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">My Bookings</h2>

      {loading && <p className="text-slate-600">Loading your requests...</p>}
      {error && <p className="rounded-md bg-red-50 p-3 text-red-700">{error}</p>}
      {!loading && rows.length === 0 && <p className="rounded-md bg-slate-100 p-3 text-slate-700">No bookings yet.</p>}

      <div className="space-y-3">
        {rows.map((b) => (
          <article key={b.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold">{b.reference}</p>
              <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusClass[b.status]}`}>{b.status}</span>
            </div>
            <p className="text-sm text-slate-700">
              {b.resorts?.name ?? 'Resort'} • {b.shops?.name ?? 'Shop'}
            </p>
            <p className="text-sm text-slate-600">
              {b.start_date} → {b.end_date}
            </p>

            {b.status === 'pending' && (
              <button
                onClick={() => void cancelBooking(b.id)}
                className="mt-3 rounded-md bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-700"
              >
                Cancel
              </button>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}

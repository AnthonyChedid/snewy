import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { supabase } from '../lib/supabase'

type ShopInfo = {
  id: string
  name: string
  resort_id: string
  resorts: { id: string; name: string; slug: string } | null
}

export function BookPage() {
  const { shopId } = useParams()
  const { session } = useAuth()

  const [shop, setShop] = useState<ShopInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [reference, setReference] = useState('')

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [gearCategory, setGearCategory] = useState<'ski' | 'snowboard'>('ski')
  const [tier, setTier] = useState<'basic' | 'standard' | 'premium'>('basic')
  const [riderLevel, setRiderLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner')

  useEffect(() => {
    if (!shopId) return

    const loadShop = async () => {
      const { data, error } = await supabase
        .from('shops')
        .select('id,name,resort_id,resorts(id,name,slug)')
        .eq('id', shopId)
        .maybeSingle()

      if (error) setError(error.message)
      else setShop(data as unknown as ShopInfo)
    }

    void loadShop()
  }, [shopId])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setReference('')

    if (!session) {
      setError('Please login first to create a booking request.')
      return
    }

    if (!shop) {
      setError('Shop not found.')
      return
    }

    setLoading(true)

    const { data, error } = await supabase
      .from('booking_requests')
      .insert({
        shop_id: shop.id,
        user_id: session.user.id,
        resort_id: shop.resort_id,
        start_date: startDate,
        end_date: endDate,
        gear_category: gearCategory,
        tier,
        rider_level: riderLevel,
      })
      .select('reference')
      .single()

    if (error) {
      setError(error.message)
    } else {
      setReference(data.reference)
    }

    setLoading(false)
  }

  return (
    <section className="mx-auto max-w-xl space-y-4">
      <h2 className="text-2xl font-semibold">Booking Request</h2>
      <p className="text-slate-600">MVP reservation request flow (full validated form arrives in Story 09).</p>

      {!session && (
        <p className="rounded-md bg-amber-50 p-3 text-amber-800">
          You need to <Link to="/login" className="underline">login</Link> before submitting.
        </p>
      )}

      {shop && (
        <p className="rounded-md bg-slate-100 p-3 text-slate-700">
          Shop: <strong>{shop.name}</strong> — Resort: <strong>{shop.resorts?.name ?? 'Unknown'}</strong>
        </p>
      )}

      <form onSubmit={submit} className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            Start date
            <input className="mt-1 w-full rounded border border-slate-300 px-2 py-1" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
          </label>
          <label className="text-sm">
            End date
            <input className="mt-1 w-full rounded border border-slate-300 px-2 py-1" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-sm">
            Gear
            <select className="mt-1 w-full rounded border border-slate-300 px-2 py-1" value={gearCategory} onChange={(e) => setGearCategory(e.target.value as 'ski' | 'snowboard')}>
              <option value="ski">Ski</option>
              <option value="snowboard">Snowboard</option>
            </select>
          </label>
          <label className="text-sm">
            Tier
            <select className="mt-1 w-full rounded border border-slate-300 px-2 py-1" value={tier} onChange={(e) => setTier(e.target.value as 'basic' | 'standard' | 'premium')}>
              <option value="basic">Basic</option>
              <option value="standard">Standard</option>
              <option value="premium">Premium</option>
            </select>
          </label>
          <label className="text-sm">
            Level
            <select className="mt-1 w-full rounded border border-slate-300 px-2 py-1" value={riderLevel} onChange={(e) => setRiderLevel(e.target.value as 'beginner' | 'intermediate' | 'advanced')}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </label>
        </div>

        <button type="submit" disabled={loading} className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60">
          {loading ? 'Submitting...' : 'Submit request'}
        </button>
      </form>

      {reference && <p className="rounded-md bg-emerald-50 p-3 text-emerald-700">Booking created. Reference: <strong>{reference}</strong></p>}
      {error && <p className="rounded-md bg-red-50 p-3 text-red-700">{error}</p>}
    </section>
  )
}

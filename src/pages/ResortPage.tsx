import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { demoPackages, demoResorts, demoShops } from '../lib/demoData'

type Resort = { id: string; name: string; slug: string }
type Shop = {
  id: string
  resort_id: string
  name: string
  address: string | null
  pickup_notes: string | null
}
type PricePackage = {
  id: string
  shop_id: string
  category: 'ski' | 'snowboard'
  tier: 'basic' | 'standard' | 'premium'
  duration: 'day' | 'weekend' | 'week'
  price_lbp: number
  price_usd: number | null
  includes: string | null
}

const tierOrder: Array<PricePackage['tier']> = ['basic', 'standard', 'premium']
const durationOrder: Array<PricePackage['duration']> = ['day', 'weekend', 'week']

export function ResortPage() {
  const { slug } = useParams()
  const [resort, setResort] = useState<Resort | null>(null)
  const [shops, setShops] = useState<Shop[]>([])
  const [packages, setPackages] = useState<PricePackage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const demoMode = !isSupabaseConfigured()

  useEffect(() => {
    if (!slug || demoMode) return

    const load = async () => {
      setLoading(true)
      setError('')

      const resortResp = await supabase
        .from('resorts')
        .select('id,name,slug')
        .eq('slug', slug)
        .maybeSingle()

      if (resortResp.error || !resortResp.data) {
        setError(resortResp.error?.message ?? 'Resort not found')
        setLoading(false)
        return
      }

      setResort(resortResp.data)

      const shopsResp = await supabase
        .from('shops')
        .select('id,resort_id,name,address,pickup_notes')
        .eq('resort_id', resortResp.data.id)
        .order('name')

      if (shopsResp.error) {
        setError(shopsResp.error.message)
        setLoading(false)
        return
      }

      const shopRows = shopsResp.data ?? []
      setShops(shopRows)

      if (shopRows.length === 0) {
        setPackages([])
        setLoading(false)
        return
      }

      const priceResp = await supabase
        .from('price_packages')
        .select('id,shop_id,category,tier,duration,price_lbp,price_usd,includes')
        .in(
          'shop_id',
          shopRows.map((s) => s.id),
        )

      if (priceResp.error) {
        setError(priceResp.error.message)
      } else {
        setPackages((priceResp.data ?? []) as PricePackage[])
      }

      setLoading(false)
    }

    void load()
  }, [slug, demoMode])

  const demoResort = demoResorts.find((r) => r.slug === slug) ?? null
  const displayResort = demoMode ? demoResort : resort
  const displayShops = demoMode && demoResort ? demoShops.filter((s) => s.resort_id === demoResort.id) : shops
  const displayPackages = demoMode ? (demoPackages as PricePackage[]) : packages

  const packagesByShop = useMemo(() => {
    const map = new Map<string, PricePackage[]>()
    for (const p of displayPackages) {
      if (!map.has(p.shop_id)) map.set(p.shop_id, [])
      map.get(p.shop_id)!.push(p)
    }
    return map
  }, [displayPackages])


  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">{displayResort ? `${displayResort.name} shops` : `Resort: ${slug}`}</h2>
      {demoMode && <p className="rounded-md bg-amber-50 p-3 text-amber-800">Demo mode: showing sample shops and prices.</p>}
      {loading && <p className="text-slate-600">Loading shops and pricing...</p>}
      {error && <p className="rounded-md bg-red-50 p-3 text-red-700">{error}</p>}
      {!loading && !error && displayShops.length === 0 && <p className="rounded-md bg-slate-100 p-3 text-slate-700">No shops yet.</p>}

      <div className="space-y-4">
        {displayShops.map((shop) => {
          const rows = packagesByShop.get(shop.id) ?? []
          return (
            <article key={shop.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-semibold">{shop.name}</h3>
                  <p className="text-sm text-slate-600">{shop.address || 'Address unavailable'}</p>
                  {shop.pickup_notes && <p className="text-sm text-slate-500">Pickup: {shop.pickup_notes}</p>}
                </div>
                <Link
                  to={`/book/${shop.id}`}
                  className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
                >
                  Reserve
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="border border-slate-200 px-3 py-2 text-left">Category</th>
                      <th className="border border-slate-200 px-3 py-2 text-left">Tier</th>
                      <th className="border border-slate-200 px-3 py-2 text-left">Day</th>
                      <th className="border border-slate-200 px-3 py-2 text-left">Weekend</th>
                      <th className="border border-slate-200 px-3 py-2 text-left">Week</th>
                      <th className="border border-slate-200 px-3 py-2 text-left">Includes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(['ski', 'snowboard'] as const).flatMap((category) =>
                      tierOrder.map((tier) => {
                        const byCombo = rows.filter((r) => r.category === category && r.tier === tier)
                        const findDuration = (duration: PricePackage['duration']) =>
                          byCombo.find((r) => r.duration === duration)
                        return (
                          <tr key={`${shop.id}-${category}-${tier}`}>
                            <td className="border border-slate-200 px-3 py-2 capitalize">{category}</td>
                            <td className="border border-slate-200 px-3 py-2 capitalize">{tier}</td>
                            {durationOrder.map((duration) => {
                              const p = findDuration(duration)
                              return (
                                <td key={duration} className="border border-slate-200 px-3 py-2">
                                  {p ? (
                                    <>
                                      <div>{p.price_lbp.toLocaleString()} LBP</div>
                                      {p.price_usd != null && <div className="text-slate-500">${p.price_usd}</div>}
                                    </>
                                  ) : (
                                    '-'
                                  )}
                                </td>
                              )
                            })}
                            <td className="border border-slate-200 px-3 py-2">{byCombo[0]?.includes ?? '-'}</td>
                          </tr>
                        )
                      }),
                    )}
                  </tbody>
                </table>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

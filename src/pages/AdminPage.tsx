import { useEffect, useState } from 'react'
import { useAuth } from '../auth/useAuth'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { useToast } from '../components/useToast'
import { logError } from '../lib/logger'

type Resort = { id: string; name: string; slug: string; is_active: boolean }
type Shop = { id: string; name: string; resort_id: string; whatsapp: string | null; is_active: boolean; resorts: { name: string } | { name: string }[] | null }
type Price = {
  id: string
  shop_id: string
  category: 'ski' | 'snowboard'
  tier: 'basic' | 'standard' | 'premium'
  duration: 'day' | 'weekend' | 'week'
  price_lbp: number
  is_active: boolean
  shops: { name: string } | null
}

export function AdminPage() {
  const { session } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const { pushToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [resorts, setResorts] = useState<Resort[]>([])
  const [shops, setShops] = useState<Shop[]>([])
  const [prices, setPrices] = useState<Price[]>([])

  const [newResortName, setNewResortName] = useState('')
  const [newResortSlug, setNewResortSlug] = useState('')

  const [newShopResortId, setNewShopResortId] = useState('')
  const [newShopName, setNewShopName] = useState('')
  const [newShopWhatsapp, setNewShopWhatsapp] = useState('')

  const [newPriceShopId, setNewPriceShopId] = useState('')
  const [newPriceCategory, setNewPriceCategory] = useState<'ski' | 'snowboard'>('ski')
  const [newPriceTier, setNewPriceTier] = useState<'basic' | 'standard' | 'premium'>('basic')
  const [newPriceDuration, setNewPriceDuration] = useState<'day' | 'weekend' | 'week'>('day')
  const [newPriceLbp, setNewPriceLbp] = useState('')

  const load = async () => {
    if (!session) return
    setLoading(true)
    setError('')

    const { data: adminRow } = await supabase
      .from('app_admins')
      .select('user_id')
      .eq('user_id', session.user.id)
      .maybeSingle()

    const admin = Boolean(adminRow)
    setIsAdmin(admin)

    if (!admin) {
      setLoading(false)
      return
    }

    const [r1, r2, r3] = await Promise.all([
      supabase.from('resorts').select('id,name,slug,is_active').order('name'),
      supabase.from('shops').select('id,name,resort_id,whatsapp,is_active,resorts(name)').order('name'),
      supabase
        .from('price_packages')
        .select('id,shop_id,category,tier,duration,price_lbp,is_active,shops(name)')
        .order('price_lbp'),
    ])

    if (r1.error || r2.error || r3.error) {
      setError(r1.error?.message ?? r2.error?.message ?? r3.error?.message ?? 'Failed loading admin data')
      pushToast('Failed to load admin data', 'error')
      logError('Admin load failed', r1.error?.message ?? r2.error?.message ?? r3.error?.message)
    } else {
      setResorts((r1.data ?? []) as Resort[])
      setShops((r2.data ?? []) as Shop[])
      setPrices((r3.data ?? []) as unknown as Price[])
      if (!newShopResortId && (r1.data?.[0] as Resort | undefined)?.id) setNewShopResortId((r1.data?.[0] as Resort).id)
      if (!newPriceShopId && (r2.data?.[0] as Shop | undefined)?.id) setNewPriceShopId((r2.data?.[0] as Shop).id)
    }

    setLoading(false)
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user.id])

  const createResort = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const { error } = await supabase.from('resorts').insert({ name: newResortName, slug: newResortSlug })
    if (error) { setError(error.message); pushToast('Create package failed', 'error'); logError('Create package failed', error.message) }
    else {
      setNewResortName('')
      setNewResortSlug('')
      await load()
    }
  }

  const createShop = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const { error } = await supabase
      .from('shops')
      .insert({ resort_id: newShopResortId, name: newShopName, whatsapp: newShopWhatsapp || null })
    if (error) { setError(error.message); pushToast('Create shop failed', 'error'); logError('Create shop failed', error.message) }
    else {
      setNewShopName('')
      setNewShopWhatsapp('')
      await load()
    }
  }

  const createPrice = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const { error } = await supabase.from('price_packages').insert({
      shop_id: newPriceShopId,
      category: newPriceCategory,
      tier: newPriceTier,
      duration: newPriceDuration,
      price_lbp: Number(newPriceLbp),
      includes: newPriceCategory === 'ski' ? 'boots+skis+poles' : 'boots+board',
    })
    if (error) { setError(error.message); pushToast('Create package failed', 'error'); logError('Create package failed', error.message) }
    else {
      setNewPriceLbp('')
      await load()
    }
  }

  if (!session) {
    return (
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Admin Portal</h2>
        <p className="rounded-md bg-amber-50 p-3 text-amber-800">Login required with an admin account.</p>
        {!isSupabaseConfigured() && <p className="rounded-md bg-slate-100 p-3 text-slate-700">Demo: this page manages resorts, shops, and packages once env/login are configured.</p>}
      </section>
    )
  }


  const resortLabel = (r: Shop['resorts']) => {
    if (!r) return 'Unknown'
    if (Array.isArray(r)) return r[0]?.name ?? 'Unknown'
    return r.name
  }

  if (loading) return <p className="text-slate-600">Loading admin data...</p>

  if (!isAdmin) return <p className="rounded-md bg-amber-50 p-3 text-amber-800">Admin access required.</p>

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold">Admin Portal</h2>
      {error && <p className="rounded-md bg-red-50 p-3 text-red-700">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-lg font-medium">Resorts</h3>
          <form onSubmit={createResort} className="space-y-2">
            <input className="w-full rounded border border-slate-300 px-2 py-1" placeholder="Resort name" value={newResortName} onChange={(e) => setNewResortName(e.target.value)} required />
            <input className="w-full rounded border border-slate-300 px-2 py-1" placeholder="slug (e.g. mzaar)" value={newResortSlug} onChange={(e) => setNewResortSlug(e.target.value)} required />
            <button className="rounded bg-slate-900 px-3 py-2 text-sm text-white">Add resort</button>
          </form>
          <ul className="mt-3 list-inside list-disc text-sm text-slate-700">
            {resorts.map((r) => (
              <li key={r.id}>
                {r.name} ({r.slug})
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-lg font-medium">Shops</h3>
          <form onSubmit={createShop} className="space-y-2">
            <select className="w-full rounded border border-slate-300 px-2 py-1" value={newShopResortId} onChange={(e) => setNewShopResortId(e.target.value)}>
              {resorts.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <input className="w-full rounded border border-slate-300 px-2 py-1" placeholder="Shop name" value={newShopName} onChange={(e) => setNewShopName(e.target.value)} required />
            <input className="w-full rounded border border-slate-300 px-2 py-1" placeholder="WhatsApp (+961...)" value={newShopWhatsapp} onChange={(e) => setNewShopWhatsapp(e.target.value)} />
            <button className="rounded bg-slate-900 px-3 py-2 text-sm text-white">Add shop</button>
          </form>
          <ul className="mt-3 list-inside list-disc text-sm text-slate-700">
            {shops.slice(0, 12).map((s) => (
              <li key={s.id}>
                {s.name} — {resortLabel(s.resorts)}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-lg font-medium">Price packages</h3>
          <form onSubmit={createPrice} className="space-y-2">
            <select className="w-full rounded border border-slate-300 px-2 py-1" value={newPriceShopId} onChange={(e) => setNewPriceShopId(e.target.value)}>
              {shops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-3 gap-2">
              <select className="rounded border border-slate-300 px-2 py-1" value={newPriceCategory} onChange={(e) => setNewPriceCategory(e.target.value as 'ski' | 'snowboard')}>
                <option value="ski">ski</option>
                <option value="snowboard">snowboard</option>
              </select>
              <select className="rounded border border-slate-300 px-2 py-1" value={newPriceTier} onChange={(e) => setNewPriceTier(e.target.value as 'basic' | 'standard' | 'premium')}>
                <option value="basic">basic</option>
                <option value="standard">standard</option>
                <option value="premium">premium</option>
              </select>
              <select className="rounded border border-slate-300 px-2 py-1" value={newPriceDuration} onChange={(e) => setNewPriceDuration(e.target.value as 'day' | 'weekend' | 'week')}>
                <option value="day">day</option>
                <option value="weekend">weekend</option>
                <option value="week">week</option>
              </select>
            </div>
            <input className="w-full rounded border border-slate-300 px-2 py-1" type="number" placeholder="Price LBP" value={newPriceLbp} onChange={(e) => setNewPriceLbp(e.target.value)} required />
            <button className="rounded bg-slate-900 px-3 py-2 text-sm text-white">Add package</button>
          </form>
          <ul className="mt-3 list-inside list-disc text-sm text-slate-700">
            {prices.slice(0, 12).map((p) => (
              <li key={p.id}>
                {p.shops?.name ?? 'Shop'} — {p.category}/{p.tier}/{p.duration}: {p.price_lbp.toLocaleString()} LBP
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

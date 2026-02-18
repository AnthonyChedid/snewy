import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useParams } from 'react-router-dom'
import { z } from 'zod'
import { useAuth } from '../auth/useAuth'
import { supabase } from '../lib/supabase'
import { buildWhatsappLink, formatBookingWhatsappMessage } from '../lib/whatsapp'
import { useToast } from '../components/useToast'
import { logError, logInfo } from '../lib/logger'

type ShopInfo = {
  id: string
  name: string
  resort_id: string
  whatsapp: string | null
  phone: string | null
  resorts: { id: string; name: string; slug: string } | null
}

type PricePackage = {
  id: string
  shop_id: string
  category: 'ski' | 'snowboard'
  tier: 'basic' | 'standard' | 'premium'
  duration: 'day' | 'weekend' | 'week'
}

const schema = z
  .object({
    start_date: z.string().min(1, 'Start date is required'),
    end_date: z.string().min(1, 'End date is required'),
    gear_category: z.enum(['ski', 'snowboard']),
    tier: z.enum(['basic', 'standard', 'premium']),
    rider_level: z.enum(['beginner', 'intermediate', 'advanced']),
    height_cm: z
      .string()
      .min(1, 'Height is required')
      .refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 90 && Number(v) <= 240, 'Height must be 90-240 cm'),
    weight_kg: z
      .string()
      .min(1, 'Weight is required')
      .refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 20 && Number(v) <= 220, 'Weight must be 20-220 kg'),
    shoe_eu: z.string().min(1, 'Shoe size is required').max(6, 'Shoe size too long'),
    notes: z.string().max(500, 'Max 500 chars').optional(),
  })
  .refine((data) => new Date(data.end_date) >= new Date(data.start_date), {
    message: 'End date must be on or after start date',
    path: ['end_date'],
  })

type BookingFormValues = z.infer<typeof schema>

export function BookPage() {
  const { shopId } = useParams()
  const { session } = useAuth()

  const [shop, setShop] = useState<ShopInfo | null>(null)
  const { pushToast } = useToast()
  const [packages, setPackages] = useState<PricePackage[]>([])
  const [loadingShop, setLoadingShop] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [reference, setReference] = useState('')
  const [lastSubmitted, setLastSubmitted] = useState<BookingFormValues | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm<BookingFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      gear_category: 'ski',
      tier: 'basic',
      rider_level: 'beginner',
      shoe_eu: '',
      notes: '',
    },
  })

  // React Hook Form watch is expected here
  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedCategory = watch('gear_category')

  useEffect(() => {
    if (!shopId) return

    const load = async () => {
      setLoadingShop(true)
      setSubmitError('')

      const { data: shopData, error: shopError } = await supabase
        .from('shops')
        .select('id,name,resort_id,whatsapp,phone,resorts(id,name,slug)')
        .eq('id', shopId)
        .maybeSingle()

      if (shopError || !shopData) {
        setSubmitError(shopError?.message ?? 'Shop not found')
      pushToast('Shop not found', 'error')
        setLoadingShop(false)
        return
      }

      setShop(shopData as unknown as ShopInfo)

      const { data: pkgData, error: pkgError } = await supabase
        .from('price_packages')
        .select('id,shop_id,category,tier,duration')
        .eq('shop_id', shopId)

      if (pkgError) {
        setSubmitError(pkgError.message)
      } else {
        setPackages((pkgData ?? []) as PricePackage[])
      }

      setLoadingShop(false)
    }

    void load()
  }, [shopId, pushToast])

  const availableTiers = useMemo(() => {
    const set = new Set(
      packages.filter((p) => p.category === selectedCategory).map((p) => p.tier),
    )
    const ordered: Array<'basic' | 'standard' | 'premium'> = ['basic', 'standard', 'premium']
    return ordered.filter((t) => set.has(t))
  }, [packages, selectedCategory])

  const onSubmit = async (values: BookingFormValues) => {
    setSubmitError('')
    setReference('')

    if (!session) {
      setSubmitError('Please login first to create a booking request.')
      return
    }
    if (!shop) {
      setSubmitError('Shop not found.')
      return
    }

    const { data, error } = await supabase
      .from('booking_requests')
      .insert({
        shop_id: shop.id,
        user_id: session.user.id,
        resort_id: shop.resort_id,
        start_date: values.start_date,
        end_date: values.end_date,
        gear_category: values.gear_category,
        tier: values.tier,
        rider_level: values.rider_level,
        height_cm: Number(values.height_cm),
        weight_kg: Number(values.weight_kg),
        shoe_eu: values.shoe_eu,
        notes: values.notes || null,
      })
      .select('reference')
      .single()

    if (error) {
      setSubmitError(error.message)
      pushToast('Booking submission failed', 'error')
      logError('Booking submit failed', error.message)
      return
    }

    setReference(data.reference)
    pushToast('Booking request created', 'success')
    logInfo('Booking created', data.reference)
    setLastSubmitted(values)
    reset()
  }

  const whatsappLink = useMemo(() => {
    if (!shop?.whatsapp || !reference || !lastSubmitted) return null

    const text = formatBookingWhatsappMessage({
      reference,
      shopName: shop.name,
      startDate: lastSubmitted.start_date,
      endDate: lastSubmitted.end_date,
      gearCategory: lastSubmitted.gear_category,
      tier: lastSubmitted.tier,
      riderLevel: lastSubmitted.rider_level,
      heightCm: Number(lastSubmitted.height_cm),
      weightKg: Number(lastSubmitted.weight_kg),
      shoeEu: lastSubmitted.shoe_eu,
      notes: lastSubmitted.notes,
      customerEmail: session?.user.email,
    })

    return buildWhatsappLink(shop.whatsapp, text)
  }, [lastSubmitted, reference, session?.user.email, shop])

  return (
    <section className="mx-auto max-w-2xl space-y-4">
      <h2 className="text-2xl font-semibold">Booking Request</h2>

      {!session && (
        <p className="rounded-md bg-amber-50 p-3 text-amber-800">
          You need to <Link to="/login" className="underline">login</Link> before submitting.
        </p>
      )}

      {loadingShop && <p className="text-slate-600">Loading shop...</p>}

      {shop && (
        <p className="rounded-md bg-slate-100 p-3 text-slate-700">
          Shop: <strong>{shop.name}</strong> — Resort: <strong>{shop.resorts?.name ?? 'Unknown'}</strong>
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            Start date
            <input className="mt-1 w-full rounded border border-slate-300 px-2 py-1" type="date" {...register('start_date')} />
            {errors.start_date && <span className="text-xs text-red-600">{errors.start_date.message}</span>}
          </label>
          <label className="text-sm">
            End date
            <input className="mt-1 w-full rounded border border-slate-300 px-2 py-1" type="date" {...register('end_date')} />
            {errors.end_date && <span className="text-xs text-red-600">{errors.end_date.message}</span>}
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-sm">
            Gear
            <select className="mt-1 w-full rounded border border-slate-300 px-2 py-1" {...register('gear_category')}>
              <option value="ski">Ski</option>
              <option value="snowboard">Snowboard</option>
            </select>
          </label>
          <label className="text-sm">
            Tier
            <select className="mt-1 w-full rounded border border-slate-300 px-2 py-1" {...register('tier')}>
              {availableTiers.length > 0 ? (
                availableTiers.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))
              ) : (
                <>
                  <option value="basic">basic</option>
                  <option value="standard">standard</option>
                  <option value="premium">premium</option>
                </>
              )}
            </select>
          </label>
          <label className="text-sm">
            Level
            <select className="mt-1 w-full rounded border border-slate-300 px-2 py-1" {...register('rider_level')}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-sm">
            Height (cm)
            <input className="mt-1 w-full rounded border border-slate-300 px-2 py-1" type="number" {...register('height_cm')} />
            {errors.height_cm && <span className="text-xs text-red-600">{errors.height_cm.message}</span>}
          </label>
          <label className="text-sm">
            Weight (kg)
            <input className="mt-1 w-full rounded border border-slate-300 px-2 py-1" type="number" {...register('weight_kg')} />
            {errors.weight_kg && <span className="text-xs text-red-600">{errors.weight_kg.message}</span>}
          </label>
          <label className="text-sm">
            Shoe size (EU)
            <input className="mt-1 w-full rounded border border-slate-300 px-2 py-1" type="text" placeholder="42" {...register('shoe_eu')} />
            {errors.shoe_eu && <span className="text-xs text-red-600">{errors.shoe_eu.message}</span>}
          </label>
        </div>

        <label className="text-sm">
          Notes (optional)
          <textarea className="mt-1 w-full rounded border border-slate-300 px-2 py-1" rows={3} {...register('notes')} />
          {errors.notes && <span className="text-xs text-red-600">{errors.notes.message}</span>}
        </label>

        <button type="submit" disabled={isSubmitting} className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60">
          {isSubmitting ? 'Submitting...' : 'Submit request'}
        </button>
      </form>

      {reference && (
        <div className="space-y-2 rounded-md bg-emerald-50 p-3 text-emerald-800">
          <p>
            Booking created. Reference: <strong>{reference}</strong>
          </p>
          {whatsappLink ? (
            <a href={whatsappLink} target="_blank" rel="noreferrer" className="inline-block rounded-md bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-800">
              Send booking to shop on WhatsApp
            </a>
          ) : (
            <p className="text-sm">Shop WhatsApp not available. Use phone: {shop?.phone ?? 'N/A'}</p>
          )}
        </div>
      )}

      {submitError && <p className="rounded-md bg-red-50 p-3 text-red-700">{submitError}</p>}
    </section>
  )
}

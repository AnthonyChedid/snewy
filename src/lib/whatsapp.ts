export type BookingWhatsappPayload = {
  reference: string
  shopName: string
  startDate: string
  endDate: string
  gearCategory: 'ski' | 'snowboard'
  tier: 'basic' | 'standard' | 'premium'
  riderLevel: 'beginner' | 'intermediate' | 'advanced'
  heightCm: number
  weightKg: number
  shoeEu: string
  notes?: string | null
  customerEmail?: string | null
}

export function formatBookingWhatsappMessage(payload: BookingWhatsappPayload) {
  return [
    'New Snewy Booking Request',
    `Reference: ${payload.reference}`,
    `Shop: ${payload.shopName}`,
    `Dates: ${payload.startDate} → ${payload.endDate}`,
    `Gear: ${payload.gearCategory} (${payload.tier})`,
    `Level: ${payload.riderLevel}`,
    `Sizes: ${payload.heightCm}cm / ${payload.weightKg}kg / EU ${payload.shoeEu}`,
    `Customer: ${payload.customerEmail ?? 'N/A'}`,
    `Notes: ${payload.notes?.trim() ? payload.notes : 'None'}`,
  ].join('\n')
}

export function buildWhatsappLink(phone: string, text: string) {
  const digits = phone.replace(/\D/g, '')
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
}

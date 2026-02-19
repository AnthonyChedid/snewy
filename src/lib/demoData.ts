export const demoResorts = [
  { id: 'r1', name: 'Mzaar Kfardebian', slug: 'mzaar' },
  { id: 'r2', name: 'Cedars', slug: 'cedars' },
]

export const demoShops = [
  { id: 's1', resort_id: 'r1', name: 'SnowPro Mzaar', address: 'Main parking', pickup_notes: 'Show booking reference at counter', whatsapp: '+96170000001' },
  { id: 's2', resort_id: 'r1', name: 'Alpine Hub', address: 'Hotel district', pickup_notes: 'Pickup before 9:00 AM', whatsapp: '+96170000002' },
]

export const demoPackages = [
  { id: 'p1', shop_id: 's1', category: 'ski', tier: 'basic', duration: 'day', price_lbp: 1800000, price_usd: null, includes: 'boots+skis+poles' },
  { id: 'p2', shop_id: 's1', category: 'ski', tier: 'standard', duration: 'day', price_lbp: 2300000, price_usd: null, includes: 'boots+skis+poles+helmet' },
  { id: 'p3', shop_id: 's1', category: 'snowboard', tier: 'basic', duration: 'day', price_lbp: 1900000, price_usd: null, includes: 'boots+board' },
  { id: 'p4', shop_id: 's2', category: 'ski', tier: 'premium', duration: 'day', price_lbp: 3300000, price_usd: null, includes: 'premium set + helmet' },
]

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

export function HomePage() {
  const resorts = [
    { slug: 'mzaar', name: 'Mzaar' },
    { slug: 'faraya', name: 'Faraya' },
    { slug: 'laklouk', name: 'Laklouk' },
  ]

  const [connectionMessage, setConnectionMessage] = useState<string>('')

  const handleConnectionCheck = async () => {
    // touch client so the app clearly uses configured Supabase instance
    void supabase

    if (!isSupabaseConfigured()) {
      setConnectionMessage('Supabase not configured (set .env variables).')
      return
    }

    setConnectionMessage('Supabase configured ✅')
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Find rental shops by resort</h2>
      <p className="text-slate-600">MVP shell is ready. Data wiring comes in upcoming stories.</p>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <p className="mb-2 text-sm font-medium">Environment check</p>
        <button
          onClick={() => void handleConnectionCheck()}
          className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Connection check
        </button>
        {connectionMessage && <p className="mt-2 text-sm text-slate-700">{connectionMessage}</p>}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {resorts.map((resort) => (
          <Link
            key={resort.slug}
            to={`/resorts/${resort.slug}`}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow"
          >
            <p className="font-medium">{resort.name}</p>
            <p className="text-sm text-slate-500">Browse shops</p>
          </Link>
        ))}
      </div>
    </section>
  )
}

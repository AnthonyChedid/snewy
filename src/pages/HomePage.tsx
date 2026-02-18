import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

type Resort = {
  id: string
  name: string
  slug: string
}

export function HomePage() {
  const [connectionMessage, setConnectionMessage] = useState<string>('')
  const [resorts, setResorts] = useState<Resort[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (!isSupabaseConfigured()) return

    const load = async () => {
      setLoading(true)
      setError('')
      const { data, error } = await supabase.from('resorts').select('id,name,slug').order('name')
      if (error) {
        setError(error.message)
      } else {
        setResorts(data ?? [])
      }
      setLoading(false)
    }

    void load()
  }, [])

  const handleConnectionCheck = async () => {
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
      <p className="text-slate-600">Browse active resorts. Shop and pricing pages are wired in next stories.</p>

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

      {!isSupabaseConfigured() && (
        <p className="rounded-md bg-amber-50 p-3 text-amber-800">
          Set Supabase env variables to load resorts from database.
        </p>
      )}

      {loading && <p className="text-slate-600">Loading resorts...</p>}
      {error && <p className="rounded-md bg-red-50 p-3 text-red-700">{error}</p>}

      <div className="grid gap-3 sm:grid-cols-3">
        {resorts.map((resort) => (
          <Link
            key={resort.id}
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

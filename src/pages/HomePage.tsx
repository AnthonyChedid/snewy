import { Link } from 'react-router-dom'

export function HomePage() {
  const resorts = [
    { slug: 'mzaar', name: 'Mzaar' },
    { slug: 'faraya', name: 'Faraya' },
    { slug: 'laklouk', name: 'Laklouk' },
  ]

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Find rental shops by resort</h2>
      <p className="text-slate-600">MVP shell is ready. Data wiring comes in upcoming stories.</p>

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

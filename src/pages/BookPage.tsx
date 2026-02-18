import { useParams } from 'react-router-dom'

export function BookPage() {
  const { shopId } = useParams()

  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-semibold">Booking Form</h2>
      <p className="text-slate-600">Shop ID: {shopId}</p>
      <p className="rounded-md bg-blue-50 p-3 text-blue-800">Placeholder — validated booking form comes in Story 09.</p>
    </section>
  )
}

import { useParams } from 'react-router-dom'

export function ResortPage() {
  const { slug } = useParams()

  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-semibold">Resort: {slug}</h2>
      <p className="rounded-md bg-amber-50 p-3 text-amber-800">Placeholder — shop listing and pricing table will be implemented in Story 06.</p>
    </section>
  )
}

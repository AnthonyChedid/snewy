import type { ReactElement } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'

export function RequireAuth({ children }: { children: ReactElement }) {
  const { session, loading } = useAuth()
  const location = useLocation()

  if (loading) return <p className="text-slate-600">Checking session...</p>
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />

  return children
}

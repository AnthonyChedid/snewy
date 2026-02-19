import { lazy, Suspense } from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth/useAuth'
import { RequireAuth } from './auth/RequireAuth'

const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })))
const ResortPage = lazy(() => import('./pages/ResortPage').then((m) => ({ default: m.ResortPage })))
const BookPage = lazy(() => import('./pages/BookPage').then((m) => ({ default: m.BookPage })))
const MyBookingsPage = lazy(() => import('./pages/MyBookingsPage').then((m) => ({ default: m.MyBookingsPage })))
const ShopPortalPage = lazy(() => import('./pages/ShopPortalPage').then((m) => ({ default: m.ShopPortalPage })))
const AdminPage = lazy(() => import('./pages/AdminPage').then((m) => ({ default: m.AdminPage })))
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })))

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/resorts/mzaar', label: 'Resort' },
  { to: '/book/s1', label: 'Book' },
  { to: '/me', label: 'My Bookings' },
  { to: '/shop', label: 'Shop Portal' },
  { to: '/admin', label: 'Admin' },
]

function RouteLoading() {
  return <p className="rounded-md bg-white p-4 text-sm text-slate-600">Loading page…</p>
}

function NotFoundPage() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold">Page not found</h2>
      <p className="mt-2 text-slate-600">Try going back to Home and selecting a resort.</p>
      <NavLink to="/" className="mt-4 inline-block rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700">
        Go Home
      </NavLink>
    </section>
  )
}

export default function App() {
  const { session, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold">Snewy — Lebanon Ski Rental Aggregator</h1>
          <div>
            {session ? (
              <button
                onClick={() => void signOut()}
                className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
              >
                Logout
              </button>
            ) : (
              <NavLink to="/login" className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700">
                Login
              </NavLink>
            )}
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl flex-wrap gap-2 px-4 pb-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Suspense fallback={<RouteLoading />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/resorts/:slug" element={<ResortPage />} />
            <Route path="/book/:shopId" element={<BookPage />} />
            <Route
              path="/me"
              element={
                <RequireAuth>
                  <MyBookingsPage />
                </RequireAuth>
              }
            />
            <Route path="/shop" element={<ShopPortalPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  )
}

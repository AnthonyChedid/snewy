import { NavLink, Route, Routes } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { ResortPage } from './pages/ResortPage'
import { BookPage } from './pages/BookPage'
import { MyBookingsPage } from './pages/MyBookingsPage'
import { ShopPortalPage } from './pages/ShopPortalPage'
import { AdminPage } from './pages/AdminPage'
import { LoginPage } from './pages/LoginPage'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/resorts/mzaar', label: 'Resort' },
  { to: '/book/demo-shop-id', label: 'Book' },
  { to: '/me', label: 'My Bookings' },
  { to: '/shop', label: 'Shop Portal' },
  { to: '/admin', label: 'Admin' },
  { to: '/login', label: 'Login' },
]

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold">Snewy — Lebanon Ski Rental Aggregator</h1>
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
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/resorts/:slug" element={<ResortPage />} />
          <Route path="/book/:shopId" element={<BookPage />} />
          <Route path="/me" element={<MyBookingsPage />} />
          <Route path="/shop" element={<ShopPortalPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </main>
    </div>
  )
}

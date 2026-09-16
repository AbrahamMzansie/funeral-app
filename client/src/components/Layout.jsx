import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: HomeIcon },
  { to: '/members', label: 'Members', icon: UsersIcon },
  { to: '/funerals', label: 'Funerals', icon: HeartIcon },
]

export default function Layout() {
  const { admin, logout } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="px-6 py-5">
          <p className="text-lg font-bold text-[var(--color-brand)]">Burial Society Fund</p>
          <p className="text-xs text-slate-400">Committee dashboard</p>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-[var(--color-brand-light)] text-[var(--color-brand-dark)]'
                    : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-200 p-4">
          <p className="truncate text-sm font-medium text-slate-700">{admin?.name}</p>
          <p className="truncate text-xs text-slate-400">{admin?.email}</p>
          <button
            onClick={logout}
            className="mt-3 w-full rounded-lg border border-slate-200 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Log out
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          <p className="text-base font-bold text-[var(--color-brand)]">Burial Society Fund</p>
          <button onClick={logout} className="text-sm font-medium text-slate-500">
            Log out
          </button>
        </header>

        <main className="flex-1 overflow-y-auto px-4 pb-24 pt-4 md:px-8 md:pb-8 md:pt-6">
          <Outlet />
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium ${
                  isActive ? 'text-[var(--color-brand)]' : 'text-slate-400'
                }`
              }
            >
              <item.icon className="h-6 w-6" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}

function HomeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M3 11.5 12 4l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function UsersIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" strokeLinecap="round" />
      <circle cx="17" cy="9" r="2.6" />
      <path d="M15.5 14.2c2.9.4 5 2.5 5 5.8" strokeLinecap="round" />
    </svg>
  )
}

function HeartIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path
        d="M12 20.5S3.5 15.4 2.3 10.5C1.4 6.8 3.9 4.1 7 4.1c2 0 3.8 1.1 5 2.8 1.2-1.7 3-2.8 5-2.8 3.1 0 5.6 2.7 4.7 6.4-1.2 4.9-9.7 10-9.7 10Z"
        strokeLinejoin="round"
      />
    </svg>
  )
}

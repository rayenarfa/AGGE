import { Link } from 'react-router-dom';
import { primaryNav, footerNav } from '../../data/navigation';
import { useAuth } from '../../hooks/useAuth';

export default function Header() {
  const { user, logout, loading } = useAuth();
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link to="/" className="flex shrink-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500 font-bold text-slate-950">
            A
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight text-white">AGGE</p>
            <p className="hidden text-xs text-slate-400 sm:block">Geoscience & Engineering</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {primaryNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          {loading ? (
            <div className="h-9 w-20 animate-pulse rounded-lg bg-slate-800" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <Link to="/dashboard" className="hidden text-sm text-slate-300 transition hover:text-emerald-400 sm:inline-block">
                Hi, <strong className="text-white">{user.firstName}</strong>
              </Link>
              {['ADMIN', 'SUPER_ADMIN', 'EDITOR', 'EVENT_MANAGER'].includes(user.role) && (
                <Link
                  to="/admin"
                  className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-emerald-500/50 hover:bg-slate-700"
                >
                  Admin Portal
                </Link>
              )}
              <button
                onClick={logout}
                className="rounded-lg border border-slate-800 px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:border-red-500/30 hover:bg-red-950/20 hover:text-red-400 cursor-pointer"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-emerald-500/50 sm:inline-flex"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500"
              >
                Join AGGE
              </Link>
            </>
          )}
        </div>
      </div>

      <nav className="border-t border-slate-800/80 lg:hidden">
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2">
          {primaryNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="shrink-0 rounded-lg px-3 py-1.5 text-xs text-slate-400 transition hover:bg-slate-800 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-900/50">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-lg font-semibold text-white">AGGE</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            Global community advancing geoscience knowledge, innovation, and collaboration.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Explore</p>
          <ul className="mt-3 space-y-2">
            {footerNav.explore.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="text-sm text-slate-400 transition hover:text-emerald-400">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Membership</p>
          <ul className="mt-3 space-y-2">
            {footerNav.membership.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="text-sm text-slate-400 transition hover:text-emerald-400">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Legal</p>
          <ul className="mt-3 space-y-2">
            {footerNav.legal.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="text-sm text-slate-400 transition hover:text-emerald-400">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} AGGE. Structure preview — content is placeholder data.
      </div>
    </footer>
  );
}

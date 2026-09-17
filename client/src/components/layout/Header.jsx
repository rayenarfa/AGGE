import { useState } from 'react';
import { Link } from 'react-router-dom';
import { primaryNav, footerNav } from '../../data/navigation';
import { useAuth } from '../../hooks/useAuth';

export default function Header() {
  const { user, logout, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const headerClass = 'sticky top-0 z-50 transition-all duration-300 bg-navy/95 backdrop-blur shadow-lg border-b border-navy-light';

  const linkClass = 'text-white hover:text-sand font-medium uppercase tracking-wider text-xs px-3 py-2 transition';

  return (
    <>
      <header className={headerClass}>
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <img
              src="/logo.png"
              alt="AGGE Logo"
              className="h-11 transition-all object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-0.5 lg:flex">
            {primaryNav.map((item) => (
              <Link key={item.to} to={item.to} className={linkClass}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-3">
            {loading ? (
              <div className="h-9 w-20 animate-pulse rounded-lg bg-navy-mid" />
            ) : user ? (
              <div className="flex items-center gap-3">
                {/* Mobile direct profile icon */}
                <Link
                  to="/dashboard"
                  className="text-sand hover:text-white text-xl p-1 lg:hidden"
                  aria-label="My Profile"
                  title="My Profile Dashboard"
                >
                  <i className="fas fa-user-circle" />
                </Link>

                <Link to="/dashboard" className="hidden text-xs text-white/90 hover:text-sand transition sm:inline-block">
                  Hi, <strong className="text-white font-semibold">{user.firstName}</strong>
                </Link>

                {['ADMIN', 'SUPER_ADMIN', 'EDITOR', 'EVENT_MANAGER'].includes(user.role) && (
                  <Link
                    to="/admin"
                    className="hidden sm:inline-block rounded-full bg-sage px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-sage-light hover:scale-105"
                  >
                    Admin Portal
                  </Link>
                )}

                <button
                  onClick={logout}
                  className="hidden sm:inline-block rounded-full border border-red-500/30 px-3.5 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-950/20 hover:text-red-300 cursor-pointer"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden rounded-full border border-white/45 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10 hover:scale-105 sm:inline-flex"
                >
                  Member Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-full bg-gradient-to-r from-copper to-copper-light px-5 py-2 text-xs font-semibold text-white transition hover:scale-105 shadow-md shadow-copper/35"
                >
                  Join AGGE
                </Link>
              </>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-white hover:text-sand cursor-pointer text-xl p-1"
              aria-label="Toggle menu"
            >
              <i className={mobileMenuOpen ? 'fas fa-times' : 'fas fa-bars'}></i>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-navy-mid border-t border-navy-light text-white animate-fadeIn absolute left-0 right-0 top-full shadow-2xl">
            <nav className="flex flex-col px-6 py-4 divide-y divide-navy-light">
              {primaryNav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 text-sm font-medium tracking-wide uppercase hover:text-sand block"
                >
                  {item.label}
                </Link>
              ))}

              <div className="pt-4 flex flex-col gap-3">
                {user ? (
                  <>
                    <div className="flex items-center justify-between bg-navy/80 p-3.5 rounded-2xl border border-sand/30 my-1">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-bold text-copper">Logged In Account</p>
                        <p className="text-sm font-display text-white font-bold">{user.firstName} {user.lastName}</p>
                        <p className="text-[10px] text-slate-400">{user.email}</p>
                      </div>
                      <Link
                        to="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="rounded-full bg-gradient-to-r from-copper to-copper-light px-4 py-2 text-xs font-bold text-white shadow hover:scale-105 transition"
                      >
                        My Profile
                      </Link>
                    </div>

                    {['ADMIN', 'SUPER_ADMIN', 'EDITOR', 'EVENT_MANAGER'].includes(user.role) && (
                      <Link
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="rounded-full bg-sage text-center py-2.5 text-xs font-bold text-white hover:bg-sage-light transition"
                      >
                        <i className="fas fa-cog mr-1.5" /> Admin Portal
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logout();
                      }}
                      className="rounded-full border border-red-500/30 text-center py-2.5 text-xs font-bold text-red-400 hover:bg-red-950/30 transition"
                    >
                      Log Out Account
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-full border border-white/30 text-center py-2.5 text-xs font-semibold hover:bg-white/5"
                    >
                      Member Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-full bg-gradient-to-r from-copper to-copper-light text-center py-2.5 text-xs font-semibold text-white hover:scale-105 transition"
                    >
                      Join AGGE
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}

export function Footer() {
  return (
    <footer className="bg-navy text-white/80 py-16 px-6 relative overflow-hidden border-t-8 border-sandstone">
      <div className="contour-bg opacity-15" />
      <div className="mx-auto max-w-6xl relative z-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <img
                src="/logo.png"
                alt="AGGE Logo"
                className="h-12 transition-all object-contain"
              />
              <div>
                <p className="text-md font-display tracking-wider text-white">AGGE</p>
                <p className="text-[10px] uppercase tracking-wider text-slate-400">Geophysics, Geoscience &amp; Environment</p>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-slate-400 mt-2">
              Association for Geophysics, Geoscience and Environment — advancing knowledge, innovation, and collaboration in the global geoscience community.
            </p>
            <div className="flex gap-3 pt-2">
              <a
                href="https://www.facebook.com/share/1BU57MkQVf/"
                target="_blank"
                rel="noreferrer"
                className="h-8 w-8 rounded-full border border-navy-light flex items-center justify-center hover:bg-copper hover:text-white transition"
                aria-label="Facebook"
              >
                <i className="fab fa-facebook-f text-sm"></i>
              </a>
              <a
                href="https://www.linkedin.com/company/association-of-geosciences-Geoscience & Environment-agge/"
                target="_blank"
                rel="noreferrer"
                className="h-8 w-8 rounded-full border border-navy-light flex items-center justify-center hover:bg-copper hover:text-white transition"
                aria-label="LinkedIn"
              >
                <i className="fab fa-linkedin-in text-sm"></i>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-xs uppercase font-bold tracking-widest text-sand mb-4">Explore AGGE</h4>
            <ul className="space-y-2.5">
              {footerNav.explore.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="text-xs text-slate-400 hover:text-sand hover:underline transition">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase font-bold tracking-widest text-sand mb-4">Membership</h4>
            <ul className="space-y-2.5">
              {footerNav.membership.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="text-xs text-slate-400 hover:text-sand hover:underline transition">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase font-bold tracking-widest text-sand mb-4">Contact Info</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <i className="fas fa-envelope text-sand mt-0.5" />
                <a href="mailto:info@agge.in" className="hover:text-sand">info@agge.in</a>
              </li>
              <li className="flex items-start gap-2">
                <i className="fas fa-phone text-sand mt-0.5" />
                <a href="tel:9526003346" className="hover:text-sand">+91 9526003346</a>
              </li>
              <li className="flex items-start gap-2">
                <i className="fas fa-map-marker-alt text-sand mt-0.5" />
                <span>
                  Association for Geophysics, Geoscience and Environment<br />
                  Global Network and Regional Chapters
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-navy-light mt-12 pt-6 text-center text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} Association for Geophysics, Geoscience and Environment. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link to="/legal/disclaimer" className="hover:text-sand">Disclaimer</Link>
            <span>•</span>
            <Link to="/legal/cookies" className="hover:text-sand">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

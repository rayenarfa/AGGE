import { Link } from 'react-router-dom';

export default function CtaBanner({ title, description, primaryLabel, primaryTo, secondaryLabel, secondaryTo }) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-navy-light bg-gradient-to-r from-navy to-navy-mid p-8 sm:p-10 shadow-xl text-white">
      <div className="contour-bg opacity-15" />
      <div className="relative z-10">
        <h2 className="text-2xl font-display text-white">{title}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-sand-light/85">{description}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {primaryTo && (
            <Link
              to={primaryTo}
              className="rounded-full bg-gradient-to-r from-copper to-copper-light px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition hover:scale-105 shadow-md shadow-copper/25"
            >
              {primaryLabel}
            </Link>
          )}
          {secondaryTo && (
            <Link
              to={secondaryTo}
              className="rounded-full border border-white/45 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-white/10 hover:scale-105"
            >
              {secondaryLabel}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

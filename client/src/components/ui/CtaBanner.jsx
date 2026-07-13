import { Link } from 'react-router-dom';

export default function CtaBanner({ title, description, primaryLabel, primaryTo, secondaryLabel, secondaryTo }) {
  return (
    <section className="rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/50 to-slate-900 p-8 sm:p-10">
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      <p className="mt-2 max-w-2xl text-slate-400">{description}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        {primaryTo && (
          <Link
            to={primaryTo}
            className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500"
          >
            {primaryLabel}
          </Link>
        )}
        {secondaryTo && (
          <Link
            to={secondaryTo}
            className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-500"
          >
            {secondaryLabel}
          </Link>
        )}
      </div>
    </section>
  );
}

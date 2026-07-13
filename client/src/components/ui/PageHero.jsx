export default function PageHero({ title, subtitle, badge }) {
  return (
    <div className="border-b border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 px-6 py-14">
      <div className="mx-auto max-w-6xl">
        {badge && (
          <span className="mb-4 inline-block rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-emerald-400">
            {badge}
          </span>
        )}
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-3 max-w-3xl text-lg text-slate-400">{subtitle}</p>}
      </div>
    </div>
  );
}

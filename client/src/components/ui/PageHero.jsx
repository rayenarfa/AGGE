export default function PageHero({ title, subtitle, badge }) {
  return (
    <div className="relative border-b border-navy-light bg-gradient-to-b from-navy to-navy-mid px-6 py-20 overflow-hidden text-white">
      <div className="contour-bg opacity-15" />
      <div className="mx-auto max-w-6xl relative z-10">
        {badge && (
          <span className="mb-4 inline-block rounded-full bg-sandstone/15 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-sand">
            {badge}
          </span>
        )}
        <h1 className="text-4xl font-display tracking-wide text-white sm:text-5xl">{title}</h1>
        {subtitle && <p className="mt-4 max-w-3xl text-md text-sand-light/90 leading-relaxed font-sans">{subtitle}</p>}
      </div>
    </div>
  );
}

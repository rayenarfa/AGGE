import PageHero from './PageHero';
import Breadcrumbs from './Breadcrumbs';
import SubNav from './SubNav';

export default function SectionPage({
  content,
  breadcrumbs,
  subNav,
  children,
  badge,
}) {
  if (!content) {
    return null;
  }

  return (
    <>
      <PageHero title={content.title} subtitle={content.subtitle} badge={badge} />
      <div className="mx-auto max-w-6xl px-6 py-12">
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
        {subNav && <SubNav items={subNav} />}
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="space-y-10 lg:col-span-2">
            {content.sections?.map((section) => (
              <section key={section.heading} className="space-y-3">
                <h2 className="text-2xl font-display text-navy border-b border-sandstone/30 pb-2 font-normal">
                  {section.heading}
                </h2>
                {section.body && (
                  <p className="mt-3 whitespace-pre-line leading-relaxed text-text-muted font-sans">{section.body}</p>
                )}
                {section.list && (
                  <ul className="mt-3 space-y-2 text-text-muted font-sans pl-1">
                    {section.list.map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <span className="text-copper mt-1.5 text-[8px]">
                          <i className="fas fa-circle" />
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
            {children}
          </div>
          <aside className="space-y-4">
            <div className="rounded-xl border border-sandstone/30 bg-white p-6 shadow-md shadow-navy/5">
              <h4 className="text-[10px] uppercase font-bold tracking-widest text-copper mb-2">AGGE Support</h4>
              <p className="text-sm font-semibold text-navy">Member Resources</p>
              <p className="mt-2 text-xs leading-relaxed text-text-muted">
                This page reflects the official AGGE information portal. All technical papers, downloads, and resources are available to registered members.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

import PageHero from '../ui/PageHero';
import Breadcrumbs from '../ui/Breadcrumbs';
import SubNav from '../ui/SubNav';

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
      <div className="mx-auto max-w-6xl px-6 py-10">
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
        {subNav && <SubNav items={subNav} />}
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            {content.sections?.map((section) => (
              <section key={section.heading}>
                <h2 className="text-xl font-semibold text-white">{section.heading}</h2>
                {section.body && (
                  <p className="mt-3 whitespace-pre-line leading-relaxed text-slate-400">{section.body}</p>
                )}
                {section.list && (
                  <ul className="mt-3 list-inside list-disc space-y-2 text-slate-400">
                    {section.list.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
            {children}
          </div>
          <aside className="space-y-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <p className="text-sm font-medium text-slate-300">Placeholder content</p>
              <p className="mt-2 text-sm text-slate-500">
                This page mirrors the EAGE information architecture. Real content will come from the CMS in a later phase.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

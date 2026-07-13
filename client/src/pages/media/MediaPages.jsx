import SectionPage from '../../components/ui/SectionPage';
import { journals, pageContent } from '../../data/mockContent';
import { mediaSubNav } from '../../data/navigation';

export default function MediaPage() {
  return (
    <SectionPage
      content={pageContent.media}
      subNav={mediaSubNav}
      breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Media' }]}
    />
  );
}

export function JournalsPage() {
  return (
    <SectionPage
      content={{
        title: 'Journals',
        subtitle: 'Peer-reviewed geoscience publications',
        sections: [{
          heading: 'Portfolio',
          body: 'AGGE co-publishes leading journals spanning petroleum geoscience, applied geophysics, basin research, and energy transition topics.',
        }],
      }}
      subNav={mediaSubNav}
      breadcrumbs={[
        { label: 'Home', to: '/' },
        { label: 'Media', to: '/media' },
        { label: 'Journals' },
      ]}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {journals.map((journal) => (
          <div key={journal.name} className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
            <h3 className="font-semibold text-white">{journal.name}</h3>
            <p className="mt-1 text-sm text-emerald-400">{journal.publisher}</p>
            <p className="mt-2 text-sm text-slate-400">{journal.focus}</p>
          </div>
        ))}
      </div>
    </SectionPage>
  );
}

export function NewslettersPage() {
  return (
    <SectionPage
      content={pageContent['media.newsletters']}
      subNav={mediaSubNav}
      breadcrumbs={[
        { label: 'Home', to: '/' },
        { label: 'Media', to: '/media' },
        { label: 'Newsletters' },
      ]}
    />
  );
}

export function PublicationsPage() {
  return (
    <SectionPage
      content={pageContent['media.publications']}
      subNav={mediaSubNav}
      breadcrumbs={[
        { label: 'Home', to: '/' },
        { label: 'Media', to: '/media' },
        { label: 'Publications' },
      ]}
    />
  );
}

import { Link, useParams } from 'react-router-dom';
import SectionPage from '../../components/ui/SectionPage';
import CommunityCard from '../../components/ui/CommunityCard';
import { communities, localChapters, pageContent } from '../../data/mockContent';

export default function CommunitiesPage() {
  return (
    <SectionPage
      content={pageContent.communities}
      breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Communities' }]}
    >
      <div className="mb-6">
        <Link
          to="/communities/local-chapters"
          className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
        >
          Browse local chapters →
        </Link>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        {communities.map((c) => (
          <CommunityCard key={c.slug} community={c} />
        ))}
      </div>
    </SectionPage>
  );
}

export function LocalChaptersPage() {
  return (
    <SectionPage
      content={{
        title: 'Local Chapters',
        subtitle: 'Find your regional AGGE community',
        sections: [{
          heading: 'Chapter network',
          body: 'Local chapters organise lectures, field trips, student events, and networking sessions. Contact your nearest chapter to get involved.',
        }],
      }}
      breadcrumbs={[
        { label: 'Home', to: '/' },
        { label: 'Communities', to: '/communities' },
        { label: 'Local Chapters' },
      ]}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {localChapters.map((chapter) => (
          <div key={chapter.name} className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
            <h3 className="font-semibold text-white">{chapter.name}</h3>
            <p className="mt-1 text-sm text-slate-400">{chapter.city}, {chapter.country}</p>
            <p className="mt-2 text-xs text-slate-500">{chapter.events} events in 2025</p>
          </div>
        ))}
      </div>
    </SectionPage>
  );
}

export function CommunityDetailPage() {
  const { slug } = useParams();
  const community = communities.find((c) => c.slug === slug);

  if (!community) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-white">Community not found</h1>
        <Link to="/communities" className="mt-4 inline-block text-emerald-400">Back to communities</Link>
      </div>
    );
  }

  return (
    <SectionPage
      content={{
        title: community.name,
        subtitle: community.focus,
        sections: [
          {
            heading: 'About this community',
            body: `${community.name} brings together AGGE members working on specialised topics within geoscience and engineering. Join discussions, access shared resources, and participate in community-led webinars.`,
          },
          {
            heading: 'Activities',
            list: [
              'Quarterly technical webinars',
              'Special sessions at AGGE Annual Conference',
              'Mentoring and early-career outreach',
              'Collaborative position statements',
            ],
          },
        ],
      }}
      breadcrumbs={[
        { label: 'Home', to: '/' },
        { label: 'Communities', to: '/communities' },
        { label: community.name },
      ]}
    >
      <p className="text-sm text-slate-500">{community.members} active members (placeholder)</p>
    </SectionPage>
  );
}

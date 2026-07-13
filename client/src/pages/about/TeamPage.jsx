import SectionPage from '../../components/ui/SectionPage';
import { teamMembers } from '../../data/mockContent';
import { aboutSubNav } from '../../data/navigation';

export default function TeamPage() {
  return (
    <SectionPage
      content={{
        title: 'Our Team',
        subtitle: 'Leadership and secretariat',
        sections: [
          {
            heading: 'Board & leadership',
            body: 'AGGE is led by elected officers and professional staff who coordinate programmes across events, education, publishing, and member services.',
          },
        ],
      }}
      subNav={aboutSubNav}
      breadcrumbs={[
        { label: 'Home', to: '/' },
        { label: 'About', to: '/about' },
        { label: 'Our Team' },
      ]}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {teamMembers.map((member) => (
          <div key={member.name} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
            <p className="font-semibold text-white">{member.name}</p>
            <p className="text-sm text-emerald-400">{member.role}</p>
            <p className="mt-2 text-sm text-slate-400">{member.bio}</p>
          </div>
        ))}
      </div>
    </SectionPage>
  );
}

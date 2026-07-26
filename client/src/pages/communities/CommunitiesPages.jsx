import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import SectionPage from '../../components/ui/SectionPage';
import CommunityCard from '../../components/ui/CommunityCard';
import { communities, localChapters, pageContent } from '../../data/mockContent';

export default function CommunitiesPage() {
  const [activeTab, setActiveTab] = useState('all');

  const executiveBureau = [
    { name: 'Dr. Helena Vance', role: 'President & Executive Chair', region: 'Europe & UK' },
    { name: 'Dr. Rajesh Kumar', role: 'Vice President — Education & Chapters', region: 'Asia-Pacific' },
    { name: 'Dr. Maria Santos', role: 'Executive Director — Technical Divisions', region: 'Americas' },
    { name: 'Eng. Tariq Al-Mansoor', role: 'Regional Steering Officer', region: 'Middle East & Africa' }
  ];

  return (
    <SectionPage
      content={{
        title: 'AGGE Communities & Networks',
        subtitle: 'Connecting geoscientists, engineers, volunteers, and student chapters globally.',
        sections: []
      }}
      breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Communities' }]}
    >
      <div className="space-y-12">
        
        {/* ───────────────────────────────────────────────────────────── */}
        {/* SECTION 1: EXECUTIVE BUREAU (BUREAU EXÉCUTIF)                 */}
        {/* ───────────────────────────────────────────────────────────── */}
        <section className="bg-navy text-white rounded-3xl p-8 md:p-10 border border-sandstone shadow-xl relative overflow-hidden">
          <div className="contour-bg opacity-15"></div>
          <div className="relative z-10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-navy-light pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-sand bg-copper/30 px-3 py-1 rounded-full">Leadership</span>
                <h2 className="text-2xl font-display font-bold text-cream mt-2">Executive Bureau (Bureau Exécutif)</h2>
              </div>
              <Link to="/about/governance" className="text-xs text-sand hover:underline font-semibold">Governance &amp; Bylaws →</Link>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {executiveBureau.map((member) => (
                <div key={member.name} className="bg-navy-mid/80 rounded-2xl p-5 border border-navy-light space-y-2">
                  <div className="h-10 w-10 rounded-full bg-sand/20 text-sand flex items-center justify-center font-display font-bold text-sm">
                    {member.name.charAt(4)}
                  </div>
                  <h3 className="font-bold text-white text-sm">{member.name}</h3>
                  <p className="text-xs text-sand font-medium">{member.role}</p>
                  <p className="text-[11px] text-slate-400">{member.region}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* SECTION 2: FOR WHOM (POUR QUI)                                */}
        {/* ───────────────────────────────────────────────────────────── */}
        <section className="bg-white rounded-3xl p-8 border border-sand/40 shadow-sm space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-copper">Target Audience</span>
            <h2 className="text-2xl font-display font-bold text-navy">Who Benefits From Our Communities? (Pour Qui)</h2>
            <p className="text-xs text-text-muted leading-relaxed">
              AGGE communities unite professionals, researchers, and specialists across the entire earth sciences spectrum.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-cream border border-sand/30 space-y-2">
              <div className="text-sage text-xl"><i className="fas fa-microscope"></i></div>
              <h3 className="font-bold text-navy text-sm">Academic Researchers</h3>
              <p className="text-xs text-slate-600 leading-relaxed">Publish research, participate in specialized working groups, and exchange peer insights.</p>
            </div>
            <div className="p-5 rounded-2xl bg-cream border border-sand/30 space-y-2">
              <div className="text-copper text-xl"><i className="fas fa-hard-hat"></i></div>
              <h3 className="font-bold text-navy text-sm">Practicing Geo-Engineers</h3>
              <p className="text-xs text-slate-600 leading-relaxed">Access geotechnical standards, site investigation guidelines, and industry network events.</p>
            </div>
            <div className="p-5 rounded-2xl bg-cream border border-sand/30 space-y-2">
              <div className="text-navy text-xl"><i className="fas fa-droplet"></i></div>
              <h3 className="font-bold text-navy text-sm">Hydrogeologists &amp; Environmentalists</h3>
              <p className="text-xs text-slate-600 leading-relaxed">Collaborate on water protection policies, CO2 sequestration modeling, and hazard control.</p>
            </div>
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* SECTION 3: PEOPLE INTERESTED & VOLUNTEERS                     */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* People Interested */}
          <section className="bg-white rounded-3xl p-8 border border-sand/40 shadow-sm space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-sage">General Interest</span>
              <h3 className="text-xl font-display font-bold text-navy">People Interested (Personnes Intéressées)</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Not a licensed engineer? We welcome policy makers, government surveyors, educators, and science enthusiasts interested in Earth system developments.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-center gap-2"><i class="fas fa-check text-sage"></i> Open Guest Webinars &amp; Public Lectures</li>
              <li className="flex items-center gap-2"><i class="fas fa-check text-sage"></i> Quarterly Technical Newsletter Subscription</li>
              <li className="flex items-center gap-2"><i class="fas fa-check text-sage"></i> Regional Event Guest Passes</li>
            </ul>
          </section>

          {/* Volunteers & Ambassadors */}
          <section className="bg-white rounded-3xl p-8 border border-sand/40 shadow-sm space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-copper">Get Involved</span>
              <h3 className="text-xl font-display font-bold text-navy">Volunteers &amp; Ambassadors (Bénévoles)</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Help organize regional chapter meetings, review conference paper abstracts, chair webinar panels, or mentor student chapters.
            </p>
            <div className="pt-2">
              <a href="contact.html?inquiry=volunteer" className="inline-block rounded-full bg-copper px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-copper-light transition">
                Become a Chapter Volunteer →
              </a>
            </div>
          </section>

        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* SECTION 4: STUDENTS & EARLY CAREER (ÉTUDIANTS)                 */}
        {/* ───────────────────────────────────────────────────────────── */}
        <section className="bg-gradient-to-r from-navy via-navy-mid to-navy text-white rounded-3xl p-8 md:p-10 border border-navy-light shadow-xl relative overflow-hidden">
          <div className="contour-bg opacity-15"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <span className="text-[10px] uppercase font-bold tracking-widest text-sage bg-sage/20 px-3 py-1 rounded-full">Future Scientists</span>
              <h3 className="text-2xl font-display font-bold text-cream">Student &amp; Early Career Community (Étudiants)</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Connect with student chapters across 25+ universities. Access travel grants, fieldwork stipends, and early career mentoring programs.
              </p>
            </div>
            <Link
              to="/students"
              className="rounded-full bg-gradient-to-r from-copper to-copper-light px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg hover:scale-105 transition shrink-0"
            >
              Explore Student Hub
            </Link>
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* SECTION 5: TECHNICAL SUPPORT & MEMBER SERVICES (SUPPORT TECH)  */}
        {/* ───────────────────────────────────────────────────────────── */}
        <section className="bg-white rounded-3xl p-8 border border-sand/40 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-copper">Helpdesk &amp; Services</span>
              <h2 className="text-2xl font-display font-bold text-navy">Technical Support &amp; Assistance (Support Technique)</h2>
              <p className="text-xs text-text-muted mt-1">Need technical assistance with your member profile, chapter portal, or publication access?</p>
            </div>
            <Link
              to="/contact"
              className="rounded-full border border-navy/20 px-6 py-2.5 text-xs font-semibold text-navy hover:bg-navy hover:text-white transition shrink-0"
            >
              Contact Support Team
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-cream border border-sand/30 flex items-start gap-3">
              <i className="fas fa-headset text-copper text-lg mt-0.5"></i>
              <div>
                <h4 className="font-bold text-navy text-xs">Community Portal Support</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Help with chapter registration, event badges, and voting rights.</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-cream border border-sand/30 flex items-start gap-3">
              <i className="fas fa-book text-sage text-lg mt-0.5"></i>
              <div>
                <h4 className="font-bold text-navy text-xs">Publication Access Support</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Assistance accessing member journals and PDF repository archives.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* SECTION 6: TECHNICAL DIVISIONS SHOWCASE                        */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div className="space-y-6 pt-4 border-t border-sand/30">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-display font-bold text-navy">Specialized Technical Divisions</h3>
            <Link to="/communities/local-chapters" className="text-xs font-semibold text-copper hover:underline">
              Browse Local Chapters →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {communities.map((c) => (
              <CommunityCard key={c.slug} community={c} />
            ))}
          </div>
        </div>

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
          <div key={chapter.name} className="rounded-2xl border border-sand/40 bg-white p-6 shadow-sm">
            <h3 className="font-bold text-navy">{chapter.name}</h3>
            <p className="mt-1 text-sm text-text-muted">{chapter.city}, {chapter.country}</p>
            <p className="mt-2 text-xs text-copper font-medium">{chapter.events} events in 2026</p>
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
        <h1 className="text-2xl font-bold text-navy">Community not found</h1>
        <Link to="/communities" className="mt-4 inline-block text-copper hover:underline">Back to communities</Link>
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
      <p className="text-sm text-text-muted">{community.members} active members</p>
    </SectionPage>
  );
}

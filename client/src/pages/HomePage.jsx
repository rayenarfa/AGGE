import { Link } from 'react-router-dom';
import PageHero from '../components/ui/PageHero';
import EventCard from '../components/ui/EventCard';
import NewsCard from '../components/ui/NewsCard';
import CtaBanner from '../components/ui/CtaBanner';
import { featuredEvents, newsArticles } from '../data/mockContent';

const pillars = [
  {
    title: 'Students',
    description: 'Competitions, chapters, and mentoring for early-career geoscientists.',
    to: '/students',
  },
  {
    title: 'Learning Geoscience',
    description: 'Courses, webinars, and masterclasses across disciplines.',
    to: '/education',
  },
  {
    title: 'Communities',
    description: 'Technical SIGs and local chapters connecting specialists worldwide.',
    to: '/communities',
  },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/30">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-emerald-400">
            AGGE Website Platform
          </p>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Advancing geoscience knowledge, innovation, and collaboration
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
            Building a global community for geoscientists and engineers. Explore events,
            education, news, and membership benefits — redesigned for a modern experience.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/membership/join"
              className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-emerald-500"
            >
              Become a member
            </Link>
            <Link
              to="/events/calendar"
              className="rounded-lg border border-slate-700 px-6 py-3 text-sm font-medium text-slate-200 transition hover:border-emerald-500/50"
            >
              Calendar of events
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Featured events</h2>
            <p className="mt-1 text-slate-400">Conferences and courses from the AGGE calendar</p>
          </div>
          <Link to="/events" className="text-sm font-medium text-emerald-400 hover:text-emerald-300">
            View all →
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredEvents.map((event) => (
            <EventCard key={event.slug} event={event} />
          ))}
        </div>
      </section>

      <section className="border-y border-slate-800 bg-slate-900/30 py-14">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Latest news</h2>
              <p className="mt-1 text-slate-400">Association updates and community stories</p>
            </div>
            <Link to="/news/archive" className="text-sm font-medium text-emerald-400 hover:text-emerald-300">
              News archive →
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {newsArticles.slice(0, 3).map((article) => (
              <NewsCard key={article.slug} article={article} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <CtaBanner
          title="Power up with 360° membership benefits"
          description="Renew for 2026 or join for the first time to unlock education, events, publications, and community access."
          primaryLabel="Join AGGE"
          primaryTo="/membership/join"
          secondaryLabel="View benefits"
          secondaryTo="/membership/benefits"
        />
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <h2 className="mb-8 text-2xl font-bold text-white">Explore AGGE</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {pillars.map((pillar) => (
            <Link
              key={pillar.title}
              to={pillar.to}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 transition hover:border-emerald-500/30"
            >
              <h3 className="text-lg font-semibold text-white">{pillar.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{pillar.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

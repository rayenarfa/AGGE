import { useState, useEffect } from 'react';
import SectionPage from '../../components/ui/SectionPage';
import EventCard from '../../components/ui/EventCard';
import { getEvents } from '../../services/events';
import { eventsSubNav } from '../../data/navigation';

function EventListPage({ type, title, subtitle }) {
  const [eventsList, setEventsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchFilteredEvents() {
      try {
        setLoading(true);
        const data = await getEvents({ type });
        setEventsList(data.events);
      } catch (err) {
        setError('Failed to fetch events.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchFilteredEvents();
  }, [type]);

  return (
    <SectionPage
      content={{ title, subtitle, sections: [] }}
      subNav={eventsSubNav}
      breadcrumbs={[
        { label: 'Home', to: '/' },
        { label: 'Events', to: '/events' },
        { label: title },
      ]}
    >
      {loading ? (
        <div className="h-40 flex items-center justify-center text-slate-400 text-sm">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-800 border-t-emerald-500 mr-3" />
          Loading events...
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-500/20 bg-red-950/20 p-4 text-sm text-red-400">
          {error}
        </div>
      ) : eventsList.length === 0 ? (
        <div className="rounded-xl border border-slate-800/60 p-8 text-center text-slate-500 text-sm">
          No upcoming {type}s at this time. Check back later!
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {eventsList.map((event) => (
            <EventCard key={event.slug} event={event} />
          ))}
        </div>
      )}
    </SectionPage>
  );
}

export function ConferencesPage() {
  return (
    <EventListPage
      type="conference"
      title="Conferences & Exhibitions"
      subtitle="Flagship multi-day meetings and exhibitions"
    />
  );
}

export function WorkshopsPage() {
  return (
    <EventListPage
      type="workshop"
      title="Workshops & Short Courses"
      subtitle="Focused technical training sessions"
    />
  );
}

export function WebinarsPage() {
  return (
    <EventListPage
      type="webinar"
      title="Webinars"
      subtitle="Distinguished lecturer and technical webinars"
    />
  );
}

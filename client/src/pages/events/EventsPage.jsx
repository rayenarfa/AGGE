import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SectionPage from '../../components/ui/SectionPage';
import EventCard from '../../components/ui/EventCard';
import { CardSkeleton } from '../../components/ui/Loader';
import { getEvents } from '../../services/events';
import { pageContent } from '../../data/mockContent';
import { eventsSubNav } from '../../data/navigation';

export default function EventsPage() {
  const [eventsList, setEventsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const data = await getEvents({ upcoming: true });
        setEventsList(data.events);
      } catch (err) {
        setError('Failed to load upcoming events.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  return (
    <SectionPage
      content={pageContent.events}
      subNav={eventsSubNav}
      breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Events' }]}
    >
      {loading ? (
        <CardSkeleton count={2} />
      ) : error ? (
        <div className="rounded-lg border border-red-500/20 bg-red-950/20 p-4 text-sm text-red-400">
          {error}
        </div>
      ) : eventsList.length === 0 ? (
        <div className="rounded-xl border border-slate-800/60 p-8 text-center text-slate-500 text-sm">
          No upcoming events at this time. Check back later!
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {eventsList.map((event) => (
            <EventCard key={event.slug} event={event} />
          ))}
        </div>
      )}
      <p className="mt-6 text-sm text-slate-500">
        <Link to="/events/environmental-policy" className="text-emerald-400 hover:underline">
          Event environmental policy
        </Link>
      </p>
    </SectionPage>
  );
}

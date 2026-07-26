import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SectionPage from '../../components/ui/SectionPage';
import EventCard from '../../components/ui/EventCard';
import { CardSkeleton } from '../../components/ui/Loader';
import { getEvents } from '../../services/events';
import { pageContent, events as mockEvents } from '../../data/mockContent';
import { eventsSubNav } from '../../data/navigation';

export default function EventsPage() {
  const [eventsList, setEventsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedFormat, setSelectedFormat] = useState('all');

  useEffect(() => {
    async function fetchEvents() {
      try {
        const data = await getEvents({ upcoming: true });
        if (data && data.events && data.events.length > 0) {
          setEventsList(data.events);
        } else {
          setEventsList(mockEvents);
        }
      } catch (err) {
        console.error('API event fetch error, using mock events', err);
        setEventsList(mockEvents);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  // Filtered Events Logic
  const filteredEvents = eventsList.filter((ev) => {
    const matchesSearch =
      !searchQuery ||
      ev.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      selectedType === 'all' ||
      ev.type?.toLowerCase() === selectedType.toLowerCase();

    const isOnline = ev.location?.toLowerCase().includes('online') || ev.location?.toLowerCase().includes('webinar');
    const matchesFormat =
      selectedFormat === 'all' ||
      (selectedFormat === 'online' && isOnline) ||
      (selectedFormat === 'in-person' && !isOnline);

    return matchesSearch && matchesType && matchesFormat;
  });

  return (
    <SectionPage
      content={pageContent.events}
      subNav={eventsSubNav}
      breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Events' }]}
    >
      {/* ───────────────────────────────────────────────────────────── */}
      {/* EVENT FILTERING & SEARCH TOOLBAR                              */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="mb-8 rounded-2xl bg-white border border-sand/40 p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Keyword Search Input */}
          <div className="relative w-full md:w-80">
            <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400"></i>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by event title or city..."
              className="w-full rounded-full bg-cream border border-sand/40 pl-9 pr-4 py-2 text-xs text-navy placeholder-slate-400 focus:border-copper focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-navy"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>

          {/* Type Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'All Events' },
              { id: 'conference', label: 'Conferences' },
              { id: 'workshop', label: 'Workshops' },
              { id: 'webinar', label: 'Webinars' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedType(tab.id)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition cursor-pointer ${
                  selectedType === tab.id
                    ? 'bg-navy text-white shadow-sm'
                    : 'bg-cream text-slate-600 border border-sand/30 hover:bg-sand/20'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Location Format Select */}
          <div className="w-full md:w-auto">
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="w-full md:w-auto rounded-full bg-cream border border-sand/40 px-4 py-2 text-xs text-navy font-medium focus:border-copper focus:outline-none cursor-pointer"
            >
              <option value="all">All Locations / Formats</option>
              <option value="in-person">In-Person &amp; Hybrid</option>
              <option value="online">Online Only</option>
            </select>
          </div>

        </div>

        {/* Counter and Active Filter Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
          <span>
            Showing <strong className="text-navy">{filteredEvents.length}</strong> of {eventsList.length} total events
          </span>

          {(searchQuery || selectedType !== 'all' || selectedFormat !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedType('all');
                setSelectedFormat('all');
              }}
              className="text-copper hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <i className="fas fa-rotate-left text-[10px]"></i> Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* EVENTS GRID DISPLAY                                          */}
      {/* ───────────────────────────────────────────────────────────── */}
      {loading ? (
        <CardSkeleton count={2} />
      ) : error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-950/20 p-6 text-sm text-red-400">
          {error}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="rounded-2xl border border-sand/40 bg-white p-12 text-center shadow-sm space-y-3">
          <div className="h-12 w-12 rounded-full bg-sand/20 text-copper flex items-center justify-center text-xl mx-auto">
            <i className="fas fa-calendar-xmark"></i>
          </div>
          <h3 className="font-display font-bold text-navy text-lg">No Matching Events Found</h3>
          <p className="text-xs text-text-muted">Try adjusting your keyword search or switching event filter criteria.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedType('all');
              setSelectedFormat('all');
            }}
            className="rounded-full bg-navy text-white px-6 py-2 text-xs font-semibold hover:bg-navy-mid transition cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredEvents.map((event) => (
            <EventCard key={event.slug} event={event} />
          ))}
        </div>
      )}

      <p className="mt-8 text-xs text-text-muted border-t border-sand/30 pt-4">
        <Link to="/events/environmental-policy" className="text-copper hover:underline font-semibold">
          Learn more about AGGE Event Environmental &amp; Sustainability Policy →
        </Link>
      </p>
    </SectionPage>
  );
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../../components/ui/PageHero';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import SubNav from '../../components/ui/SubNav';
import { getCalendar } from '../../services/calendar';
import { eventsSubNav } from '../../data/navigation';

const CATEGORIES = [
  { name: 'Geology', slug: 'geology' },
  { name: 'Geophysics', slug: 'geophysics' },
  { name: 'Energy Transition', slug: 'energy-transition' },
  { name: 'Reservoir Characterization', slug: 'reservoir-characterization' },
  { name: 'Near Surface', slug: 'near-surface' },
];

const EVENT_TYPES = [
  { label: 'Conference', value: 'CONFERENCE' },
  { label: 'Workshop', value: 'WORKSHOP' },
  { label: 'Webinar', value: 'WEBINAR' },
];

const COURSE_TYPES = [
  { label: 'Self-paced Online', value: 'SELF_PACED' },
  { label: 'Interactive Short', value: 'INTERACTIVE_SHORT' },
  { label: 'Extensive Online', value: 'EXTENSIVE_ONLINE' },
  { label: 'Video Lecture', value: 'VIDEO' },
];

function formatEventDates(startStr, endStr) {
  if (!startStr) return 'Self-paced (On demand)';
  const start = new Date(startStr);
  const end = endStr ? new Date(endStr) : null;
  
  const startMonth = start.toLocaleDateString('en-US', { month: 'long' });
  const year = start.getFullYear();

  if (!end || start.toDateString() === end.toDateString()) {
    return `${start.getDate()} ${startMonth} ${year}`;
  }

  const endMonth = end.toLocaleDateString('en-US', { month: 'long' });
  if (startMonth === endMonth) {
    return `${start.getDate()}–${end.getDate()} ${startMonth} ${year}`;
  }

  return `${start.getDate()} ${startMonth} – ${end.getDate()} ${endMonth} ${year}`;
}

export default function EventsCalendarPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [type, setType] = useState('ALL'); // 'ALL' | 'EVENT' | 'COURSE'
  const [eventType, setEventType] = useState('');
  const [courseType, setCourseType] = useState('');
  const [category, setCategory] = useState('');
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Fetch handler
  const loadCalendarData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (type !== 'ALL') params.type = type;
      if (type !== 'COURSE' && eventType) params.eventType = eventType;
      if (type !== 'EVENT' && courseType) params.courseType = courseType;
      if (category) params.category = category;
      if (onlineOnly) params.online = 'true';
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const data = await getCalendar(params);
      setItems(data.items);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch calendar index records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalendarData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, eventType, courseType, category, onlineOnly, startDate, endDate]);

  const handleReset = () => {
    setSearch('');
    setType('ALL');
    setEventType('');
    setCourseType('');
    setCategory('');
    setOnlineOnly(false);
    setStartDate('');
    setEndDate('');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadCalendarData();
  };

  return (
    <>
      <PageHero
        title="Interactive Calendar"
        subtitle="Search and filter events, conferences, workshops, and educational programs"
      />
      <div className="mx-auto max-w-7xl px-6 py-10">
        <Breadcrumbs items={[
          { label: 'Home', to: '/' },
          { label: 'Events', to: '/events' },
          { label: 'Calendar' },
        ]} />
        <SubNav items={eventsSubNav} />

        <div className="mt-8 grid gap-8 lg:grid-cols-4">
          
          {/* SIDEBAR FILTER PANEL */}
          <div className="rounded-xl border border-sandstone/30 bg-white p-6 space-y-6 text-left self-start lg:col-span-1 shadow-md shadow-navy/5">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-navy pb-2 border-b border-sandstone/25">
                Refine Search
              </h3>
            </div>

            {/* Keyword Search */}
            <form onSubmit={handleSearchSubmit} className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">Keyword Search</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. reservoir, CO2"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-sandstone/45 bg-sand-light/10 px-3 py-2 text-xs text-navy focus:bg-white focus:border-copper focus:outline-none"
                />
                <button
                  type="submit"
                  className="absolute right-2.5 top-2.5 text-text-muted hover:text-navy text-xs cursor-pointer border-none bg-transparent"
                >
                  🔍
                </button>
              </div>
            </form>

            {/* Item Type Selector */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">Catalog Category</label>
              <div className="flex gap-2">
                {['ALL', 'EVENT', 'COURSE'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setType(t);
                      setEventType('');
                      setCourseType('');
                    }}
                    className={`flex-1 rounded-full py-1.5 text-[9px] font-bold tracking-wider uppercase transition cursor-pointer text-center border-none ${
                      type === t
                        ? 'bg-copper text-white shadow-sm'
                        : 'bg-sand-light/40 text-text-muted hover:bg-sand-light/80 hover:text-navy'
                    }`}
                  >
                    {t === 'ALL' ? 'All' : t === 'EVENT' ? 'Events' : 'Courses'}
                  </button>
                ))}
              </div>
            </div>

            {/* Event Type select */}
            {type !== 'COURSE' && (
              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">Event Type</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full rounded-lg border border-sandstone/45 bg-sand-light/10 px-3 py-2 text-xs text-navy focus:bg-white focus:border-copper focus:outline-none"
                >
                  <option value="">All Event Formats</option>
                  {EVENT_TYPES.map((et) => (
                    <option key={et.value} value={et.value}>{et.label}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Course Type select */}
            {type !== 'EVENT' && (
              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">Course Type</label>
                <select
                  value={courseType}
                  onChange={(e) => setCourseType(e.target.value)}
                  className="w-full rounded-lg border border-sandstone/45 bg-sand-light/10 px-3 py-2 text-xs text-navy focus:bg-white focus:border-copper focus:outline-none"
                >
                  <option value="">All Course Formats</option>
                  {COURSE_TYPES.map((ct) => (
                    <option key={ct.value} value={ct.value}>{ct.label}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Technical Category */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">Technical Topic</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-sandstone/45 bg-sand-light/10 px-3 py-2 text-xs text-navy focus:bg-white focus:border-copper focus:outline-none"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Date Range selectors */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">Date Range</label>
              <div className="space-y-1.5">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border border-sandstone/45 bg-sand-light/10 px-3 py-2 text-xs text-navy focus:bg-white focus:border-copper focus:outline-none"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-lg border border-sandstone/45 bg-sand-light/10 px-3 py-2 text-xs text-navy focus:bg-white focus:border-copper focus:outline-none"
                />
              </div>
            </div>

            {/* Online-only checkbox */}
            <div className="flex items-center gap-2 pt-2">
              <input
                id="onlineCheck"
                type="checkbox"
                checked={onlineOnly}
                onChange={(e) => setOnlineOnly(e.target.checked)}
                className="h-4 w-4 rounded border-sandstone/45 bg-sand-light/10 text-copper focus:ring-copper"
              />
              <label htmlFor="onlineCheck" className="text-xs font-semibold text-text-muted cursor-pointer font-sans">
                Online-only options
              </label>
            </div>

            {/* Reset filters button */}
            <button
              type="button"
              onClick={handleReset}
              className="mt-4 w-full rounded-full bg-sand-light/20 hover:bg-sand-light/50 border border-sandstone/30 py-2 text-xs font-bold uppercase tracking-wider text-navy transition cursor-pointer text-center"
            >
              Reset Filters
            </button>
          </div>

          {/* MAIN CALENDAR TIMELINE PANEL */}
          <div className="lg:col-span-3 text-left">
            {loading ? (
              <div className="h-60 flex items-center justify-center text-text-muted text-sm">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-sandstone/30 border-t-copper mr-3" />
                Loading calendar indices...
              </div>
            ) : error ? (
              <div className="rounded-xl border border-red-500/30 bg-red-50 p-6 text-sm text-red-800 font-medium">
                {error}
              </div>
            ) : (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-xs text-text-muted font-semibold uppercase tracking-wider">
                    Showing {items.length} items
                  </p>
                </div>

                <div className="overflow-x-auto rounded-xl border border-sandstone/30 bg-white shadow-md shadow-navy/5">
                  <table className="w-full min-w-[700px] text-left text-sm text-navy">
                    <thead>
                      <tr className="border-b border-sandstone/30 text-[10px] font-bold uppercase tracking-wider text-copper bg-sand-light/35">
                        <th className="p-4">Schedule / Dates</th>
                        <th className="p-4">Format / Category</th>
                        <th className="p-4">Title / Venue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sandstone/20">
                      {items.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="p-12 text-center text-text-muted text-xs font-semibold">
                            No events or education programs match your filter parameters.
                          </td>
                        </tr>
                      ) : (
                        items.map((item) => {
                          let detailPath = '/education/courses';
                          if (item.itemType === 'EVENT') {
                            const sub = item.subType.toLowerCase();
                            const subPath = sub === 'conference' ? 'conferences' : sub === 'workshop' ? 'workshops' : 'webinars';
                            detailPath = `/events/${subPath}/${item.slug}`;
                          }

                          return (
                            <tr key={`${item.itemType}-${item.id}`} className="hover:bg-sand-light/10 transition">
                              {/* Date cell */}
                              <td className="p-4 text-xs font-semibold text-navy whitespace-nowrap">
                                {formatEventDates(item.startDate, item.endDate)}
                              </td>
                              
                              {/* Classification Badges */}
                              <td className="p-4 whitespace-nowrap">
                                <span className={`inline-block rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider mr-2 border ${
                                  item.itemType === 'EVENT'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-blue-50 text-blue-700 border-blue-200'
                                }`}>
                                  {item.itemType}
                                </span>
                                <span className="inline-block text-[10px] text-text-muted font-sans font-medium">
                                  {item.category}
                                </span>
                              </td>

                              {/* Title and location */}
                              <td className="p-4">
                                <Link
                                  to={detailPath}
                                  className="font-bold text-navy hover:text-copper transition text-sm leading-snug"
                                >
                                  {item.title}
                                </Link>
                                <div className="mt-1 flex items-center gap-2 text-[10px] text-text-muted font-medium font-sans">
                                  <span>{item.location}</span>
                                  {item.online && (
                                    <>
                                      <span>•</span>
                                      <span className="text-emerald-700 font-bold uppercase tracking-wider text-[8px]">Live Stream</span>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}

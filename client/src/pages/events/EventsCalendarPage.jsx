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
          <div className="rounded-xl border border-slate-800 bg-slate-900/10 p-6 space-y-6 text-left self-start lg:col-span-1">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800/60">
                Refine Search
              </h3>
            </div>

            {/* Keyword Search */}
            <form onSubmit={handleSearchSubmit} className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Keyword Search</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. reservoir, CO2"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="absolute right-2.5 top-2.5 text-slate-500 hover:text-white text-xs cursor-pointer"
                >
                  🔍
                </button>
              </div>
            </form>

            {/* Item Type Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Catalog Category</label>
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
                    className={`flex-1 rounded py-1.5 text-[10px] font-bold tracking-wider uppercase transition cursor-pointer text-center ${
                      type === t
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-850 hover:text-white'
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
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Event Type</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-300 focus:border-emerald-500 focus:outline-none"
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
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Course Type</label>
                <select
                  value={courseType}
                  onChange={(e) => setCourseType(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-300 focus:border-emerald-500 focus:outline-none"
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
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Technical Topic</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-300 focus:border-emerald-500 focus:outline-none"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Date Range selectors */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Date Range</label>
              <div className="space-y-1.5">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-300 focus:border-emerald-500 focus:outline-none"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-300 focus:border-emerald-500 focus:outline-none"
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
                className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="onlineCheck" className="text-xs font-medium text-slate-400 cursor-pointer">
                Online-only options
              </label>
            </div>

            {/* Reset filters button */}
            <button
              type="button"
              onClick={handleReset}
              className="mt-4 w-full rounded bg-slate-900 border border-slate-850 hover:bg-slate-850 py-2 text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer text-center"
            >
              Reset Filters
            </button>
          </div>

          {/* MAIN CALENDAR TIMELINE PANEL */}
          <div className="lg:col-span-3 text-left">
            {loading ? (
              <div className="h-60 flex items-center justify-center text-slate-400 text-sm">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-850 border-t-emerald-500 mr-3" />
                Loading calendar indices...
              </div>
            ) : error ? (
              <div className="rounded-xl border border-red-500/20 bg-red-950/10 p-6 text-sm text-red-400">
                {error}
              </div>
            ) : (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                    Showing {items.length} items
                  </p>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/10 shadow-lg">
                  <table className="w-full min-w-[700px] text-left text-sm text-slate-300">
                    <thead>
                      <tr className="border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-900/25">
                        <th className="p-4">Schedule / Dates</th>
                        <th className="p-4">Format / Category</th>
                        <th className="p-4">Title / Venue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {items.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="p-12 text-center text-slate-500 text-xs font-medium">
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
                            <tr key={`${item.itemType}-${item.id}`} className="hover:bg-slate-900/20 transition">
                              {/* Date cell */}
                              <td className="p-4 text-xs font-medium text-slate-300 whitespace-nowrap">
                                {formatEventDates(item.startDate, item.endDate)}
                              </td>
                              
                              {/* Classification Badges */}
                              <td className="p-4 whitespace-nowrap">
                                <span className={`inline-block rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider mr-2 ${
                                  item.itemType === 'EVENT'
                                    ? 'bg-emerald-500/10 text-emerald-400'
                                    : 'bg-sky-500/10 text-sky-400'
                                }`}>
                                  {item.itemType}
                                </span>
                                <span className="inline-block text-[10px] text-slate-500">
                                  {item.category}
                                </span>
                              </td>

                              {/* Title and location */}
                              <td className="p-4">
                                <Link
                                  to={detailPath}
                                  className="font-semibold text-white hover:text-emerald-400 transition text-sm leading-snug"
                                >
                                  {item.title}
                                </Link>
                                <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                                  <span>{item.location}</span>
                                  {item.online && (
                                    <>
                                      <span>•</span>
                                      <span className="text-emerald-500/80 font-bold uppercase tracking-wider text-[8px]">Live Stream</span>
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

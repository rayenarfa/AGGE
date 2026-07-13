import { Link } from 'react-router-dom';

function formatEventDates(startStr, endStr) {
  if (!startStr || !endStr) return '';
  const start = new Date(startStr);
  const end = new Date(endStr);
  
  const startMonth = start.toLocaleDateString('en-US', { month: 'long' });
  const endMonth = end.toLocaleDateString('en-US', { month: 'long' });
  const year = start.getFullYear();

  if (start.toDateString() === end.toDateString()) {
    return `${start.getDate()} ${startMonth} ${year}`;
  }

  if (startMonth === endMonth) {
    return `${start.getDate()}–${end.getDate()} ${startMonth} ${year}`;
  }

  return `${start.getDate()} ${startMonth} – ${end.getDate()} ${endMonth} ${year}`;
}

export default function EventCard({ event }) {
  const type = (event.eventType || event.type || 'webinar').toLowerCase();
  const typePath = type === 'conference' ? 'conferences' : type === 'workshop' ? 'workshops' : 'webinars';
  
  const dates = event.dates || formatEventDates(event.startDate, event.endDate);
  const excerpt = event.excerpt || (event.description && event.description.length > 120 
    ? event.description.slice(0, 120) + '...' 
    : event.description || '');

  const isPast = event.past || (event.endDate && new Date(event.endDate) < new Date());

  return (
    <article className="flex flex-col rounded-xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-emerald-500/30">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs capitalize text-slate-300">
          {type}
        </span>
        {isPast && (
          <span className="text-xs text-slate-500">Past event</span>
        )}
      </div>
      <h3 className="text-lg font-semibold text-white">
        <Link to={`/events/${typePath}/${event.slug}`} className="hover:text-emerald-400">
          {event.title}
        </Link>
      </h3>
      <p className="mt-2 text-sm text-emerald-400/90">{dates}</p>
      <p className="text-sm text-slate-400">{event.location}</p>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-400">{excerpt}</p>
      {event.earlyBird && (
        <p className="mt-3 text-xs font-medium text-amber-400/90">{event.earlyBird}</p>
      )}
      <Link
        to={`/events/${typePath}/${event.slug}`}
        className="mt-4 inline-flex text-sm font-medium text-emerald-400 hover:text-emerald-300"
      >
        {event.cta || (isPast ? 'View recap' : 'View details')} →
      </Link>
    </article>
  );
}

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
    <article className="flex flex-col rounded-xl border border-sandstone/30 bg-white p-6 shadow-md shadow-navy/5 transition-all duration-300 hover:shadow-lg hover:border-copper/45 hover:-translate-y-1">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="rounded-full bg-sand-light px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-navy">
          {type}
        </span>
        {isPast && (
          <span className="text-[11px] font-semibold text-text-muted flex items-center gap-1">
            <i className="fas fa-clock" /> Past event
          </span>
        )}
      </div>
      <h3 className="text-lg font-display text-navy font-semibold leading-snug">
        <Link to={`/events/${typePath}/${event.slug}`} className="hover:text-copper transition-colors">
          {event.title}
        </Link>
      </h3>
      <p className="mt-2 text-xs font-bold text-copper-light">{dates}</p>
      <p className="text-xs text-text-muted mt-0.5">{event.location}</p>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-text-muted">{excerpt}</p>
      {event.earlyBird && (
        <p className="mt-3 text-xs font-medium text-sage">{event.earlyBird}</p>
      )}
      <Link
        to={`/events/${typePath}/${event.slug}`}
        className="mt-4 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-copper hover:text-copper-light transition-colors"
      >
        {event.cta || (isPast ? 'View recap' : 'View details')} <i className="fas fa-chevron-right text-[10px]" />
      </Link>
    </article>
  );
}

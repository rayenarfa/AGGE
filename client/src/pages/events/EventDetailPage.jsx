import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import PageHero from '../../components/ui/PageHero';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import { getEventBySlug } from '../../services/events';

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

export default function EventDetailPage() {
  const { type, slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const registering = false;
  const regSuccess = null;
  const regError = null;

  useEffect(() => {
    async function fetchEventDetails() {
      try {
        setLoading(true);
        setError(null);
        const data = await getEventBySlug(slug);
        setEvent(data.event);
        setIsRegistered(data.registered);
      } catch (err) {
        setError('Failed to load event details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchEventDetails();
  }, [slug]);

  const handleRegister = () => {
    if (!event) return;
    navigate(`/checkout?type=EVENT&id=${event.id}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-140px)] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-sandstone/30 border-t-copper" />
          <p className="text-sm text-text-muted">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-navy">Event not found</h1>
        <p className="mt-2 text-sm text-text-muted">{error || 'This event does not exist.'}</p>
        <Link to="/events" className="mt-4 inline-block text-copper hover:underline font-semibold">
          Back to events
        </Link>
      </div>
    );
  }

  const typeLabel = type?.replace(/s$/, '') || event.eventType;
  const datesText = formatEventDates(event.startDate, event.endDate);
  const isPast = new Date(event.endDate) < new Date();
  
  const hasEarlyBird = event.earlyBirdDeadline && new Date(event.earlyBirdDeadline) > new Date();

  return (
    <>
      <PageHero
        title={event.title}
        subtitle={`${datesText} · ${event.online ? 'Online Event' : event.location}`}
        badge={event.eventType.toLowerCase()}
      />
      <div className="mx-auto max-w-6xl px-6 py-10">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Events', to: '/events' },
            { label: typeLabel, to: `/events/${type}` },
            { label: event.title },
          ]}
        />
        <div className="grid gap-10 lg:grid-cols-3">
          
          <div className="space-y-6 lg:col-span-2">
            
            {/* Image display if exists */}
            {event.imageUrl && (
              <div className="overflow-hidden rounded-xl border border-sandstone/30 bg-white">
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="h-64 w-full object-cover sm:h-80 md:h-96"
                />
              </div>
            )}

            <div className="prose max-w-none text-navy mt-6">
              <p className="text-sm leading-relaxed text-text-muted whitespace-pre-line font-sans">
                {event.description}
              </p>
            </div>

            {hasEarlyBird && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-50 px-4 py-3 text-xs text-amber-800 font-medium">
                Early bird rates available until {new Date(event.earlyBirdDeadline).toLocaleDateString()}
              </div>
            )}
            
            {event.abstractDeadline && (
              <div className="rounded-lg border border-blue-500/30 bg-blue-50 px-4 py-3 text-xs text-blue-800 font-medium">
                Abstract submission deadline: {new Date(event.abstractDeadline).toLocaleDateString()}
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <div className="rounded-xl border border-sandstone/30 bg-white p-6 shadow-md shadow-navy/5">
              <h2 className="font-semibold text-navy text-base">Event Details</h2>
              
              <div className="mt-4 space-y-3 text-xs text-text-muted">
                <div>
                  <span className="block text-[10px] text-copper font-bold uppercase tracking-wider">Date & Time</span>
                  <span className="text-navy font-semibold text-xs">{datesText}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-copper font-bold uppercase tracking-wider">Venue</span>
                  <span className="text-navy font-semibold text-xs">{event.online ? 'Online (Zoom/Teams)' : event.location}</span>
                </div>
                {event.organizer && (
                  <div>
                    <span className="block text-[10px] text-copper font-bold uppercase tracking-wider">Organizer</span>
                    <span className="text-navy font-semibold text-xs">{event.organizer}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-sandstone/20">
                  <span className="block text-[10px] text-copper font-bold uppercase tracking-wider">Member Rate</span>
                  <span className="text-base font-bold text-navy">
                    {Number(event.priceMember) === 0 ? 'Free' : `€${Number(event.priceMember).toFixed(2)}`}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-copper font-bold uppercase tracking-wider">Non-Member Rate</span>
                  <span className="text-base font-bold text-text-muted">
                    {Number(event.priceNonMember) === 0 ? 'Free' : `€${Number(event.priceNonMember).toFixed(2)}`}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-sandstone/20">
                {regSuccess && (
                  <div className="mb-4 text-xs text-emerald-750 font-medium bg-emerald-50 border border-emerald-300/30 p-3 rounded-lg">
                    {regSuccess}
                  </div>
                )}
                {regError && (
                  <div className="mb-4 text-xs text-red-750 font-medium bg-red-50 border border-red-300/30 p-3 rounded-lg">
                    {regError}
                  </div>
                )}

                {isPast ? (
                  <button
                    type="button"
                    disabled
                    className="w-full rounded-full bg-sand-light border-none py-2.5 text-xs font-bold uppercase tracking-wider text-text-muted cursor-not-allowed"
                  >
                    Past Event
                  </button>
                ) : isRegistered ? (
                  <button
                    type="button"
                    disabled
                    className="w-full flex items-center justify-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 py-2.5 text-xs font-bold uppercase tracking-wider text-emerald-600 cursor-not-allowed"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    Registered
                  </button>
                ) : !user ? (
                  <Link
                    to="/login"
                    className="block w-full text-center rounded-full bg-gradient-to-r from-copper to-copper-light py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:scale-[1.02] transition shadow border-none cursor-pointer"
                  >
                    Log In to Register
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={handleRegister}
                    disabled={registering}
                    className="w-full rounded-full bg-gradient-to-r from-copper to-copper-light py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:scale-[1.02] transition shadow border-none cursor-pointer"
                  >
                    {registering ? 'Processing...' : 'Register Now'}
                  </button>
                )}

                {event.registrationDeadline && !isPast && !isRegistered && (
                  <p className="mt-2 text-center text-[10px] text-text-muted">
                    Registration closes on {new Date(event.registrationDeadline).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-sandstone/30 bg-white p-6 shadow-md shadow-navy/5">
              <h3 className="font-semibold text-navy text-sm">Policy Notes</h3>
              <p className="mt-2 text-xs text-text-muted leading-relaxed">
                Cancellations received in writing 14 days prior to event start qualify for full refunds. 
                Read our full environmental stance under the{' '}
                <Link to="/events/environmental-policy" className="text-copper hover:underline font-semibold">
                  Environmental Policy
                </Link>
                .
              </p>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

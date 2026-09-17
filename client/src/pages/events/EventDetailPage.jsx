import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import PageHero from '../../components/ui/PageHero';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import { getEventBySlug } from '../../services/events';

function formatEventDates(startStr, endStr) {
  if (!startStr || !endStr) return 'TBA';
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
  const [activeTab, setActiveTab] = useState('overview');

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
          <p className="text-sm text-text-muted">Loading scientific event details...</p>
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
          Back to events calendar
        </Link>
      </div>
    );
  }

  const typeLabel = type?.replace(/s$/, '') || event.eventType || 'Scientific Event';
  const datesText = formatEventDates(event.startDate, event.endDate);
  const isPast = new Date(event.endDate) < new Date();
  const hasEarlyBird = event.earlyBirdDeadline && new Date(event.earlyBirdDeadline) > new Date();

  // Mock agenda & speakers data if not provided in DB
  const agendaItems = event.agenda || [
    { time: '09:00 - 10:00', title: 'Registration & Welcome Address', speaker: 'AGGE Executive Committee' },
    { time: '10:00 - 11:30', title: 'Keynote Presentation: Frontiers in Geophysics & Environmental Monitoring', speaker: 'Prof. Amira Belhadj' },
    { time: '11:30 - 13:00', title: 'Technical Session: Subsurface Data Integration & Field Surveys', speaker: 'Dr. Karim Mansour' },
    { time: '13:00 - 14:30', title: 'Networking Lunch & Poster Presentation Session', speaker: 'All Delegates' },
    { time: '14:30 - 16:30', title: 'Interactive Workshop: Applied Remote Sensing & GIS Tools', speaker: 'Eng. Sarah Lindström' },
  ];

  const speakersList = event.speakers || [
    { name: 'Prof. Amira Belhadj', role: 'Keynote Speaker', affiliation: 'University of Sciences & Geophysics', bio: 'Senior researcher in computational geophysics and environmental hazard monitoring.' },
    { name: 'Dr. Karim Mansour', role: 'Technical Lead', affiliation: 'National Hydrogeology Institute', bio: 'Specialist in groundwater modeling and electrical resistivity tomography.' },
    { name: 'Eng. Sarah Lindström', role: 'Workshop Trainer', affiliation: 'GeoSubsurface Systems', bio: 'Expert in digital spatial data processing and GIS integration for Earth sciences.' },
  ];

  const eventSponsors = [
    { name: 'Global Energy Tech', tier: 'Platinum Sponsor' },
    { name: 'GeoSubsurface Solutions', tier: 'Gold Sponsor' },
    { name: 'National Institute of Earth Sciences', tier: 'Academic Partner' },
  ];

  return (
    <>
      <PageHero
        title={event.title}
        subtitle={`${datesText} · ${event.online ? 'Online Virtual Event' : event.location}`}
        badge={`${event.eventType?.toLowerCase() || 'event'} · AGGE Official`}
      />

      <div className="mx-auto max-w-6xl px-6 py-10">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Events', to: '/events' },
            { label: typeLabel, to: `/events/${type || 'all'}` },
            { label: event.title },
          ]}
        />

        <div className="grid gap-10 lg:grid-cols-3 mt-6">
          {/* Main Content Column */}
          <div className="space-y-8 lg:col-span-2">
            
            {/* Event Media / Hero Image */}
            {event.imageUrl && (
              <div className="overflow-hidden rounded-2xl border border-sand/40 bg-white shadow-sm">
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="h-64 w-full object-cover sm:h-80 md:h-96"
                />
              </div>
            )}

            {/* Quick Info Badges Bar */}
            <div className="flex flex-wrap items-center gap-3 p-4 bg-white rounded-2xl border border-sand/40 text-xs font-semibold text-navy">
              <span className="inline-flex items-center gap-1.5 bg-copper/10 text-copper px-3 py-1 rounded-full uppercase tracking-wider text-[10px]">
                <i className="fas fa-tag"></i> {event.eventType || 'Conference'}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-navy/5 text-navy px-3 py-1 rounded-full">
                <i className="fas fa-calendar-alt text-copper"></i> {datesText}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-navy/5 text-navy px-3 py-1 rounded-full">
                <i className="fas fa-map-marker-alt text-copper"></i> {event.online ? 'Online Access' : event.location}
              </span>
            </div>

            {/* Section Tabs */}
            <div className="flex border-b border-sand/40 space-x-6 text-xs uppercase font-bold tracking-wider">
              {['overview', 'programme', 'speakers', 'sponsors'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 transition border-b-2 cursor-pointer ${
                    activeTab === tab
                      ? 'border-copper text-copper'
                      : 'border-transparent text-text-muted hover:text-navy'
                  }`}
                >
                  {tab === 'overview' && '1. Overview & Audience'}
                  {tab === 'programme' && '2. Agenda & Schedule'}
                  {tab === 'speakers' && '3. Speakers & Keynotes'}
                  {tab === 'sponsors' && '4. Partners & Sponsors'}
                </button>
              ))}
            </div>

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-white p-6 rounded-2xl border border-sand/40 shadow-xs space-y-4">
                  <h3 className="text-lg font-display font-bold text-navy">Event Overview &amp; Description</h3>
                  <p className="text-xs leading-relaxed text-text-muted whitespace-pre-line font-sans">
                    {event.description}
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-sand/40 shadow-xs space-y-3">
                  <h3 className="text-sm font-bold text-navy uppercase tracking-wider flex items-center gap-2">
                    <i className="fas fa-users text-copper"></i> Target Audience &amp; Requirements
                  </h3>
                  <ul className="space-y-2 text-xs text-text-muted list-disc list-inside">
                    <li>University researchers, academics, and teachers in geophysics and Earth sciences.</li>
                    <li>Professional geologists, geophysicists, hydrogeologists, and environmental experts.</li>
                    <li>Undergraduate, master, and PhD students in Earth and environmental engineering.</li>
                    <li>Environmental policy experts and resource management decision-makers.</li>
                  </ul>
                </div>

                {/* Key Deadlines */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {hasEarlyBird && (
                    <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-50/60 text-xs text-amber-900 space-y-1">
                      <span className="font-bold uppercase tracking-wider text-[10px] text-amber-700">Early Bird Registration</span>
                      <p>Discounted fees available until <strong>{new Date(event.earlyBirdDeadline).toLocaleDateString()}</strong></p>
                    </div>
                  )}
                  {event.abstractDeadline && (
                    <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-50/60 text-xs text-blue-900 space-y-1">
                      <span className="font-bold uppercase tracking-wider text-[10px] text-blue-700">Abstract Submission Deadline</span>
                      <p>Submit abstracts by <strong>{new Date(event.abstractDeadline).toLocaleDateString()}</strong></p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: PROGRAMME / AGENDA */}
            {activeTab === 'programme' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-sand/40 shadow-xs">
                  <div>
                    <h3 className="text-lg font-display font-bold text-navy">Programme &amp; Technical Schedule</h3>
                    <p className="text-xs text-text-muted">Full detailed agenda for the event proceedings.</p>
                  </div>
                  <button
                    onClick={() => alert('Downloading official event schedule PDF...')}
                    className="inline-flex items-center gap-2 rounded-full bg-navy text-white px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-navy-mid transition cursor-pointer"
                  >
                    <i className="fas fa-file-pdf text-copper"></i> Download PDF
                  </button>
                </div>

                <div className="space-y-3">
                  {agendaItems.map((item, idx) => (
                    <div key={idx} className="p-4 bg-white rounded-xl border border-sand/30 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                      <span className="shrink-0 bg-navy/5 text-navy font-mono font-bold text-xs px-3 py-1.5 rounded-lg">
                        {item.time}
                      </span>
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-navy text-xs">{item.title}</h4>
                        <p className="text-[11px] text-copper font-medium">{item.speaker}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: SPEAKERS */}
            {activeTab === 'speakers' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-white p-6 rounded-2xl border border-sand/40 shadow-xs">
                  <h3 className="text-lg font-display font-bold text-navy">Keynote Speakers &amp; Trainers</h3>
                  <p className="text-xs text-text-muted">Leading academics and industry experts featured at this event.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {speakersList.map((spk, idx) => (
                    <div key={idx} className="p-5 bg-white rounded-2xl border border-sand/40 shadow-xs space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-copper/10 text-copper flex items-center justify-center font-bold text-sm">
                          {spk.name[0]}
                        </div>
                        <div>
                          <h4 className="font-bold text-navy text-sm">{spk.name}</h4>
                          <span className="text-[10px] text-copper uppercase font-bold">{spk.role}</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">{spk.affiliation}</p>
                      <p className="text-xs text-text-muted leading-relaxed pt-1">{spk.bio}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: SPONSORS */}
            {activeTab === 'sponsors' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-white p-6 rounded-2xl border border-sand/40 shadow-xs">
                  <h3 className="text-lg font-display font-bold text-navy">Supporting Institutions &amp; Sponsors</h3>
                  <p className="text-xs text-text-muted">Organisations partnering with AGGE to host this scientific activity.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {eventSponsors.map((sps, idx) => (
                    <div key={idx} className="p-4 bg-white rounded-xl border border-sand/30 text-center space-y-1">
                      <i className="fas fa-building text-copper text-xl mb-1"></i>
                      <h4 className="font-bold text-navy text-xs">{sps.name}</h4>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">{sps.tier}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Post Event Gallery Section if past event */}
            {isPast && (
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <h3 className="text-sm font-bold text-navy flex items-center gap-2">
                  <i className="fas fa-camera text-copper"></i> Post-Event Outcomes &amp; Photo Gallery
                </h3>
                <p className="text-xs text-slate-600">
                  This event has concluded. Proceedings, slide decks, and photographs are available in the AGGE Member Portal library.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar Column */}
          <aside className="space-y-6">
            
            {/* Registration & Fees Box */}
            <div className="rounded-2xl border border-sand/40 bg-white p-6 shadow-md shadow-navy/5 space-y-5">
              <h2 className="font-display font-bold text-navy text-lg">Registration Fees &amp; Access</h2>
              
              <div className="space-y-3 text-xs text-text-muted border-t border-sand/30 pt-4">
                <div>
                  <span className="block text-[10px] text-copper font-bold uppercase tracking-wider">Date &amp; Time</span>
                  <span className="text-navy font-semibold text-xs">{datesText}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-copper font-bold uppercase tracking-wider">Location / Venue</span>
                  <span className="text-navy font-semibold text-xs">{event.online ? 'Online Access (Zoom/Teams)' : event.location}</span>
                </div>

                {/* Member vs Non-Member Pricing with TND / EUR conversion support */}
                <div className="p-3 bg-cream/70 rounded-xl border border-sand/40 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-semibold text-slate-600">AGGE Member Rate:</span>
                    <span className="text-base font-extrabold text-navy">
                      {Number(event.priceMember) === 0 ? 'Free' : `${Number(event.priceMember)} DT`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-sand/30">
                    <span className="text-[11px] font-semibold text-slate-500">Non-Member Rate:</span>
                    <span className="text-sm font-bold text-text-muted">
                      {Number(event.priceNonMember) === 0 ? 'Free' : `${Number(event.priceNonMember)} DT`}
                    </span>
                  </div>
                  <p className="text-[10px] text-copper font-bold pt-1">
                    * Members receive reduced registration fees for all AGGE workshops &amp; courses.
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                {isPast ? (
                  <button
                    type="button"
                    disabled
                    className="w-full rounded-full bg-slate-100 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 cursor-not-allowed"
                  >
                    Past Event (Closed)
                  </button>
                ) : isRegistered ? (
                  <button
                    type="button"
                    disabled
                    className="w-full flex items-center justify-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 py-3 text-xs font-bold uppercase tracking-wider text-emerald-600 cursor-not-allowed"
                  >
                    <i className="fas fa-check-circle"></i> Registered
                  </button>
                ) : !user ? (
                  <div className="space-y-2">
                    <Link
                      to="/login"
                      className="block w-full text-center rounded-full bg-gradient-to-r from-copper to-copper-light py-3 text-xs font-bold uppercase tracking-wider text-white hover:scale-[1.02] transition shadow-md"
                    >
                      Log In to Register
                    </Link>
                    <Link
                      to="/register"
                      className="block w-full text-center text-[11px] text-copper hover:underline font-semibold"
                    >
                      Create Free Account First
                    </Link>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleRegister}
                    className="w-full rounded-full bg-gradient-to-r from-copper to-copper-light py-3 text-xs font-bold uppercase tracking-wider text-white hover:scale-[1.02] transition shadow-md cursor-pointer"
                  >
                    Register for Event
                  </button>
                )}

                {event.registrationDeadline && !isPast && !isRegistered && (
                  <p className="mt-2 text-center text-[10px] text-text-muted">
                    Deadline: {new Date(event.registrationDeadline).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            {/* Enquiries Contact Card */}
            <div className="rounded-2xl border border-sand/40 bg-white p-6 shadow-sm space-y-3">
              <h3 className="font-bold text-navy text-sm uppercase tracking-wider flex items-center gap-2">
                <i className="fas fa-envelope text-copper"></i> Enquiries &amp; Information
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Have questions regarding registration, abstract submission, or student grants?
              </p>
              <div className="text-xs space-y-1 text-navy font-semibold pt-1">
                <p><i className="fas fa-at text-copper w-4"></i> events@agge.tn</p>
                <p><i className="fas fa-phone text-copper w-4"></i> +216 71 000 000</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

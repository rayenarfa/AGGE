import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import EventCard from '../components/ui/EventCard';
import NewsCard from '../components/ui/NewsCard';
import { featuredEvents, newsArticles } from '../data/mockContent';

export default function HomePage() {
  // Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);

  // Map Project Selection State
  const [selectedProject, setSelectedProject] = useState('india');

  const heroSlides = [
    {
      badge: 'Global Geoscience Network',
      title: 'Advancing Geophysics, Geoscience & Environment',
      description: 'Bridging academic research and field applications through training, consultancy, and a global network of earth science professionals.',
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80',
      primaryBtn: { text: 'Join the Association', to: '/membership/join' },
      secondaryBtn: { text: 'Explore Events', to: '/events' }
    },
    {
      badge: 'Subsurface Innovation & Energy Transition',
      title: 'Near Surface & Environmental Frontiers',
      description: 'Reflecting the breadth, energy, and expertise of our community shaping sustainable natural resource and subsurface engineering.',
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80',
      primaryBtn: { text: 'Browse Media & Journals', to: '/media' },
      secondaryBtn: { text: 'Local Chapters', to: '/communities' }
    },
    {
      badge: 'Global Summit & Technical Workshops',
      title: 'International Collaboration & Field Research',
      description: 'Bringing together top geophysicists, hydrogeologists, and geo-engineers for world-class technical exchanges and summits.',
      image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1920&q=80',
      primaryBtn: { text: 'Upcoming Conferences', to: '/events' },
      secondaryBtn: { text: 'Contact Headquarters', to: '/contact' }
    }
  ];

  // Auto-advance Carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const projects = {
    india: {
      region: 'South Asia',
      title: 'Groundwater & Hydrogeological Survey',
      description: 'Electric resistivity surveys and borewell planning supporting domestic and industrial water resource management.',
      tags: ['Hydrogeology', 'Field Survey']
    },
    europe: {
      region: 'Europe',
      title: 'Research Collaboration Programme',
      description: 'Joint seminars and technical exchange on environmental geology and sustainable mining.',
      tags: ['Research', 'Partnership']
    },
    'middle-east': {
      region: 'Middle East',
      title: 'Geotechnical Site Assessment',
      description: 'Infrastructure and foundation studies including subsurface investigation and structural reporting.',
      tags: ['Geotechnical', 'Consultancy']
    },
    australia: {
      region: 'Oceania',
      title: 'Mineral Exploration Support',
      description: 'Geological mapping and resource estimation using GIS and remote sensing integration.',
      tags: ['Mining', 'GIS']
    }
  };

  return (
    <div className="font-sans bg-cream text-navy">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 1: HERO IMAGE CAROUSEL & IMPACT STATS                 */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[85vh] flex flex-col justify-between overflow-hidden bg-navy text-white">

        {/* Carousel Background Images with Fade Transition */}
        {heroSlides.map((slide, idx) => (
          <div
            key={slide.title}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="h-full w-full object-cover brightness-[0.45] transform scale-105 transition-transform duration-10000 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/60 to-transparent" />
            <div className="contour-bg opacity-20" />
          </div>
        ))}

        {/* Hero Content Overlay */}
        <div className="relative z-20 mx-auto w-full max-w-6xl px-6 pt-12 sm:pt-24 pb-8 sm:pb-16 my-auto flex flex-col justify-center">
          <div className="max-w-2xl space-y-6 animate-fadeIn">
            <span className="inline-flex items-center gap-2 rounded-full border border-sand/30 bg-navy-mid/80 px-4 py-1.5 text-xs text-sand font-semibold backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-copper animate-ping"></span>
              {heroSlides[currentSlide].badge}
            </span>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-display font-light leading-snug text-cream">
              {heroSlides[currentSlide].title}
            </h1>

            <p className="text-base sm:text-lg leading-relaxed text-slate-200 font-light max-w-xl">
              {heroSlides[currentSlide].description}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/events"
                className="rounded-full bg-gradient-to-r from-copper to-copper-light px-5 py-2.5 sm:px-7 sm:py-3.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white shadow-xl hover:scale-105 transition flex items-center gap-2"
              >
                <i className="fas fa-calendar-alt text-sand"></i> See Events
              </Link>
              <Link
                to="/membership"
                className="rounded-full bg-white text-navy px-5 py-2.5 sm:px-7 sm:py-3.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider hover:bg-cream hover:scale-105 transition shadow-md flex items-center gap-2"
              >
                <i className="fas fa-user-plus text-copper"></i> Join Now
              </Link>
              <Link
                to="/contact"
                className="rounded-full border border-white/40 bg-white/10 px-4 py-2.5 sm:px-6 sm:py-3.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white hover:bg-white/20 transition backdrop-blur flex items-center gap-2"
              >
                <i className="fas fa-envelope text-slate-300"></i> Contact Us
              </Link>
            </div>
          </div>
        </div>

        {/* Carousel Controls & Indicators */}
        <div className="relative z-20 mx-auto w-full max-w-6xl px-6 pb-8 flex items-center justify-between">
          {/* Indicators */}
          <div className="flex gap-3">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-10 bg-copper' : 'w-2.5 bg-white/40 hover:bg-white/70'
                  }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Prev / Next Arrows */}
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1))}
              className="h-10 w-10 rounded-full border border-white/30 bg-navy-mid/60 text-white flex items-center justify-center hover:bg-copper hover:border-copper transition"
              aria-label="Previous Slide"
            >
              <i className="fas fa-chevron-left text-xs"></i>
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
              className="h-10 w-10 rounded-full border border-white/30 bg-navy-mid/60 text-white flex items-center justify-center hover:bg-copper hover:border-copper transition"
              aria-label="Next Slide"
            >
              <i className="fas fa-chevron-right text-xs"></i>
            </button>
          </div>
        </div>

        {/* Integrated Stats Bar */}
        <div className="relative z-20 border-t border-navy-light bg-navy-mid/95 backdrop-blur py-5 px-6">
          <div className="mx-auto max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
            <div>
              <p className="text-2xl font-display font-bold text-sand">12,500+</p>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Global Members</p>
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-sand">45+</p>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Regional Chapters</p>
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-sand">180+</p>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Conferences &amp; Workshops</p>
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-sand">4,000+</p>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Research Publications</p>
            </div>
          </div>
        </div>

      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MISSION & CORE VALUES SECTION (CLIENT HIGHLIGHT)              */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="py-10 sm:py-16 px-4 sm:px-6 bg-white border-b border-sand/30">
        <div className="mx-auto max-w-6xl space-y-12">

          {/* Mission Card */}
          <div className="bg-gradient-to-r from-navy to-navy-mid text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-navy-light relative overflow-hidden">
            <div className="contour-bg opacity-15" />
            <div className="relative z-10 max-w-3xl space-y-4">
              <span className="inline-block rounded-full bg-copper/20 border border-copper/40 px-3.5 py-1 text-[10px] font-bold text-sand uppercase tracking-widest">
                Our Official Mission
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-light text-cream leading-snug">
                Fostering Research, Cooperation &amp; Earth Science Applications for Sustainable Development
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                The Association for Geophysics, Geosciences and Environment (AGGE) is a scientific association dedicated to promoting cooperation among researchers, academics, professionals, and institutions at both national and international levels. It aims to enhance the value and visibility of scientific research in the fields of geophysics, geosciences, and environmental sciences, while fostering the exchange of knowledge and expertise and encouraging the use of modern technologies and digital tools.
              </p>
            </div>
          </div>

          {/* 4 Core Pillars Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-cream rounded-2xl border border-sand/40 space-y-2">
              <div className="h-10 w-10 rounded-xl bg-copper/10 text-copper flex items-center justify-center font-bold text-base">
                <i className="fas fa-award"></i>
              </div>
              <h3 className="font-bold text-navy text-sm">Technical Excellence</h3>
              <p className="text-xs text-text-muted leading-relaxed">High-standard scientific research and rigorous methodology in geophysics and Earth science.</p>
            </div>

            <div className="p-6 bg-cream rounded-2xl border border-sand/40 space-y-2">
              <div className="h-10 w-10 rounded-xl bg-sage/20 text-sage flex items-center justify-center font-bold text-base">
                <i className="fas fa-leaf"></i>
              </div>
              <h3 className="font-bold text-navy text-sm">Protecting Environment</h3>
              <p className="text-xs text-text-muted leading-relaxed">Promoting eco-friendly solutions, water security, and sustainable natural resource management.</p>
            </div>

            <div className="p-6 bg-cream rounded-2xl border border-sand/40 space-y-2">
              <div className="h-10 w-10 rounded-xl bg-navy/10 text-navy flex items-center justify-center font-bold text-base">
                <i className="fas fa-lightbulb"></i>
              </div>
              <h3 className="font-bold text-navy text-sm">Scientific Innovation</h3>
              <p className="text-xs text-text-muted leading-relaxed">Fostering digital tools, modern technologies, and multidisciplinary Earth science applications.</p>
            </div>

            <div className="p-6 bg-cream rounded-2xl border border-sand/40 space-y-2">
              <div className="h-10 w-10 rounded-xl bg-sandstone/20 text-sandstone flex items-center justify-center font-bold text-base">
                <i className="fas fa-handshake"></i>
              </div>
              <h3 className="font-bold text-navy text-sm">Socioeconomic Synergy</h3>
              <p className="text-xs text-text-muted leading-relaxed">Strengthening collaboration between academic researchers, industry, and decision-makers.</p>
            </div>
          </div>

        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 2: GLOBAL PROJECTS MAP & DISCIPLINES SPOTLIGHT         */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="py-10 sm:py-20 px-4 sm:px-6 bg-cream">
        <div className="mx-auto max-w-6xl space-y-16">

          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[10px] uppercase tracking-widest font-bold text-copper">Global Impact &amp; Research</span>
            <h2 className="text-3xl font-display text-navy font-bold">Projects Across the World</h2>
            <p className="text-xs text-text-muted leading-relaxed">
              Explore active sub-surface engineering, groundwater surveys, and geophysics research led by AGGE members globally.
            </p>
          </div>

          {/* Map + Card Grid */}
          <div className="grid gap-8 lg:grid-cols-3 items-center">
            {/* Map Canvas Card */}
            <div className="lg:col-span-2 relative bg-gradient-to-b from-navy-light to-navy p-4 rounded-3xl shadow-xl border border-navy-light overflow-hidden">
              <div className="contour-bg opacity-15" />

              <div className="relative z-10 w-full aspect-[2/1] bg-[linear-gradient(rgba(12,26,43,0.4),rgba(12,26,43,0.4)),url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-center bg-contain bg-no-repeat rounded-2xl">
                {/* Marker buttons */}
                <button
                  onClick={() => setSelectedProject('india')}
                  className={`map-marker ${selectedProject === 'india' ? 'active' : ''}`}
                  style={{ left: '72%', top: '48%' }}
                  aria-label="India Project"
                />
                <button
                  onClick={() => setSelectedProject('europe')}
                  className={`map-marker ${selectedProject === 'europe' ? 'active' : ''}`}
                  style={{ left: '55%', top: '38%' }}
                  aria-label="Europe Project"
                />
                <button
                  onClick={() => setSelectedProject('middle-east')}
                  className={`map-marker ${selectedProject === 'middle-east' ? 'active' : ''}`}
                  style={{ left: '62%', top: '42%' }}
                  aria-label="Middle East Project"
                />
                <button
                  onClick={() => setSelectedProject('australia')}
                  className={`map-marker ${selectedProject === 'australia' ? 'active' : ''}`}
                  style={{ left: '85%', top: '68%' }}
                  aria-label="Australia Project"
                />
              </div>
            </div>

            {/* Sidebar info */}
            <div className="bg-white border border-sand/40 rounded-3xl p-8 shadow-sm flex flex-col justify-between min-h-[280px]">
              {selectedProject && projects[selectedProject] && (
                <div className="space-y-4 animate-fadeIn">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-copper bg-copper/10 px-3 py-1 rounded-full">
                    {projects[selectedProject].region}
                  </span>
                  <h3 className="text-xl font-display text-navy font-bold leading-snug">
                    {projects[selectedProject].title}
                  </h3>
                  <p className="text-xs text-text-muted leading-relaxed">
                    {projects[selectedProject].description}
                  </p>
                  <div className="flex gap-2 pt-2">
                    {projects[selectedProject].tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-cream border border-sand/40 px-3 py-1 text-[10px] font-bold text-navy">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Core Disciplines Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            {[
              { title: 'Geophysics & Seismics', desc: 'Subsurface imaging and quantitative interpretation.', icon: 'fa-wave-square' },
              { title: 'Hydrogeology & Water', desc: 'Aquifer protection and sustainable water management.', icon: 'fa-droplet' },
              { title: 'Geoscience & Environment', desc: 'Foundation testing and soil mechanics for infrastructure.', icon: 'fa-hard-hat' },
              { title: 'Environmental Geology', desc: 'Climate impact studies and subsurface contamination control.', icon: 'fa-leaf' }
            ].map((discipline) => (
              <div key={discipline.title} className="bg-white rounded-2xl p-6 border border-sand/40 shadow-xs hover:shadow-md transition">
                <div className="h-10 w-10 rounded-xl bg-sage/20 flex items-center justify-center text-sage text-lg mb-4">
                  <i className={`fas ${discipline.icon}`}></i>
                </div>
                <h4 className="font-display font-bold text-navy text-sm mb-2">{discipline.title}</h4>
                <p className="text-xs text-text-muted leading-relaxed">{discipline.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 3: FEATURED EVENTS & NEWS SPOTLIGHT + JOIN CTA       */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="py-10 sm:py-20 px-4 sm:px-6 bg-gradient-to-b from-sand-light/40 to-cream border-t border-sand/30">
        <div class="mx-auto max-w-6xl space-y-16">

          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-widest font-bold text-copper">Spotlight &amp; Updates</span>
              <h2 className="text-3xl font-display text-navy font-bold mt-1">Conferences &amp; Latest News</h2>
            </div>
            <div className="flex gap-4 text-xs font-bold uppercase tracking-wider">
              <Link to="/events" className="text-copper hover:underline">All Events →</Link>
              <Link to="/news" className="text-copper hover:underline">News Archive →</Link>
            </div>
          </div>

          {/* Grid of Events & News */}
          <div className="grid md:grid-cols-3 gap-8">
            {featuredEvents.slice(0, 1).map((event) => (
              <div key={event.slug} className="md:col-span-2">
                <EventCard event={event} />
              </div>
            ))}
            {newsArticles.slice(0, 1).map((article) => (
              <NewsCard key={article.slug} article={article} />
            ))}
          </div>

          {/* Join CTA Banner */}
          <div className="bg-navy text-white rounded-3xl p-10 md:p-12 border-4 border-sandstone shadow-2xl relative overflow-hidden text-center">
            <div className="contour-bg opacity-15"></div>
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <h3 className="font-display text-3xl font-bold text-sand">Be Part of the Global Subsurface Community</h3>
              <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Connect with thousands of geoscientists, receive member journal subscriptions, and gain discounted access to all AGGE events.
              </p>
              <div className="flex flex-wrap justify-center gap-4 pt-2">
                <Link
                  to="/membership/join"
                  className="rounded-full bg-gradient-to-r from-copper to-copper-light px-5 py-2.5 sm:px-7 sm:py-3.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white shadow-lg hover:scale-105 transition"
                >
                  Join AGGE Today
                </Link>
                <Link
                  to="/communities"
                  className="rounded-full border border-white/40 px-5 py-2.5 sm:px-7 sm:py-3.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white hover:bg-white/10 transition"
                >
                  Explore Chapters
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}

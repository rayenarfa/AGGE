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
      title: 'Advancing Geoscience & Geo Engineering',
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
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
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
        <div className="relative z-20 mx-auto w-full max-w-6xl px-6 pt-24 pb-16 my-auto flex flex-col justify-center">
          <div className="max-w-2xl space-y-6 animate-fadeIn">
            <span className="inline-flex items-center gap-2 rounded-full border border-sand/30 bg-navy-mid/80 px-4 py-1.5 text-xs text-sand font-semibold backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-copper animate-ping"></span>
              {heroSlides[currentSlide].badge}
            </span>

            <h1 className="text-4xl sm:text-6xl font-display font-light leading-tight text-cream">
              {heroSlides[currentSlide].title}
            </h1>

            <p className="text-base sm:text-lg leading-relaxed text-slate-200 font-light max-w-xl">
              {heroSlides[currentSlide].description}
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to={heroSlides[currentSlide].primaryBtn.to}
                className="rounded-full bg-gradient-to-r from-copper to-copper-light px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-xl hover:scale-105 transition"
              >
                {heroSlides[currentSlide].primaryBtn.text}
              </Link>
              <Link
                to={heroSlides[currentSlide].secondaryBtn.to}
                className="rounded-full border border-white/40 bg-white/10 px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/20 transition backdrop-blur"
              >
                {heroSlides[currentSlide].secondaryBtn.text}
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
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  idx === currentSlide ? 'w-10 bg-copper' : 'w-2.5 bg-white/40 hover:bg-white/70'
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
              <i class="fas fa-chevron-left text-xs"></i>
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
              className="h-10 w-10 rounded-full border border-white/30 bg-navy-mid/60 text-white flex items-center justify-center hover:bg-copper hover:border-copper transition"
              aria-label="Next Slide"
            >
              <i class="fas fa-chevron-right text-xs"></i>
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
              <p class="text-2xl font-display font-bold text-sand">45+</p>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Regional Chapters</p>
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-sand">180+</p>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Conferences &amp; Events</p>
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-sand">4,000+</p>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Research Publications</p>
            </div>
          </div>
        </div>

      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 2: GLOBAL PROJECTS MAP & DISCIPLINES SPOTLIGHT         */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-cream">
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
              { title: 'Geo-Engineering', desc: 'Foundation testing and soil mechanics for infrastructure.', icon: 'fa-hard-hat' },
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
      <section className="py-20 px-6 bg-gradient-to-b from-sand-light/40 to-cream border-t border-sand/30">
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
                  className="rounded-full bg-gradient-to-r from-copper to-copper-light px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg hover:scale-105 transition"
                >
                  Join AGGE Today
                </Link>
                <Link
                  to="/communities"
                  className="rounded-full border border-white/40 px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/10 transition"
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

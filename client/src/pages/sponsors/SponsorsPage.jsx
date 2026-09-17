import { useState } from 'react';

export default function SponsorsPage() {
  const [formData, setFormData] = useState({
    orgName: '',
    contactName: '',
    email: '',
    phone: '',
    packageTier: 'Gold Package',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const currentSponsors = {
    platinum: [
      { name: 'Global Energy Tech', category: 'Energy & Geophysics', logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=300&q=80' },
      { name: 'GeoSubsurface Solutions', category: 'Geophysical Instruments', logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=300&q=80' },
    ],
    gold: [
      { name: 'HydroGeo Environmental', category: 'Water & Soil Management' },
      { name: 'Subsurface Analytics Inc.', category: 'Seismic Data Processing' },
      { name: 'TerraExplorer Tech', category: 'Geoscience GIS Software' },
    ],
    academic: [
      { name: 'National Institute of Earth Sciences', type: 'Research Partner' },
      { name: 'University Laboratory of Geophysics & Environment', type: 'Academic Partner' },
      { name: 'International Geosciences Union', type: 'Institutional Partner' },
    ],
  };

  const packages = [
    {
      name: 'Platinum Package',
      price: '5,000 TND / year',
      popular: true,
      features: [
        'Prime logo placement on AGGE website, newsletter & event proceedings',
        '4 complimentary full professional memberships',
        'Dedicated exhibition booth at AGGE annual conference & summits',
        'Keynote presentation or workshop slot at regional events',
        'Direct access to AGGE student & young researcher talent pool',
        'Social media & press release spotlight',
      ],
    },
    {
      name: 'Gold Package',
      price: '3,000 TND / year',
      popular: false,
      features: [
        'Prominent logo display on AGGE homepage & event banners',
        '2 complimentary professional memberships',
        'Exhibition table at AGGE workshops and symposiums',
        'Feature article in AGGE digital newsletter',
        'Recruitment announcements in AGGE student portal',
      ],
    },
    {
      name: 'Silver Package',
      price: '1,500 TND / year',
      popular: false,
      features: [
        'Logo placement on AGGE sponsors page & event materials',
        '1 complimentary professional membership',
        'Reduced registration fees for corporate delegates',
        'Acknowledgment in conference opening ceremonies',
      ],
    },
  ];

  return (
    <div className="font-sans bg-cream text-navy">
      {/* Hero Section */}
      <section className="relative bg-navy py-20 px-6 text-white overflow-hidden">
        <div className="contour-bg opacity-15" />
        <div className="relative z-10 mx-auto max-w-5xl text-center space-y-4">
          <span className="inline-block rounded-full bg-copper/20 border border-copper/40 px-4 py-1 text-xs font-bold text-sand uppercase tracking-wider">
            Sponsorship &amp; Partnerships
          </span>
          <h1 className="text-4xl sm:text-5xl font-display font-light text-cream">
            Our Sponsors &amp; Institutional Partners
          </h1>
          <p className="mx-auto max-w-2xl text-sm sm:text-base text-slate-300 font-light leading-relaxed">
            AGGE collaborates with industry leaders, research institutions, and environmental stakeholders to advance geophysics, geosciences, and environmental sciences worldwide.
          </p>
        </div>
      </section>

      {/* Navigation Tabs Bar */}
      <div className="bg-navy-mid border-b border-navy-light py-4 px-6 text-center">
        <div className="mx-auto max-w-4xl flex justify-center gap-6 text-xs uppercase font-bold tracking-wider text-slate-300">
          <a href="#current-sponsors" className="hover:text-sand transition">Current Sponsors</a>
          <span>•</span>
          <a href="#sponsorship-opportunities" className="hover:text-sand transition">Sponsorship Packages</a>
          <span>•</span>
          <a href="#become-a-sponsor" className="hover:text-sand transition">Become a Sponsor Form</a>
        </div>
      </div>

      {/* SECTION 1: Current Sponsors */}
      <section id="current-sponsors" className="py-16 px-6 bg-cream border-b border-sand/30">
        <div className="mx-auto max-w-6xl space-y-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-[10px] font-bold text-copper uppercase tracking-widest">Our Community Network</span>
            <h2 className="text-3xl font-display font-bold text-navy">Supporting Organisations</h2>
            <p className="text-xs text-text-muted">
              We extend our heartfelt gratitude to the corporate sponsors and academic institutions powering AGGE research and event initiatives.
            </p>
          </div>

          {/* Platinum Tier */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-copper"></span>
              <h3 className="text-xs uppercase tracking-widest font-bold text-navy">Platinum Partners</h3>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {currentSponsors.platinum.map((item) => (
                <div key={item.name} className="flex items-center gap-5 p-6 bg-white rounded-2xl border border-sand/40 shadow-sm hover:shadow-md transition">
                  <div className="h-14 w-14 rounded-xl bg-navy/5 flex items-center justify-center shrink-0">
                    <i className="fas fa-building text-navy text-2xl"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-navy text-base">{item.name}</h4>
                    <p className="text-xs text-slate-500">{item.category}</p>
                    <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider text-copper bg-copper/10 px-2.5 py-0.5 rounded-full">
                      Platinum Partner
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gold Tier */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-sandstone"></span>
              <h3 className="text-xs uppercase tracking-widest font-bold text-navy">Gold Sponsors</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {currentSponsors.gold.map((item) => (
                <div key={item.name} className="p-5 bg-white rounded-xl border border-sand/30 shadow-xs text-center space-y-1">
                  <i className="fas fa-industry text-copper text-lg mb-1"></i>
                  <h4 className="font-bold text-navy text-sm">{item.name}</h4>
                  <p className="text-[11px] text-slate-500">{item.category}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Academic & Institutional Partners */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-sage"></span>
              <h3 className="text-xs uppercase tracking-widest font-bold text-navy">Academic &amp; Research Partners</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {currentSponsors.academic.map((item) => (
                <div key={item.name} className="p-5 bg-sage/5 rounded-xl border border-sage/20 text-center space-y-1">
                  <i className="fas fa-university text-sage text-lg mb-1"></i>
                  <h4 className="font-bold text-navy text-sm">{item.name}</h4>
                  <p className="text-[11px] text-sage">{item.type}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Become a Sponsor Opportunities & Packages */}
      <section id="sponsorship-opportunities" className="py-20 px-6 bg-white">
        <div className="mx-auto max-w-6xl space-y-16">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-[10px] font-bold text-copper uppercase tracking-widest">Partnership Options</span>
            <h2 className="text-3xl font-display font-bold text-navy">Sponsorship Packages</h2>
            <p className="text-xs text-text-muted leading-relaxed">
              Partner with AGGE to gain international visibility, showcase your technology to leading geoscientists and researchers, and support sustainable Earth science applications.
            </p>
          </div>

          {/* Package Cards */}
          <div className="grid gap-8 lg:grid-cols-3 items-stretch">
            {packages.map((pkg) => (
              <div
                key={pkg.name}
                className={`relative flex flex-col justify-between p-8 rounded-3xl border transition-all duration-300 ${
                  pkg.popular
                    ? 'bg-navy text-white border-copper shadow-2xl scale-105 z-10'
                    : 'bg-cream border-sand/40 text-navy hover:shadow-lg'
                }`}
              >
                {pkg.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-copper px-4 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white shadow-md">
                    Most Popular Choice
                  </span>
                )}

                <div className="space-y-6">
                  <div>
                    <h3 className={`text-xl font-display font-bold ${pkg.popular ? 'text-cream' : 'text-navy'}`}>
                      {pkg.name}
                    </h3>
                    <p className={`text-2xl font-bold mt-2 ${pkg.popular ? 'text-sand' : 'text-copper'}`}>
                      {pkg.price}
                    </p>
                  </div>

                  <ul className="space-y-3 text-xs">
                    {pkg.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <i className={`fas fa-check-circle mt-0.5 ${pkg.popular ? 'text-sand' : 'text-copper'}`} />
                        <span className={pkg.popular ? 'text-slate-200' : 'text-slate-600'}>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-8">
                  <a
                    href="#become-a-sponsor"
                    onClick={() => setFormData({ ...formData, packageTier: pkg.name })}
                    className={`block w-full text-center rounded-full py-3 text-xs font-bold uppercase tracking-wider transition ${
                      pkg.popular
                        ? 'bg-gradient-to-r from-copper to-copper-light text-white hover:scale-105 shadow-lg'
                        : 'bg-navy text-white hover:bg-navy-mid'
                    }`}
                  >
                    Select {pkg.name}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: Contact / Application Form */}
      <section id="become-a-sponsor" className="py-20 px-6 bg-navy text-white relative">
        <div className="contour-bg opacity-15" />
        <div className="relative z-10 mx-auto max-w-4xl space-y-10">
          <div className="text-center space-y-3">
            <span className="text-[10px] font-bold text-sand uppercase tracking-widest">Connect With Our Team</span>
            <h2 className="text-3xl font-display font-light text-cream">Become an AGGE Sponsor</h2>
            <p className="text-xs text-slate-300 max-w-xl mx-auto">
              Interested in a custom partnership, exhibition booth, or event sponsorship? Fill out the form below and our partnership coordinator will reach out promptly.
            </p>
          </div>

          <div className="bg-navy-mid/90 backdrop-blur p-8 sm:p-10 rounded-3xl border border-navy-light shadow-2xl">
            {submitted ? (
              <div className="text-center py-12 space-y-4 animate-fadeIn">
                <div className="h-16 w-16 bg-sage/20 text-sage rounded-full flex items-center justify-center mx-auto text-3xl">
                  <i className="fas fa-check-circle"></i>
                </div>
                <h3 className="text-2xl font-display text-cream font-bold">Inquiry Received!</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  Thank you for your interest in partnering with the Association for Geophysics, Geoscience and Environment. Our corporate relations officer will contact you within 24 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 rounded-full border border-sand/40 px-6 py-2 text-xs text-sand hover:bg-white/10"
                >
                  Submit Another Request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Organisation / Company Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.orgName}
                      onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
                      placeholder="e.g. Earth Tech Ltd"
                      className="w-full rounded-xl bg-navy border border-navy-light px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-copper focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Contact Representative Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      placeholder="Dr. Full Name"
                      className="w-full rounded-xl bg-navy border border-navy-light px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-copper focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="contact@company.com"
                      className="w-full rounded-xl bg-navy border border-navy-light px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-copper focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Phone / WhatsApp</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+216 XX XXX XXX"
                      className="w-full rounded-xl bg-navy border border-navy-light px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-copper focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Preferred Sponsorship Package</label>
                  <select
                    value={formData.packageTier}
                    onChange={(e) => setFormData({ ...formData, packageTier: e.target.value })}
                    className="w-full rounded-xl bg-navy border border-navy-light px-4 py-3 text-xs text-white focus:border-copper focus:outline-none"
                  >
                    <option value="Platinum Package">Platinum Package (5,000 TND / year)</option>
                    <option value="Gold Package">Gold Package (3,000 TND / year)</option>
                    <option value="Silver Package">Silver Package (1,500 TND / year)</option>
                    <option value="Academic / Research Partner">Academic &amp; Research Partnership</option>
                    <option value="Custom Sponsorship">Custom Event / Exhibition Sponsorship</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Partnership Goals / Comments</label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about your organization's objectives or specific events you wish to sponsor..."
                    className="w-full rounded-xl bg-navy border border-navy-light px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-copper focus:outline-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-full bg-gradient-to-r from-copper to-copper-light py-3.5 text-xs font-bold uppercase tracking-wider text-white hover:scale-[1.02] transition shadow-xl"
                >
                  Submit Sponsorship Inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initHeaderScroll();
  initScrollReveal();
  initStatCounters();
  initWorldMap();
  initParallax();
  initPricingTabs();
  initGalleryFilter();
  initLoginForm();
});

function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', nav.classList.contains('open'));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => nav.classList.remove('open'));
  });
}

function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  };

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

function initScrollReveal() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const elements = document.querySelectorAll('.reveal');

  if (prefersReduced) {
    elements.forEach((el) => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach((el) => observer.observe(el));
}

function initStatCounters() {
  const stats = document.querySelectorAll('.stat-number');
  if (!stats.length) return;

  const animate = (el) => {
    const target = parseInt(el.dataset.target, 10);
    const duration = 2000;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target).toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString();
    };

    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  stats.forEach((stat) => observer.observe(stat));
}

function initWorldMap() {
  const markers = document.querySelectorAll('.map-marker');
  const panels = document.querySelectorAll('.map-panel-content');
  const placeholder = document.getElementById('map-placeholder');
  if (!markers.length) return;

  const showProject = (id) => {
    markers.forEach((m) => m.classList.toggle('active', m.dataset.project === id));
    panels.forEach((p) => p.classList.toggle('active', p.dataset.project === id));
    if (placeholder) placeholder.style.display = 'none';
  };

  markers.forEach((marker) => {
    marker.addEventListener('click', () => showProject(marker.dataset.project));
    marker.addEventListener('mouseenter', () => showProject(marker.dataset.project));
  });

  if (markers[0]) showProject(markers[0].dataset.project);
}

function initParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const layers = document.querySelectorAll('[data-parallax]');
  if (!layers.length) return;

  let ticking = false;

  const update = () => {
    const scrollY = window.scrollY;
    layers.forEach((layer) => {
      const speed = parseFloat(layer.dataset.parallax) || 0;
      layer.style.transform = `translate3d(0, ${scrollY * speed}px, 0)`;
    });
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  update();
}

function initPricingTabs() {
  const tabs = document.querySelectorAll('.pricing-tab');
  const panels = document.querySelectorAll('.pricing-panel');
  if (!tabs.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.plan;
      tabs.forEach((t) => t.classList.toggle('active', t === tab));
      panels.forEach((panel) => panel.classList.toggle('active', panel.dataset.plan === target));
    });
  });
}

function initGalleryFilter() {
  const filters = document.querySelectorAll('.gallery-filter');
  const items = document.querySelectorAll('.gallery-item');
  if (!filters.length) return;

  filters.forEach((filter) => {
    filter.addEventListener('click', () => {
      const category = filter.dataset.filter;
      filters.forEach((f) => f.classList.toggle('active', f === filter));
      items.forEach((item) => {
        item.style.display = category === 'all' || item.dataset.category === category ? '' : 'none';
      });
    });
  });
}

function initLoginForm() {
  const form = document.getElementById('login-form');
  const success = document.getElementById('form-success');
  if (!form || !success) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    form.classList.add('is-submitted');
    success.classList.add('is-visible');
  });
}

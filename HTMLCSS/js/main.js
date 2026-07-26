/**
 * AGGE — Association of Geosciences & Geo Engineering
 * Main Client Interactivity Script
 */

document.addEventListener('DOMContentLoaded', () => {
  // Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
      mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
      mobileMenu.classList.toggle('hidden');

      const icon = mobileMenuBtn.querySelector('i');
      if (icon) {
        if (mobileMenu.classList.contains('hidden')) {
          icon.className = 'fas fa-bars';
        } else {
          icon.className = 'fas fa-times';
        }
      }
    });
  }

  // Active Link Highlighting
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('header nav a, #mobile-menu nav a');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('text-sand', 'font-semibold');
    }
  });

  // Tab Switcher Handler
  const tabContainers = document.querySelectorAll('[data-tabs]');
  tabContainers.forEach(container => {
    const tabBtns = container.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');

        tabBtns.forEach(b => b.classList.remove('active', 'bg-navy', 'text-white'));
        btn.classList.add('active', 'bg-navy', 'text-white');

        tabContents.forEach(content => {
          if (content.id === targetTab) {
            content.classList.add('active');
            content.style.display = 'block';
          } else {
            content.classList.remove('active');
            content.style.display = 'none';
          }
        });
      });
    });
  });

  // Modal Handlers
  const modalTriggers = document.querySelectorAll('[data-modal-target]');
  const modalCloses = document.querySelectorAll('[data-modal-close]');

  modalTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const modalId = trigger.getAttribute('data-modal-target');
      const targetModal = document.getElementById(modalId);
      if (targetModal) {
        targetModal.classList.remove('hidden');
        targetModal.classList.add('flex');
      }
    });
  });

  modalCloses.forEach(close => {
    close.addEventListener('click', () => {
      const modal = close.closest('.modal-container');
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
    });
  });

  // Footer Year Auto Update
  const footerYear = document.getElementById('copyright-year');
  if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
  }
});

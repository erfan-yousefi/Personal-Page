'use strict';

(() => {
  const root = document.documentElement;
  const themeButton = document.querySelector('.theme-toggle');
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const updateThemeControl = () => {
    const isDark = root.dataset.theme !== 'light';
    themeButton.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} theme`);
    themeMeta.content = isDark ? '#171a16' : '#f7f7f0';
  };
  themeButton.hidden = false;
  updateThemeControl();
  themeButton.addEventListener('click', () => {
    const theme = root.dataset.theme === 'light' ? 'dark' : 'light';
    root.dataset.theme = theme;
    // Storage may be disabled in private or embedded browsing contexts.
    try { localStorage.setItem('theme', theme); } catch {}
    updateThemeControl();
  });

  const menuButton = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('#mobile-nav');
  menuButton.hidden = false;
  const setMenu = (open) => {
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    mobileNav.hidden = !open;
  };
  menuButton.addEventListener('click', () => setMenu(mobileNav.hidden));
  mobileNav.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenu(false);
  });
  document.addEventListener('click', (event) => {
    if (!mobileNav.hidden && !event.target.closest('.site-header')) setMenu(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !mobileNav.hidden) {
      setMenu(false);
      menuButton.focus();
    }
  });
  window.matchMedia('(min-width: 601px)').addEventListener('change', (event) => {
    if (event.matches) setMenu(false);
  });

  const cards = [...document.querySelectorAll('.certificate')];
  const filterButtons = [...document.querySelectorAll('[data-filter]')];
  const showMore = document.querySelector('#show-certificates');
  const count = document.querySelector('.certificate-count');
  let activeFilter = 'all';
  let expanded = false;
  const updateCertificates = () => {
    const matching = cards.filter(card => activeFilter === 'all' || card.dataset.category === activeFilter);
    const visible = new Set(expanded || activeFilter !== 'all' ? matching : matching.slice(0, 6));
    cards.forEach(card => { card.hidden = !visible.has(card); });
    count.textContent = `Showing ${visible.size} of ${matching.length} certificates`;
    showMore.hidden = activeFilter !== 'all' || matching.length <= 6;
    showMore.setAttribute('aria-expanded', String(expanded));
    showMore.textContent = expanded ? 'Show fewer certificates ↑' : `View all ${matching.length} certificates ↓`;
    filterButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === activeFilter)));
  };
  document.querySelector('.certificate-toolbar').hidden = false;
  document.querySelector('.filters').addEventListener('click', (event) => {
    const button = event.target.closest('[data-filter]');
    if (!button) return;
    activeFilter = button.dataset.filter;
    expanded = false;
    updateCertificates();
  });
  showMore.addEventListener('click', () => {
    expanded = !expanded;
    updateCertificates();
    if (expanded) {
      // Move keyboard focus to the first newly revealed credential.
      cards[6]?.focus({ preventScroll: true });
    } else {
      document.querySelector('.certificate-toolbar').scrollIntoView({ block: 'start' });
    }
  });
  updateCertificates();

  const dialog = document.querySelector('.certificate-dialog');
  const preview = dialog.querySelector('.dialog-image');
  const previewStatus = dialog.querySelector('.image-status');
  const originalLink = dialog.querySelector('.original-link');
  let openedFrom = null;

  // Real links remain the fallback in browsers without native dialog support.
  if (typeof dialog.showModal === 'function') {
    cards.forEach(card => card.setAttribute('aria-haspopup', 'dialog'));
    document.querySelector('.certificate-grid').addEventListener('click', (event) => {
      const card = event.target.closest('.certificate');
      if (!card || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      openedFrom = card;
      dialog.querySelector('#dialog-title').textContent = card.dataset.title;
      preview.alt = `Certificate: ${card.dataset.title}`;
      preview.hidden = true;
      previewStatus.hidden = false;
      previewStatus.textContent = 'Loading certificate…';
      originalLink.href = card.href;
      preview.src = card.href;
      dialog.showModal();
      document.body.classList.add('dialog-open');
    });
    preview.addEventListener('load', () => {
      preview.hidden = false;
      previewStatus.hidden = true;
    });
    preview.addEventListener('error', () => {
      preview.hidden = true;
      previewStatus.hidden = false;
      previewStatus.textContent = 'The preview could not load. Use “Open original” below to view the certificate.';
    });
    const closeButton = dialog.querySelector('.dialog-close');
    closeButton.addEventListener('click', () => dialog.close());
    dialog.addEventListener('keydown', (event) => {
      if (event.key !== 'Tab') return;
      if (event.shiftKey && document.activeElement === closeButton) {
        event.preventDefault();
        originalLink.focus();
      } else if (!event.shiftKey && document.activeElement === originalLink) {
        event.preventDefault();
        closeButton.focus();
      }
    });
    // Only dismiss a click on the backdrop, not the image or dialog padding.
    dialog.addEventListener('click', (event) => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => {
      document.body.classList.remove('dialog-open');
      preview.removeAttribute('src');
      openedFrom?.focus({ preventScroll: true });
    });
  }

  // Native observers replace the blocking third-party animation dependency.
  if ('IntersectionObserver' in window) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!reducedMotion.matches) {
      const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08 });
      document.querySelectorAll('[data-reveal]').forEach(element => revealObserver.observe(element));
    }

    const navigationLinks = [...document.querySelectorAll('.desktop-nav a')];
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navigationLinks.forEach(link => {
          if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-15% 0px -55% 0px', threshold: 0 });
    document.querySelectorAll('main > section[id]').forEach(section => sectionObserver.observe(section));
  }
  document.querySelector('#year').textContent = String(new Date().getFullYear());
})();

document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = window.matchMedia('(hover: hover)').matches;

  /* ---------- Active nav link ---------- */
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.main-nav a, .mobile-menu a').forEach((link) => {
    const href = link.getAttribute('href');
    if (href === path) link.setAttribute('aria-current', 'page');
    if (href === path) link.classList.add('active');
  });

  /* ---------- Header on scroll ---------- */
  const header = document.querySelector('.site-header');
  if (header) {
    const toggleHeader = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 40);
    };
    toggleHeader();
    window.addEventListener('scroll', toggleHeader, { passive: true });
  }

  /* ---------- Copyright year (with static fallback already in HTML) ---------- */
  document.querySelectorAll('.copy-year').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Mobile menu ---------- */
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (menuToggle && mobileMenu) {
    const getFocusable = () =>
      Array.from(mobileMenu.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])'))
        .filter((el) => el.offsetParent !== null);

    const openMenu = () => {
      mobileMenu.classList.add('is-open');
      menuToggle.classList.add('is-open');
      menuToggle.setAttribute('aria-expanded', 'true');
      menuToggle.setAttribute('aria-label', 'Chiudi menu di navigazione');
      document.body.classList.add('menu-open');
      const focusable = getFocusable();
      if (focusable.length) focusable[0].focus();
    };

    const closeMenu = ({ returnFocus = true } = {}) => {
      mobileMenu.classList.remove('is-open');
      menuToggle.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Apri menu di navigazione');
      document.body.classList.remove('menu-open');
      if (returnFocus) menuToggle.focus();
    };

    menuToggle.addEventListener('click', () => {
      if (mobileMenu.classList.contains('is-open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    mobileMenu.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => closeMenu({ returnFocus: false }))
    );

    document.addEventListener('keydown', (e) => {
      if (!mobileMenu.classList.contains('is-open')) return;

      if (e.key === 'Escape') {
        closeMenu();
        return;
      }

      if (e.key === 'Tab') {
        const focusable = getFocusable();
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Grotta: hover spotlight (mouse) + tap/keyboard image swap ---------- */
  const grottaMedia = document.querySelector('.grotta-section .split-media');
  const grottaHintText = document.querySelector('.grotta-hint-text');
  if (grottaMedia) {
    if (!reduceMotion && canHover) {
      grottaMedia.addEventListener('mousemove', (e) => {
        const rect = grottaMedia.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        grottaMedia.style.setProperty('--x', `${x}%`);
        grottaMedia.style.setProperty('--y', `${y}%`);
      });
    }

    if (grottaHintText) {
      grottaHintText.textContent = canHover
        ? "Muovi il cursore sull'immagine per svelare un diverso scorcio della grotta al calar della sera."
        : "Tocca l'immagine per scoprire un altro allestimento della Grotta Naturale.";
    }

    const toggleGrotta = () => {
      const isSwapped = grottaMedia.classList.toggle('is-swapped');
      grottaMedia.setAttribute('aria-pressed', String(isSwapped));
    };
    grottaMedia.setAttribute('role', 'button');
    grottaMedia.setAttribute('tabindex', '0');
    grottaMedia.setAttribute('aria-pressed', 'false');
    grottaMedia.setAttribute('aria-label', 'Mostra un altro allestimento della Grotta Naturale');
    grottaMedia.addEventListener('click', toggleGrotta);
    grottaMedia.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        toggleGrotta();
      }
    });
  }

  /* ---------- Parallax ---------- */
  const parallaxImgs = document.querySelectorAll('.parallax-img');
  if (parallaxImgs.length && !reduceMotion) {
    let ticking = false;
    const updateParallax = () => {
      parallaxImgs.forEach((img) => {
        const rect = img.parentElement.getBoundingClientRect();
        const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
        const offset = (progress - 0.5) * 60;
        img.style.transform = `translateY(${offset}px)`;
      });
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
    updateParallax();
  }

  /* ---------- Gallery filters ---------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const galleryGrid = document.querySelector('.gallery-grid');
  if (filterBtns.length) {
    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterBtns.forEach((b) => b.setAttribute('aria-pressed', 'false'));
        btn.setAttribute('aria-pressed', 'true');
        const filter = btn.dataset.filter;
        galleryItems.forEach((item) => {
          const match = filter === 'all' || item.dataset.category === filter;
          item.classList.toggle('hidden', !match);
          if (!match) item.setAttribute('tabindex', '-1');
          else item.setAttribute('tabindex', '0');
        });
        // Masonry spans (g-large/g-wide/g-tall) only tile cleanly with the full set.
        // Filtered subsets use a uniform grid so "dense" packing never leaves gaps.
        if (galleryGrid) galleryGrid.classList.toggle('is-filtered', filter !== 'all');
      });
    });
  }

  /* ---------- Lightbox ---------- */
  const lightbox = document.querySelector('.lightbox');
  if (lightbox && galleryItems.length) {
    const lbImg = lightbox.querySelector('img');
    const lbCap = lightbox.querySelector('.lightbox-cap');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');
    let currentIndex = 0;
    let originItem = null;

    const visibleItems = () => Array.from(galleryItems).filter((item) => !item.classList.contains('hidden'));

    galleryItems.forEach((item, index) => {
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');
      const title = item.querySelector('.title');
      item.setAttribute('aria-label', `Apri in vista ingrandita: ${title ? title.textContent : 'immagine galleria'}`);
    });

    const openLightbox = (index, trigger) => {
      const items = visibleItems();
      currentIndex = index;
      const item = items[currentIndex];
      if (!item) return;
      originItem = trigger || item;
      const img = item.querySelector('img');
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      lbCap.textContent = img.alt;
      lightbox.classList.add('is-open');
      document.body.classList.add('lightbox-open');
      closeBtn.focus();
    };

    const closeLightbox = () => {
      lightbox.classList.remove('is-open');
      document.body.classList.remove('lightbox-open');
      if (originItem) originItem.focus();
    };

    const step = (dir) => {
      const items = visibleItems();
      currentIndex = (currentIndex + dir + items.length) % items.length;
      openLightbox(currentIndex, originItem);
    };

    const activate = (item) => {
      const items = visibleItems();
      const realIndex = items.indexOf(item);
      openLightbox(realIndex === -1 ? 0 : realIndex, item);
    };

    galleryItems.forEach((item) => {
      item.addEventListener('click', () => activate(item));
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault();
          activate(item);
        }
      });
    });

    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', () => step(-1));
    nextBtn.addEventListener('click', () => step(1));
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') { closeLightbox(); return; }
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'Tab') {
        const focusable = [prevBtn, nextBtn, closeBtn];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }

  /* ---------- Hero video ---------- */
  const heroVideo = document.querySelector('.hero-video');
  if (heroVideo) {
    if (reduceMotion) {
      heroVideo.removeAttribute('autoplay');
      heroVideo.pause();
    } else if ('IntersectionObserver' in window) {
      const vio = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) heroVideo.play().catch(() => {});
          else heroVideo.pause();
        });
      }, { threshold: 0.1 });
      vio.observe(heroVideo);
    }
  }
});

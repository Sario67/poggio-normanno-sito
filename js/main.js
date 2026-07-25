document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Active nav link ---------- */
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.main-nav a, .mobile-menu a').forEach((link) => {
    const href = link.getAttribute('href');
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

  /* ---------- Mobile menu ---------- */
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (menuToggle && mobileMenu) {
    const closeMenu = () => {
      menuToggle.classList.remove('is-open');
      mobileMenu.classList.remove('is-open');
      document.body.style.overflow = '';
    };
    menuToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('is-open');
      menuToggle.classList.toggle('is-open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));
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

  /* ---------- Grotta spotlight effect ---------- */
  const grottaMedia = document.querySelector('.grotta-section .split-media');
  if (grottaMedia && !reduceMotion && window.matchMedia('(hover: hover)').matches) {
    grottaMedia.addEventListener('mousemove', (e) => {
      const rect = grottaMedia.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      grottaMedia.style.setProperty('--x', `${x}%`);
      grottaMedia.style.setProperty('--y', `${y}%`);
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
        filterBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        galleryItems.forEach((item) => {
          const match = filter === 'all' || item.dataset.category === filter;
          item.classList.toggle('hidden', !match);
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
    let currentIndex = 0;

    const visibleItems = () => Array.from(galleryItems).filter((item) => !item.classList.contains('hidden'));

    const openLightbox = (index) => {
      const items = visibleItems();
      currentIndex = index;
      const item = items[currentIndex];
      if (!item) return;
      const img = item.querySelector('img');
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      lbCap.textContent = img.alt;
      lightbox.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
      lightbox.classList.remove('is-open');
      document.body.style.overflow = '';
    };

    const step = (dir) => {
      const items = visibleItems();
      currentIndex = (currentIndex + dir + items.length) % items.length;
      openLightbox(currentIndex);
    };

    galleryItems.forEach((item, index) => {
      item.addEventListener('click', () => {
        const items = visibleItems();
        const realIndex = items.indexOf(item);
        openLightbox(realIndex === -1 ? 0 : realIndex);
      });
    });

    lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox-prev').addEventListener('click', () => step(-1));
    lightbox.querySelector('.lightbox-next').addEventListener('click', () => step(1));
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    });
  }

  /* ---------- Hero video: pause when out of view (perf) ---------- */
  const heroVideo = document.querySelector('.hero-video');
  if (heroVideo && 'IntersectionObserver' in window) {
    const vio = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) heroVideo.play().catch(() => {});
        else heroVideo.pause();
      });
    }, { threshold: 0.1 });
    vio.observe(heroVideo);
  }
});

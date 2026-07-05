// 江西 AI OPC 联盟 — interactions

(function () {
  'use strict';

  // ---------- Nav scroll state ----------
  const nav = document.getElementById('nav');
  const onScroll = () => {
    if (window.scrollY > 12) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- Mobile nav toggle ----------
  const toggle = document.getElementById('navToggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('show'));
    links.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => links.classList.remove('show'))
    );
  }

  // ---------- Counter animation ----------
  const counters = document.querySelectorAll('.hero-stats strong[data-target]');
  const animateCounter = (el) => {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1600;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.floor(target * eased) + suffix;
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = target + suffix;
    };
    requestAnimationFrame(tick);
  };

  // ---------- Reveal on scroll ----------
  const revealEls = document.querySelectorAll(
    '.reveal, .section-head, .about-grid, .value-card, .brand-card, .night-cards, .night-illust, .solution, .logos-strip, .member, .partner-card, .city-banner, .cta-head, .cta-qr, .cta-form, .gallery-filters, .gallery-grid, .opc-space-card, .demand-card, .opc-stats-bar, .aidaily-banner'
  );
  revealEls.forEach(el => el.classList.add('reveal'));

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => io.observe(el));

    // Counter trigger
    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) {
      const cio = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            counters.forEach(animateCounter);
            cio.disconnect();
          }
        });
      }, { threshold: 0.3 });
      cio.observe(heroStats);
    }
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
    counters.forEach(animateCounter);
  }

  // ---------- Smooth anchor offset for sticky nav ----------
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      const top = el.getBoundingClientRect().top + window.scrollY - 60;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ---------- AI 日报日期动态显示 ----------
  const aidailyDate = document.getElementById('aidailyDate');
  if (aidailyDate) {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    aidailyDate.textContent = `${mm}月${dd}日`;
  }


  // ---------- Gallery filter & lightbox (only on pages with gallery) ----------
  const filters = document.querySelectorAll('.g-filter');
  const items = Array.from(document.querySelectorAll('.g-item'));
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  const galleryLoadmore = document.getElementById('galleryLoadmore');
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImg');
  const lbCap = document.getElementById('lbCap');

  if (items.length && galleryLoadmore && lb && lbImg && lbCap) {
    const PER_PAGE = 9;
    let page = 1;
    let activeCat = 'all';

    const applyFilter = (cat) => {
      activeCat = cat;
      page = 1;
      const visible = items.filter(it => cat === 'all' || it.dataset.cat === cat);
      visible.forEach((it, idx) => {
        it.classList.toggle('hidden', idx >= PER_PAGE);
      });
      if (visible.length <= PER_PAGE) {
        galleryLoadmore.style.display = 'none';
      } else {
        galleryLoadmore.style.display = 'flex';
      }
    };

    filters.forEach(f => {
      f.addEventListener('click', () => {
        filters.forEach(x => x.classList.toggle('active', x === f));
        applyFilter(f.dataset.filter);
      });
    });

    // Initially apply filter
    applyFilter('all');

    // Load more
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        page++;
        const visible = items.filter(it => activeCat === 'all' || it.dataset.cat === activeCat);
        const showCount = page * PER_PAGE;
        visible.forEach((it, idx) => {
          it.classList.toggle('hidden', idx >= showCount);
        });
        if (showCount >= visible.length) {
          galleryLoadmore.style.display = 'none';
        }
      });
    }

    // ---------- Lightbox ----------
    let lbIdx = 0;
    let visibleItems = () => items.filter(it => !it.classList.contains('hidden'));

    const openLb = (idx) => {
      const list = visibleItems();
      if (!list.length) return;
      lbIdx = ((idx % list.length) + list.length) % list.length;
      const target = list[lbIdx];
      const img = target.querySelector('img');
      const cap = target.querySelector('figcaption');
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt;
      lbCap.textContent = cap ? cap.textContent.trim() : '';
      lb.classList.add('open');
      lb.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };
    const closeLb = () => {
      lb.classList.remove('open');
      lb.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };
    const stepLb = (delta) => openLb(lbIdx + delta);

    items.forEach((it) => {
      it.addEventListener('click', () => {
        const list = visibleItems();
        const idx = list.indexOf(it);
        if (idx >= 0) openLb(idx);
      });
    });

    lb.querySelector('.lb-close').addEventListener('click', closeLb);
    lb.querySelector('.lb-prev').addEventListener('click', () => stepLb(-1));
    lb.querySelector('.lb-next').addEventListener('click', () => stepLb(1));
    lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
    document.addEventListener('keydown', (e) => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') closeLb();
      else if (e.key === 'ArrowLeft') stepLb(-1);
      else if (e.key === 'ArrowRight') stepLb(1);
    });
  }
})();

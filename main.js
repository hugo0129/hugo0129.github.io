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

  // ---------- Nav dropdown (click to toggle on touch / mobile) ----------
  document.querySelectorAll('.nav-dropdown').forEach((dd) => {
    const trigger = dd.querySelector('.nav-drop-trigger');
    if (!trigger) return;
    trigger.addEventListener('click', (e) => {
      // On desktop, hover handles it; on touch / mobile, toggle open
      if (window.matchMedia('(max-width: 800px)').matches || e.detail > 0) {
        e.preventDefault();
        const isOpen = dd.classList.toggle('open');
        trigger.setAttribute('aria-expanded', String(isOpen));
      }
    });
  });
  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-dropdown')) {
      document.querySelectorAll('.nav-dropdown.open').forEach((dd) => {
        dd.classList.remove('open');
        const t = dd.querySelector('.nav-drop-trigger');
        if (t) t.setAttribute('aria-expanded', 'false');
      });
    }
  });

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

  // ---------- News list render (only on news page) ----------
  const newsTimeline = document.getElementById('newsTimeline');
  if (newsTimeline) {
    const newsEmpty = document.getElementById('newsEmpty');
    const newsFilters = document.querySelectorAll('.news-filter');
    const newsTotalCount = document.getElementById('newsTotalCount');
    const newsMediaCount = document.getElementById('newsMediaCount');
    const newsWechatCount = document.getElementById('newsWechatCount');
    let newsData = [];
    let newsActiveFilter = 'all';

    const badgeLabels = {
      media: '官媒报道',
      wechat: '公众号',
      event: '活动预告',
      voice: '行业发声'
    };

    const formatDate = (dateStr) => {
      const d = new Date(dateStr);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return yyyy + '.' + mm + '.' + dd;
    };

    const renderNews = (data) => {
      newsTimeline.innerHTML = '';
      if (!data.length) {
        newsEmpty.style.display = 'block';
        return;
      }
      newsEmpty.style.display = 'none';

      data.forEach((item) => {
        const div = document.createElement('div');
        div.className = 'news-item reveal' + (item.featured ? ' featured' : '');
        div.dataset.type = item.sourceType;

        const badgeClass = 'news-badge-' + item.sourceType;
        const badgeLabel = badgeLabels[item.sourceType] || item.sourceType;

        div.innerHTML =
          '<div class="news-dot"></div>' +
          '<a class="news-card" href="' + item.url + '" target="_blank" rel="noopener">' +
            '<div class="news-card-head">' +
              '<span class="news-date">' + formatDate(item.date) + '</span>' +
              '<span class="news-badge ' + badgeClass + '">' + badgeLabel + '</span>' +
              '<span class="news-source">' + item.source + '</span>' +
              (item.featured ? '<span class="news-featured-tag">置顶</span>' : '') +
            '</div>' +
            '<h3 class="news-title">' + item.title + '</h3>' +
            (item.summary ? '<p class="news-summary">' + item.summary + '</p>' : '') +
            '<span class="news-link">阅读原文 →</span>' +
          '</a>';

        newsTimeline.appendChild(div);
      });

      // Reveal animation
      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              io.unobserve(entry.target);
            }
          });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        newsTimeline.querySelectorAll('.news-item').forEach(el => io.observe(el));
      } else {
        newsTimeline.querySelectorAll('.news-item').forEach(el => el.classList.add('visible'));
      }
    };

    const applyNewsFilter = (filter) => {
      newsActiveFilter = filter;
      newsFilters.forEach(f => f.classList.toggle('active', f.dataset.filter === filter));
      const filtered = filter === 'all'
        ? newsData
        : newsData.filter(item => item.sourceType === filter);
      renderNews(filtered);
    };

    newsFilters.forEach(f => {
      f.addEventListener('click', () => applyNewsFilter(f.dataset.filter));
    });

    // Render from inline data (no fetch needed — works with file:// protocol)
    if (window.NEWS_DATA && Array.isArray(window.NEWS_DATA)) {
      // Sort by date descending
      newsData = window.NEWS_DATA.sort((a, b) => new Date(b.date) - new Date(a.date));

      // Update stats
      if (newsTotalCount) newsTotalCount.textContent = newsData.length;
      if (newsMediaCount) newsMediaCount.textContent = newsData.filter(i => i.sourceType === 'media').length;
      if (newsWechatCount) newsWechatCount.textContent = newsData.filter(i => i.sourceType === 'wechat').length;

      renderNews(newsData);
    } else {
      newsTimeline.innerHTML = '<div class="news-loading">数据加载失败，请刷新重试。</div>';
    }
  }
})();

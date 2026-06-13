/* =====================================================
   FinanceNews Navigator  |  Google DeepMine v2.1
   Loads all data from data.json via fetch()
   Logo button: fixed left, always visible
   ===================================================== */

(function () {
  'use strict';

  /* ── CONSTANTS ───────────────────────────────────── */
  const DEFAULT_COIN     = 'BTC';
  const DEFAULT_QUERY_TPL =
    'ราคา {COIN} วันนี้จากนั้นวิเคราะห์ ทิศทางเพื่อหาแนวทางเทรด';
  const BASE_URL =
    'https://www.google.com/search?igu=1&ctxs=2' +
    '&sxsrf=AE3TifOHvDnV3Oa3M9AQi9AuKOQ__k588A%3A1765292428919' +
    '&udm=50&fbs=AIIjpHwddnRuQwBQAoDsj65ELSF9yG';

  /* ── STATE ───────────────────────────────────────── */
  let COIN_REGISTRY    = {};
  let MAIN_CATEGORIES  = [];
  let NEWS_CATEGORIES  = [];

  let currentCoin   = DEFAULT_COIN;
  let currentMode   = 'main';   // 'main' | 'sub'
  let activeMainIdx = -1;
  let isHomePage    = false;

  /* ── PHYSICS: INERTIAL SCROLL ────────────────────── */
  /*
    Exponential decay:  v(t) = v₀ · e^(−λt)
    λ = 6  (friction coefficient, tuned for 60 fps)
    Stops when |v| < 0.5 px/s
  */
  function installMomentumScroll(rail) {
    const LAMBDA = 6;
    const MIN_V  = 0.5;
    let startX, startScrollLeft, velX, lastX, lastT, rafId;

    function decay() {
      const dt = 1 / 60;
      velX *= Math.exp(-LAMBDA * dt);
      rail.scrollLeft -= velX * dt;
      if (Math.abs(velX) > MIN_V) rafId = requestAnimationFrame(decay);
    }

    rail.addEventListener('touchstart', e => {
      startX          = e.touches[0].clientX;
      startScrollLeft = rail.scrollLeft;
      velX = 0; lastX = startX; lastT = performance.now();
      cancelAnimationFrame(rafId);
    }, { passive: true });

    rail.addEventListener('touchmove', e => {
      const x   = e.touches[0].clientX;
      const now = performance.now();
      const dt  = (now - lastT) / 1000;
      velX      = dt > 0 ? (x - lastX) / dt : 0;
      lastX = x; lastT = now;
      rail.scrollLeft = startScrollLeft - (x - startX);
    }, { passive: true });

    rail.addEventListener('touchend', () => {
      rafId = requestAnimationFrame(decay);
    }, { passive: true });
  }

  /* ── HELPERS ─────────────────────────────────────── */
  function tmpl(s, coin) {
    return s.split('{COIN}').join(coin);
  }

  function resolveDeeplinkCoin() {
    const raw   = window.location.pathname.split('/').filter(Boolean)[0];
    if (!raw) return null;
    const sym   = raw.toUpperCase();
    const found = Object.keys(COIN_REGISTRY).find(
      k => k.toUpperCase() === sym
    );
    return found || null;
  }

  function buildSearchUrl(q) {
    if (!q) return BASE_URL;
    try {
      const u = new URL(BASE_URL);
      u.searchParams.set('q', q);
      return u.toString();
    } catch (_) {
      return BASE_URL + '&q=' + encodeURIComponent(q);
    }
  }

  /* ── DOM HELPERS ─────────────────────────────────── */
  function updateIframe(q) {
    const iframe = document.getElementById('mapFrame');
    if (!iframe) return;
    const url = buildSearchUrl(q || '');
    if (iframe.src !== url) iframe.src = url;
  }

  function syncTitle(coin) {
    const info  = COIN_REGISTRY[coin];
    const label = info ? info.label : coin;
    document.getElementById('page-title').textContent =
      'วิเคราะห์ ' + label + ' - คำถามนำทาง';
  }

  function setGroupLoading(on) {
    const g = document.getElementById('btn-group');
    if (g) g.classList.toggle('btn-loading', on);
  }

  /* ── RENDER: MAIN BUTTONS ────────────────────────── */
  function renderMainButtons() {
    const group = document.getElementById('btn-group');
    if (!group) return;
    const cats = isHomePage ? NEWS_CATEGORIES : MAIN_CATEGORIES;
    const frag = document.createDocumentFragment();

    cats.forEach((cat, idx) => {
      const btn             = document.createElement('button');
      btn.className         = 'question-btn';
      btn.dataset.mainIndex = idx;
      btn.textContent       = isHomePage
        ? cat.label
        : tmpl(cat.label, currentCoin);
      frag.appendChild(btn);
    });

    group.textContent = '';
    group.appendChild(frag);

    /* Reset scroll position */
    const rail = document.getElementById('scroll-rail');
    if (rail) rail.scrollLeft = 0;
  }

  /* ── RENDER: SUB BUTTONS ─────────────────────────── */
  function renderSubButtons(mainIdx) {
    const group = document.getElementById('btn-group');
    if (!group) return;
    const cats = isHomePage ? NEWS_CATEGORIES : MAIN_CATEGORIES;
    const cat  = cats[mainIdx];
    if (!cat) return;

    const frag = document.createDocumentFragment();

    /* Sub-query buttons only — no back btn here (logo-btn handles back) */
    cat.subQueries.forEach(sub => {
      const btn          = document.createElement('button');
      btn.className      = 'question-btn';
      const fullQuery    = isHomePage
        ? sub.query
        : tmpl(sub.query, currentCoin);
      btn.dataset.subQuery = fullQuery;
      btn.textContent    = isHomePage
        ? sub.label
        : tmpl(sub.label, currentCoin);
      frag.appendChild(btn);
    });

    group.textContent = '';
    group.appendChild(frag);

    /* Reset scroll */
    const rail = document.getElementById('scroll-rail');
    if (rail) rail.scrollLeft = 0;
  }

  /* ── LOGO BUTTON HANDLER ─────────────────────────── */
  /*
    - In 'sub' mode  → go back to main
    - In 'main' mode → reload default query (home/coin)
  */
  function handleLogoBtn() {
    if (currentMode === 'sub') {
      currentMode   = 'main';
      activeMainIdx = -1;
      renderMainButtons();
    } else {
      /* Already on main — reload default */
      if (isHomePage) {
        updateIframe(null);
      } else {
        updateIframe(tmpl(DEFAULT_QUERY_TPL, currentCoin));
      }
    }
  }

  /* ── PILL BUTTON HANDLER ─────────────────────────── */
  function handleButtonClick(e) {
    const btn = e.target.closest('button');
    if (!btn) return;
    e.preventDefault();

    /* Main → Sub */
    if (currentMode === 'main' && btn.dataset.mainIndex !== undefined) {
      const idx  = parseInt(btn.dataset.mainIndex, 10);
      const cats = isHomePage ? NEWS_CATEGORIES : MAIN_CATEGORIES;
      const cat  = cats[idx];
      if (!cat) return;

      const q = cat.mainQuery
        ? (isHomePage ? cat.mainQuery : tmpl(cat.mainQuery, currentCoin))
        : null;

      updateIframe(q);
      currentMode   = 'sub';
      activeMainIdx = idx;
      renderSubButtons(idx);
      return;
    }

    /* Sub query */
    if (currentMode === 'sub' && btn.dataset.subQuery) {
      updateIframe(btn.dataset.subQuery);
    }
  }

  /* ── LOAD DATA & INIT ────────────────────────────── */
  function init(data) {
    /* Populate from data.json */
    COIN_REGISTRY   = data.coinRegistry   || {};
    MAIN_CATEGORIES = data.mainCategories || [];
    NEWS_CATEGORIES = data.newsCategories || [];

    /* Resolve route */
    const coinFromPath = resolveDeeplinkCoin();
    isHomePage = (coinFromPath === null);

    if (isHomePage) {
      currentCoin = DEFAULT_COIN;
      document.getElementById('page-title').textContent =
        'ข่าวสารและตลาดการเงิน';
      updateIframe(null);
    } else {
      currentCoin = coinFromPath;
      syncTitle(currentCoin);
      updateIframe(tmpl(DEFAULT_QUERY_TPL, currentCoin));
    }

    currentMode   = 'main';
    activeMainIdx = -1;
    renderMainButtons();

    /* Pill button events */
    const group = document.getElementById('btn-group');
    if (group) {
      group.addEventListener('click', handleButtonClick);
    }

    /* Logo button — always fixed left */
    const logoBtn = document.getElementById('logo-btn');
    if (logoBtn) {
      logoBtn.addEventListener('click', handleLogoBtn);
    }

    /* Momentum scroll on rail */
    const rail = document.getElementById('scroll-rail');
    if (rail) installMomentumScroll(rail);

    /* Done loading */
    setGroupLoading(false);
  }

  /* ── BOOT: fetch data.json first ─────────────────── */
  function boot() {
    setGroupLoading(true);
    fetch('data.json')
      .then(r => {
        if (!r.ok) throw new Error('data.json not found: ' + r.status);
        return r.json();
      })
      .then(data => init(data))
      .catch(err => {
        console.error('[FinanceNews] Failed to load data.json:', err);
        /* Fallback: show error in btn-group */
        const g = document.getElementById('btn-group');
        if (g) {
          g.textContent = '';
          const msg       = document.createElement('span');
          msg.style.cssText =
            'color:#dc2626;font-size:0.8rem;padding:0.4rem 0.75rem;';
          msg.textContent = '⚠ โหลดข้อมูลไม่สำเร็จ กรุณารีเฟรช';
          g.appendChild(msg);
          setGroupLoading(false);
        }
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
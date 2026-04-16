/* app.js — For Sinthia */
(() => {
  'use strict';

  const DATE_LOVE    = new Date('2023-05-02T00:00:00');
  const DATE_WEDDING = new Date('2024-05-02T00:00:00');
  const DATE_ANNIV   = new Date('2026-05-02T00:00:00');
  const REASON_EPOCH = new Date('2026-04-05T00:00:00');

  /* ── PARTICLES ── */
  function initParticles() {
    const canvas = document.getElementById('particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, list = [];

    const COLS = [
      'rgba(212,162,100,',
      'rgba(226,196,154,',
      'rgba(237,224,204,',
      'rgba(176,125,74,',
    ];

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    class P {
      constructor() { this.reset(true); }
      reset(init) {
        this.x    = Math.random() * W;
        this.y    = init ? Math.random() * H : H + 8;
        this.r    = Math.random() * 1.3 + 0.3;
        this.vx   = (Math.random() - 0.5) * 0.18;
        this.vy   = -(Math.random() * 0.32 + 0.08);
        this.a    = 0;
        this.max  = Math.random() * 0.32 + 0.08;
        this.life = 0;
        this.end  = Math.random() * 450 + 200;
        this.col  = COLS[Math.floor(Math.random() * COLS.length)];
      }
      step() {
        this.life++;
        this.x += this.vx;
        this.y += this.vy;
        const p = this.life / this.end;
        this.a = p < 0.2 ? (p / 0.2) * this.max
               : p > 0.8 ? ((1 - p) / 0.2) * this.max
               : this.max;
        if (this.life >= this.end || this.y < -8) this.reset(false);
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = this.col + this.a + ')';
        ctx.fill();
      }
    }

    function spawn() {
      const n = Math.min(Math.floor(W * H / 13000), 90);
      list = Array.from({ length: n }, () => new P());
    }

    function loop() {
      ctx.clearRect(0, 0, W, H);
      list.forEach(p => { p.step(); p.draw(); });
      requestAnimationFrame(loop);
    }

    window.addEventListener('resize', () => { resize(); list = []; spawn(); });
    resize(); spawn(); loop();
  }

  /* ── STAR FIELD ── */
  function initStars() {
    const field = document.getElementById('starField');
    if (!field) return;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 65; i++) {
      const el = document.createElement('div');
      el.className = 'star';
      const sz = Math.random() * 1.8 + 0.4;
      el.style.cssText = `
        left:${Math.random()*100}%;
        top:${Math.random()*100}%;
        width:${sz}px;height:${sz}px;
        --d:${(Math.random()*4+2).toFixed(1)}s;
        --o:${(Math.random()*0.45+0.12).toFixed(2)};
        animation-delay:${(Math.random()*6).toFixed(1)}s;
      `;
      frag.appendChild(el);
    }
    field.appendChild(frag);
  }

  /* ── NAV DOTS + SNAP SCROLL ── */
  function initScroll() {
    const container = document.getElementById('snapContainer');
    const navDots   = document.getElementById('navDots');
    if (!container || !navDots) return;

    function buildDots() {
      navDots.innerHTML = '';
      const sections = [...container.querySelectorAll('.snap-section')];
      sections.forEach((_, i) => {
        const d = document.createElement('span');
        d.className = 'dot';
        d.dataset.index = i;
        d.addEventListener('click', () => sections[i].scrollIntoView({ behavior: 'smooth' }));
        navDots.appendChild(d);
      });
    }

    function activateSection(index) {
      const dots     = [...navDots.querySelectorAll('.dot')];
      const sections = [...container.querySelectorAll('.snap-section')];
      dots.forEach((d, i) => d.classList.toggle('active', i === index));
      if (sections[index]) {
        sections[index].querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
      }
    }

    function observe() {
      const sections = [...container.querySelectorAll('.snap-section')];
      const obs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const idx = [...container.querySelectorAll('.snap-section')].indexOf(entry.target);
            if (idx !== -1) activateSection(idx);
          }
        });
      }, { root: container, threshold: 0.5 });
      sections.forEach(s => obs.observe(s));
      return obs;
    }

    buildDots();
    activateSection(0);
    let obs = observe();

    // allow anniversary.js to rebuild dots after showing the anniversary section
    window.__refreshNav = () => {
      buildDots();
      obs.disconnect();
      obs = observe();
    };
  }

  /* ── LIVE COUNTERS ── */
  function initCounters() {
    const loveDaysEl    = document.getElementById('loveDays');
    const weddingDaysEl = document.getElementById('weddingDays');
    const loveTimeEl    = document.getElementById('loveTime');
    const weddingTimeEl = document.getElementById('weddingTime');
    if (!loveDaysEl) return;

    const pad = n => String(n).padStart(2, '0');

    function diff(start) {
      const ms   = Date.now() - start.getTime();
      const secs = Math.floor(ms / 1000);
      return {
        days: Math.floor(secs / 86400),
        hrs:  Math.floor((secs % 86400) / 3600),
        mins: Math.floor((secs % 3600) / 60),
        s:    secs % 60,
      };
    }

    function tick() {
      const l = diff(DATE_LOVE);
      const w = diff(DATE_WEDDING);
      loveDaysEl.textContent    = l.days.toLocaleString();
      weddingDaysEl.textContent = w.days.toLocaleString();
      if (loveTimeEl)    loveTimeEl.textContent    = `${pad(l.hrs)}h ${pad(l.mins)}m ${pad(l.s)}s`;
      if (weddingTimeEl) weddingTimeEl.textContent = `${pad(w.hrs)}h ${pad(w.mins)}m ${pad(w.s)}s`;
    }

    tick();
    setInterval(tick, 1000);
  }

  /* ── HERO COUNTDOWN ── */
  function initHeroCountdown() {
    const wrap  = document.getElementById('heroCountdown');
    const label = document.getElementById('hcdLabel');
    if (!wrap) return;

    const now    = new Date();
    const anniv  = DATE_ANNIV;
    const isDay  = now.getMonth() === anniv.getMonth() && now.getDate() === anniv.getDate();

    if (isDay) {
      // hide countdown on anniversary day
      wrap.style.display = 'none';
      return;
    }

    const pad = n => String(n).padStart(2, '0');

    function getTarget() {
      const n = new Date();
      let t = new Date(n.getFullYear(), 4, 2, 0, 0, 0, 0); // May = 4
      if (n >= t) t = new Date(n.getFullYear() + 1, 4, 2, 0, 0, 0, 0);
      return t;
    }

    function tick() {
      const diff = Math.max(0, getTarget() - Date.now());
      const s    = Math.floor(diff / 1000);
      const days = Math.floor(s / 86400);
      const hrs  = Math.floor((s % 86400) / 3600);
      const mins = Math.floor((s % 3600) / 60);
      const sec  = s % 60;

      const dEl = document.getElementById('hcd-days');
      const hEl = document.getElementById('hcd-hours');
      const mEl = document.getElementById('hcd-mins');
      const sEl = document.getElementById('hcd-secs');

      if (dEl) dEl.textContent = days;
      if (hEl) hEl.textContent = pad(hrs);
      if (mEl) mEl.textContent = pad(mins);
      if (sEl) sEl.textContent = pad(sec);
    }

    tick();
    setInterval(tick, 1000);
  }

  /* ── DAILY REASON ── */
  function initReason() {
    if (!window.REASONS || !window.REASONS.length) return;
    const reasons = window.REASONS;
    const dayNum  = Math.floor((Date.now() - REASON_EPOCH.getTime()) / 86400000);
    const idx     = ((dayNum % reasons.length) + reasons.length) % reasons.length;

    const ordinal = n => {
      const s = ['th','st','nd','rd'];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    const dayEl  = document.getElementById('reasonDay');
    const textEl = document.getElementById('reasonText');
    if (dayEl)  dayEl.textContent  = `reason ${ordinal(idx + 1)} of 365`;
    if (textEl) textEl.textContent = reasons[idx];
  }

  /* ── INIT ── */
  document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initStars();
    initScroll();
    initCounters();
    initHeroCountdown();
    initReason();
  });

})();

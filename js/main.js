'use strict';

// ── Navbar scroll ────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 30);
}, { passive: true });

// ── Mobile menu ──────────────────────────────────
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  hamburger.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
});

document.querySelectorAll('.mob-link').forEach(l => l.addEventListener('click', closeMob));
document.addEventListener('click', e => {
  if (mobileMenu.classList.contains('open') &&
      !mobileMenu.contains(e.target) &&
      !hamburger.contains(e.target)) closeMob();
});
function closeMob() {
  mobileMenu.classList.remove('open');
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

// ── Smooth scroll ────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id === '#') { window.scrollTo({ top: 0, behavior: 'smooth' }); e.preventDefault(); return; }
    const el = document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 64;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - navH - 16, behavior: 'smooth' });
    closeMob();
  });
});

// ── Scroll reveal ────────────────────────────────
const revealObs = new IntersectionObserver((entries, obs) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

[
  '.tweet-origin-badge', '.hero-title', '.hero-desc', '.hero-cta',
  '.tweet-stats-bar', '.article-preview-card', '.why-card', '.finding-item',
  '.market-map-card', '.build-card', '.profile-card', '.original-tweet-card',
  '.section-label', '.section-heading', '.section-sub'
].forEach(sel => {
  document.querySelectorAll(sel).forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${(i % 4) * 70}ms`;
    revealObs.observe(el);
  });
});

// ── Stat counter ─────────────────────────────────
const statEls = document.querySelectorAll('.ts-num[data-count]');
const counterObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const target = parseInt(el.dataset.count);
    counterObs.unobserve(el);
    const start = performance.now();
    const dur = 1400;
    (function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const v = Math.round((1 - Math.pow(1 - p, 3)) * target);
      el.textContent = v.toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  });
}, { threshold: 0.5 });
statEls.forEach(el => counterObs.observe(el));

// ── Neural network canvas ─────────────────────────
(function initNeural() {
  const canvas = document.getElementById('neuralCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, nodes;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function mkNode() {
    return {
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r:  Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.6 + 0.2,
    };
  }

  function init() { resize(); nodes = Array.from({ length: 80 }, mkNode); }

  function drawFrame() {
    ctx.clearRect(0, 0, W, H);
    const MAX_DIST = 140;

    nodes.forEach(n => {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;

      // Node dot
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,212,255,${n.alpha * 0.6})`;
      ctx.fill();
    });

    // Connections
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < MAX_DIST) {
          const alpha = (1 - dist / MAX_DIST) * 0.12;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(0,212,255,${alpha})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(drawFrame);
  }

  window.addEventListener('resize', () => { resize(); }, { passive: true });
  init();
  drawFrame();
})();

// ── Card glow on hover ────────────────────
document.querySelectorAll('.build-card, .why-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width  * 100).toFixed(1);
    const y = ((e.clientY - r.top)  / r.height * 100).toFixed(1);
    card.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(0,212,255,0.04), var(--bg-card-2) 60%)`;
  });
  card.addEventListener('mouseleave', () => { card.style.background = ''; });
});

/* =====================================================
   JCO MEDIA — PORTFOLIO  |  script.js
   ===================================================== */

/* ---------- Auto-mark placeholders ---------- */
function markPlaceholders() {
  document.querySelectorAll('.card').forEach(card => {
    const img = card.querySelector('img');
    const vid = card.querySelector('.vid-src');
    if (img) {
      const label = '.png';
      const fail = () => { card.classList.add('placeholder'); card.dataset.label = label; };
      const ok   = () => { card.classList.remove('placeholder'); };
      if (img.complete) (img.naturalWidth === 0 ? fail() : ok());
      img.addEventListener('error', fail);
      img.addEventListener('load',  () => (img.naturalWidth === 0 ? fail() : ok()));
    } else if (vid) {
      const label = '.mp4';
      const fail = () => { card.classList.add('placeholder'); card.dataset.label = label; };
      vid.addEventListener('error', fail);
    }
  });
}

function markMissingProfile() {
  const avatar = document.querySelector('.profile-avatar img');
  const wrap = document.querySelector('.profile-avatar');
  if (!avatar || !wrap) return;
  const fallback = () => { avatar.style.display = 'none'; wrap.classList.add('no-img'); };
  avatar.addEventListener('error', fallback);
  if (avatar.complete && avatar.naturalWidth === 0) fallback();
}

function markMissingTools() {
  document.querySelectorAll('.tool-card').forEach(card => {
    const img = card.querySelector('img');
    if (!img) return;
    const name = card.dataset.name || '';
    const fallback = () => {
      img.style.display = 'none';
      if (!card.querySelector('.tool-fallback')) {
        const span = document.createElement('span');
        span.className = 'tool-fallback';
        span.textContent = name.charAt(0);
        span.style.cssText = 'font-size:1.6rem;font-weight:700;color:#fff;';
        card.insertBefore(span, card.firstChild);
      }
    };
    img.addEventListener('error', fallback);
    if (img.complete && img.naturalWidth === 0) fallback();
  });
}

/* ---------- Fade-up on scroll ---------- */
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const el = entry.target;
    if (entry.isIntersecting) {
      el.classList.add('in-view');
      el.classList.remove('past-view');
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.fade-up').forEach(el => fadeObserver.observe(el));

/* ---------- Footer content crossfade ---------- */
const footerContent = document.querySelector('.footer-content');
if (footerContent) {
  const footerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        footerContent.classList.add('in-view');
        footerContent.classList.remove('past-view');
      } else {
        if (entry.boundingClientRect.top < 0) {
          footerContent.classList.remove('in-view');
          footerContent.classList.add('past-view');
        } else {
          footerContent.classList.remove('in-view');
          footerContent.classList.remove('past-view');
        }
      }
    });
  }, { threshold: 0.2 });
  footerObserver.observe(footerContent);
}

/* ---------- WHAT I DO title crossfade ---------- */
const whatIDoTitle = document.querySelector('.contents-title');
if (whatIDoTitle) {
  const titleObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        whatIDoTitle.classList.add('in-view');
        whatIDoTitle.classList.remove('past-view');
      } else {
        if (entry.boundingClientRect.top < 0) {
          whatIDoTitle.classList.remove('in-view');
          whatIDoTitle.classList.add('past-view');
        } else {
          whatIDoTitle.classList.remove('in-view');
          whatIDoTitle.classList.remove('past-view');
        }
      }
    });
  }, { threshold: 0.3 });
  titleObserver.observe(whatIDoTitle);
}

/* ---------- Long-press for mobile ---------- */
function enableLongPress(elements, className = 'touched') {
  elements.forEach(el => {
    let timer = null;
    el.addEventListener('touchstart', () => {
      timer = setTimeout(() => el.classList.add(className), 250);
    }, { passive: true });
    const cancel = () => {
      clearTimeout(timer);
      setTimeout(() => el.classList.remove(className), 800);
    };
    el.addEventListener('touchend', cancel);
    el.addEventListener('touchcancel', cancel);
    el.addEventListener('touchmove', cancel);
  });
}
enableLongPress(document.querySelectorAll('.tool-card'));
enableLongPress(document.querySelectorAll('.hello-card'));

/* ---------- EXPERIENCE — trim line to last dot + scroll highlighting ---------- */
const expBlocks = Array.from(document.querySelectorAll('.year-block'));
const expLineEl = document.querySelector('.timeline-line');
const expLineFill = document.querySelector('.timeline-line-fill');

function trimExpLine() {
  if (!expLineEl || !expBlocks.length) return;
  const timeline = document.querySelector('.timeline');
  if (!timeline) return;
  const lastDot = expBlocks[expBlocks.length - 1].querySelector('.dot');
  if (!lastDot) return;
  const timelineRect = timeline.getBoundingClientRect();
  const dotRect = lastDot.getBoundingClientRect();
  const dotCenterFromTop = (dotRect.top + dotRect.height / 2) - timelineRect.top;
  const lineTopOffset = parseFloat(getComputedStyle(expLineEl).top) || 18;
  const lineHeight = dotCenterFromTop - lineTopOffset;
  expLineEl.style.bottom = 'auto';
  expLineEl.style.height = Math.max(0, lineHeight) + 'px';
}

function updateExperience() {
  if (!expBlocks.length) return;
  const winH = window.innerHeight;
  const center = winH * 0.5;

  let activeIdx = -1;
  expBlocks.forEach((b, i) => {
    const dot = b.querySelector('.dot');
    if (!dot) return;
    const r = dot.getBoundingClientRect();
    const dotCenter = r.top + r.height / 2;
    if (dotCenter <= center) activeIdx = i;
  });

  expBlocks.forEach((b, i) => {
    if (i <= activeIdx) b.classList.add('active');
    else b.classList.remove('active');
  });

  if (expLineFill && expLineEl) {
    const lineRect = expLineEl.getBoundingClientRect();
    if (activeIdx >= 0) {
      const dot = expBlocks[activeIdx].querySelector('.dot');
      const dotRect = dot.getBoundingClientRect();
      const fill = (dotRect.top + dotRect.height / 2) - lineRect.top;
      expLineFill.style.height = Math.max(0, Math.min(lineRect.height, fill)) + 'px';
    } else {
      expLineFill.style.height = '0px';
    }
  }
}

/* ==========================================================
   CANVAS VIDEO SYSTEM
   Each .card with a .vid-canvas + .vid-src gets its own
   CanvasPlayer instance. The player:
   - Sizes the canvas to match the card on init and resize
   - Draws frames via requestAnimationFrame using cover-fit
   - start() → plays the video + begins RAF loop
   - stop()  → pauses the video + cancels RAF (canvas freezes
               on the last drawn frame — no black flash)
   ========================================================== */

class CanvasPlayer {
  constructor(card) {
    this.card    = card;
    this.canvas  = card.querySelector('.vid-canvas');
    this.video   = card.querySelector('.vid-src');
    this.ctx     = this.canvas.getContext('2d');
    this.rafId   = null;
    this.running = false;
    this._setupCanvas();
  }

  _setupCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const w = this.card.offsetWidth  || 300;
    const h = this.card.offsetHeight || 300;
    this.canvas.width  = w * dpr;
    this.canvas.height = h * dpr;
    this.ctx.scale(dpr, dpr);
    // CSS size — canvas element fills the card via CSS
  }

  resize() {
    // Redraw at new size without losing the current frame
    const dpr = window.devicePixelRatio || 1;
    const w = this.card.offsetWidth  || 300;
    const h = this.card.offsetHeight || 300;
    this.canvas.width  = w * dpr;
    this.canvas.height = h * dpr;
    this.ctx.scale(dpr, dpr);
    this._drawFrame(); // repaint immediately so no blank flash on resize
  }

  _drawFrame() {
    const v   = this.video;
    const ctx = this.ctx;
    const cw  = this.card.offsetWidth;
    const ch  = this.card.offsetHeight;
    const vw  = v.videoWidth  || cw;
    const vh  = v.videoHeight || ch;
    if (!vw || !vh) return;

    // Cover-fit: scale so the video fills the canvas, centered
    const scale = Math.max(cw / vw, ch / vh);
    const dw = vw * scale;
    const dh = vh * scale;
    const dx = (cw - dw) / 2;
    const dy = (ch - dh) / 2;

    try {
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(v, dx, dy, dw, dh);
    } catch (e) {}
  }

  _loop() {
    this._drawFrame();
    if (this.running) {
      this.rafId = requestAnimationFrame(() => this._loop());
    }
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.video.play().catch(() => {});
    this.rafId = requestAnimationFrame(() => this._loop());
  }

  stop() {
    this.running = false;
    if (this.rafId) { cancelAnimationFrame(this.rafId); this.rafId = null; }
    this.video.pause();
    // Canvas keeps the last drawn frame — no black flash
  }
}

/* Build a CanvasPlayer for every video card */
const allPlayers = [];
document.querySelectorAll('.card').forEach(card => {
  if (card.querySelector('.vid-canvas') && card.querySelector('.vid-src')) {
    allPlayers.push(new CanvasPlayer(card));
  }
});

/* Map each scroll-section to its players */
const sectionPlayers = new Map();
document.querySelectorAll('.scroll-section[data-has-video="true"]').forEach(section => {
  const players = allPlayers.filter(p => section.contains(p.card));
  sectionPlayers.set(section, players);
});

function startSectionPlayers(section) {
  const players = sectionPlayers.get(section) || [];
  players.forEach(p => p.start());
}

function stopSectionPlayers(section) {
  const players = sectionPlayers.get(section) || [];
  players.forEach(p => p.stop());
}

function stopAllPlayers() {
  allPlayers.forEach(p => p.stop());
}

/* Resize all canvases on window resize */
function resizePlayers() {
  allPlayers.forEach(p => p.resize());
}

/* ---------- Active section tracking ---------- */
let activePinnedSection = null;

/* ---------- CONTENTS — scrub + active stage + canvas video gating ---------- */
const scrollSections = document.querySelectorAll('.scroll-section');
const sectionData = Array.from(scrollSections).map(section => ({
  section,
  stage:    section.querySelector('.sticky-stage'),
  track:    section.querySelector('.track'),
  cards:    Array.from(section.querySelectorAll('.card')),
  hasVideo: section.dataset.hasVideo === 'true',
}));

function updateContents() {
  const winH = window.innerHeight;
  let newActive = null;

  sectionData.forEach(({ section, stage, track, cards, hasVideo }) => {
    if (!cards.length) return;
    const rect     = section.getBoundingClientRect();
    const sectionH = section.offsetHeight;
    const scrolled = -rect.top;
    const total    = sectionH - winH;
    let progress   = total > 0 ? scrolled / total : 0;
    progress = Math.max(0, Math.min(1, progress));

    const n         = cards.length;
    const floatIndex = progress * (n - 1);
    const activeIdx  = Math.round(floatIndex);

    const stageWidth = stage.offsetWidth;
    const lo = Math.floor(floatIndex);
    const hi = Math.min(lo + 1, n - 1);
    const t  = floatIndex - lo;
    const loCenter  = cards[lo].offsetLeft + cards[lo].offsetWidth / 2;
    const hiCenter  = cards[hi].offsetLeft + cards[hi].offsetWidth / 2;
    const cardCenter = loCenter + (hiCenter - loCenter) * t;
    const x = stageWidth / 2 - cardCenter;
    track.style.transform = `translateY(-50%) translateX(${x}px)`;

    cards.forEach((c, i) => {
      c.classList.remove('is-active', 'is-left', 'is-right');
      if (i === activeIdx)          c.classList.add('is-active');
      else if (i === activeIdx - 1) c.classList.add('is-left');
      else if (i === activeIdx + 1) c.classList.add('is-right');
    });

    const pinned = rect.top <= 0 && rect.bottom > winH;
    if (pinned) {
      stage.classList.add('active');
      if (hasVideo) newActive = section;
    } else {
      stage.classList.remove('active');
    }
  });

  /* Switch canvas players only when the active section changes */
  if (newActive !== activePinnedSection) {
    if (activePinnedSection) stopSectionPlayers(activePinnedSection);
    if (newActive)           startSectionPlayers(newActive);
    activePinnedSection = newActive;
  }
}

/* ---------- Scroll loop ---------- */
let ticking = false;
function onScroll() {
  if (!ticking) {
    requestAnimationFrame(() => {
      updatePortfolioRubberband();
      updateExperience();
      updateContents();
      ticking = false;
    });
    ticking = true;
  }
}
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', () => {
  trimExpLine();
  resizePlayers();
  updatePortfolioRubberband();
  updateExperience();
  updateContents();
});

/* ---------- Back to top ---------- */
const backBtn = document.getElementById('backToTop');
if (backBtn) {
  backBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const prev = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    document.documentElement.style.scrollBehavior = prev;
  });
}

/* ---------- Hide arrows past hero ---------- */
const hero = document.querySelector('.hero');
const arrowsEl = document.querySelector('.scroll-arrows');
if (hero && arrowsEl) {
  const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      arrowsEl.style.visibility = e.isIntersecting ? 'visible' : 'hidden';
    });
  }, { threshold: 0.1 });
  heroObserver.observe(hero);
}

/* ---------- PORTFOLIO rubberband effect ---------- */
const portfolioTitle = document.querySelector('.portfolio-title');
function updatePortfolioRubberband() {
  if (!portfolioTitle) return;
  const heroEl = document.querySelector('.hero');
  if (!heroEl) return;
  const heroH = heroEl.offsetHeight;
  let progress = window.scrollY / heroH;
  progress = Math.max(0, Math.min(1, progress));
  const isMobile  = window.innerWidth <= 720;
  const startScale = isMobile ? 1.6 : 1.35;
  const scaleY = startScale - ((startScale - 1.0) * progress);
  portfolioTitle.style.transform = `scaleY(${scaleY})`;
  if (isMobile) {
    portfolioTitle.style.fontSize = '15.5vw';
  } else {
    portfolioTitle.style.fontSize = '';
  }
}

/* ---------- INIT ---------- */
function init() {
  stopAllPlayers();     // nothing plays on load
  markPlaceholders();
  markMissingProfile();
  markMissingTools();
  trimExpLine();
  updatePortfolioRubberband();
  updateExperience();
  updateContents();
}
document.addEventListener('DOMContentLoaded', init);
window.addEventListener('load', init);

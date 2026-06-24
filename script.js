/* =====================================================
   JCO MEDIA — PORTFOLIO  |  script.js
   ===================================================== */

/* ---------- Auto-mark placeholders ---------- */
function markPlaceholders() {
  document.querySelectorAll('.card').forEach(card => {
    const img = card.querySelector('img');
    const vid = card.querySelector('video');
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
      setTimeout(() => {
        if (vid.error || vid.networkState === 3 || vid.readyState === 0) fail();
      }, 1200);
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
   SECTION-BASED VIDEO PLAY/PAUSE + CASCADING PRELOAD
   - AI Content: preloads immediately on page load (src in HTML)
   - Short Form: starts preloading once AI Content is loaded
   - Long Form:  starts preloading once Short Form is loaded
   Only the pinned section plays at any time.
   ========================================================== */

let activePinnedSection = null;

/* Assign src from data-src and begin preloading a section's videos */
function preloadSection(section) {
  section.querySelectorAll('video[data-src]').forEach(v => {
    if (!v.dataset.loaded) {
      v.src = v.dataset.src;
      v.preload = 'auto';
      v.load();
      v.dataset.loaded = 'true';
    }
  });
}

/* Returns true when all videos in a section have enough data to play */
function isSectionLoaded(section) {
  const videos = Array.from(section.querySelectorAll('video'));
  return videos.every(v => v.readyState >= 3);
}

/* Cascade: load each video section after the previous one is ready */
function initCascadingPreload() {
  const videoSections = Array.from(
    document.querySelectorAll('.scroll-section[data-has-video="true"]')
  );
  if (!videoSections.length) return;

  // First section (Short Form) is already preloading via src in HTML
  // Kick off the chain once it has enough data
  function loadNext(index) {
    if (index >= videoSections.length) return;
    const section = videoSections[index];

    // If this section uses data-src, assign src now
    preloadSection(section);

    // Wait until this section is loaded, then trigger the next
    const videos = Array.from(section.querySelectorAll('video'));
    let loaded = 0;
    const onLoaded = () => {
      loaded++;
      if (loaded >= videos.length) loadNext(index + 1);
    };
    videos.forEach(v => {
      if (v.readyState >= 3) {
        onLoaded();
      } else {
        v.addEventListener('canplaythrough', onLoaded, { once: true });
      }
    });
  }

  loadNext(0);
}

function playSectionVideos(section) {
  // If user scrolled here before the cascade reached it, load now immediately
  preloadSection(section);
  section.querySelectorAll('video').forEach(v => {
    if (v.paused) v.play().catch(() => {});
  });
}

function pauseSectionVideos(section) {
  section.querySelectorAll('video').forEach(v => {
    if (!v.paused) v.pause();
  });
}

function pauseAllVideos() {
  document.querySelectorAll('.scroll-section video').forEach(v => v.pause());
}

/* ---------- CONTENTS — scrub + active stage + video gating ---------- */
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

    const n          = cards.length;
    const floatIndex = progress * (n - 1);
    const activeIdx  = Math.round(floatIndex);

    const stageWidth = stage.offsetWidth;
    const lo = Math.floor(floatIndex);
    const hi = Math.min(lo + 1, n - 1);
    const t  = floatIndex - lo;
    const loCenter   = cards[lo].offsetLeft + cards[lo].offsetWidth / 2;
    const hiCenter   = cards[hi].offsetLeft + cards[hi].offsetWidth / 2;
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

  if (newActive !== activePinnedSection) {
    if (activePinnedSection) pauseSectionVideos(activePinnedSection);
    if (newActive) playSectionVideos(newActive);
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
  const isMobile   = window.innerWidth <= 720;
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
  pauseAllVideos();
  initCascadingPreload();
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

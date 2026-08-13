/* ============================================================
   MOHAMMED AKBER HUSSAIN — PORTFOLIO
   main.js · Animation Engine
   GSAP 3 + ScrollTrigger + Lenis smooth scroll
   ============================================================ */

'use strict';

/* ─── GSAP PLUGIN REGISTRATION ──────────────────────────────── */
gsap.registerPlugin(ScrollTrigger);

/* ─── UTILITY ───────────────────────────────────────────────── */
const select  = (s, ctx = document) => ctx.querySelector(s);
const selectAll = (s, ctx = document) => [...ctx.querySelectorAll(s)];
const isReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouchDevice   = () => window.matchMedia('(hover: none), (pointer: coarse)').matches;
const isDesktop       = () => window.innerWidth >= 1024;

/* ─── CERTIFICATE DATA ──────────────────────────────────────── */
const CERTS = [
  {
    src:     './assets/certs/cisco-python-1.jpeg',
    caption: 'Python Essentials 1 — Cisco Networking Academy',
    date:    'Nov 2024'
  },
  {
    src:     './assets/certs/cisco-python-2.jpeg',
    caption: 'Python Essentials 2 — Cisco Networking Academy',
    date:    'Dec 2024'
  },
  {
    src:     './assets/certs/nptel-iiot.jpeg',
    caption: 'Industry 4.0 & IIoT (Elite) — NPTEL / IIT Kharagpur',
    date:    'Jan–Apr 2025'
  },
  {
    src:     './assets/certs/greatlearning-sql.jpeg',
    caption: 'SQL for Data Science — Great Learning Academy',
    date:    'Dec 2024'
  },
  {
    src:     './assets/certs/zscaler-networking.jpeg',
    caption: 'Networking for Cyber Professionals — Zscaler Academy',
    date:    'Valid to Mar 2028'
  },
];

/* ============================================================
   1. LENIS SMOOTH SCROLL
   ============================================================ */
function initLenis() {
  const lenis = new Lenis({
    duration:  1.2,
    easing:    (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    smooth:    true,
    smoothTouch: false,
    touchMultiplier: 2,
  });

  // Integrate Lenis with GSAP ticker for ScrollTrigger compatibility
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);

  // Smooth anchor links
  selectAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      const target = select(href);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -72, duration: 1.4 });
    });
  });

  window.__lenis = lenis;
}

/* ============================================================
   2. PARTICLE CANVAS
   ============================================================ */
function initParticles() {
  const canvas = select('#particleCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let w, h, particles, animId;
  const COUNT = isDesktop() ? 65 : 35;
  const MAX_DIST = 130;

  function resize() {
    w = canvas.width  = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
    buildParticles();
  }

  class Particle {
    constructor() { this.reset(true); }

    reset(init = false) {
      this.x  = Math.random() * w;
      this.y  = init ? Math.random() * h : (Math.random() > 0.5 ? -5 : h + 5);
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = (Math.random() - 0.5) * 0.35;
      this.r  = Math.random() * 1.8 + 0.4;
      this.a  = Math.random() * 0.45 + 0.08;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < -10) this.x = w + 10;
      if (this.x > w + 10) this.x = -10;
      if (this.y < -10) this.y = h + 10;
      if (this.y > h + 10) this.y = -10;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(217, 91%, 72%, ${this.a})`;
      ctx.fill();
    }
  }

  function buildParticles() {
    particles = Array.from({ length: COUNT }, () => new Particle());
  }

  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          const alpha = (1 - dist / MAX_DIST) * 0.15;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `hsla(217, 91%, 72%, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach((p) => { p.update(); p.draw(); });
    drawLines();
    animId = requestAnimationFrame(loop);
  }

  // Pause when hero not visible (performance)
  const heroObs = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      if (!animId) loop();
    } else {
      cancelAnimationFrame(animId);
      animId = null;
    }
  }, { threshold: 0 });

  const hero = select('#hero');
  if (hero) heroObs.observe(hero);

  resize();
  loop();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 200);
  });
}

/* ============================================================
   3. SPLIT TEXT INTO CHARS (SplitText-like, no plugin)
   ============================================================ */
function splitToChars(element) {
  const original = element.textContent.trim();
  element.textContent = '';
  const chars = [];

  [...original].forEach((char) => {
    const span = document.createElement('span');
    span.textContent = char === ' ' ? '\u00A0' : char;
    span.className   = 'hero__char';
    element.appendChild(span);
    chars.push(span);
  });

  return chars;
}

/* ============================================================
   4. TYPEWRITER EFFECT
   ============================================================ */
function typewriter(element, text, speed = 38) {
  return new Promise((resolve) => {
    element.textContent = '';
    let i = 0;
    const id = setInterval(() => {
      element.textContent += text[i];
      i++;
      if (i >= text.length) { clearInterval(id); resolve(); }
    }, speed);
  });
}

/* ============================================================
   5. PAGE LOAD MASTER TIMELINE
   ============================================================ */
function initLoadTimeline() {
  if (isReducedMotion()) {
    // Just show everything immediately
    gsap.set(['.navbar', '.hero__mono', '.hero__name', '.hero__sub', '.hero__ctas', '.hero__scroll-cue'], { opacity: 1, y: 0, x: 0 });
    const monoEl = select('#heroMono');
    if (monoEl) monoEl.textContent = 'Aspiring Full Stack Developer · Python';
    return;
  }

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  // Split name lines into chars
  const nameLines = selectAll('.hero__line');
  const allChars  = [];
  nameLines.forEach((line) => {
    allChars.push(...splitToChars(line));
  });

  // Set initial states
  gsap.set('.navbar',           { y: -80, opacity: 0 });
  gsap.set(allChars,            { y: 72, opacity: 0 });
  gsap.set('#heroSub',          { y: 28, opacity: 0 });
  gsap.set('#heroCtas',         { y: 24, opacity: 0 });
  gsap.set('#heroScrollCue',    { opacity: 0 });

  // Timeline
  tl
    .to('.navbar', { y: 0, opacity: 1, duration: 0.7 }, 0.15)
    .to(allChars, {
      y: 0,
      opacity: 1,
      stagger: 0.038,
      duration: 0.55,
    }, 0.35)
    .add(() => {
      const monoEl = select('#heroMono');
      if (monoEl) typewriter(monoEl, 'Aspiring Full Stack Developer · Python', 36);
    }, 0.5)
    .to('#heroSub',       { y: 0, opacity: 1, duration: 0.65 }, 1.1)
    .to('#heroCtas',      { y: 0, opacity: 1, duration: 0.6  }, 1.3)
    .to('#heroScrollCue', { opacity: 1, duration: 0.5 }, 1.6);
}

/* ============================================================
   6. SCROLL PROGRESS BAR
   ============================================================ */
function initScrollProgress() {
  const bar = select('#scrollProgress');
  if (!bar) return;

  const update = () => {
    const scrolled = window.scrollY;
    const total    = document.documentElement.scrollHeight - window.innerHeight;
    const pct      = total > 0 ? (scrolled / total) * 100 : 0;
    bar.style.width = `${pct}%`;
    bar.setAttribute('aria-valuenow', Math.round(pct));
  };

  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ============================================================
   7. NAVBAR SCROLL BEHAVIOUR
   ============================================================ */
function initNavbar() {
  const navbar = select('#navbar');
  if (!navbar) return;

  const THRESHOLD = 80;

  const handleScroll = () => {
    if (window.scrollY > THRESHOLD) {
      navbar.classList.add('is-scrolled');
    } else {
      navbar.classList.remove('is-scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Active section highlighting via IntersectionObserver
  const sections = selectAll('section[id]');
  const links    = selectAll('.navbar__link[data-section]');

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        links.forEach((l) => l.classList.remove('is-active'));
        const active = links.find((l) => l.dataset.section === entry.target.id);
        if (active) active.classList.add('is-active');
      }
    });
  }, { threshold: 0.4, rootMargin: `-${THRESHOLD}px 0px 0px 0px` });

  sections.forEach((s) => obs.observe(s));
}

/* ============================================================
   8. MOBILE MENU
   ============================================================ */
function initMobileMenu() {
  const burger   = select('#navBurger');
  const menu     = select('#navMobile');
  const close    = select('#navMobileClose');
  const backdrop = select('#navMobileBackdrop');
  if (!burger || !menu) return;

  const open = () => {
    menu.classList.add('is-open');
    menu.removeAttribute('aria-hidden');
    burger.classList.add('is-open');
    burger.setAttribute('aria-expanded', 'true');
    document.body.classList.add('mobile-menu-open');
  };

  const closeMenu = () => {
    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('mobile-menu-open');
  };

  burger.addEventListener('click', open);
  close?.addEventListener('click', closeMenu);
  backdrop?.addEventListener('click', closeMenu);

  // Close on nav link click
  selectAll('.nav-mobile__link', menu).forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  // ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
}

/* ============================================================
   9. SCROLL-TRIGGERED SECTION ANIMATIONS
   ============================================================ */
function initScrollAnimations() {
  if (isReducedMotion()) return;

  const defaults = {
    ease:     'power3.out',
    duration: 0.8,
  };

  /* ── About ─────────────────────────────────────────────── */
  const photoCol = select('[data-reveal="photo"]');
  const textCol  = select('[data-reveal="text"]');

  if (photoCol && textCol) {
    gsap.set(photoCol, { x: -60, opacity: 0 });
    gsap.set(textCol,  { x:  60, opacity: 0 });

    ScrollTrigger.create({
      trigger: '.about',
      start:   'top 75%',
      once:    true,
      onEnter: () => {
        gsap.to(photoCol, { x: 0, opacity: 1, ...defaults });
        gsap.to(textCol,  { x: 0, opacity: 1, ...defaults, delay: 0.12 });
      },
    });

    // Floating parallax on photo
    gsap.to('.about__photo-frame', {
      y: -24,
      ease: 'none',
      scrollTrigger: {
        trigger: '.about',
        start:   'top bottom',
        end:     'bottom top',
        scrub:   1.5,
      },
    });
  }

  /* ── Skills ─────────────────────────────────────────────── */
  const skillGroups = selectAll('[data-reveal="skill-group"]');
  skillGroups.forEach((group) => {
    gsap.set(group, { y: 40, opacity: 0 });
  });

  if (skillGroups.length) {
    ScrollTrigger.create({
      trigger:  '.skills',
      start:    'top 78%',
      once:     true,
      onEnter:  () => {
        gsap.to(skillGroups, {
          y:       0,
          opacity: 1,
          stagger: 0.12,
          ...defaults,
        });
      },
    });
  }

  /* ── Projects ───────────────────────────────────────────── */
  const projectCards = selectAll('[data-reveal="project-card"]');
  projectCards.forEach((card) => {
    gsap.set(card, { y: 70, opacity: 0 });
  });

  if (projectCards.length) {
    ScrollTrigger.create({
      trigger: '.projects',
      start:   'top 78%',
      once:    true,
      onEnter: () => {
        gsap.to(projectCards, {
          y:       0,
          opacity: 1,
          stagger: 0.14,
          ...defaults,
        });
      },
    });
  }

  /* ── Certificates ───────────────────────────────────────── */
  const certCards = selectAll('[data-reveal="cert-card"]');
  certCards.forEach((card, i) => {
    gsap.set(card, { x: 50, opacity: 0 });
  });

  if (certCards.length) {
    ScrollTrigger.create({
      trigger: '.certs',
      start:   'top 78%',
      once:    true,
      onEnter: () => {
        gsap.to(certCards, {
          x:       0,
          opacity: 1,
          stagger: 0.1,
          ...defaults,
        });
      },
    });
  }

  /* ── Contact ────────────────────────────────────────────── */
  const contactInner = select('[data-reveal="contact"]');
  if (contactInner) {
    gsap.set(contactInner, { y: 50, opacity: 0 });
    ScrollTrigger.create({
      trigger: '.contact',
      start:   'top 78%',
      once:    true,
      onEnter: () => {
        gsap.to(contactInner, { y: 0, opacity: 1, ...defaults });
      },
    });
  }
}

/* ============================================================
   10. CUSTOM CURSOR
   ============================================================ */
function initCursor() {
  if (isTouchDevice() || !isDesktop()) return;

  const dot  = select('#cursorDot');
  const ring = select('#cursorRing');
  if (!dot || !ring) return;

  let mouseX = window.innerWidth  / 2;
  let mouseY = window.innerHeight / 2;
  let dotX   = mouseX;
  let dotY   = mouseY;
  let ringX  = mouseX;
  let ringY  = mouseY;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  gsap.ticker.add(() => {
    // Dot follows tightly
    dotX += (mouseX - dotX) * 0.65;
    dotY += (mouseY - dotY) * 0.65;
    // Ring lags more
    ringX += (mouseX - ringX) * 0.14;
    ringY += (mouseY - ringY) * 0.14;

    dot.style.left  = `${dotX}px`;
    dot.style.top   = `${dotY}px`;
    ring.style.left = `${ringX}px`;
    ring.style.top  = `${ringY}px`;
  });

  // Expand on interactive elements
  const expandTargets = selectAll('[data-cursor-expand], a, button, [role="button"]');
  expandTargets.forEach((el) => {
    el.addEventListener('mouseenter', () => ring.classList.add('is-expanded'));
    el.addEventListener('mouseleave', () => ring.classList.remove('is-expanded'));
  });

  // Hide when mouse leaves window
  document.addEventListener('mouseleave', () => ring.classList.add('is-hidden'));
  document.addEventListener('mouseenter', () => ring.classList.remove('is-hidden'));
}

/* ============================================================
   11. CERTIFICATE LIGHTBOX
   ============================================================ */
function initLightbox() {
  const lightbox = select('#lightbox');
  const imgEl    = select('#lightboxImg');
  const captionEl= select('#lightboxCaption');
  const counterEl= select('#lightboxCounter');
  const imgWrap  = select('#lightboxImgWrap');
  const closeBtn = select('#lightboxClose');
  const prevBtn  = select('#lightboxPrev');
  const nextBtn  = select('#lightboxNext');
  const backdrop = select('#lightboxBackdrop');

  if (!lightbox) return;

  let currentIdx = 0;
  let isOpen     = false;

  /* ── Open ──────────────────────────────────────────── */
  function openLightbox(idx) {
    currentIdx = ((idx % CERTS.length) + CERTS.length) % CERTS.length;
    const cert = CERTS[currentIdx];

    imgEl.src    = cert.src;
    imgEl.alt    = cert.caption;
    captionEl.textContent = cert.caption;
    counterEl.textContent = `${currentIdx + 1} / ${CERTS.length}`;

    lightbox.removeAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';
    isOpen = true;

    // Animate in
    gsap.set(lightbox, { opacity: 0, pointerEvents: 'all' });
    gsap.set(imgWrap,  { scale: 0.88, opacity: 0, y: 20 });

    gsap.to(lightbox, { opacity: 1, duration: 0.3, ease: 'power2.out' });
    gsap.to(imgWrap,  { scale: 1, opacity: 1, y: 0, duration: 0.45, ease: 'power3.out', delay: 0.05 });

    closeBtn.focus();
  }

  /* ── Close ─────────────────────────────────────────── */
  function closeLightbox() {
    if (!isOpen) return;
    isOpen = false;

    gsap.to(imgWrap,  { scale: 0.9, opacity: 0, y: -16, duration: 0.3, ease: 'power2.in' });
    gsap.to(lightbox, {
      opacity: 0,
      duration: 0.35,
      ease: 'power2.in',
      delay: 0.05,
      onComplete: () => {
        lightbox.setAttribute('aria-hidden', 'true');
        lightbox.style.pointerEvents = 'none';
        imgEl.src = '';
        document.body.style.overflow = '';
      },
    });
  }

  /* ── Navigate ──────────────────────────────────────── */
  function navigate(direction) {
    const nextIdx = ((currentIdx + direction) + CERTS.length) % CERTS.length;
    const cert    = CERTS[nextIdx];

    gsap.to(imgWrap, {
      x: direction * -40,
      opacity: 0,
      duration: 0.22,
      ease: 'power2.in',
      onComplete: () => {
        currentIdx = nextIdx;
        imgEl.src             = cert.src;
        imgEl.alt             = cert.caption;
        captionEl.textContent  = cert.caption;
        counterEl.textContent  = `${currentIdx + 1} / ${CERTS.length}`;
        gsap.fromTo(imgWrap,
          { x: direction * 40, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.3, ease: 'power3.out' }
        );
      },
    });
  }

  /* ── Cert card click events ─────────────────────────── */
  selectAll('.cert-card').forEach((card) => {
    const clickHandler = () => {
      const idx = parseInt(card.dataset.certIndex, 10);
      openLightbox(idx);
    };

    card.addEventListener('click',   clickHandler);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        clickHandler();
      }
    });
  });

  /* ── Controls ───────────────────────────────────────── */
  closeBtn?.addEventListener('click', closeLightbox);
  backdrop?.addEventListener('click', closeLightbox);
  prevBtn?.addEventListener('click',  () => navigate(-1));
  nextBtn?.addEventListener('click',  () => navigate(+1));

  /* ── Keyboard ───────────────────────────────────────── */
  document.addEventListener('keydown', (e) => {
    if (!isOpen) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  navigate(-1);
    if (e.key === 'ArrowRight') navigate(+1);
  });

  /* ── Touch swipe ────────────────────────────────────── */
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  lightbox.addEventListener('touchend', (e) => {
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 50) navigate(delta < 0 ? 1 : -1);
  }, { passive: true });
}

/* ============================================================
   12. HERO PARALLAX (subtle depth on scroll)
   ============================================================ */
function initHeroParallax() {
  if (isReducedMotion()) return;

  const heroContent = select('.hero__content');
  if (!heroContent) return;

  gsap.to(heroContent, {
    y:    80,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start:   'top top',
      end:     'bottom top',
      scrub:   1,
    },
  });
}

/* ============================================================
   13. MICRO INTERACTIONS — PROJECT CARDS TILT (Desktop)
   ============================================================ */
function initCardTilt() {
  if (isReducedMotion() || !isDesktop()) return;

  selectAll('.project-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) / (rect.width  / 2);
      const dy     = (e.clientY - cy) / (rect.height / 2);
      const rotX   = -dy * 4;
      const rotY   =  dx * 4;

      gsap.to(card, {
        rotateX:     rotX,
        rotateY:     rotY,
        duration:    0.35,
        ease:        'power2.out',
        transformPerspective: 800,
        transformOrigin: 'center center',
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateX:  0,
        rotateY:  0,
        duration: 0.5,
        ease:     'power3.out',
      });
    });
  });
}

/* ============================================================
   14. HANDLE WINDOW RESIZE (cleanup / refresh)
   ============================================================ */
function initResizeHandler() {
  let timer;
  window.addEventListener('resize', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 300);
  });
}

/* ============================================================
   INIT ALL
   ============================================================ */
function init() {
  initLenis();
  initParticles();
  initScrollProgress();
  initNavbar();
  initMobileMenu();
  initScrollAnimations();
  initCursor();
  initLightbox();
  initHeroParallax();
  initCardTilt();
  initResizeHandler();
  initLoadTimeline(); // Last — ensures DOM is ready for all splits
}

/* ─── Bootstrap ─────────────────────────────────────────────── */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

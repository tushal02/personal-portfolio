const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.getElementById('year').textContent = new Date().getFullYear();

const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.classList.toggle('open', isOpen);
  navToggle.setAttribute('aria-expanded', isOpen);
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

const sections = document.querySelectorAll('main .section, .hero');
const navAnchors = document.querySelectorAll('[data-nav]');

const setActiveLink = () => {
  let currentId = '';
  sections.forEach(sec => {
    const rect = sec.getBoundingClientRect();
    if (rect.top <= 120 && rect.bottom >= 120) {
      currentId = sec.id;
    }
  });
  navAnchors.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === `#${currentId}`);
  });
};
window.addEventListener('scroll', setActiveLink, { passive: true });
setActiveLink();

const revealTargets = document.querySelectorAll(
  '.section-head, .about-body, .skill-group, .project-card, .timeline-item, .contact-card, .stat-chip'
);
revealTargets.forEach(el => el.classList.add('reveal'));

if (prefersReducedMotion) {
  revealTargets.forEach(el => el.classList.add('is-visible'));
} else {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealTargets.forEach(el => io.observe(el));
}

const videoModal = document.getElementById('video-modal');
const videoModalPlayer = document.getElementById('video-modal-player');
const videoModalTitle = document.getElementById('video-modal-title');
const videoModalClose = document.getElementById('video-modal-close');
const videoModalBackdrop = document.getElementById('video-modal-backdrop');

function openVideoModal(src, title) {
  videoModalPlayer.src = src;
  videoModalTitle.textContent = title || '';
  videoModal.hidden = false;
  document.body.style.overflow = 'hidden';
  videoModalPlayer.play().catch(() => {});
}

function closeVideoModal() {
  videoModal.hidden = true;
  videoModalPlayer.pause();
  videoModalPlayer.removeAttribute('src');
  videoModalPlayer.load();
  document.body.style.overflow = '';
}

videoModalClose.addEventListener('click', closeVideoModal);
videoModalBackdrop.addEventListener('click', closeVideoModal);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !videoModal.hidden) closeVideoModal();
});

document.querySelectorAll('.project-card[data-video]').forEach(card => {
  const src = card.getAttribute('data-video');
  const title = card.getAttribute('data-video-title') || '';
  const btn = card.querySelector('.watch-demo');
  if (!src || !btn) return;

  fetch(src, { method: 'HEAD' })
    .then(res => {
      if (res.ok) {
        btn.hidden = false;
        btn.addEventListener('click', () => openVideoModal(src, title));
      }
    })
    .catch(() => {});
});

const canvas = document.getElementById('node-canvas');
const ctx = canvas.getContext('2d');

let width, height, dpr;
let nodes = [];
const NODE_COUNT_BASE = 55;
const LINK_DIST = 150;
const mouse = { x: null, y: null, radius: 160 };

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  initNodes();
}

function initNodes() {
  const area = width * height;
  const count = Math.min(NODE_COUNT_BASE, Math.round(area / 18000));
  nodes = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.25,
    vy: (Math.random() - 0.5) * 0.25,
    r: Math.random() * 1.4 + 1
  }));
}

function draw() {
  ctx.clearRect(0, 0, width, height);

  for (const n of nodes) {
    n.x += n.vx;
    n.y += n.vy;

    if (n.x < 0 || n.x > width) n.vx *= -1;
    if (n.y < 0 || n.y > height) n.vy *= -1;

    if (mouse.x !== null) {
      const dx = n.x - mouse.x;
      const dy = n.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < mouse.radius) {
        const force = (mouse.radius - dist) / mouse.radius;
        n.x += (dx / dist) * force * 0.6;
        n.y += (dy / dist) * force * 0.6;
      }
    }
  }

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < LINK_DIST) {
        const opacity = (1 - dist / LINK_DIST) * 0.16;
        ctx.strokeStyle = `rgba(124, 92, 255, ${opacity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  for (const n of nodes) {
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(237, 239, 242, 0.35)';
    ctx.fill();
  }

  if (!prefersReducedMotion) requestAnimationFrame(draw);
}

window.addEventListener('resize', resize, { passive: true });
window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
}, { passive: true });
window.addEventListener('mouseleave', () => {
  mouse.x = null;
  mouse.y = null;
});

resize();
if (prefersReducedMotion) {
  draw();
} else {
  draw();
}

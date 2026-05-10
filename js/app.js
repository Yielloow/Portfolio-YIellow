/* ══════════════════════════════════════════
   APP.JS — i18n · GSAP · Data · UI
══════════════════════════════════════════ */

/* ── Supabase config ─────────────────────
   Replace with your real values after creating
   a Supabase project at supabase.com
───────────────────────────────────────── */
const SUPABASE_URL = 'https://fzoxpcpfoazihmxzthnm.supabase.co';
const SUPABASE_KEY = 'sb_publishable_lGurPEsMa7O5UeEuonrLhg_ckpsZA3N';
const sb = (SUPABASE_URL !== 'https://fzoxpcpfoazihmxzthnm.supabase.co' && window.supabase)
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

/* ══════════════════════════════════════════
   STATIC FALLBACK DATA
   (used when Supabase is not configured)
══════════════════════════════════════════ */
const STATIC_SKILLS = [
  { name: 'JavaScript / TypeScript', level: 82, category: 'Languages' },
  { name: 'Python',                  level: 72, category: 'Languages' },
  { name: 'C / C++',                 level: 65, category: 'Languages' },
  { name: 'React / Vue.js',          level: 78, category: 'Frontend' },
  { name: 'HTML / CSS',              level: 85, category: 'Frontend' },
  { name: 'Node.js',                 level: 72, category: 'Backend' },
  { name: 'PostgreSQL / SQLite',     level: 65, category: 'Backend' },
  { name: 'Docker',                  level: 60, category: 'DevOps' },
  { name: 'Linux / Bash',            level: 70, category: 'DevOps' },
  { name: 'Git',                     level: 88, category: 'Tools' },
  { name: 'Arduino / ESP32',         level: 68, category: 'Embedded' },
  { name: 'ROS (Robot OS)',          level: 50, category: 'Embedded' },
];

const STATIC_THEMES = [
  { id: 1, slug: 'web',       icon: '🌐', title_fr: 'Développement Web',  title_en: 'Web Development',  hours: 8 },
  { id: 2, slug: 'robotique', icon: '🤖', title_fr: 'Robotique',          title_en: 'Robotics',         hours: 10 },
  { id: 3, slug: 'cyber',     icon: '🔒', title_fr: 'Cybersécurité',      title_en: 'Cybersecurity',    hours: 6 },
  { id: 4, slug: 'cloud',     icon: '☁️', title_fr: 'Cloud & DevOps',     title_en: 'Cloud & DevOps',   hours: 7 },
  { id: 5, slug: 'soft',      icon: '💬', title_fr: 'Soft Skills',        title_en: 'Soft Skills',      hours: 5 },
  { id: 6, slug: 'reseaux',   icon: '🔗', title_fr: 'Réseaux',            title_en: 'Networking',       hours: 8 },
];

const STATIC_ACTIVITIES = [
  {
    id: 1, theme_id: 1, type: 'formation',
    title_fr: 'Formation React avancée', title_en: 'Advanced React Training',
    hours: 4, date: '2025-03-15',
    reflection_fr: 'À remplir via l\'administration…',
    reflection_en: 'To be filled via admin panel…',
    proof_url: ''
  },
  {
    id: 2, theme_id: 1, type: 'projet',
    title_fr: 'Projet Web Full-Stack', title_en: 'Full-Stack Web Project',
    hours: 6, date: '2025-04-10',
    reflection_fr: 'À remplir via l\'administration…',
    reflection_en: 'To be filled via admin panel…',
    proof_url: ''
  },
  {
    id: 3, theme_id: 2, type: 'hackathon',
    title_fr: 'Compétition de robotique', title_en: 'Robotics Competition',
    hours: 10, date: '2025-02-20',
    reflection_fr: 'À remplir via l\'administration…',
    reflection_en: 'To be filled via admin panel…',
    proof_url: ''
  },
  {
    id: 4, theme_id: 2, type: 'formation',
    title_fr: 'Atelier Arduino & ROS', title_en: 'Arduino & ROS Workshop',
    hours: 6, date: '2025-01-18',
    reflection_fr: 'À remplir via l\'administration…',
    reflection_en: 'To be filled via admin panel…',
    proof_url: ''
  },
  {
    id: 5, theme_id: 3, type: 'conference',
    title_fr: 'Conférence Sécurité OWASP', title_en: 'OWASP Security Conference',
    hours: 3, date: '2025-03-05',
    reflection_fr: 'À remplir via l\'administration…',
    reflection_en: 'To be filled via admin panel…',
    proof_url: ''
  },
  {
    id: 6, theme_id: 3, type: 'formation',
    title_fr: 'CTF — Capture The Flag', title_en: 'CTF — Capture The Flag',
    hours: 8, date: '2025-04-22',
    reflection_fr: 'À remplir via l\'administration…',
    reflection_en: 'To be filled via admin panel…',
    proof_url: ''
  },
  {
    id: 7, theme_id: 4, type: 'formation',
    title_fr: 'Formation Docker & CI/CD', title_en: 'Docker & CI/CD Training',
    hours: 5, date: '2025-02-08',
    reflection_fr: 'À remplir via l\'administration…',
    reflection_en: 'To be filled via admin panel…',
    proof_url: ''
  },
  {
    id: 8, theme_id: 5, type: 'jobday',
    title_fr: 'Job Day EPHEC 2025', title_en: 'EPHEC Job Day 2025',
    hours: 4, date: '2025-03-28',
    reflection_fr: 'À remplir via l\'administration…',
    reflection_en: 'To be filled via admin panel…',
    proof_url: ''
  },
  {
    id: 9, theme_id: 6, type: 'visite',
    title_fr: 'Visite datacenter Proximus', title_en: 'Proximus Datacenter Visit',
    hours: 3, date: '2025-01-30',
    reflection_fr: 'À remplir via l\'administration…',
    reflection_en: 'To be filled via admin panel…',
    proof_url: ''
  },
  {
    id: 10, theme_id: 6, type: 'conference',
    title_fr: 'Salon IT — BruSSels Forum', title_en: 'IT Fair — Brussels Forum',
    hours: 6, date: '2025-02-14',
    reflection_fr: 'À remplir via l\'administration…',
    reflection_en: 'To be filled via admin panel…',
    proof_url: ''
  },
];

const STATIC_TIMELINE = [
  { year: '2021', title_fr: 'EPHEC Louvain-la-Neuve', title_en: 'EPHEC Louvain-la-Neuve', type: 'education',
    desc_fr: 'Début du Bachelier en Technologies de l\'Informatique.', desc_en: 'Start of Bachelor in Computer Science Technologies.' },
  { year: '2022', title_fr: 'Projets académiques', title_en: 'Academic Projects', type: 'project',
    desc_fr: 'Développement de projets en algorithmique, bases de données et réseau.', desc_en: 'Development of projects in algorithms, databases and networking.' },
  { year: '2023', title_fr: 'Approfondissement technique', title_en: 'Technical Deepening', type: 'education',
    desc_fr: 'Spécialisation en développement web et systèmes embarqués.', desc_en: 'Specialisation in web development and embedded systems.' },
  { year: '2024', title_fr: 'Projets avancés & Hackathons', title_en: 'Advanced Projects & Hackathons', type: 'project',
    desc_fr: 'Participation à des compétitions et projets en équipe complexes.', desc_en: 'Participation in competitions and complex team projects.' },
  { year: '2025', title_fr: 'Stage professionnel', title_en: 'Professional Internship', type: 'work',
    desc_fr: 'Stage en entreprise — mise en pratique des compétences acquises.', desc_en: 'Company internship — applying acquired skills in a professional context.' },
  { year: '2026', title_fr: 'Diplôme — À venir', title_en: 'Degree — Upcoming', type: 'future',
    desc_fr: 'Obtention du Bachelier en Technologies de l\'Informatique.', desc_en: 'Obtaining the Bachelor in Computer Science Technologies.' },
];

/* ══════════════════════════════════════════
   I18N
══════════════════════════════════════════ */
let lang = localStorage.getItem('portfolio-lang') || 'fr';
let translations = {};

async function loadTranslations(l) {
  try {
    const base = document.querySelector('base')?.href || location.href.replace(/[^/]*$/, '');
    const r = await fetch(`${base}locales/${l}.json`);
    translations = await r.json();
  } catch {
    translations = {};
  }
}

function t(key) {
  return translations[key] || key;
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = t(key);
    if (typeof val === 'string') el.textContent = val;
  });
  document.documentElement.lang = lang;
  document.getElementById('lang-toggle').textContent = lang === 'fr' ? 'EN' : 'FR';
}

document.getElementById('lang-toggle').addEventListener('click', async () => {
  lang = lang === 'fr' ? 'en' : 'fr';
  localStorage.setItem('portfolio-lang', lang);
  await loadTranslations(lang);
  applyTranslations();
  renderSkills(STATIC_SKILLS);
  loadAndRenderActivities();
  renderTimeline(STATIC_TIMELINE);
  restartTyping();
});

/* ══════════════════════════════════════════
   TYPING EFFECT
══════════════════════════════════════════ */
let typingTimer = null;

function restartTyping() {
  clearTimeout(typingTimer);
  startTyping();
}

function startTyping() {
  const el = document.getElementById('typed-text');
  if (!el) return;
  const phrases = (translations['hero.typed'] && Array.isArray(translations['hero.typed']))
    ? translations['hero.typed']
    : ['Developer', 'Robotics', 'EPHEC'];

  let pIdx = 0, cIdx = 0, deleting = false;

  function tick() {
    const phrase = phrases[pIdx];
    if (!deleting) {
      el.textContent = phrase.slice(0, ++cIdx);
      if (cIdx === phrase.length) {
        deleting = true;
        typingTimer = setTimeout(tick, 2200);
        return;
      }
    } else {
      el.textContent = phrase.slice(0, --cIdx);
      if (cIdx === 0) {
        deleting = false;
        pIdx = (pIdx + 1) % phrases.length;
      }
    }
    typingTimer = setTimeout(tick, deleting ? 50 : 90);
  }
  tick();
}

/* ══════════════════════════════════════════
   GSAP SCROLL ANIMATIONS
══════════════════════════════════════════ */
function initAnimations() {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  document.querySelectorAll('[data-animate]').forEach(el => {
    const type = el.getAttribute('data-animate') || 'fade-up';
    const from = {
      opacity: 0,
      y: type === 'fade-up'    ? 40 : 0,
      x: type === 'fade-right' ? -50 : type === 'fade-left' ? 50 : 0,
    };
    gsap.from(el, {
      ...from,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none none',
      }
    });
  });

  gsap.from('h2', {
    opacity: 0, y: 28, duration: 0.8, ease: 'power3.out',
    scrollTrigger: { trigger: 'h2', start: 'top 90%', toggleActions: 'play none none none' },
    stagger: 0.1
  });
}

/* ══════════════════════════════════════════
   SKILLS
══════════════════════════════════════════ */
function renderSkills(skills) {
  const container = document.getElementById('skills-container');
  if (!container) return;

  const cats = [...new Set(skills.map(s => s.category))];
  const catLabels = {
    Languages: lang === 'fr' ? 'Langages' : 'Languages',
    Frontend:  'Frontend',
    Backend:   'Backend',
    DevOps:    'DevOps',
    Tools:     lang === 'fr' ? 'Outils' : 'Tools',
    Embedded:  lang === 'fr' ? 'Embarqué' : 'Embedded',
  };

  container.innerHTML = cats.map(cat => `
    <div class="skills-category">
      <div class="skills-category-title">${catLabels[cat] || cat}</div>
      ${skills.filter(s => s.category === cat).map(s => `
        <div class="skill-item">
          <div class="skill-header">
            <span class="skill-name">${s.name}</span>
            <span class="skill-pct">${s.level}%</span>
          </div>
          <div class="skill-bar">
            <div class="skill-fill" data-level="${s.level}" style="width:0%"></div>
          </div>
        </div>
      `).join('')}
    </div>
  `).join('');

  if (window.ScrollTrigger) {
    ScrollTrigger.refresh();
  }

  observeSkills();
}

function observeSkills() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.skill-fill').forEach(bar => {
          bar.style.width = bar.dataset.level + '%';
        });
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.skills-category').forEach(c => io.observe(c));
}

/* ══════════════════════════════════════════
   ACTIVITIES
══════════════════════════════════════════ */
async function loadAndRenderActivities() {
  let themes     = STATIC_THEMES;
  let activities = STATIC_ACTIVITIES;

  if (sb) {
    try {
      const [tRes, aRes] = await Promise.all([
        sb.from('themes').select('*').order('order_index'),
        sb.from('activities').select('*').order('order_index')
      ]);
      if (!tRes.error && tRes.data?.length) themes     = tRes.data;
      if (!aRes.error && aRes.data?.length) activities = aRes.data;
    } catch (_) {}
  }

  renderFilterBar(themes);
  renderActivities(activities, themes);
  updateStats(themes, activities);
}

function renderFilterBar(themes) {
  const bar = document.getElementById('filter-bar');
  if (!bar) return;
  bar.innerHTML = `<button class="filter-btn active" data-filter="all">${t('activities.all')}</button>`;
  themes.forEach(th => {
    const label = lang === 'en' && th.title_en ? th.title_en : th.title_fr;
    bar.innerHTML += `<button class="filter-btn" data-filter="${th.slug || th.id}">${th.icon || ''} ${label}</button>`;
  });
  bar.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => filterActivities(btn.dataset.filter, btn));
  });
}

function renderActivities(activities, themes) {
  const grid = document.getElementById('activities-grid');
  if (!grid) return;

  grid.innerHTML = activities.map(a => {
    const theme = themes.find(th => th.id === a.theme_id);
    const themeLabel = theme ? (lang === 'en' && theme.title_en ? theme.title_en : theme.title_fr) : '';
    const title = lang === 'en' && a.title_en ? a.title_en : a.title_fr;
    const reflection = lang === 'en' && a.reflection_en ? a.reflection_en : a.reflection_fr;
    const dateStr = a.date ? new Date(a.date).toLocaleDateString(lang === 'fr' ? 'fr-BE' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

    return `
    <div class="activity-card"
         data-theme="${theme?.slug || theme?.id || ''}"
         data-id="${a.id}"
         data-title="${escHtml(title)}"
         data-type="${a.type || ''}"
         data-hours="${a.hours || 0}"
         data-date="${dateStr}"
         data-reflection="${escHtml(reflection)}"
         data-proof="${escHtml(a.proof_url || '')}">
      <div class="card-meta">
        <span class="type-badge ${a.type || ''}">${typeLabel(a.type)}</span>
        <span class="card-hours">${a.hours || 0}h</span>
      </div>
      <div class="card-theme">${themeLabel}</div>
      <div class="card-title">${title}</div>
      <div class="card-excerpt">${reflection}</div>
      <span class="card-readmore">${t('activities.readmore')}</span>
    </div>
    `;
  }).join('');

  grid.querySelectorAll('.activity-card').forEach(card => {
    card.addEventListener('click', () => openModal(card));
  });

  if (window.gsap) {
    gsap.from('.activity-card', {
      opacity: 0, y: 30, duration: 0.6, stagger: 0.07, ease: 'power3.out',
      scrollTrigger: { trigger: '#activities-grid', start: 'top 85%', toggleActions: 'play none none none' }
    });
  }
}

function typeLabel(type) {
  const map = {
    hackathon:  'Hackathon',
    formation:  lang === 'fr' ? 'Formation' : 'Training',
    conference: lang === 'fr' ? 'Conférence' : 'Conference',
    visite:     lang === 'fr' ? 'Visite' : 'Company Visit',
    jobday:     'Job Day',
    projet:     lang === 'fr' ? 'Projet' : 'Project',
    salon:      'Salon IT',
  };
  return map[type] || type || '—';
}

function filterActivities(filter, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  document.querySelectorAll('.activity-card').forEach(card => {
    const show = filter === 'all' || card.dataset.theme === filter;
    card.classList.toggle('hidden', !show);
  });
}

function updateStats(themes, activities) {
  const totalHours = activities.reduce((s, a) => s + (a.hours || 0), 0);
  animateCounter('stat-themes',     themes.length);
  animateCounter('stat-hours',      totalHours);
  animateCounter('stat-activities', activities.length);
}

function animateCounter(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  let current = 0;
  const step = Math.ceil(target / 40);
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current + (target >= 10 ? '+' : '');
    if (current >= target) clearInterval(timer);
  }, 40);
}

/* ══════════════════════════════════════════
   MODAL
══════════════════════════════════════════ */
function openModal(card) {
  const overlay = document.getElementById('modal-overlay');
  document.getElementById('modal-title').textContent       = card.dataset.title;
  document.getElementById('modal-type').textContent        = typeLabel(card.dataset.type);
  document.getElementById('modal-type').className         = `modal-type-badge ${card.dataset.type}`;
  document.getElementById('modal-hours').textContent       = `${card.dataset.hours} ${t('modal.hours')}`;
  document.getElementById('modal-date').textContent        = card.dataset.date;
  document.getElementById('modal-reflection').textContent  = card.dataset.reflection;

  const proofEl = document.getElementById('modal-proof');
  if (card.dataset.proof) {
    proofEl.innerHTML = `<span>${t('modal.proof')}</span> <a href="${card.dataset.proof}" target="_blank" rel="noopener">${card.dataset.proof}</a>`;
  } else {
    proofEl.innerHTML = '';
  }

  overlay.setAttribute('aria-hidden', 'false');
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-overlay').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeModal();
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

/* ══════════════════════════════════════════
   TIMELINE
══════════════════════════════════════════ */
function renderTimeline(items) {
  const container = document.getElementById('timeline');
  if (!container) return;

  container.innerHTML = items.map((item, i) => {
    const title = lang === 'en' && item.title_en ? item.title_en : item.title_fr;
    const desc  = lang === 'en' && item.desc_en  ? item.desc_en  : item.desc_fr;
    return `
    <div class="tl-item">
      <div class="tl-dot"></div>
      <div class="tl-content" style="animation-delay:${i*0.12}s">
        <div class="tl-year">${item.year}</div>
        <div class="tl-title">${title}</div>
        <div class="tl-desc">${desc}</div>
      </div>
      <div class="tl-spacer"></div>
    </div>
    `;
  }).join('');

  if (window.gsap) {
    gsap.from('.tl-item', {
      opacity: 0, y: 30, duration: 0.6, stagger: 0.12, ease: 'power3.out',
      scrollTrigger: { trigger: '#timeline', start: 'top 85%', toggleActions: 'play none none none' }
    });
  }
}

/* ══════════════════════════════════════════
   NAVIGATION — scroll spy, burger, shrink
══════════════════════════════════════════ */
function initNav() {
  const navbar  = document.getElementById('navbar');
  const burger  = document.getElementById('burger');
  const navLinks = document.getElementById('nav-links');
  const links   = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);

    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 120) current = s.id;
    });
    links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${current}`));
  }, { passive: true });

  burger.addEventListener('click', () => {
    const open = burger.classList.toggle('open');
    navLinks.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
  });

  links.forEach(a => a.addEventListener('click', () => {
    burger.classList.remove('open');
    navLinks.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  }));
}

/* ══════════════════════════════════════════
   HELPERS
══════════════════════════════════════════ */
function escHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/* ══════════════════════════════════════════
   INIT
══════════════════════════════════════════ */
async function init() {
  await loadTranslations(lang);
  applyTranslations();
  initNav();
  initAnimations();
  startTyping();
  renderSkills(STATIC_SKILLS);
  await loadAndRenderActivities();
  renderTimeline(STATIC_TIMELINE);
}

document.addEventListener('DOMContentLoaded', init);

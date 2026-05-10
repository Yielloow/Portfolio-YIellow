/* ══════════════════════════════════════════
   ADMIN.JS — Auth · CRUD · UI
══════════════════════════════════════════ */

/* ── Config ─ replace with your Supabase values ── */
const SUPABASE_URL = 'https://fzoxpcpfoazihmxzthnm.supabase.co';
const SUPABASE_KEY = 'sb_publishable_lGurPEsMa7O5UeEuonrLhg_ckpsZA3N';

const sb = (SUPABASE_URL !== 'YOUR_SUPABASE_URL' && window.supabase)
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

/* ══════════════════════════════════════════
   STATE
══════════════════════════════════════════ */
let activeTab    = 'activities';
let editingItem  = null; // { table, id } when editing
let formContext  = null; // 'activity' | 'theme' | 'skill' | 'timeline'

/* ══════════════════════════════════════════
   INIT
══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  if (!sb) {
    showNoSupabase();
    return;
  }

  const { data: { session } } = await sb.auth.getSession();
  if (session) showDashboard();
  else         showLogin();

  bindGlobalEvents();
});

function showNoSupabase() {
  const ls = document.getElementById('login-screen');
  ls.innerHTML = `
    <div class="login-card" style="text-align:center">
      <div class="login-logo">&lt;FMC/&gt;</div>
      <h1 class="login-title" style="font-size:1.3rem">Supabase non configuré</h1>
      <p class="login-sub" style="margin-bottom:24px">
        Ouvrez <code style="color:#00d4ff;background:rgba(0,212,255,0.1);padding:2px 6px;border-radius:4px">js/admin.js</code>
        et remplacez <code style="color:#00d4ff;background:rgba(0,212,255,0.1);padding:2px 6px;border-radius:4px">YOUR_SUPABASE_URL</code>
        et <code style="color:#00d4ff;background:rgba(0,212,255,0.1);padding:2px 6px;border-radius:4px">YOUR_SUPABASE_ANON_KEY</code>
        par vos vraies valeurs Supabase.
      </p>
      <p style="font-size:0.82rem;color:#64748b;margin-bottom:28px">
        Créez votre projet sur <strong style="color:#00d4ff">supabase.com</strong> puis exécutez le fichier
        <code style="color:#00d4ff;background:rgba(0,212,255,0.1);padding:2px 6px;border-radius:4px">supabase/schema.sql</code>
        dans l'éditeur SQL de Supabase.
      </p>
      <a href="index.html" class="back-link">← Retour au portfolio</a>
    </div>
  `;
}

/* ══════════════════════════════════════════
   AUTH
══════════════════════════════════════════ */
function showLogin() {
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('dashboard').style.display    = 'none';
}

async function showDashboard() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('dashboard').style.display    = 'flex';
  switchTab('activities');
}

document.getElementById('login-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('login-btn');
  const errEl = document.getElementById('login-error');
  btn.textContent = 'Connexion…';
  btn.disabled = true;
  errEl.textContent = '';

  const { error } = await sb.auth.signInWithPassword({
    email:    document.getElementById('email').value,
    password: document.getElementById('password').value,
  });

  if (error) {
    errEl.textContent = 'Identifiants incorrects. Vérifiez votre email et mot de passe.';
    btn.textContent = 'Se connecter';
    btn.disabled = false;
  } else {
    showDashboard();
  }
});

document.getElementById('logout-btn')?.addEventListener('click', async () => {
  await sb.auth.signOut();
  showLogin();
});

/* ══════════════════════════════════════════
   TAB NAVIGATION
══════════════════════════════════════════ */
const TAB_TITLES = {
  activities: 'Activités',
  themes:     'Thèmes',
  skills:     'Compétences',
  timeline:   'Parcours',
  profile:    'Profil & Projet',
  cv:         'CV',
};

function switchTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sn-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`tab-${tab}`)?.classList.add('active');
  document.querySelector(`.sn-btn[data-tab="${tab}"]`)?.classList.add('active');
  document.getElementById('tab-title').textContent = TAB_TITLES[tab] || tab;
  loadTab(tab);
}

function bindGlobalEvents() {
  document.querySelectorAll('.sn-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  document.getElementById('new-activity-btn')?.addEventListener('click', () => openForm('activity'));
  document.getElementById('new-theme-btn')?.addEventListener('click',    () => openForm('theme'));
  document.getElementById('new-skill-btn')?.addEventListener('click',    () => openForm('skill'));
  document.getElementById('new-tl-btn')?.addEventListener('click',       () => openForm('timeline'));

  document.getElementById('save-profile-btn')?.addEventListener('click', saveProfile);

  setupCvUpload('fr');
  setupCvUpload('en');

  document.getElementById('form-close')?.addEventListener('click', closeForm);
  document.getElementById('form-overlay')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) closeForm();
  });
  document.getElementById('item-form')?.addEventListener('submit', handleFormSubmit);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeForm(); });
}

/* ══════════════════════════════════════════
   LOAD TAB DATA
══════════════════════════════════════════ */
async function loadTab(tab) {
  if (tab === 'activities') await loadActivities();
  if (tab === 'themes')     await loadThemes();
  if (tab === 'skills')     await loadSkills();
  if (tab === 'timeline')   await loadTimeline();
  if (tab === 'profile')    { await loadProfile(); await loadSectionOrder(); }
}

/* ── Activities ── */
async function loadActivities() {
  const list = document.getElementById('activities-list');
  list.innerHTML = '<p style="color:var(--muted);font-size:.88rem">Chargement…</p>';

  const [{ data: activities }, { data: themes }] = await Promise.all([
    sb.from('activities').select('*').order('order_index'),
    sb.from('themes').select('id, title_fr, slug').order('order_index'),
  ]);

  if (!activities?.length) {
    list.innerHTML = '<p style="color:var(--muted);font-size:.88rem">Aucune activité. Créez-en une !</p>';
    return;
  }

  const themeMap = Object.fromEntries((themes || []).map(t => [t.id, t.title_fr]));
  list.innerHTML = activities.map(a => `
    <div class="item-row">
      <div class="item-icon">📋</div>
      <div class="item-info">
        <div class="item-title">${escHtml(a.title_fr)}</div>
        <div class="item-meta">${themeMap[a.theme_id] || '—'} &nbsp;·&nbsp; ${typeLabel(a.type)} &nbsp;·&nbsp; ${a.hours || 0}h</div>
      </div>
      <span class="badge">${a.type || '—'}</span>
      <div class="item-actions">
        <button class="btn-ghost btn-sm" onclick="editItem('activity','${a.id}')">Éditer</button>
      </div>
    </div>
  `).join('');
}

/* ── Themes ── */
async function loadThemes() {
  const list = document.getElementById('themes-list');
  list.innerHTML = '<p style="color:var(--muted);font-size:.88rem">Chargement…</p>';

  const [{ data: themes }, { data: activities }] = await Promise.all([
    sb.from('themes').select('*').order('order_index'),
    sb.from('activities').select('theme_id, hours'),
  ]);

  if (!themes?.length) {
    list.innerHTML = '<p style="color:var(--muted);font-size:.88rem">Aucun thème.</p>';
    return;
  }

  // calculate hours per theme from activities
  const hoursMap = {};
  (activities || []).forEach(a => {
    hoursMap[a.theme_id] = (hoursMap[a.theme_id] || 0) + (a.hours || 0);
  });

  list.innerHTML = themes.map(th => {
    const total = hoursMap[th.id] || 0;
    const overLimit = total > 10;
    return `
    <div class="item-row">
      <div class="item-icon">${th.icon || '🏷️'}</div>
      <div class="item-info">
        <div class="item-title">${escHtml(th.title_fr)}</div>
        <div class="item-meta">slug: ${th.slug || '—'}</div>
      </div>
      <span class="badge ${overLimit ? 'badge-warn' : ''}">${total}h / 10h max</span>
      <div class="item-actions">
        <button class="btn-ghost btn-sm" onclick="editItem('theme','${th.id}')">Éditer</button>
      </div>
    </div>`;
  }).join('');
}

/* ── Skills ── */
async function loadSkills() {
  const list = document.getElementById('skills-list');
  list.innerHTML = '<p style="color:var(--muted);font-size:.88rem">Chargement…</p>';

  const { data: skills } = await sb.from('skills').select('*').order('order_index');
  if (!skills?.length) {
    list.innerHTML = '<p style="color:var(--muted);font-size:.88rem">Aucune compétence.</p>';
    return;
  }
  list.innerHTML = skills.map(s => `
    <div class="item-row">
      <div class="item-icon">💡</div>
      <div class="item-info">
        <div class="item-title">${escHtml(s.name)}</div>
        <div class="item-meta">${s.category || '—'} &nbsp;·&nbsp; ${s.level || 0}%</div>
      </div>
      <div class="item-actions">
        <button class="btn-ghost btn-sm" onclick="editItem('skill','${s.id}')">Éditer</button>
      </div>
    </div>
  `).join('');
}

/* ── Timeline ── */
async function loadTimeline() {
  const list = document.getElementById('timeline-list');
  list.innerHTML = '<p style="color:var(--muted);font-size:.88rem">Chargement…</p>';

  const { data: items } = await sb.from('timeline_items').select('*').order('year');
  if (!items?.length) {
    list.innerHTML = '<p style="color:var(--muted);font-size:.88rem">Aucune étape.</p>';
    return;
  }
  list.innerHTML = items.map(i => `
    <div class="item-row">
      <div class="item-icon">📅</div>
      <div class="item-info">
        <div class="item-title">${i.year} — ${escHtml(i.title_fr)}</div>
        <div class="item-meta">${escHtml(i.desc_fr || '').slice(0, 80)}…</div>
      </div>
      <div class="item-actions">
        <button class="btn-ghost btn-sm" onclick="editItem('timeline','${i.id}')">Éditer</button>
      </div>
    </div>
  `).join('');
}

/* ── Profile ── */
async function loadProfile() {
  const { data } = await sb.from('profile').select('*').single();
  if (!data) return;
  setValue('bio-fr',     data.bio_fr);
  setValue('bio-en',     data.bio_en);
  setValue('projet-fr',  data.project_fr);
  setValue('projet-en',  data.project_en);
  setValue('strengths',  (data.strengths_fr || []).join('\n'));
  setValue('weaknesses', (data.weaknesses_fr || []).join('\n'));
}

async function saveProfile() {
  const btn = document.getElementById('save-profile-btn');
  const statusEl = document.getElementById('profile-status');
  btn.disabled = true;
  statusEl.textContent = 'Enregistrement…';
  statusEl.className = 'save-status';

  const payload = {
    bio_fr:        getValue('bio-fr'),
    bio_en:        getValue('bio-en'),
    project_fr:    getValue('projet-fr'),
    project_en:    getValue('projet-en'),
    strengths_fr:  getValue('strengths').split('\n').filter(Boolean),
    weaknesses_fr: getValue('weaknesses').split('\n').filter(Boolean),
    updated_at:    new Date().toISOString(),
  };

  const { error } = await sb.from('profile').upsert({ id: 1, ...payload });
  btn.disabled = false;
  if (error) {
    statusEl.textContent = 'Erreur : ' + error.message;
    statusEl.className = 'save-status error';
  } else {
    statusEl.textContent = '✓ Profil enregistré !';
    setTimeout(() => { statusEl.textContent = ''; }, 3000);
  }
}

/* ══════════════════════════════════════════
   FORM — OPEN / FIELDS / SUBMIT
══════════════════════════════════════════ */
const FORM_FIELDS = {
  activity: [
    { key: '_row1',         type: 'row-start' },
    { key: 'title_fr',      label: 'Titre (FR)',           type: 'text',         required: true },
    { key: 'title_en',      label: 'Title (EN)',           type: 'text' },
    { key: '_row1end',      type: 'row-end' },
    { key: '_row2',         type: 'row-start' },
    { key: 'theme_id',      label: 'Thème',                type: 'theme-select', required: true },
    { key: 'type',          label: 'Type d\'activité',     type: 'type-select' },
    { key: '_row2end',      type: 'row-end' },
    { key: '_row3',         type: 'row-start' },
    { key: 'hours',         label: 'Heures',               type: 'number' },
    { key: 'date',          label: 'Date',                 type: 'date' },
    { key: '_row3end',      type: 'row-end' },
    { key: 'reflection_fr', label: 'Analyse réflexive (FR) — min. 1 page (~1500 caractères)', type: 'reflection', rows: 14, required: true },
    { key: 'reflection_en', label: 'Reflective analysis (EN)',                                type: 'reflection', rows: 14 },
    { key: '_proof',        type: 'proof-section' },
    { key: 'proof_url',     label: 'Preuves de participation (un lien par ligne)', type: 'multi-url' },
    { key: 'order_index',   label: 'Ordre d\'affichage',   type: 'number' },
  ],
  theme: [
    { key: '_row1',       type: 'row-start' },
    { key: 'title_fr',    label: 'Titre (FR)',  type: 'text', required: true },
    { key: 'title_en',    label: 'Title (EN)',  type: 'text' },
    { key: '_row1end',    type: 'row-end' },
    { key: '_row2',       type: 'row-start' },
    { key: 'slug',        label: 'Slug (ex: web, robotique…)', type: 'text', required: true },
    { key: 'icon',        label: 'Emoji icône', type: 'text' },
    { key: '_row2end',    type: 'row-end' },
    { key: 'order_index', label: 'Ordre d\'affichage', type: 'number' },
  ],
  skill: [
    { key: 'name',        label: 'Nom',      type: 'text',   required: true },
    { key: 'level',       label: 'Niveau (0–100)', type: 'number' },
    { key: 'category',    label: 'Catégorie', type: 'text' },
    { key: 'order_index', label: 'Ordre',    type: 'number' },
  ],
  timeline: [
    { key: 'year',        label: 'Année',      type: 'text',     required: true },
    { key: 'title_fr',    label: 'Titre (FR)', type: 'text',     required: true },
    { key: 'title_en',    label: 'Title (EN)', type: 'text' },
    { key: 'desc_fr',     label: 'Description (FR)', type: 'textarea', rows: 3 },
    { key: 'desc_en',     label: 'Description (EN)', type: 'textarea', rows: 3 },
    { key: 'type',        label: 'Type (education/work/project/future)', type: 'text' },
  ],
};

const TABLE_MAP = {
  activity: 'activities',
  theme:    'themes',
  skill:    'skills',
  timeline: 'timeline_items',
};

async function openForm(type, data = null) {
  formContext = type;
  editingItem = data ? { table: TABLE_MAP[type], id: data.id } : null;

  const overlay = document.getElementById('form-overlay');
  const title   = document.getElementById('form-title');
  const fields  = document.getElementById('form-fields');
  const delBtn  = document.getElementById('delete-btn');

  const labels = { activity: 'activité', theme: 'thème', skill: 'compétence', timeline: 'étape' };
  title.textContent = data ? `Modifier ${labels[type]}` : `Nouvelle ${labels[type]}`;
  delBtn.style.display = data ? 'flex' : 'none';

  let themes = [];
  if (type === 'activity') {
    const { data: t } = await sb.from('themes').select('id, title_fr').order('order_index');
    themes = t || [];
  }

  fields.innerHTML = FORM_FIELDS[type].map(f => {
    const val = data?.[f.key] ?? '';
    return buildField(f, val, themes);
  }).join('');

  setupCharCounters();
  setupProofUpload(data?.id);
  overlay.classList.add('open');
}

function buildField(f, val, themes) {
  const req = f.required ? 'required' : '';

  if (f.type === 'row-start')  return '<div class="form-row-2">';
  if (f.type === 'row-end')    return '</div>';
  if (f.type === 'proof-section') return `
    <div class="proof-upload-section">
      <div class="proof-section-label">📎 Preuve de participation</div>
      <div class="proof-upload-inner">
        <input type="file" id="proof-file-input" accept="image/*,.pdf" class="file-input">
        <label for="proof-file-input" class="btn-ghost file-label">Choisir un fichier (image ou PDF)</label>
        <span class="file-name" id="proof-file-name">Aucun fichier</span>
        <button type="button" class="btn-primary btn-sm" id="proof-upload-btn">Téléverser</button>
        <span class="save-status" id="proof-upload-status"></span>
      </div>
      <div id="proof-preview" class="proof-preview"></div>
    </div>`;

  if (f.type === 'theme-select') {
    const opts = themes.map(t => `<option value="${t.id}" ${val == t.id ? 'selected' : ''}>${t.title_fr}</option>`).join('');
    return `<div class="form-group"><label>${f.label}</label><select name="${f.key}" ${req}><option value="">— Choisir —</option>${opts}</select></div>`;
  }
  if (f.type === 'type-select') {
    const types = [
      { v:'formation',  l:'📚 Formation' },
      { v:'hackathon',  l:'🏆 Hackathon' },
      { v:'conference', l:'🎤 Conférence' },
      { v:'visite',     l:'🏢 Visite d\'entreprise' },
      { v:'jobday',     l:'💼 Job Day' },
      { v:'projet',     l:'🔨 Projet' },
      { v:'salon',      l:'🎪 Salon IT' },
    ];
    const opts = types.map(t => `<option value="${t.v}" ${val === t.v ? 'selected' : ''}>${t.l}</option>`).join('');
    return `<div class="form-group"><label>${f.label}</label><select name="${f.key}"><option value="">— Type —</option>${opts}</select></div>`;
  }
  if (f.type === 'reflection') {
    const isFr  = f.key === 'reflection_fr';
    const count = String(val || '').length;
    const cls   = count >= 1500 ? 'ok' : count >= 750 ? 'warn' : 'low';
    const counter = isFr ? `
        <div class="char-counter ${cls}" id="${f.key}-counter">
          <span class="char-num">${count}</span> caractères
          <span class="char-target">${count >= 1500 ? '✓ suffisant' : '· objectif : 1500+'}</span>
        </div>` : '';
    return `
      <div class="form-group">
        <label>${f.label}</label>
        <textarea name="${f.key}" rows="${f.rows || 8}" ${req} class="${isFr ? 'reflection-ta' : ''}" ${isFr ? `data-counter="${f.key}-counter"` : ''}>${escHtml(val)}</textarea>
        ${counter}
      </div>`;
  }
  if (f.type === 'multi-url') {
    return `
      <div class="form-group">
        <label>${f.label}</label>
        <textarea name="${f.key}" rows="3" placeholder="https://drive.google.com/...&#10;https://photo.example.com/...">${escHtml(val)}</textarea>
        <span class="field-hint">Un lien par ligne · photo, certificat, Drive, OneDrive…</span>
      </div>`;
  }
  if (f.type === 'textarea') {
    return `<div class="form-group"><label>${f.label}</label><textarea name="${f.key}" rows="${f.rows || 4}" ${req}>${escHtml(val)}</textarea></div>`;
  }
  return `<div class="form-group"><label>${f.label}</label><input type="${f.type}" name="${f.key}" value="${escHtml(String(val))}" ${req}></div>`;
}

function setupCharCounters() {
  document.querySelectorAll('.reflection-ta').forEach(ta => {
    const counterId = ta.dataset.counter;
    ta.addEventListener('input', () => {
      const count  = ta.value.length;
      const el     = document.getElementById(counterId);
      if (!el) return;
      el.querySelector('.char-num').textContent = count;
      el.querySelector('.char-target').textContent = count >= 1500 ? '✓ suffisant' : '· objectif : 1500+';
      el.className = `char-counter ${count >= 1500 ? 'ok' : count >= 750 ? 'warn' : 'low'}`;
    });
  });
}

function setupProofUpload(activityId) {
  const fileInput  = document.getElementById('proof-file-input');
  const fileNameEl = document.getElementById('proof-file-name');
  const uploadBtn  = document.getElementById('proof-upload-btn');
  const statusEl   = document.getElementById('proof-upload-status');
  const previewEl  = document.getElementById('proof-preview');
  const urlInput   = document.querySelector('input[name="proof_url"]');

  if (!fileInput) return;

  fileInput.addEventListener('change', () => {
    const f = fileInput.files[0];
    fileNameEl.textContent = f?.name || 'Aucun fichier';
    if (f && f.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = e => { previewEl.innerHTML = `<img src="${e.target.result}" alt="preview">`; };
      reader.readAsDataURL(f);
    } else {
      previewEl.innerHTML = '';
    }
  });

  uploadBtn?.addEventListener('click', async () => {
    const file = fileInput.files[0];
    if (!file) { statusEl.textContent = 'Aucun fichier.'; return; }
    if (!sb)   { statusEl.textContent = 'Supabase non configuré.'; return; }

    uploadBtn.disabled = true;
    statusEl.textContent = 'Téléversement…';
    statusEl.className = 'save-status';

    const ext  = file.name.split('.').pop();
    const name = `proof_${activityId || Date.now()}.${ext}`;
    const { data, error } = await sb.storage.from('proof-images').upload(name, file, { upsert: true });

    uploadBtn.disabled = false;
    if (error) {
      statusEl.textContent = 'Erreur : ' + error.message;
      statusEl.className = 'save-status error';
      return;
    }
    const { data: { publicUrl } } = sb.storage.from('proof-images').getPublicUrl(name);
    if (urlInput) urlInput.value = publicUrl;
    statusEl.textContent = '✓ Fichier téléversé, URL copiée dans le champ ci-dessus';
    setTimeout(() => { statusEl.textContent = ''; }, 4000);
  });
}

async function handleFormSubmit(e) {
  e.preventDefault();
  const form    = document.getElementById('item-form');
  const data    = Object.fromEntries(new FormData(form).entries());
  const table   = TABLE_MAP[formContext];

  // coerce types — empty strings → null for non-text fields
  if (data.hours)       data.hours       = Number(data.hours);
  if (data.level)       data.level       = Number(data.level);
  if (data.order_index) data.order_index = Number(data.order_index);
  if (data.date      === '') data.date      = null;
  if (data.proof_url === '') data.proof_url = null;
  else if (data.proof_url) data.proof_url = data.proof_url.trim();
  if (data.title_en    === '') data.title_en    = null;
  if (data.reflection_en === '') data.reflection_en = null;

  let error;
  if (editingItem) {
    ({ error } = await sb.from(table).update(data).eq('id', editingItem.id));
  } else {
    ({ error } = await sb.from(table).insert(data));
  }

  if (error) {
    alert('Erreur : ' + error.message);
    return;
  }
  closeForm();
  loadTab(activeTab);
}

async function editItem(type, id) {
  const table = TABLE_MAP[type];
  const { data } = await sb.from(table).select('*').eq('id', id).single();
  if (data) openForm(type, data);
}

document.getElementById('delete-btn')?.addEventListener('click', async () => {
  if (!editingItem) return;
  if (!confirm('Supprimer cet élément ?')) return;
  await sb.from(editingItem.table).delete().eq('id', editingItem.id);
  closeForm();
  loadTab(activeTab);
});

function closeForm() {
  document.getElementById('form-overlay').classList.remove('open');
  editingItem = null;
}

/* ══════════════════════════════════════════
   CV UPLOAD (Supabase Storage)
══════════════════════════════════════════ */
function setupCvUpload(lang) {
  const fileInput = document.getElementById(`cv-${lang}-file`);
  const nameEl    = document.getElementById(`cv-${lang}-name`);
  const uploadBtn = document.getElementById(`upload-cv-${lang}`);
  const statusEl  = document.getElementById(`cv-${lang}-status`);

  fileInput?.addEventListener('change', () => {
    nameEl.textContent = fileInput.files[0]?.name || 'Aucun fichier';
  });

  uploadBtn?.addEventListener('click', async () => {
    const file = fileInput?.files?.[0];
    if (!file) { statusEl.textContent = 'Aucun fichier sélectionné.'; statusEl.className = 'save-status error'; return; }
    uploadBtn.disabled = true;
    statusEl.textContent = 'Téléversement…';
    statusEl.className = 'save-status';

    const { error } = await sb.storage.from('cv').upload(`cv-${lang}.pdf`, file, { upsert: true });
    uploadBtn.disabled = false;
    if (error) {
      statusEl.textContent = 'Erreur : ' + error.message;
      statusEl.className = 'save-status error';
      return;
    }
    // Save public URL to profile so portfolio can link to it
    const { data: { publicUrl } } = sb.storage.from('cv').getPublicUrl(`cv-${lang}.pdf`);
    await sb.from('profile').upsert({ id: 1, [`cv_${lang}_url`]: publicUrl });
    statusEl.textContent = `✓ CV téléversé et lié au portfolio !`;
    setTimeout(() => { statusEl.textContent = ''; }, 4000);
  });
}

/* ══════════════════════════════════════════
   SECTION ORDERING
══════════════════════════════════════════ */
const SECTION_LABELS = {
  about:       '👤 À propos',
  projet:      '🎯 Projet professionnel',
  competences: '💡 Stack technique',
  activites:   '📋 Activités & Thèmes',
  parcours:    '📅 Parcours',
  cv:          '📄 CV',
};
const DEFAULT_ORDER = ['about','projet','competences','activites','parcours','cv'];

let currentSectionOrder = [...DEFAULT_ORDER];

async function loadSectionOrder() {
  const container = document.getElementById('section-order-list');
  if (!container) return;
  try {
    const { data } = await sb.from('profile').select('section_order').single();
    if (data?.section_order?.length) currentSectionOrder = data.section_order;
  } catch (_) {}
  renderSectionOrder(container);
}

function renderSectionOrder(container) {
  container.innerHTML = currentSectionOrder.map((id, i) => `
    <div class="section-order-row" data-id="${id}">
      <span class="so-handle">⠿</span>
      <span class="so-label">${SECTION_LABELS[id] || id}</span>
      <div class="so-btns">
        <button class="so-btn" onclick="moveSectionOrder(${i},-1)" ${i === 0 ? 'disabled' : ''}>↑</button>
        <button class="so-btn" onclick="moveSectionOrder(${i}, 1)" ${i === currentSectionOrder.length-1 ? 'disabled' : ''}>↓</button>
      </div>
    </div>`).join('');
}

async function moveSectionOrder(idx, dir) {
  const newIdx = idx + dir;
  if (newIdx < 0 || newIdx >= currentSectionOrder.length) return;
  [currentSectionOrder[idx], currentSectionOrder[newIdx]] = [currentSectionOrder[newIdx], currentSectionOrder[idx]];
  const container = document.getElementById('section-order-list');
  renderSectionOrder(container);
  await saveSectionOrder();
}

async function saveSectionOrder() {
  const statusEl = document.getElementById('section-order-status');
  const { error } = await sb.from('profile').upsert({ id: 1, section_order: currentSectionOrder });
  if (statusEl) {
    statusEl.textContent = error ? 'Erreur : ' + error.message : '✓ Ordre sauvegardé';
    statusEl.className = `save-status${error ? ' error' : ''}`;
    setTimeout(() => { statusEl.textContent = ''; }, 2500);
  }
}

window.moveSectionOrder = moveSectionOrder;

/* ══════════════════════════════════════════
   HELPERS
══════════════════════════════════════════ */
function escHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;').replace(/"/g, '&quot;')
    .replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function getValue(id) { return document.getElementById(id)?.value || ''; }
function setValue(id, val) { const el = document.getElementById(id); if (el) el.value = val || ''; }
function typeLabel(type) {
  const m = { hackathon:'Hackathon', formation:'Formation', conference:'Conférence', visite:'Visite', jobday:'Job Day', projet:'Projet', salon:'Salon IT' };
  return m[type] || type || '—';
}

/* expose for inline onclick */
window.editItem = editItem;

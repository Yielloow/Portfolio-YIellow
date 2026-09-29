/* ══════════════════════════════════════════
   INTRO — Glitch reveal <FMC/>
   Joue une seule fois par session
══════════════════════════════════════════ */
(function () {
  const overlay = document.getElementById('intro-overlay');
  const canvas  = document.getElementById('intro-canvas');
  if (!overlay || !canvas) return;

  // Une seule fois par session
  if (sessionStorage.getItem('fmc-intro')) {
    overlay.remove();
    return;
  }

  document.body.style.overflow = 'hidden';

  const ctx = canvas.getContext('2d');
  const TARGET = '<FMC/>';
  const CHARS  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%<>/\\|{}[]!?'.split('');
  const revealed = Array(TARGET.length).fill(false);

  let W, H, frame = 0;
  let phase = 'glitch'; // glitch → pause → wipe

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  function fs()  { return Math.min(W * 0.11, H * 0.16, 88); }
  function sub() { return fs() * 0.22; }

  function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function draw() {
    W = canvas.width; H = canvas.height;

    /* fond */
    ctx.fillStyle = '#05080f';
    ctx.fillRect(0, 0, W, H);

    const size   = fs();
    const charW  = size * 0.62;
    const totalW = TARGET.length * charW;
    const sx     = W / 2 - totalW / 2 + charW / 2;
    const cy     = H / 2;

    /* ── Texte glitché ── */
    ctx.font         = `700 ${size}px 'Courier New', monospace`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    TARGET.split('').forEach((c, i) => {
      const x = sx + i * charW;

      if (revealed[i]) {
        /* caractère fixé */
        ctx.shadowColor = 'rgba(0,212,255,0.55)';
        ctx.shadowBlur  = 18;
        ctx.fillStyle   = 'rgba(0,212,255,0.92)';
        ctx.fillText(c, x, cy);
        ctx.shadowBlur  = 0;
      } else {
        /* caractère glitché */
        const disp = rand(CHARS);
        const a    = 0.15 + Math.random() * 0.25;
        const ox   = (Math.random() - 0.5) * 7;
        const oy   = (Math.random() - 0.5) * 4;
        /* couleur glitch aléatoire */
        if (Math.random() < 0.12) {
          ctx.fillStyle = `rgba(255,30,80,${a})`;
        } else if (Math.random() < 0.08) {
          ctx.fillStyle = `rgba(150,0,255,${a})`;
        } else {
          ctx.fillStyle = `rgba(0,212,255,${a})`;
        }
        ctx.fillText(disp, x + ox, cy + oy);
      }
    });

    /* sous-titre PORTFOLIO — apparaît une fois tout révélé */
    if (phase === 'pause') {
      const subAlpha = Math.min(1, frame / 25);
      ctx.font      = `300 ${sub()}px 'Segoe UI', sans-serif`;
      ctx.fillStyle = `rgba(148,163,184,${subAlpha.toFixed(3)})`;
      ctx.shadowBlur = 0;
      ctx.fillText('PORTFOLIO', W / 2, cy + size * 0.78);
    }

    /* ── Logique de phases ── */
    frame++;

    if (phase === 'glitch') {
      /* révéler progressivement */
      if (frame % 4 === 0) {
        const hidden = revealed.map((r, i) => (!r ? i : -1)).filter(i => i >= 0);
        if (hidden.length) {
          const pick = hidden[Math.floor(Math.random() * hidden.length)];
          revealed[pick] = true;
        }
      }
      /* passer en pause quand tout est révélé et min 40 frames */
      if (frame > 40 && revealed.every(Boolean)) {
        phase = 'pause';
        frame = 0;
      }
    } else if (phase === 'pause') {
      if (frame > 70) {
        phase = 'wipe';
        frame = 0;
        overlay.classList.add('wipe-out');
        /* nettoyer après la transition CSS */
        overlay.addEventListener('transitionend', finish, { once: true });
        /* fallback si transitionend rate */
        setTimeout(finish, 700);
      }
    }

    if (phase !== 'wipe') requestAnimationFrame(draw);
  }

  function finish() {
    overlay.remove();
    document.body.style.overflow = '';
    window.removeEventListener('resize', resize);
    sessionStorage.setItem('fmc-intro', '1');
  }

  draw();
})();

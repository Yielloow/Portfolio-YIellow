/* ══════════════════════════════════════════
   AURORA BACKGROUND
   - Canvas 2D fixed full-page
   - Animated gradient wave layers
   - Stars field
   - Mouse parallax
   - Fades on scroll
══════════════════════════════════════════ */
(function () {
  const canvas = document.getElementById('three-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H;
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  /* ── Mouse parallax ── */
  let mx = 0, my = 0;
  document.addEventListener('mousemove', e => {
    mx = e.clientX / window.innerWidth  - 0.5;
    my = e.clientY / window.innerHeight - 0.5;
  }, { passive: true });

  /* ── Stars ── */
  const STARS = Array.from({ length: 220 }, () => ({
    x:  Math.random(),
    y:  Math.random(),
    r:  Math.random() * 1.1 + 0.2,
    ph: Math.random() * Math.PI * 2,
  }));

  /* ── Aurora layers ──
     yBase : vertical center of the wave (0–1 of H)
     amp   : vertical amplitude (0–1 of H)
     speed : animation speed multiplier
     phase : initial time offset
  ── */
  const LAYERS = [
    { hex: '#7c3aed', op: 0.22, speed: 0.00055, amp: 0.13, phase: 0.0,  yBase: 0.50 },
    { hex: '#00d4ff', op: 0.18, speed: 0.00085, amp: 0.10, phase: 2.1,  yBase: 0.40 },
    { hex: '#a855f7', op: 0.14, speed: 0.00042, amp: 0.15, phase: 4.2,  yBase: 0.63 },
    { hex: '#06b6d4', op: 0.12, speed: 0.00110, amp: 0.08, phase: 1.0,  yBase: 0.33 },
    { hex: '#8b5cf6', op: 0.10, speed: 0.00070, amp: 0.17, phase: 3.5,  yBase: 0.72 },
  ];

  function hexRgb(h) {
    return [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)).join(',');
  }
  LAYERS.forEach(l => { l.rgb = hexRgb(l.hex); });

  function scrollFade() {
    return Math.min(1, window.scrollY / (window.innerHeight * 0.65));
  }

  let t = 0;
  function draw() {
    requestAnimationFrame(draw);
    t++;

    const fade  = scrollFade();
    const gAlpha = 0.94 - fade * 0.58;
    canvas.style.opacity = gAlpha.toFixed(3);

    ctx.clearRect(0, 0, W, H);

    /* ── Stars ── */
    const starAlpha = (0.75 - fade * 0.45);
    const now = t * 0.009;
    if (starAlpha > 0) {
      STARS.forEach(s => {
        const a = starAlpha * (0.25 + 0.75 * Math.abs(Math.sin(now + s.ph)));
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.r, 0, 6.2832);
        ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`;
        ctx.fill();
      });
    }

    /* ── Mouse offset ── */
    const px = mx * 40;
    const py = my * 25;

    /* ── Aurora waves ── */
    LAYERS.forEach(l => {
      const tf = t * l.speed * 60;
      const yc = (l.yBase + Math.sin(tf + l.phase) * l.amp * 0.6) * H + py * 0.4;

      ctx.beginPath();
      ctx.moveTo(0, yc);

      const steps = 100;
      for (let i = 0; i <= steps; i++) {
        const x  = (i / steps) * W + px * 0.25;
        const wy =
          Math.sin(i / steps * Math.PI * 3.5 + tf + l.phase)       * l.amp * H * 0.55 +
          Math.sin(i / steps * Math.PI * 6.0 + tf * 1.3 + l.phase) * l.amp * H * 0.22 +
          Math.sin(i / steps * Math.PI * 1.5 + tf * 0.7)            * l.amp * H * 0.15;
        ctx.lineTo(x, yc + wy);
      }

      ctx.lineTo(W + Math.abs(px) * 0.25, H);
      ctx.lineTo(0, H);
      ctx.closePath();

      const bandH = l.amp * H * 1.8;
      const grad  = ctx.createLinearGradient(0, yc - bandH * 0.3, 0, yc + bandH);
      grad.addColorStop(0,   `rgba(${l.rgb},0)`);
      grad.addColorStop(0.25, `rgba(${l.rgb},${l.op})`);
      grad.addColorStop(0.6,  `rgba(${l.rgb},${(l.op * 0.5).toFixed(3)})`);
      grad.addColorStop(1,   `rgba(${l.rgb},0)`);

      ctx.fillStyle = grad;
      ctx.fill();
    });
  }

  draw();
})();

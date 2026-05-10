/* ══════════════════════════════════════════
   THREE.JS SCENE — Night sky / Moon / Tech sphere
══════════════════════════════════════════ */
(function () {
  const canvas = document.getElementById('three-canvas');
  if (!canvas || !window.THREE) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 500);
  camera.position.set(0, 0, 7);

  /* ── Lights ── */
  scene.add(new THREE.AmbientLight(0x0a0f2e, 2));
  const moonLight = new THREE.PointLight(0xffd080, 3, 60);
  moonLight.position.set(5, 4, 0);
  scene.add(moonLight);
  const techLight = new THREE.PointLight(0x00d4ff, 1.5, 30);
  techLight.position.set(-3, 0, 2);
  scene.add(techLight);

  /* ── Stars ── */
  const starCount = 9000;
  const starPos   = new Float32Array(starCount * 3);
  const starOpac  = new Float32Array(starCount);
  for (let i = 0; i < starCount; i++) {
    const r = 80 + Math.random() * 120;
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);
    starPos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
    starPos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
    starPos[i*3+2] = r * Math.cos(phi);
    starOpac[i] = 0.3 + Math.random() * 0.7;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.18,
    transparent: true,
    opacity: 0.75,
    sizeAttenuation: true
  });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  /* ── Foreground floating particles ── */
  const fgCount = 180;
  const fgPos   = new Float32Array(fgCount * 3);
  for (let i = 0; i < fgCount; i++) {
    fgPos[i*3]   = (Math.random() - 0.5) * 24;
    fgPos[i*3+1] = (Math.random() - 0.5) * 14;
    fgPos[i*3+2] = (Math.random() - 0.5) * 8;
  }
  const fgGeo = new THREE.BufferGeometry();
  fgGeo.setAttribute('position', new THREE.BufferAttribute(fgPos, 3));
  const fgMat = new THREE.PointsMaterial({
    color: 0x00d4ff,
    size: 0.06,
    transparent: true,
    opacity: 0.5,
    sizeAttenuation: true
  });
  const fgParticles = new THREE.Points(fgGeo, fgMat);
  scene.add(fgParticles);

  /* ── Moon ── */
  function buildMoon() {
    const g = new THREE.Group();

    const core = new THREE.Mesh(
      new THREE.SphereGeometry(1.7, 64, 64),
      new THREE.MeshPhongMaterial({
        color: 0xfff8e1,
        emissive: 0xffcc55,
        emissiveIntensity: 0.18,
        shininess: 25,
        specular: 0xffeebb
      })
    );
    g.add(core);

    const glows = [
      { r: 1.95, c: 0xffd060, o: 0.14 },
      { r: 2.25, c: 0xff9030, o: 0.07 },
      { r: 2.70, c: 0xff6010, o: 0.035 }
    ];
    glows.forEach(({ r, c, o }) => {
      g.add(new THREE.Mesh(
        new THREE.SphereGeometry(r, 32, 32),
        new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, side: THREE.BackSide })
      ));
    });

    g.position.set(4.5, 2.8, -4);
    return g;
  }
  const moon = buildMoon();
  scene.add(moon);

  /* ── Tech wireframe sphere ── */
  function buildTechSphere() {
    const g = new THREE.Group();

    g.add(new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.3, 1),
      new THREE.MeshPhongMaterial({
        color: 0x00d4ff, emissive: 0x004466,
        wireframe: true, transparent: true, opacity: 0.55
      })
    ));
    g.add(new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.0, 2),
      new THREE.MeshPhongMaterial({
        color: 0x7c3aed, emissive: 0x1a0040,
        wireframe: true, transparent: true, opacity: 0.28
      })
    ));
    g.add(new THREE.Mesh(
      new THREE.SphereGeometry(0.72, 32, 32),
      new THREE.MeshPhongMaterial({
        color: 0x001833,
        emissive: 0x002244,
        transparent: true, opacity: 0.6
      })
    ));

    g.position.set(-2.2, -0.2, 0);
    return g;
  }
  const techSphere = buildTechSphere();
  scene.add(techSphere);

  /* ── Orbiting ring around tech sphere ── */
  const ringGeo = new THREE.TorusGeometry(1.8, 0.008, 8, 80);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x00d4ff, transparent: true, opacity: 0.25
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 3;
  ring.position.copy(techSphere.position);
  scene.add(ring);

  /* ── Floating circuit fragments ── */
  const fragments = [];
  for (let i = 0; i < 8; i++) {
    const geo = new THREE.BoxGeometry(
      0.04 + Math.random() * 0.08,
      0.04 + Math.random() * 0.08,
      0.02
    );
    const mat = new THREE.MeshBasicMaterial({
      color: Math.random() > 0.5 ? 0x00d4ff : 0x7c3aed,
      transparent: true, opacity: 0.4 + Math.random() * 0.3
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 6,
      (Math.random() - 0.5) * 3
    );
    mesh.userData.speed = { x: (Math.random()-0.5)*0.003, y: (Math.random()-0.5)*0.003, rot: (Math.random()-0.5)*0.012 };
    scene.add(mesh);
    fragments.push(mesh);
  }

  /* ── Mouse parallax ── */
  let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
  document.addEventListener('mousemove', (e) => {
    targetX = (e.clientX / window.innerWidth  - 0.5) * 1.6;
    targetY = (e.clientY / window.innerHeight - 0.5) * 1.0;
  });

  /* ── Scroll (unused — canvas is fixed) ── */
  const scrollRatio = 0;

  /* ── Animate ── */
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    stars.rotation.y = t * 0.012;

    techSphere.rotation.y = t * 0.45;
    techSphere.rotation.x = t * 0.28;

    ring.rotation.z = t * 0.3;
    ring.rotation.y = t * 0.15;

    const pulse = 1 + Math.sin(t * 0.7) * 0.018;
    moon.scale.setScalar(pulse);
    moonLight.intensity = 3 + Math.sin(t * 0.4) * 0.5;

    fgParticles.rotation.y = t * 0.04;
    fgParticles.rotation.x = t * 0.02;

    fragments.forEach(f => {
      f.position.x += f.userData.speed.x;
      f.position.y += f.userData.speed.y;
      f.rotation.z  += f.userData.speed.rot;
      if (Math.abs(f.position.x) > 6) f.userData.speed.x *= -1;
      if (Math.abs(f.position.y) > 4) f.userData.speed.y *= -1;
    });

    currentX += (targetX - currentX) * 0.04;
    currentY += (targetY - currentY) * 0.04;
    camera.position.x = currentX * 0.6;
    camera.position.y = -currentY * 0.4;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }
  animate();

  /* ── Resize ── */
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();

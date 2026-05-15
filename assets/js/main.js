/* ══════════════════════════════════════════════════════
   Nathan Wong Shih Hao — Portfolio v9 — Main Script
   ══════════════════════════════════════════════════════ */

/* ─────────── wait for sections to be loaded ─────────── */
document.addEventListener('sections-loaded', function mainInit() {

/* ─────────── particle dot grid (signature effect) ─────────── */
(function () {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

  let W = 0, H = 0;
  let mouse = { x: -9999, y: -9999, active: false };
  let scrollY = window.scrollY || 0;
  let dots = [];
  let ripples = [];
  const isMobile = window.innerWidth < 720 || 'ontouchstart' in window;

  function spacing() {
    if (window.innerWidth < 500) return 56;
    if (window.innerWidth < 900) return 48;
    return 40;
  }

  function resize() {
    W = canvas.clientWidth = window.innerWidth;
    H = canvas.clientHeight = window.innerHeight;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildDots();
  }

  function buildDots() {
    dots = [];
    const sp = spacing();
    const cols = Math.ceil(W / sp) + 2;
    const rows = Math.ceil(H / sp) + 2;
    const offX = (W - (cols - 1) * sp) / 2;
    const offY = (H - (rows - 1) * sp) / 2;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const bx = offX + c * sp;
        const by = offY + r * sp;
        dots.push({
          bx: bx, by: by,
          x: bx, y: by,
          vx: 0, vy: 0,
          phase: Math.random() * Math.PI * 2,
          col: c, row: r
        });
      }
    }
  }

  function onMove(e) {
    let cx, cy;
    if (e.touches && e.touches.length) {
      cx = e.touches[0].clientX; cy = e.touches[0].clientY;
    } else {
      cx = e.clientX; cy = e.clientY;
    }
    mouse.x = cx; mouse.y = cy; mouse.active = true;
    if (Math.random() < 0.08) {
      ripples.push({ x: cx, y: cy, r: 0, life: 1 });
      if (ripples.length > 12) ripples.shift();
    }
    const g = document.getElementById('cursorGlow');
    if (g && cy < window.innerHeight) {
      g.style.left = cx + 'px';
      g.style.top = cy + 'px';
      g.style.opacity = '1';
    }
  }
  function onLeave() {
    mouse.active = false;
    mouse.x = -9999; mouse.y = -9999;
    const g = document.getElementById('cursorGlow');
    if (g) g.style.opacity = '0';
  }

  function tick(t) {
    if (document.hidden) { requestAnimationFrame(tick); return; }
    ctx.clearRect(0, 0, W, H);

    const time = t * 0.001;
    const scrollPhase = scrollY * 0.005;
    const repelRadius = 140;
    const repelStrength = 38;

    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i];
      r.r += 4;
      r.life -= 0.025;
      if (r.life <= 0) ripples.splice(i, 1);
    }

    for (let i = 0; i < dots.length; i++) {
      const d = dots[i];
      const breathe = reduced ? 0 : Math.sin(time * 0.6 + d.phase) * 1.2;
      const wave = reduced ? 0 : Math.sin((d.by * 0.008) + scrollPhase) * 4
                              + Math.cos((d.bx * 0.006) - scrollPhase * 0.7) * 3;

      let tx = d.bx + breathe;
      let ty = d.by + wave;

      let dispMag = 0;
      let nearMouse = 0;
      if (!isMobile && !reduced && mouse.active) {
        const dx = d.x - mouse.x;
        const dy = d.y - mouse.y;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < repelRadius * repelRadius) {
          const dist = Math.sqrt(dist2) || 0.0001;
          const force = (1 - dist / repelRadius);
          nearMouse = force;
          tx += (dx / dist) * force * repelStrength;
          ty += (dy / dist) * force * repelStrength;
        }
      }

      if (!reduced) {
        for (let k = 0; k < ripples.length; k++) {
          const rp = ripples[k];
          const dx = d.x - rp.x;
          const dy = d.y - rp.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.0001;
          const band = Math.abs(dist - rp.r);
          if (band < 30) {
            const force = (1 - band / 30) * rp.life * 14;
            tx += (dx / dist) * force;
            ty += (dy / dist) * force;
          }
        }
      }

      if (reduced) {
        d.x = d.bx; d.y = d.by;
        dispMag = 0;
      } else {
        const k = 0.10;
        const damping = 0.78;
        d.vx = (d.vx + (tx - d.x) * k) * damping;
        d.vy = (d.vy + (ty - d.y) * k) * damping;
        d.x += d.vx;
        d.y += d.vy;
        const ddx = d.x - d.bx, ddy = d.y - d.by;
        dispMag = Math.sqrt(ddx * ddx + ddy * ddy);
      }

      const baseR = 1.0;
      const r = baseR + Math.min(dispMag * 0.05, 2.2);

      let alpha = 0.32 + Math.min(dispMag * 0.012, 0.4);
      if (nearMouse > 0) {
        const r1 = Math.round(245 - nearMouse * 45);
        const g1 = Math.round(200 - nearMouse * 80);
        const b1 = Math.round(156 - nearMouse * 110);
        ctx.fillStyle = 'rgba(' + r1 + ',' + g1 + ',' + b1 + ',' + (0.55 + nearMouse * 0.35) + ')';
      } else {
        ctx.fillStyle = 'rgba(200,117,51,' + alpha + ')';
      }
      ctx.beginPath();
      ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(tick);
  }

  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });
  if (!isMobile) {
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseout', onLeave);
  }
  requestAnimationFrame(tick);
})();

/* ─────────── scroll progress bar ─────────── */
(function () {
  const bar = document.getElementById('scrollBar');
  if (!bar) return;
  function update() {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    bar.style.width = pct + '%';
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* ─────────── terminal ─────────── */
const CMDS = {
  help: [
    '// available commands',
    '  about      who am i',
    '  work       selected projects',
    '  skills     toolkit',
    '  exp        experience',
    '  contact    get in touch',
    '  cv         download my cv',
    '  clear      clear terminal',
  ],
  about: [
    '// Nathan Wong Shih Hao',
    '  role     = "CS undergrad, HKUST"',
    '  current  = "R&D Software Intern, Hitachi Rail"',
    '  based    = "Hong Kong"',
    '  speaks   = ["English", "Bahasa Indonesia", "中文"]',
    '',
    '↓ scroll to read the full introduction',
  ],
  work: [
    '// selected projects',
    '  01  snp500-forecasting/   ARIMA · SARIMA · LightGBM · LSTM',
    '  02  ocr-summariser/       OCR → NLP pipeline',
    '  03  project-naia/         FYP · Kafka · ClickHouse · K8s',
    '  04  this-site/            HTML · CSS · no frameworks',
    '  05  morning-digest/       Python · OAuth 2.0 · Gmail · PDF',
    '  06  llm-router/           Python · React · TypeScript · Docker',
    '',
    '↓ scroll to Projects for full details',
  ],
  skills: [
    '// toolkit',
    '  langs  Python SQL C++ C# Java JavaScript Bash',
    '  stack  Git Docker Kafka Spark ClickHouse',
    '         Jenkins K8s AWS-EC2',
    '',
    '↓ scroll to Skills for more',
  ],
  exp: [
    '// experience',
    '  2026-    Capgemini HK          Technology Consultant',
    '  2025-26  Hitachi Rail GTS      R&D Software Intern',
    '  2024     Total Rehab Mgmt      Software Developer',
    '  2023-    HKUST SEA Assoc.      President',
    '  2022-23  ICMS                  Internal Affairs Director',
    '',
    '↓ scroll to Experience for full details',
  ],
  contact: [
    '// get in touch',
    '  email    nwshao@connect.ust.hk',
    '  github   github.com/nathanwong052003',
    '  linkedin /in/nathan-wong-shih-hao',
    '',
    '↓ scroll to Contact to send a message',
  ],
  cv: ['// opening cv...', '  → Nathan_Wong_CV.pdf'],
  ls: ['about/  work/  skills/  exp/  gallery/  contact/'],
  pwd: ['/home/nathan/nwsh'],
  whoami: ['nathan wong shih hao'],
  date: [new Date().toISOString().split('T')[0]],
};

const termBody = document.getElementById('termBody');
const termInput = document.getElementById('termInput');

function addLine(text, cls = '') {
  const d = document.createElement('div');
  d.className = 'term-line' + (cls ? ' ' + cls : '');
  d.textContent = text;
  termBody.appendChild(d);
}

function addPromptLine(cmd) {
  const d = document.createElement('div');
  d.className = 'term-prompt-row';
  d.innerHTML =
    '<span class="t-prompt">nathan@nwsh</span>' +
    '<span class="t-sym">:</span>' +
    '<span class="t-path">~</span>' +
    '<span class="t-sym">$ </span>' +
    '<span class="t-cmd">' + escHtml(cmd) + '</span>';
  termBody.appendChild(d);
}

function escHtml(s) {
  return s.replace(/&/g,'&').replace(/</g,'<').replace(/>/g,'>');
}

function runCmd(raw) {
  const cmd = raw.trim().toLowerCase();
  if (!cmd) return;
  if (cmd === 'clear') {
    termBody.innerHTML = '';
    return;
  }
  addPromptLine(cmd);
  const out = CMDS[cmd];
  if (out) {
    out.forEach(l => addLine(l, l.startsWith('//') ? 't-comment' : ''));
    if (cmd === 'cv') {
      const a = document.createElement('a');
      a.href = 'documents/Nathan_Wong_CV.pdf'; a.download = 'Nathan_Wong_CV.pdf'; a.click();
    }
    if (cmd === 'contact') {
      setTimeout(() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' }), 600);
    }
  } else {
    addLine('command not found: ' + cmd + ' — try "help"', 't-comment');
  }
  addLine('');
  termBody.scrollTop = termBody.scrollHeight;
}

termInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') { runCmd(termInput.value); termInput.value = ''; }
});
document.querySelectorAll('.term-key').forEach(btn => {
  btn.addEventListener('click', () => {
    termInput.focus();
    runCmd(btn.dataset.cmd);
  });
});
document.getElementById('termWindow').addEventListener('click', () => termInput.focus());

(function welcome() {
  const seq = [
    { cmd: 'whoami', delay: 500 },
    { cmd: 'help', delay: 900 },
  ];
  seq.forEach(({ cmd, delay }) => setTimeout(() => runCmd(cmd), delay));
})();

/* ─────────── mobile nav ─────────── */
document.getElementById('menuBtn').addEventListener('click', () => {
  document.getElementById('mobileNav').classList.toggle('open');
});
document.querySelectorAll('#mobileNav a').forEach(a => {
  a.addEventListener('click', () => document.getElementById('mobileNav').classList.remove('open'));
});

/* ─────────── scroll reveal ─────────── */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); }});
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

/* ─────────── active nav ─────────── */
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('section[id]');
const navObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
    }
  });
}, { threshold: 0.35 });
sections.forEach(s => navObs.observe(s));

/* ─────────── responsive experience cols ─────────── */
function checkExpCols() {
  const el = document.getElementById('expCols');
  if (!el) return;
  el.style.gridTemplateColumns = window.innerWidth < 760 ? '1fr' : '1fr 1fr';
}
checkExpCols();
window.addEventListener('resize', checkExpCols);

/* ─────────── lightbox ─────────── */
const lb = document.getElementById('lightbox');
const lbImg = document.getElementById('lightbox-img');
const lbSvg = document.getElementById('lightbox-svg');
const lbCap = document.getElementById('lightbox-cap');
const lbPrev = document.getElementById('lightbox-prev');
const lbNext = document.getElementById('lightbox-next');
const galleryItems = document.querySelectorAll('.gallery-item');
let currentIdx = -1;

function openLb(idx) {
  if (idx < 0 || idx >= galleryItems.length) return;
  currentIdx = idx;
  const item = galleryItems[idx];
  lbImg.src = item.dataset.full || item.querySelector('img').src;
  lbCap.textContent = item.dataset.cap || '';
  lbPrev.style.display = '';
  lbNext.style.display = '';
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function prevLb() {
  const idx = currentIdx <= 0 ? galleryItems.length - 1 : currentIdx - 1;
  openLb(idx);
}
function nextLb() {
  const idx = currentIdx >= galleryItems.length - 1 ? 0 : currentIdx + 1;
  openLb(idx);
}
function closeLb() {
  lb.classList.remove('open');
  document.body.style.overflow = '';
  currentIdx = -1;
  lbSvg.innerHTML = '';
  lbSvg.style.display = '';
  lbImg.style.display = '';
}

galleryItems.forEach((item, i) => {
  item.addEventListener('click', () => openLb(i));
});

document.getElementById('fypPoster').addEventListener('click', () => {
  const img = document.querySelector('#fypPoster img');
  lbImg.src = img.src;
  lbCap.textContent = 'Project NAIA — FYP Poster';
  lbPrev.style.display = 'none';
  lbNext.style.display = 'none';
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
  currentIdx = -1;
});

document.getElementById('naiaDiagram').addEventListener('click', () => {
  const clone = document.querySelector('#naiaDiagram svg').cloneNode(true);
  lbSvg.innerHTML = '';
  lbSvg.appendChild(clone);
  lbImg.style.display = 'none';
  lbSvg.style.display = 'block';
  lbCap.textContent = 'NAIA — System Architecture';
  lbPrev.style.display = 'none';
  lbNext.style.display = 'none';
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
  currentIdx = -1;
});

document.getElementById('lightbox-close').addEventListener('click', closeLb);
lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
lbPrev.addEventListener('click', e => { e.stopPropagation(); prevLb(); });
lbNext.addEventListener('click', e => { e.stopPropagation(); nextLb(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLb();
  if (e.key === 'ArrowLeft' && lb.classList.contains('open')) prevLb();
  if (e.key === 'ArrowRight' && lb.classList.contains('open')) nextLb();
});

/* ─────────── UPGRADE 2 — stat counters ─────────── */
(function() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.stat-num').forEach(el => {
      el.textContent = el.dataset.target + (el.dataset.suffix || '');
    });
    return;
  }
  const counters = document.querySelectorAll('.stat-num');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = +el.dataset.target;
      const suffix = el.dataset.suffix || '';
      const duration = 1200;
      const start = performance.now();
      function step(now) {
        const p = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(ease * target) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => obs.observe(c));
})();

/* ─────────── UPGRADE 4 — 3D tilt on project items ─────────── */
(function() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const items = document.querySelectorAll('.project-item');
  items.forEach(item => {
    const thumbWrap = item.querySelector('.proj-thumb-wrap');
    if (thumbWrap) {
      const shine = document.createElement('div');
      shine.className = 'proj-tilt-shine';
      thumbWrap.appendChild(shine);
    }

    item.addEventListener('mousemove', (e) => {
      const rect = item.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      const maxRot = 6;
      item.style.transform = `perspective(900px) rotateY(${dx * maxRot}deg) rotateX(${-dy * maxRot}deg) scale3d(1.015,1.015,1.015)`;
      if (thumbWrap) {
        const shine = thumbWrap.querySelector('.proj-tilt-shine');
        if (shine) {
          const shineX = ((e.clientX - rect.left) / rect.width) * 100;
          const shineY = ((e.clientY - rect.top) / rect.height) * 100;
          shine.style.background = `radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255,255,255,0.22), rgba(255,255,255,0) 55%)`;
          shine.style.opacity = '1';
        }
      }
    });

    item.addEventListener('mouseleave', () => {
      item.style.transform = '';
      const shine = item.querySelector('.proj-tilt-shine');
      if (shine) shine.style.opacity = '0';
    });
  });
})();

/* ══════════════════════════════════════════════════════
   GAMES PLAYGROUND
   ══════════════════════════════════════════════════════ */
(function () {
'use strict';

/* ── TAB SWITCHING ── */
const gameTabs = document.querySelectorAll('.game-tab');
const gamePanels = document.querySelectorAll('.game-panel');

gameTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;
    gameTabs.forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    gamePanels.forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    const panel = document.getElementById('panel-' + target);
    if (panel) panel.classList.add('active');
  });
});


/* ══════════════════════════════════════════════════════
   GAME 1 — SNAKE PIPELINE
   ══════════════════════════════════════════════════════ */
(function SnakePipeline() {
  const canvas = document.getElementById('snake-canvas');
  const ctx    = canvas.getContext('2d');
  const ASPECT = 5 / 3; // width / height
  let COLS, ROWS, CELL;

  function resizeCanvas() {
    const wrap = canvas.parentElement;
    const w    = wrap.clientWidth;
    const h    = Math.round(w / ASPECT);
    canvas.width  = w;
    canvas.height = h;
    // Aim for CELL ≈ 20px
    CELL  = Math.floor(w / 30);
    COLS  = Math.floor(w / CELL);
    ROWS  = Math.floor(h / CELL);
    if (typeof snake !== 'undefined') drawFrame();
  }

  const scoreEl  = document.getElementById('snake-score');
  const lengthEl = document.getElementById('snake-length');
  const overlay  = document.getElementById('snake-overlay');
  const oTitle   = document.getElementById('snake-overlay-title');
  const oSub     = document.getElementById('snake-overlay-sub');
  const btnStart = document.getElementById('snake-start');
  const btnPause = document.getElementById('snake-pause');
  const btnRestart = document.getElementById('snake-restart');

  let snake, dir, nextDir, food, score, running, paused, tickTimer, tickSpeed;

  function initGame() {
    snake = [
      { x: 15, y: 9 },
      { x: 14, y: 9 },
      { x: 13, y: 9 },
    ];
    dir      = { x: 1, y: 0 };
    nextDir  = { x: 1, y: 0 };
    score    = 0;
    tickSpeed = 130;
    running  = false;
    paused   = false;
    spawnFood();
    updateHUD();
    drawFrame();
  }

  function spawnFood() {
    let pos;
    do {
      pos = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
    } while (snake.some(s => s.x === pos.x && s.y === pos.y));
    food = pos;
  }

  function updateHUD() {
    scoreEl.textContent  = score + ' MB/s';
    lengthEl.textContent = snake.length;
  }

  function startGame() {
    initGame();
    overlay.style.display = 'none';
    running = true;
    paused  = false;
    btnStart.disabled = true;
    btnPause.disabled = false;
    btnPause.textContent = 'pause()';
    scheduleTick();
  }

  function scheduleTick() {
    clearTimeout(tickTimer);
    if (running && !paused) {
      tickTimer = setTimeout(() => {
        tick();
        scheduleTick();
      }, tickSpeed);
    }
  }

  function tick() {
    dir = { ...nextDir };
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
      gameOver(); return;
    }
    for (let i = 0; i < snake.length - 1; i++) {
      if (snake[i].x === head.x && snake[i].y === head.y) { gameOver(); return; }
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      score += 5;
      if (score % 25 === 0) {
        tickSpeed = Math.max(60, tickSpeed - 8);
      }
      spawnFood();
    } else {
      snake.pop();
    }

    updateHUD();
    drawFrame();
  }

  function gameOver() {
    running = false;
    clearTimeout(tickTimer);
    oTitle.textContent = 'Pipeline crashed!';
    oSub.textContent   = 'Throughput: ' + score + ' MB/s';
    overlay.style.display = 'flex';
    btnStart.disabled = false;
    btnPause.disabled = true;
  }

  function togglePause() {
    if (!running) return;
    paused = !paused;
    btnPause.textContent = paused ? 'resume()' : 'pause()';
    if (!paused) scheduleTick();
  }

  function drawFrame() {
    ctx.fillStyle = '#1a0f08';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(200,117,51,0.08)';
    ctx.lineWidth   = 0.5;
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath(); ctx.moveTo(x * CELL, 0); ctx.lineTo(x * CELL, canvas.height); ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath(); ctx.moveTo(0, y * CELL); ctx.lineTo(canvas.width, y * CELL); ctx.stroke();
    }

    ctx.save();
    ctx.shadowColor  = '#f5c89c';
    ctx.shadowBlur   = 10;
    ctx.fillStyle    = '#c87533';
    ctx.beginPath();
    ctx.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, CELL * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const len = snake.length;
    snake.forEach((seg, i) => {
      const t = len > 1 ? i / (len - 1) : 0;
      const r = Math.round(200 + (138 - 200) * t);
      const g = Math.round(117 + (58  - 117) * t);
      const b = Math.round(51  + (26  -  51) * t);
      ctx.fillStyle = `rgb(${r},${g},${b})`;

      const isHead  = i === 0;
      const inset   = isHead ? 1 : 2;
      const radius  = isHead ? 5 : 3;
      const x = seg.x * CELL + inset;
      const y = seg.y * CELL + inset;
      const w = CELL - inset * 2;
      const h = CELL - inset * 2;

      ctx.beginPath();
      ctx.roundRect(x, y, w, h, radius);
      ctx.fill();

      if (isHead) {
        ctx.fillStyle = 'rgba(245,200,156,0.25)';
        ctx.beginPath();
        ctx.roundRect(x + 2, y + 2, w - 4, 4, 2);
        ctx.fill();
      }
    });
  }

  const KEY_MAP = {
    ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT',
    w: 'UP', s: 'DOWN', a: 'LEFT', d: 'RIGHT',
    W: 'UP', S: 'DOWN', A: 'LEFT', D: 'RIGHT',
  };
  const DIR_MAP = {
    UP:    { x:  0, y: -1 },
    DOWN:  { x:  0, y:  1 },
    LEFT:  { x: -1, y:  0 },
    RIGHT: { x:  1, y:  0 },
  };
  const OPPOSITE = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };

  document.addEventListener('keydown', e => {
    const d = KEY_MAP[e.key];
    if (!d) return;
    if (!running) return;
    const curDir = Object.keys(DIR_MAP).find(k => DIR_MAP[k].x === dir.x && DIR_MAP[k].y === dir.y);
    if (d !== OPPOSITE[curDir]) {
      nextDir = DIR_MAP[d];
    }
    e.preventDefault();
  });

  document.querySelectorAll('.dpad-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const d = btn.dataset.dir;
      if (!running) return;
      const curDir = Object.keys(DIR_MAP).find(k => DIR_MAP[k].x === dir.x && DIR_MAP[k].y === dir.y);
      if (d !== OPPOSITE[curDir]) nextDir = DIR_MAP[d];
    });
  });

  btnStart.addEventListener('click', startGame);
  btnRestart.addEventListener('click', startGame);
  btnPause.addEventListener('click', togglePause);

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  initGame();
  overlay.style.display = 'flex';
  oTitle.textContent = 'pipeline.run()';
  oSub.textContent   = 'press run_pipeline() to start';
})();


/* ══════════════════════════════════════════════════════
   GAME 2 — CONWAY'S GAME OF LIFE
   ══════════════════════════════════════════════════════ */
(function ConwaysLife() {
  const canvas  = document.getElementById('life-canvas');
  const ctx     = canvas.getContext('2d');
  const COLS    = 50;
  const ROWS    = 30;
  const CELL    = 12;

  const genEl   = document.getElementById('life-gen');
  const cellsEl = document.getElementById('life-cells');
  const btnPlay  = document.getElementById('life-play');
  const btnStep  = document.getElementById('life-step');
  const btnClear = document.getElementById('life-clear');
  const btnRandom = document.getElementById('life-random');
  const btnSpeed = document.getElementById('life-speed');

  let grid, gen, running, intervalId;
  let fastMode = true;
  let isMouseDown = false;
  let lastToggled = null;

  function makeGrid() {
    return Array.from({ length: ROWS }, () => new Uint8Array(COLS));
  }

  function initGrid() {
    grid = makeGrid();
    gen  = 0;
    updateHUD();
    drawFrame();
  }

  function randomize() {
    grid = makeGrid();
    gen  = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        grid[r][c] = Math.random() < 0.22 ? 1 : 0;
      }
    }
    updateHUD();
    drawFrame();
  }

  function countLive() {
    let n = 0;
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) n += grid[r][c];
    return n;
  }

  function updateHUD() {
    genEl.textContent   = gen;
    cellsEl.textContent = countLive();
  }

  function step() {
    const next = makeGrid();
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        let neighbors = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = (r + dr + ROWS) % ROWS;
            const nc = (c + dc + COLS) % COLS;
            neighbors += grid[nr][nc];
          }
        }
        const alive = grid[r][c];
        if (alive) {
          next[r][c] = (neighbors === 2 || neighbors === 3) ? 1 : 0;
        } else {
          next[r][c] = neighbors === 3 ? 1 : 0;
        }
      }
    }
    grid = next;
    gen++;
    updateHUD();
    drawFrame();
  }

  function togglePlay() {
    running = !running;
    if (running) {
      btnPlay.textContent = 'pause()';
      intervalId = setInterval(step, fastMode ? 100 : 350);
    } else {
      btnPlay.textContent = 'play()';
      clearInterval(intervalId);
    }
  }

  function stopPlay() {
    running = false;
    btnPlay.textContent = 'play()';
    clearInterval(intervalId);
  }

  btnPlay.addEventListener('click', togglePlay);
  btnStep.addEventListener('click', () => { stopPlay(); step(); });
  btnClear.addEventListener('click', () => { stopPlay(); initGrid(); });
  btnRandom.addEventListener('click', () => { stopPlay(); randomize(); });

  btnSpeed.addEventListener('click', () => {
    fastMode = !fastMode;
    btnSpeed.textContent = fastMode ? 'fast' : 'slow';
    if (running) {
      clearInterval(intervalId);
      intervalId = setInterval(step, fastMode ? 100 : 350);
    }
  });

  function drawFrame() {
    ctx.fillStyle = '#f7eee0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(200,117,51,0.12)';
    ctx.lineWidth   = 0.5;
    for (let c = 0; c <= COLS; c++) {
      ctx.beginPath(); ctx.moveTo(c * CELL, 0); ctx.lineTo(c * CELL, canvas.height); ctx.stroke();
    }
    for (let r = 0; r <= ROWS; r++) {
      ctx.beginPath(); ctx.moveTo(0, r * CELL); ctx.lineTo(canvas.width, r * CELL); ctx.stroke();
    }

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (grid[r][c]) {
          ctx.fillStyle = '#c87533';
          ctx.fillRect(c * CELL + 0.5, r * CELL + 0.5, CELL - 1, CELL - 1);
        }
      }
    }
  }

  function cellFromEvent(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top)  * scaleY;
    const c = Math.floor(x / CELL);
    const r = Math.floor(y / CELL);
    if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return null;
    return { r, c };
  }

  canvas.addEventListener('mousedown', e => {
    isMouseDown = true;
    const cell = cellFromEvent(e);
    if (!cell) return;
    grid[cell.r][cell.c] = grid[cell.r][cell.c] ? 0 : 1;
    lastToggled = { r: cell.r, c: cell.c, val: grid[cell.r][cell.c] };
    updateHUD();
    drawFrame();
  });

  canvas.addEventListener('mousemove', e => {
    if (!isMouseDown) return;
    const cell = cellFromEvent(e);
    if (!cell) return;
    if (lastToggled && cell.r === lastToggled.r && cell.c === lastToggled.c) return;
    grid[cell.r][cell.c] = lastToggled ? lastToggled.val : 1;
    lastToggled = { r: cell.r, c: cell.c, val: grid[cell.r][cell.c] };
    updateHUD();
    drawFrame();
  });

  document.addEventListener('mouseup', () => { isMouseDown = false; lastToggled = null; });

  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    const touch = e.touches[0];
    const cell = cellFromEvent(touch);
    if (!cell) return;
    grid[cell.r][cell.c] = grid[cell.r][cell.c] ? 0 : 1;
    lastToggled = { r: cell.r, c: cell.c, val: grid[cell.r][cell.c] };
    updateHUD(); drawFrame();
  }, { passive: false });

  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    const touch = e.touches[0];
    const cell = cellFromEvent(touch);
    if (!cell) return;
    if (lastToggled && cell.r === lastToggled.r && cell.c === lastToggled.c) return;
    grid[cell.r][cell.c] = lastToggled ? lastToggled.val : 1;
    lastToggled = { r: cell.r, c: cell.c, val: grid[cell.r][cell.c] };
    updateHUD(); drawFrame();
  }, { passive: false });

  canvas.addEventListener('touchend', () => { lastToggled = null; });

  function placePattern(pattern) {
    stopPlay();
    const h = pattern.reduce((m, [r]) => Math.max(m, r), 0) + 1;
    const w = pattern.reduce((m, [, c]) => Math.max(m, c), 0) + 1;
    const originR = Math.floor((ROWS - h) / 2);
    const originC = Math.floor((COLS - w) / 2);
    grid = makeGrid();
    gen  = 0;
    pattern.forEach(([r, c]) => {
      const nr = originR + r;
      const nc = originC + c;
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) grid[nr][nc] = 1;
    });
    updateHUD(); drawFrame();
  }

  const PRESETS = {
    glider: [
      [0,1],[1,2],[2,0],[2,1],[2,2]
    ],
    blinker: [
      [0,0],[0,1],[0,2]
    ],
    pulsar: (function() {
      const cells = [];
      const top = [2,3,4,8,9,10];
      const rows = [0,5,7,12];
      rows.forEach(r => top.forEach(c => { cells.push([r, c]); cells.push([c, r]); }));
      return [...new Set(cells.map(([r,c]) => r+','+c))].map(s => s.split(',').map(Number));
    })(),
    gun: (function() {
      const raw = [
        [0,24],
        [1,22],[1,24],
        [2,12],[2,13],[2,20],[2,21],[2,34],[2,35],
        [3,11],[3,15],[3,20],[3,21],[3,34],[3,35],
        [4,0],[4,1],[4,10],[4,16],[4,20],[4,21],
        [5,0],[5,1],[5,10],[5,14],[5,16],[5,17],[5,22],[5,24],
        [6,10],[6,16],[6,24],
        [7,11],[7,15],
        [8,12],[8,13]
      ];
      return raw;
    })()
  };

  document.querySelectorAll('[data-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
      placePattern(PRESETS[btn.dataset.preset]);
    });
  });

  initGrid();
})();


/* ══════════════════════════════════════════════════════
   GAME 3 — TYPING SPEED TEST
   ══════════════════════════════════════════════════════ */
(function TypingTest() {
  const snippetEl = document.getElementById('type-snippet');
  const inputEl   = document.getElementById('type-input');
  const wpmEl     = document.getElementById('type-wpm');
  const accEl     = document.getElementById('type-acc');
  const timerEl   = document.getElementById('type-timer');
  const resultEl  = document.getElementById('type-result');
  const statsEl   = document.getElementById('type-result-stats');
  const btnReset  = document.getElementById('type-reset');
  const btnNext   = document.getElementById('type-next');

  const SNIPPETS = [
    `df.groupby('station')\n  .agg({'passenger_count': 'sum', 'avg_wait': 'mean'})\n  .sort_values('passenger_count', ascending=False)\n  .reset_index()`,
    `producer = KafkaProducer(\n  bootstrap_servers=['localhost:9092'],\n  value_serializer=lambda v: json.dumps(v).encode('utf-8')\n)`,
    `CREATE TABLE passenger_flow (\n  station_id UInt32,\n  ts DateTime,\n  count UInt64,\n  line String\n) ENGINE = MergeTree()\nORDER BY (station_id, ts);`,
    `model = LGBMRegressor(\n  n_estimators=500,\n  learning_rate=0.05,\n  max_depth=6,\n  num_leaves=31\n)\nmodel.fit(X_train, y_train)`,
    `kubectl apply -f deployment.yaml\nkubectl rollout status deployment/naia\nkubectl get pods -n production`,
  ];

  let currentSnippet = '';
  let currentIndex   = 0;
  let typedChars     = 0;
  let correctChars   = 0;
  let startTime      = null;
  let timerInterval  = null;
  let timeLeft       = 60;
  let finished       = false;
  let usedIndices    = [];

  function pickSnippet() {
    if (usedIndices.length >= SNIPPETS.length) usedIndices = [];
    let idx;
    do { idx = Math.floor(Math.random() * SNIPPETS.length); } while (usedIndices.includes(idx));
    usedIndices.push(idx);
    return idx;
  }

  function initTest() {
    clearInterval(timerInterval);
    currentIndex   = pickSnippet();
    currentSnippet = SNIPPETS[currentIndex];
    typedChars     = 0;
    correctChars   = 0;
    startTime      = null;
    timeLeft       = 60;
    finished       = false;

    inputEl.value = '';
    inputEl.disabled = false;
    resultEl.classList.add('hidden');
    wpmEl.textContent   = '0';
    accEl.textContent   = '100%';
    timerEl.textContent = '60s';

    renderSnippet('');
  }

  function renderSnippet(typed) {
    const chars = currentSnippet.split('');
    let html = '';
    for (let i = 0; i < chars.length; i++) {
      const ch = chars[i];
      const display = ch === '\n' ? '\\u21b5\n' : ch === ' ' ? ' ' : ch;
      if (i < typed.length) {
        if (typed[i] === ch) {
          html += '<span class="t-correct">' + escapeHtml(display) + '</span>';
        } else {
          html += '<span class="t-wrong">' + escapeHtml(display) + '</span>';
        }
      } else if (i === typed.length) {
        html += '<span class="t-cursor">' + escapeHtml(display) + '</span>';
      } else {
        html += '<span>' + escapeHtml(display) + '</span>';
      }
    }
    snippetEl.innerHTML = html;
  }

  function escapeHtml(s) {
    return s.replace(/&/g,'&').replace(/</g,'<').replace(/>/g,'>');
  }

  function calcWPM() {
    if (!startTime) return 0;
    const elapsed = (Date.now() - startTime) / 60000;
    if (elapsed <= 0) return 0;
    return Math.round((correctChars / 5) / elapsed);
  }

  function calcAccuracy(totalTyped, correct) {
    if (totalTyped === 0) return 100;
    return Math.round((correct / totalTyped) * 100);
  }

  function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(() => {
      timeLeft--;
      timerEl.textContent = timeLeft + 's';
      if (timeLeft <= 0) finishTest();
    }, 1000);
  }

  function finishTest() {
    if (finished) return;
    finished = true;
    clearInterval(timerInterval);
    inputEl.disabled = true;

    const wpm = calcWPM();
    const acc = calcAccuracy(typedChars, correctChars);

    wpmEl.textContent = wpm;
    accEl.textContent = acc + '%';
    statsEl.textContent = wpm + ' wpm \u00b7 ' + acc + '% accuracy \u00b7 ' + correctChars + ' correct chars';
    resultEl.classList.remove('hidden');
  }

  inputEl.addEventListener('input', () => {
    if (finished) return;
    const typed = inputEl.value;

    if (!startTime && typed.length > 0) startTimer();

    typedChars   = typed.length;
    correctChars = 0;
    for (let i = 0; i < Math.min(typed.length, currentSnippet.length); i++) {
      if (typed[i] === currentSnippet[i]) correctChars++;
    }

    renderSnippet(typed);

    wpmEl.textContent = calcWPM();
    accEl.textContent = calcAccuracy(typedChars, correctChars) + '%';

    if (typed === currentSnippet) finishTest();
  });

  inputEl.addEventListener('keydown', e => {
    if (e.key === 'Tab') e.preventDefault();
  });

  btnReset.addEventListener('click', initTest);
  btnNext.addEventListener('click', initTest);

  initTest();
})();

})(); // end games IIFE
 
}); // end sections-loaded listener

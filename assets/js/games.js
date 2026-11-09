/* ══════════════════════════════════════════════════════
   Games playground (Snake · Game of Life · Typing test)
   Loaded on demand by main.js when #play is near the viewport.
   ══════════════════════════════════════════════════════ */

(function () {
  "use strict";

  /* ── TAB SWITCHING ── */
  const gameTabs = document.querySelectorAll(".game-tab");
  const gamePanels = document.querySelectorAll(".game-panel");

  gameTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;
      gameTabs.forEach((t) => {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });
      gamePanels.forEach((p) => p.classList.remove("active"));
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
      const panel = document.getElementById("panel-" + target);
      if (panel) panel.classList.add("active");
    });
  });

  /* ══════════════════════════════════════════════════════
   GAME 1 — SNAKE PIPELINE
   ══════════════════════════════════════════════════════ */
  (function SnakePipeline() {
    const canvas = document.getElementById("snake-canvas");
    const ctx = canvas.getContext("2d");
    const ASPECT = 5 / 3; // width / height
    let COLS, ROWS, CELL;

    function resizeCanvas() {
      const wrap = canvas.parentElement;
      const w = wrap.clientWidth;
      const h = Math.round(w / ASPECT);
      canvas.width = w;
      canvas.height = h;
      // Aim for CELL ≈ 20px
      CELL = Math.floor(w / 30);
      COLS = Math.floor(w / CELL);
      ROWS = Math.floor(h / CELL);
      if (typeof snake !== "undefined") {
        if (food && (food.x >= COLS || food.y >= ROWS)) spawnFood();
        drawFrame();
      }
    }

    const scoreEl = document.getElementById("snake-score");
    const lengthEl = document.getElementById("snake-length");
    const overlay = document.getElementById("snake-overlay");
    const oTitle = document.getElementById("snake-overlay-title");
    const oSub = document.getElementById("snake-overlay-sub");
    const btnStart = document.getElementById("snake-start");
    const btnPause = document.getElementById("snake-pause");
    const btnRestart = document.getElementById("snake-restart");

    let snake, dir, nextDir, food, score, running, paused, tickTimer, tickSpeed;
    let inView = false; // snake canvas is on screen (and its tab is showing)

    function visibleNow(el) {
      const r = el.getBoundingClientRect();
      return (
        r.width > 0 &&
        r.height > 0 &&
        r.bottom > 0 &&
        r.top < window.innerHeight
      );
    }

    function initGame() {
      snake = [
        { x: 15, y: 9 },
        { x: 14, y: 9 },
        { x: 13, y: 9 },
      ];
      dir = { x: 1, y: 0 };
      nextDir = { x: 1, y: 0 };
      score = 0;
      tickSpeed = 130;
      running = false;
      paused = false;
      spawnFood();
      updateHUD();
      drawFrame();
    }

    function spawnFood() {
      let pos;
      do {
        pos = {
          x: Math.floor(Math.random() * COLS),
          y: Math.floor(Math.random() * ROWS),
        };
      } while (snake.some((s) => s.x === pos.x && s.y === pos.y));
      food = pos;
    }

    function updateHUD() {
      scoreEl.textContent = score + " MB/s";
      lengthEl.textContent = snake.length;
    }

    function startGame() {
      initGame();
      overlay.style.display = "none";
      running = true;
      paused = false;
      inView = visibleNow(canvas);
      btnStart.disabled = true;
      btnPause.disabled = false;
      btnPause.textContent = "pause()";
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
        gameOver();
        return;
      }
      for (let i = 0; i < snake.length - 1; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
          gameOver();
          return;
        }
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
      oTitle.textContent = "Pipeline crashed!";
      oSub.textContent = "Throughput: " + score + " MB/s";
      overlay.style.display = "flex";
      btnStart.disabled = false;
      btnPause.disabled = true;
    }

    function togglePause() {
      if (!running) return;
      paused = !paused;
      btnPause.textContent = paused ? "resume()" : "pause()";
      if (!paused) scheduleTick();
    }

    // Auto-pause when scrolled away, on another tab, or when the page is backgrounded.
    function autoPause() {
      if (!running || paused) return;
      paused = true;
      clearTimeout(tickTimer);
      btnPause.textContent = "resume()";
    }
    new IntersectionObserver(
      (entries) => {
        inView = entries[entries.length - 1].isIntersecting;
        if (!inView) autoPause();
      },
      { threshold: 0.1 },
    ).observe(canvas);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) autoPause();
    });

    function drawFrame() {
      ctx.fillStyle = "#1a0f08";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "rgba(200,117,51,0.08)";
      ctx.lineWidth = 0.5;
      for (let x = 0; x <= COLS; x++) {
        ctx.beginPath();
        ctx.moveTo(x * CELL, 0);
        ctx.lineTo(x * CELL, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y <= ROWS; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * CELL);
        ctx.lineTo(canvas.width, y * CELL);
        ctx.stroke();
      }

      ctx.save();
      ctx.shadowColor = "#f5c89c";
      ctx.shadowBlur = 10;
      ctx.fillStyle = "#c87533";
      ctx.beginPath();
      ctx.arc(
        food.x * CELL + CELL / 2,
        food.y * CELL + CELL / 2,
        CELL * 0.28,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.restore();

      const len = snake.length;
      snake.forEach((seg, i) => {
        const t = len > 1 ? i / (len - 1) : 0;
        const r = Math.round(200 + (138 - 200) * t);
        const g = Math.round(117 + (58 - 117) * t);
        const b = Math.round(51 + (26 - 51) * t);
        ctx.fillStyle = `rgb(${r},${g},${b})`;

        const isHead = i === 0;
        const inset = isHead ? 1 : 2;
        const radius = isHead ? 5 : 3;
        const x = seg.x * CELL + inset;
        const y = seg.y * CELL + inset;
        const w = CELL - inset * 2;
        const h = CELL - inset * 2;

        ctx.beginPath();
        ctx.roundRect(x, y, w, h, radius);
        ctx.fill();

        if (isHead) {
          ctx.fillStyle = "rgba(245,200,156,0.25)";
          ctx.beginPath();
          ctx.roundRect(x + 2, y + 2, w - 4, 4, 2);
          ctx.fill();
        }
      });
    }

    const KEY_MAP = {
      ArrowUp: "UP",
      ArrowDown: "DOWN",
      ArrowLeft: "LEFT",
      ArrowRight: "RIGHT",
    };
    const DIR_MAP = {
      UP: { x: 0, y: -1 },
      DOWN: { x: 0, y: 1 },
      LEFT: { x: -1, y: 0 },
      RIGHT: { x: 1, y: 0 },
    };
    const OPPOSITE = { UP: "DOWN", DOWN: "UP", LEFT: "RIGHT", RIGHT: "LEFT" };

    document.addEventListener("keydown", (e) => {
      const d = KEY_MAP[e.key];
      if (!d) return;
      if (!running || !inView) return; // never hijack arrows while the game is off-screen
      const t = e.target;
      if (
        t &&
        t.closest &&
        t.closest("input, textarea, select, [contenteditable]")
      )
        return;
      const curDir = Object.keys(DIR_MAP).find(
        (k) => DIR_MAP[k].x === dir.x && DIR_MAP[k].y === dir.y,
      );
      if (d !== OPPOSITE[curDir]) {
        nextDir = DIR_MAP[d];
      }
      e.preventDefault();
    });

    document.querySelectorAll(".dpad-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const d = btn.dataset.dir;
        if (!running) return;
        const curDir = Object.keys(DIR_MAP).find(
          (k) => DIR_MAP[k].x === dir.x && DIR_MAP[k].y === dir.y,
        );
        if (d !== OPPOSITE[curDir]) nextDir = DIR_MAP[d];
      });
    });

    btnStart.addEventListener("click", startGame);
    btnRestart.addEventListener("click", startGame);
    btnPause.addEventListener("click", togglePause);

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    initGame();
    overlay.style.display = "flex";
    oTitle.textContent = "pipeline.run()";
    oSub.textContent = "press run_pipeline() to start";
  })();

  /* ══════════════════════════════════════════════════════
   GAME 2 — CONWAY'S GAME OF LIFE
   ══════════════════════════════════════════════════════ */
  (function ConwaysLife() {
    const canvas = document.getElementById("life-canvas");
    const ctx = canvas.getContext("2d");
    const COLS = 50;
    const ROWS = 30;
    const CELL = 12;

    const genEl = document.getElementById("life-gen");
    const cellsEl = document.getElementById("life-cells");
    const btnPlay = document.getElementById("life-play");
    const btnStep = document.getElementById("life-step");
    const btnClear = document.getElementById("life-clear");
    const btnRandom = document.getElementById("life-random");
    const btnSpeed = document.getElementById("life-speed");

    let grid, back, gen, running, intervalId;
    let suspended = false; // interval paused because the canvas is off-screen
    let lifeInView = false;
    let fastMode = true;
    let isMouseDown = false;
    let lastToggled = null;

    function makeGrid() {
      return Array.from({ length: ROWS }, () => new Uint8Array(COLS));
    }

    function initGrid() {
      grid = makeGrid();
      gen = 0;
      updateHUD();
      drawFrame();
    }

    function randomize() {
      grid = makeGrid();
      gen = 0;
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
      for (let r = 0; r < ROWS; r++)
        for (let c = 0; c < COLS; c++) n += grid[r][c];
      return n;
    }

    function updateHUD() {
      genEl.textContent = gen;
      cellsEl.textContent = countLive();
    }

    function step() {
      const next = back || makeGrid(); // reuse the previous buffer; every cell is overwritten
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
            next[r][c] = neighbors === 2 || neighbors === 3 ? 1 : 0;
          } else {
            next[r][c] = neighbors === 3 ? 1 : 0;
          }
        }
      }
      back = grid;
      grid = next;
      gen++;
      updateHUD();
      drawFrame();
    }

    function togglePlay() {
      suspended = false;
      running = !running;
      if (running) {
        btnPlay.textContent = "pause()";
        intervalId = setInterval(step, fastMode ? 100 : 350);
      } else {
        btnPlay.textContent = "play()";
        clearInterval(intervalId);
      }
    }

    function stopPlay() {
      suspended = false;
      running = false;
      btnPlay.textContent = "play()";
      clearInterval(intervalId);
    }

    btnPlay.addEventListener("click", togglePlay);
    btnStep.addEventListener("click", () => {
      stopPlay();
      step();
    });
    btnClear.addEventListener("click", () => {
      stopPlay();
      initGrid();
    });
    btnRandom.addEventListener("click", () => {
      stopPlay();
      randomize();
    });

    btnSpeed.addEventListener("click", () => {
      fastMode = !fastMode;
      btnSpeed.textContent = fastMode ? "fast" : "slow";
      if (running && !suspended) {
        clearInterval(intervalId);
        intervalId = setInterval(step, fastMode ? 100 : 350);
      }
    });

    function setActive(active) {
      if (!running) return;
      if (!active && !suspended) {
        clearInterval(intervalId);
        suspended = true;
      } else if (active && suspended) {
        suspended = false;
        intervalId = setInterval(step, fastMode ? 100 : 350);
      }
    }
    new IntersectionObserver(
      (entries) => {
        lifeInView = entries[entries.length - 1].isIntersecting;
        setActive(lifeInView && !document.hidden);
      },
      { threshold: 0.1 },
    ).observe(canvas);
    document.addEventListener("visibilitychange", () =>
      setActive(lifeInView && !document.hidden),
    );

    function drawFrame() {
      ctx.fillStyle = "#f7eee0";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "rgba(200,117,51,0.12)";
      ctx.lineWidth = 0.5;
      for (let c = 0; c <= COLS; c++) {
        ctx.beginPath();
        ctx.moveTo(c * CELL, 0);
        ctx.lineTo(c * CELL, canvas.height);
        ctx.stroke();
      }
      for (let r = 0; r <= ROWS; r++) {
        ctx.beginPath();
        ctx.moveTo(0, r * CELL);
        ctx.lineTo(canvas.width, r * CELL);
        ctx.stroke();
      }

      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (grid[r][c]) {
            ctx.fillStyle = "#c87533";
            ctx.fillRect(c * CELL + 0.5, r * CELL + 0.5, CELL - 1, CELL - 1);
          }
        }
      }
    }

    function cellFromEvent(e) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      const c = Math.floor(x / CELL);
      const r = Math.floor(y / CELL);
      if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return null;
      return { r, c };
    }

    canvas.addEventListener("mousedown", (e) => {
      isMouseDown = true;
      const cell = cellFromEvent(e);
      if (!cell) return;
      grid[cell.r][cell.c] = grid[cell.r][cell.c] ? 0 : 1;
      lastToggled = { r: cell.r, c: cell.c, val: grid[cell.r][cell.c] };
      updateHUD();
      drawFrame();
    });

    canvas.addEventListener("mousemove", (e) => {
      if (!isMouseDown) return;
      const cell = cellFromEvent(e);
      if (!cell) return;
      if (lastToggled && cell.r === lastToggled.r && cell.c === lastToggled.c)
        return;
      grid[cell.r][cell.c] = lastToggled ? lastToggled.val : 1;
      lastToggled = { r: cell.r, c: cell.c, val: grid[cell.r][cell.c] };
      updateHUD();
      drawFrame();
    });

    document.addEventListener("mouseup", () => {
      isMouseDown = false;
      lastToggled = null;
    });

    canvas.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const cell = cellFromEvent(touch);
        if (!cell) return;
        grid[cell.r][cell.c] = grid[cell.r][cell.c] ? 0 : 1;
        lastToggled = { r: cell.r, c: cell.c, val: grid[cell.r][cell.c] };
        updateHUD();
        drawFrame();
      },
      { passive: false },
    );

    canvas.addEventListener(
      "touchmove",
      (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const cell = cellFromEvent(touch);
        if (!cell) return;
        if (lastToggled && cell.r === lastToggled.r && cell.c === lastToggled.c)
          return;
        grid[cell.r][cell.c] = lastToggled ? lastToggled.val : 1;
        lastToggled = { r: cell.r, c: cell.c, val: grid[cell.r][cell.c] };
        updateHUD();
        drawFrame();
      },
      { passive: false },
    );

    canvas.addEventListener("touchend", () => {
      lastToggled = null;
    });

    function placePattern(pattern) {
      stopPlay();
      const h = pattern.reduce((m, [r]) => Math.max(m, r), 0) + 1;
      const w = pattern.reduce((m, [, c]) => Math.max(m, c), 0) + 1;
      const originR = Math.floor((ROWS - h) / 2);
      const originC = Math.floor((COLS - w) / 2);
      grid = makeGrid();
      gen = 0;
      pattern.forEach(([r, c]) => {
        const nr = originR + r;
        const nc = originC + c;
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) grid[nr][nc] = 1;
      });
      updateHUD();
      drawFrame();
    }

    const PRESETS = {
      glider: [
        [0, 1],
        [1, 2],
        [2, 0],
        [2, 1],
        [2, 2],
      ],
      blinker: [
        [0, 0],
        [0, 1],
        [0, 2],
      ],
      pulsar: (function () {
        const cells = [];
        const top = [2, 3, 4, 8, 9, 10];
        const rows = [0, 5, 7, 12];
        rows.forEach((r) =>
          top.forEach((c) => {
            cells.push([r, c]);
            cells.push([c, r]);
          }),
        );
        return [...new Set(cells.map(([r, c]) => r + "," + c))].map((s) =>
          s.split(",").map(Number),
        );
      })(),
      gun: (function () {
        const raw = [
          [0, 24],
          [1, 22],
          [1, 24],
          [2, 12],
          [2, 13],
          [2, 20],
          [2, 21],
          [2, 34],
          [2, 35],
          [3, 11],
          [3, 15],
          [3, 20],
          [3, 21],
          [3, 34],
          [3, 35],
          [4, 0],
          [4, 1],
          [4, 10],
          [4, 16],
          [4, 20],
          [4, 21],
          [5, 0],
          [5, 1],
          [5, 10],
          [5, 14],
          [5, 16],
          [5, 17],
          [5, 22],
          [5, 24],
          [6, 10],
          [6, 16],
          [6, 24],
          [7, 11],
          [7, 15],
          [8, 12],
          [8, 13],
        ];
        return raw;
      })(),
    };

    document.querySelectorAll("[data-preset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        placePattern(PRESETS[btn.dataset.preset]);
      });
    });

    initGrid();
  })();

  /* ══════════════════════════════════════════════════════
   GAME 3 — TYPING SPEED TEST
   ══════════════════════════════════════════════════════ */
  (function TypingTest() {
    const snippetEl = document.getElementById("type-snippet");
    const inputEl = document.getElementById("type-input");
    const wpmEl = document.getElementById("type-wpm");
    const accEl = document.getElementById("type-acc");
    const timerEl = document.getElementById("type-timer");
    const resultEl = document.getElementById("type-result");
    const statsEl = document.getElementById("type-result-stats");
    const btnReset = document.getElementById("type-reset");
    const btnNext = document.getElementById("type-next");

    const SNIPPETS = [
      "The quick brown fox jumps over the lazy dog while the sun sets slowly behind the mountains. Birds chirp in the distance as the evening breeze carries the scent of fresh flowers.",
      "Learning to type faster is a skill that improves with practice and dedication. The more you practice typing, the more your fingers will remember the keyboard layout and move with greater speed and accuracy.",
      "Technology has transformed the way we communicate and work together. From smartphones to computers, we now have tools that connect us instantly to people around the world no matter where we are.",
      "The greatest achievements in life often come from the smallest efforts and the most persistent determination. Success requires patience, hard work, and the willingness to learn from mistakes and failures along the way.",
      "Nature has always been a source of inspiration for artists, writers, and thinkers throughout history. Mountains, forests, oceans, and deserts all hold mysteries and beauty that have captivated human imagination for countless generations.",
      "Reading books opens doors to new worlds and ideas that might never have been discovered otherwise. Every page turned is an adventure into someone else's mind and imagination, expanding our understanding of humanity and the universe around us.",
      "The art of conversation is becoming increasingly rare in our digital age where people prefer texting to talking face to face. Yet real human connection requires the warmth and nuance that only spoken words can truly provide.",
      "Education is the most powerful tool we have to change the world and improve lives across communities. Knowledge empowers individuals to make better decisions and contribute meaningfully to society in ways both big and small.",
      "Travel experiences teach us more about the world and ourselves than any book could ever do. Whether exploring distant countries or nearby towns, each journey offers unique perspectives and memories that last a lifetime.",
      "The power of creativity lies in the ability to see connections between seemingly unrelated ideas. Innovation happens when someone combines existing concepts in a new way to create something that has never existed before.",
    ];

    let currentSnippet = "";
    let currentIndex = 0;
    let typedChars = 0;
    let correctChars = 0;
    let startTime = null;
    let timerInterval = null;
    let timeLeft = 60;
    let finished = false;
    let usedIndices = [];

    function pickSnippet() {
      if (usedIndices.length >= SNIPPETS.length) usedIndices = [];
      let idx;
      do {
        idx = Math.floor(Math.random() * SNIPPETS.length);
      } while (usedIndices.includes(idx));
      usedIndices.push(idx);
      return idx;
    }

    function initTest() {
      clearInterval(timerInterval);
      currentIndex = pickSnippet();
      currentSnippet = SNIPPETS[currentIndex];
      typedChars = 0;
      correctChars = 0;
      startTime = null;
      timeLeft = 60;
      finished = false;

      inputEl.value = "";
      inputEl.disabled = false;
      resultEl.classList.add("hidden");
      wpmEl.textContent = "0";
      accEl.textContent = "100%";
      timerEl.textContent = "60s";

      renderSnippet("");
    }

    function renderSnippet(typed) {
      const chars = currentSnippet.split("");
      let html = "";
      for (let i = 0; i < chars.length; i++) {
        const ch = chars[i];
        const display = ch === "\n" ? "\\u21b5\n" : ch === " " ? " " : ch;
        if (i < typed.length) {
          if (typed[i] === ch) {
            html +=
              '<span class="t-correct">' + escapeHtml(display) + "</span>";
          } else {
            html += '<span class="t-wrong">' + escapeHtml(display) + "</span>";
          }
        } else if (i === typed.length) {
          html += '<span class="t-cursor">' + escapeHtml(display) + "</span>";
        } else {
          html += "<span>" + escapeHtml(display) + "</span>";
        }
      }
      snippetEl.innerHTML = html;
    }

    function escapeHtml(s) {
      return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }

    function calcWPM() {
      if (!startTime) return 0;
      const elapsed = (Date.now() - startTime) / 60000;
      if (elapsed <= 0) return 0;
      return Math.round(correctChars / 5 / elapsed);
    }

    function calcAccuracy(totalTyped, correct) {
      if (totalTyped === 0) return 100;
      return Math.round((correct / totalTyped) * 100);
    }

    function startTimer() {
      startTime = Date.now();
      // derive the time from the clock so throttled/background tabs can't drift
      timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        timeLeft = Math.max(0, 60 - elapsed);
        timerEl.textContent = timeLeft + "s";
        if (timeLeft <= 0) finishTest();
      }, 250);
    }

    function finishTest() {
      if (finished) return;
      finished = true;
      clearInterval(timerInterval);
      inputEl.disabled = true;

      const wpm = calcWPM();
      const acc = calcAccuracy(typedChars, correctChars);

      wpmEl.textContent = wpm;
      accEl.textContent = acc + "%";
      statsEl.textContent =
        wpm +
        " wpm \u00b7 " +
        acc +
        "% accuracy \u00b7 " +
        correctChars +
        " correct chars";
      resultEl.classList.remove("hidden");
    }

    inputEl.addEventListener("input", () => {
      if (finished) return;
      const typed = inputEl.value;

      if (!startTime && typed.length > 0) startTimer();

      typedChars = typed.length;
      correctChars = 0;
      for (let i = 0; i < Math.min(typed.length, currentSnippet.length); i++) {
        if (typed[i] === currentSnippet[i]) correctChars++;
      }

      renderSnippet(typed);

      wpmEl.textContent = calcWPM();
      accEl.textContent = calcAccuracy(typedChars, correctChars) + "%";

      if (typed === currentSnippet) finishTest();
    });

    inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Tab") e.preventDefault();
    });

    btnReset.addEventListener("click", initTest);
    btnNext.addEventListener("click", initTest);

    initTest();
  })();
})(); // end games IIFE

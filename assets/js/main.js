/* ══════════════════════════════════════════════════════
   Nathan Wong Shih Hao — Portfolio v9 — Main Script
   ══════════════════════════════════════════════════════ */

(function () {
  function init() {
    document.documentElement.classList.add("ready");
    /* ─────────── dark mode toggle ─────────── */
    (function () {
      const root = document.documentElement;
      const themeToggleDesktop = document.getElementById("themeToggle");
      const themeToggleMobile = document.getElementById("themeToggleMobile");
      const themeIcon = document.getElementById("themeIcon");
      const themeIconMobile = document.getElementById("themeIconMobile");

      // localStorage can throw (private mode, blocked site data) — never let that break the page
      const store = {
        get(key) {
          try {
            return localStorage.getItem(key);
          } catch (e) {
            return null;
          }
        },
        set(key, value) {
          try {
            localStorage.setItem(key, value);
          } catch (e) {}
        },
      };
      const media = window.matchMedia("(prefers-color-scheme: dark)");

      // saved choice wins; otherwise follow the OS (same rule as assets/js/theme-init.js)
      function preferredTheme() {
        const saved = store.get("theme");
        if (saved === "dark" || saved === "light") return saved;
        return media.matches ? "dark" : "light";
      }

      function setTheme(theme, persist) {
        const isDark = theme === "dark";
        if (isDark) {
          root.setAttribute("data-theme", "dark");
          document.body.setAttribute("data-theme", "dark");
          if (themeIcon) themeIcon.textContent = "☽";
          if (themeIconMobile) themeIconMobile.textContent = "☽";
        } else {
          root.removeAttribute("data-theme");
          document.body.removeAttribute("data-theme");
          if (themeIcon) themeIcon.textContent = "☀";
          if (themeIconMobile) themeIconMobile.textContent = "☀";
        }
        if (themeToggleDesktop)
          themeToggleDesktop.setAttribute(
            "aria-checked",
            isDark ? "true" : "false",
          );
        if (themeToggleMobile)
          themeToggleMobile.setAttribute(
            "aria-checked",
            isDark ? "true" : "false",
          );
        if (persist) store.set("theme", theme);
      }

      setTheme(preferredTheme(), false);

      function toggleTheme() {
        const isDark = root.getAttribute("data-theme") === "dark";
        setTheme(isDark ? "light" : "dark", true);
      }

      if (themeToggleDesktop) {
        themeToggleDesktop.addEventListener("click", toggleTheme);
      }
      if (themeToggleMobile) {
        themeToggleMobile.addEventListener("click", toggleTheme);
      }
      // follow OS changes until the visitor makes an explicit choice
      if (media.addEventListener) {
        media.addEventListener("change", () => {
          if (!store.get("theme")) setTheme(preferredTheme(), false);
        });
      }
    })();

    /* ─────────── particle dot grid (signature effect) ─────────── */
    (function () {
      const canvas = document.getElementById("particles");
      if (!canvas) return;
      const ctx = canvas.getContext("2d", { alpha: true });
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const glow = document.getElementById("cursorGlow");
      const TAU = Math.PI * 2;

      let W = 0,
        H = 0;
      const mouse = { x: -9999, y: -9999, active: false };
      let scrollY = window.scrollY || 0;
      let dots = [];
      const ripples = [];
      // phones/tablets (touch, no hover) skip pointer effects; touch laptops keep them
      const touchOnly = window.matchMedia(
        "(hover: none) and (pointer: coarse)",
      ).matches;
      const isMobile = window.innerWidth < 720 || touchOnly;

      // Resting dots only differ by alpha, so they are drawn in a handful of
      // batched paths (one fill per alpha bucket) instead of one fill per dot.
      const ALPHA_MIN = 0.32;
      const ALPHA_SPAN = 0.4;
      const BUCKETS = 12;
      const bucketStyle = [];
      for (let b = 0; b < BUCKETS; b++) {
        const a = ALPHA_MIN + (ALPHA_SPAN * b) / (BUCKETS - 1);
        bucketStyle.push("rgba(200,117,51," + a.toFixed(3) + ")");
      }
      const buckets = bucketStyle.map(() => []);
      const nearDots = [];

      function spacing() {
        if (window.innerWidth < 500) return 56;
        if (window.innerWidth < 900) return 48;
        return 40;
      }

      function resize() {
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = Math.floor(W * dpr);
        canvas.height = Math.floor(H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        buildDots();
        if (reduced) tick(0); // static: draw once per layout, no animation loop
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
              bx: bx,
              by: by,
              x: bx,
              y: by,
              vx: 0,
              vy: 0,
              phase: Math.random() * Math.PI * 2,
              col: c,
              row: r,
            });
          }
        }
      }

      function onMove(e) {
        const cx = e.clientX;
        const cy = e.clientY;
        mouse.x = cx;
        mouse.y = cy;
        mouse.active = true;
        if (Math.random() < 0.08) {
          ripples.push({ x: cx, y: cy, r: 0, life: 1 });
          if (ripples.length > 12) ripples.shift();
        }
        if (glow && cy < window.innerHeight) {
          glow.style.left = cx + "px";
          glow.style.top = cy + "px";
          glow.style.opacity = "1";
        }
      }
      function onLeave() {
        mouse.active = false;
        mouse.x = -9999;
        mouse.y = -9999;
        if (glow) glow.style.opacity = "0";
      }

      function tick(t) {
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

        for (let b = 0; b < BUCKETS; b++) buckets[b].length = 0;
        nearDots.length = 0;

        for (let i = 0; i < dots.length; i++) {
          const d = dots[i];
          const breathe = reduced ? 0 : Math.sin(time * 0.6 + d.phase) * 1.2;
          const wave = reduced
            ? 0
            : Math.sin(d.by * 0.008 + scrollPhase) * 4 +
              Math.cos(d.bx * 0.006 - scrollPhase * 0.7) * 3;

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
              const force = 1 - dist / repelRadius;
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
            d.x = d.bx;
            d.y = d.by;
            dispMag = 0;
          } else {
            const k = 0.1;
            const damping = 0.78;
            d.vx = (d.vx + (tx - d.x) * k) * damping;
            d.vy = (d.vy + (ty - d.y) * k) * damping;
            d.x += d.vx;
            d.y += d.vy;
            const ddx = d.x - d.bx,
              ddy = d.y - d.by;
            dispMag = Math.sqrt(ddx * ddx + ddy * ddy);
          }

          const baseR = 1.0;
          const r = baseR + Math.min(dispMag * 0.05, 2.2);

          if (nearMouse > 0) {
            nearDots.push(d.x, d.y, r, nearMouse);
          } else {
            const alpha = ALPHA_MIN + Math.min(dispMag * 0.012, ALPHA_SPAN);
            const bi = Math.round(
              ((alpha - ALPHA_MIN) / ALPHA_SPAN) * (BUCKETS - 1),
            );
            buckets[bi].push(d.x, d.y, r);
          }
        }

        for (let b = 0; b < BUCKETS; b++) {
          const arr = buckets[b];
          if (!arr.length) continue;
          ctx.fillStyle = bucketStyle[b];
          ctx.beginPath();
          for (let i = 0; i < arr.length; i += 3) {
            ctx.moveTo(arr[i] + arr[i + 2], arr[i + 1]);
            ctx.arc(arr[i], arr[i + 1], arr[i + 2], 0, TAU);
          }
          ctx.fill();
        }
        for (let i = 0; i < nearDots.length; i += 4) {
          const nm = nearDots[i + 3];
          const r1 = Math.round(245 - nm * 45);
          const g1 = Math.round(200 - nm * 80);
          const b1 = Math.round(156 - nm * 110);
          ctx.fillStyle =
            "rgba(" + r1 + "," + g1 + "," + b1 + "," + (0.55 + nm * 0.35) + ")";
          ctx.beginPath();
          ctx.arc(nearDots[i], nearDots[i + 1], nearDots[i + 2], 0, TAU);
          ctx.fill();
        }
      }

      function loop(t) {
        if (!document.hidden) tick(t);
        requestAnimationFrame(loop);
      }

      resize();
      let resizeTimer = 0;
      window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resize, 100);
      });
      window.addEventListener(
        "scroll",
        () => {
          scrollY = window.scrollY;
        },
        { passive: true },
      );
      if (!isMobile) {
        window.addEventListener("mousemove", onMove, { passive: true });
        window.addEventListener("mouseout", onLeave);
      }
      if (!reduced) requestAnimationFrame(loop);
    })();

    /* ─────────── scroll progress bar ─────────── */
    (function () {
      const bar = document.getElementById("scrollBar");
      if (!bar) return;
      function update() {
        const h = document.documentElement;
        const max = h.scrollHeight - h.clientHeight;
        const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
        bar.style.width = pct + "%";
      }
      window.addEventListener("scroll", update, { passive: true });
      update();
    })();

    /* ─────────── terminal ─────────── */
    const CMDS = {
      help: [
        "// available commands",
        "  about      who am i",
        "  work       selected projects",
        "  skills     toolkit",
        "  exp        experience",
        "  contact    get in touch",
        "  cv         download my cv",
        "  clear      clear terminal",
      ],
      about: [
        "// Nathan Wong Shih Hao",
        '  role     = "CS undergrad, HKUST"',
        '  current  = "R&D Software Intern, Hitachi Rail"',
        '  based    = "Hong Kong"',
        '  speaks   = ["English", "Bahasa Indonesia", "中文"]',
        "",
        "↓ scroll to read the full introduction",
      ],
      work: [
        "// selected projects",
        "  01  snp500-forecasting/   ARIMA · SARIMA · LightGBM · LSTM",
        "  02  ocr-summariser/       OCR → NLP pipeline",
        "  03  project-naia/         FYP · Kafka · ClickHouse · K8s",
        "  04  this-site/            HTML · CSS · no frameworks",
        "  05  morning-digest/       Python · OAuth 2.0 · Gmail · PDF",
        "  06  llm-router/           Python · React · TypeScript · Docker",
        "",
        "↓ scroll to Projects for full details",
      ],
      skills: [
        "// toolkit",
        "  langs  Python SQL C++ C# Java JavaScript Bash",
        "  stack  Git Docker Kafka Spark ClickHouse",
        "         Jenkins K8s AWS-EC2",
        "",
        "↓ scroll to Skills for more",
      ],
      exp: [
        "// experience",
        "  2026-    Capgemini HK          Technology Consultant",
        "  2025-26  Hitachi Rail GTS      R&D Software Intern",
        "  2024     Total Rehab Mgmt      Software Developer",
        "  2023-    HKUST SEA Assoc.      President",
        "  2022-23  ICMS                  Internal Affairs Director",
        "",
        "↓ scroll to Experience for full details",
      ],
      contact: [
        "// get in touch",
        "  email    " + ["nwshao", "connect.ust.hk"].join("@"), // not a plain literal: keeps scrapers off the address
        "  github   github.com/nathanwong052003",
        "  linkedin /in/nathan-wong-shih-hao",
        "",
        "↓ scroll to Contact to send a message",
      ],
      cv: ["// opening cv...", "  → Nathan_Wong_CV.pdf"],
      ls: ["about/  work/  skills/  exp/  gallery/  contact/"],
      pwd: ["/home/nathan/nwsh"],
      whoami: ["nathan wong shih hao"],
      date: [new Date().toISOString().split("T")[0]],
    };

    const termBody = document.getElementById("termBody");
    const termInput = document.getElementById("termInput");
    const MAX_TERM_NODES = 500;

    function trimTerm() {
      while (termBody.childElementCount > MAX_TERM_NODES)
        termBody.removeChild(termBody.firstElementChild);
    }

    function addLine(text, cls = "") {
      const d = document.createElement("div");
      d.className = "term-line" + (cls ? " " + cls : "");
      d.textContent = text;
      termBody.appendChild(d);
      trimTerm();
    }

    // Built with textContent (never innerHTML): the command is user-typed text.
    function addPromptLine(cmd) {
      const d = document.createElement("div");
      d.className = "term-prompt-row";
      [
        ["t-prompt", "nathan@nwsh"],
        ["t-sym", ":"],
        ["t-path", "~"],
        ["t-sym", "$\u00a0"],
        ["t-cmd", cmd],
      ].forEach(([cls, text]) => {
        const s = document.createElement("span");
        s.className = cls;
        s.textContent = text;
        d.appendChild(s);
      });
      termBody.appendChild(d);
      trimTerm();
    }

    function runCmd(raw) {
      const cmd = raw.trim().toLowerCase();
      if (!cmd) return;
      if (cmd === "clear") {
        termBody.innerHTML = "";
        return;
      }
      addPromptLine(cmd);
      const out = Object.prototype.hasOwnProperty.call(CMDS, cmd)
        ? CMDS[cmd]
        : null;
      if (out) {
        out.forEach((l) => addLine(l, l.startsWith("//") ? "t-comment" : ""));
        if (cmd === "cv") {
          const a = document.createElement("a");
          a.href = "documents/Nathan_Wong_CV.pdf";
          a.download = "Nathan_Wong_CV.pdf";
          a.click();
        }
        if (cmd === "contact") {
          setTimeout(
            () =>
              document
                .getElementById("contact")
                .scrollIntoView({ behavior: "smooth" }),
            600,
          );
        }
      } else {
        addLine("command not found: " + cmd + ' — try "help"', "t-comment");
      }
      addLine("");
      termBody.scrollTop = termBody.scrollHeight;
    }

    termInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        runCmd(termInput.value);
        termInput.value = "";
      }
    });
    document.querySelectorAll(".term-key").forEach((btn) => {
      btn.addEventListener("click", () => {
        termInput.focus();
        runCmd(btn.dataset.cmd);
      });
    });
    document
      .getElementById("termWindow")
      .addEventListener("click", () => termInput.focus());

    (function welcome() {
      const seq = [
        { cmd: "whoami", delay: 500 },
        { cmd: "help", delay: 900 },
      ];
      seq.forEach(({ cmd, delay }) => setTimeout(() => runCmd(cmd), delay));
    })();

    /* ─────────── mobile nav ─────────── */
    const menuBtn = document.getElementById("menuBtn");
    const mobileNav = document.getElementById("mobileNav");
    function setMenu(open) {
      mobileNav.classList.toggle("open", open);
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    }
    menuBtn.setAttribute("aria-controls", "mobileNav");
    setMenu(false);
    menuBtn.addEventListener("click", () =>
      setMenu(!mobileNav.classList.contains("open")),
    );
    document.querySelectorAll("#mobileNav a").forEach((a) => {
      a.addEventListener("click", () => setMenu(false));
    });

    /* ─────────── scroll reveal ─────────── */
    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            revealObs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );
    document.querySelectorAll(".reveal").forEach((el) => revealObs.observe(el));

    /* ─────────── active nav ─────────── */
    const navLinks = document.querySelectorAll(".nav-links a");
    const sections = document.querySelectorAll("section[id]");
    const navObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            navLinks.forEach((a) =>
              a.classList.toggle(
                "active",
                a.getAttribute("href") === "#" + e.target.id,
              ),
            );
          }
        });
      },
      { threshold: 0.35 },
    );
    sections.forEach((s) => navObs.observe(s));

    /* ─────────── responsive experience cols ─────────── */
    function checkExpCols() {
      const el = document.getElementById("expCols");
      if (!el) return;
      el.style.gridTemplateColumns =
        window.innerWidth < 760 ? "1fr" : "1fr 1fr";
    }
    checkExpCols();
    window.addEventListener("resize", checkExpCols);

    /* ─────────── lightbox ─────────── */
    const lb = document.getElementById("lightbox");
    const lbImg = document.getElementById("lightbox-img");
    const lbSvg = document.getElementById("lightbox-svg");
    const lbCap = document.getElementById("lightbox-cap");
    const lbPrev = document.getElementById("lightbox-prev");
    const lbNext = document.getElementById("lightbox-next");
    const lbClose = document.getElementById("lightbox-close");
    const galleryItems = document.querySelectorAll(".gallery-item");
    let currentIdx = -1;
    let lastFocus = null;

    const lbIsOpen = () => lb.classList.contains("open");

    // Mark the lightbox as open. Focus moves in once (not on every prev/next),
    // and the opener is remembered so focus can return to it on close.
    function showLb() {
      if (!lbIsOpen()) {
        lastFocus = document.activeElement;
        lb.classList.add("open");
        lbClose.focus({ preventScroll: true });
      }
      document.body.style.overflow = "hidden";
    }

    // Elements that open the lightbox are plain divs: make them real buttons.
    function makeButton(el, label) {
      el.setAttribute("role", "button");
      el.setAttribute("tabindex", "0");
      el.setAttribute("aria-label", label);
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          el.click();
        }
      });
    }

    function openLb(idx) {
      if (idx < 0 || idx >= galleryItems.length) return;
      currentIdx = idx;
      const item = galleryItems[idx];
      const thumb = item.querySelector("img").src;
      const full = item.dataset.full || thumb;

      lbImg.src = thumb;
      lbImg.style.filter = "blur(3px)";
      lbImg.style.transition = "filter 0.2s";
      const fullImg = new Image();
      fullImg.onload = () => {
        if (currentIdx === idx) {
          lbImg.src = full;
          lbImg.style.filter = "";
        }
      };
      fullImg.src = full;

      lbCap.textContent = item.dataset.cap || "";
      lbPrev.style.display = "";
      lbNext.style.display = "";
      showLb();
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
      const wasOpen = lbIsOpen();
      lb.classList.remove("open");
      document.body.style.overflow = "";
      currentIdx = -1;
      lbSvg.innerHTML = "";
      lbSvg.style.display = "";
      lbImg.style.display = "";
      if (wasOpen && lastFocus && document.contains(lastFocus)) {
        lastFocus.focus({ preventScroll: true });
      }
      lastFocus = null;
    }

    galleryItems.forEach((item, i) => {
      const label =
        "View photo: " +
        (item.dataset.cap ||
          item.querySelector("img").alt ||
          "photo " + (i + 1));
      makeButton(item, label);
      let preloaded = false;
      item.addEventListener("mouseenter", () => {
        if (!preloaded) {
          preloaded = true;
          const img = new Image();
          img.src = item.dataset.full || item.querySelector("img").src;
        }
      });
      item.addEventListener("click", () => openLb(i));
    });

    const fypPoster = document.getElementById("fypPoster");
    makeButton(fypPoster, "View the Project NAIA poster full size");
    fypPoster.addEventListener("click", () => {
      const img = document.querySelector("#fypPoster img");
      lbImg.src = img.src;
      lbCap.textContent = "Project NAIA — FYP Poster";
      lbPrev.style.display = "none";
      lbNext.style.display = "none";
      showLb();
      currentIdx = -1;
    });

    // Home-server diagrams: same full-size treatment as the FYP poster.
    [
      ["labArch", "View the home server architecture diagram full size"],
      ["labTraffic", "View the home server traffic diagram full size"],
    ].forEach(([id, label]) => {
      const fig = document.getElementById(id);
      if (!fig) return;
      makeButton(fig, label);
      fig.addEventListener("click", () => {
        lbImg.src = fig.querySelector("img").src;
        lbCap.textContent = fig.dataset.cap || "";
        lbPrev.style.display = "none";
        lbNext.style.display = "none";
        showLb();
        currentIdx = -1;
      });
    });

    // Cloned SVG would duplicate every id in the page (invalid, and ambiguous
    // for <mpath href="#…">). Prefix the clone's ids and rewrite references.
    function uniquifyIds(root, prefix) {
      const ids = new Set();
      root.querySelectorAll("[id]").forEach((el) => ids.add(el.id));
      if (root.id) ids.add(root.id);
      const fix = (v) =>
        v.replace(/#([A-Za-z_][\w.:-]*)/g, (m, id) =>
          ids.has(id) ? "#" + prefix + id : m,
        );
      [root, ...root.querySelectorAll("*")].forEach((el) => {
        if (el.id && ids.has(el.id)) el.id = prefix + el.id;
        for (const attr of Array.from(el.attributes)) {
          if (attr.name !== "id" && attr.value.includes("#")) {
            const nv = fix(attr.value);
            if (nv !== attr.value) attr.value = nv;
          }
        }
      });
    }

    const naiaDiagram = document.getElementById("naiaDiagram");
    makeButton(
      naiaDiagram,
      "View the NAIA system architecture diagram full size",
    );
    naiaDiagram.addEventListener("click", () => {
      const clone = document.querySelector("#naiaDiagram svg").cloneNode(true);
      uniquifyIds(clone, "lb-");
      lbSvg.innerHTML = "";
      lbSvg.appendChild(clone);
      lbImg.style.display = "none";
      lbSvg.style.display = "block";
      lbCap.textContent = "NAIA — System Architecture";
      lbPrev.style.display = "none";
      lbNext.style.display = "none";
      showLb();
      currentIdx = -1;
    });

    lbClose.addEventListener("click", closeLb);
    lb.addEventListener("click", (e) => {
      if (e.target === lb) closeLb();
    });
    lbPrev.addEventListener("click", (e) => {
      e.stopPropagation();
      prevLb();
    });
    lbNext.addEventListener("click", (e) => {
      e.stopPropagation();
      nextLb();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeLb();
      if (!lbIsOpen()) return;
      if (e.key === "ArrowLeft") prevLb();
      if (e.key === "ArrowRight") nextLb();
      if (e.key === "Tab") {
        // keep keyboard focus inside the dialog while it is open
        const focusable = [lbClose, lbPrev, lbNext].filter(
          (b) => getComputedStyle(b).display !== "none",
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!lb.contains(document.activeElement)) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });

    /* ─────────── UPGRADE 2 — stat counters ─────────── */
    (function () {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        document.querySelectorAll(".stat-num").forEach((el) => {
          el.textContent = el.dataset.target + (el.dataset.suffix || "");
        });
        return;
      }
      const counters = document.querySelectorAll(".stat-num");
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const target = +el.dataset.target;
            const suffix = el.dataset.suffix || "";
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
        },
        { threshold: 0.5 },
      );
      counters.forEach((c) => obs.observe(c));
    })();

    /* ─────────── UPGRADE 4 — 3D tilt on project items ─────────── */
    (function () {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const items = document.querySelectorAll(".project-item");
      items.forEach((item) => {
        const contentDiv = item.children[1];
        if (!contentDiv) return;

        item.addEventListener("mousemove", (e) => {
          const rect = item.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dx = (e.clientX - cx) / (rect.width / 2);
          const dy = (e.clientY - cy) / (rect.height / 2);
          const maxRot = 6;
          contentDiv.style.transition = "";
          contentDiv.style.transform = `perspective(900px) rotateY(${dx * maxRot}deg) rotateX(${-dy * maxRot}deg) scale3d(1.015,1.015,1.015)`;
        });

        item.addEventListener("mouseleave", () => {
          contentDiv.style.transition = "transform 0.35s ease";
          contentDiv.style.transform = "";
        });
      });
    })();

    /* ─────────── games (separate script, loaded only when #play is near) ─────────── */
    (function () {
      const play = document.getElementById("play");
      let loaded = false;
      function load() {
        if (loaded) return;
        loaded = true;
        const s = document.createElement("script");
        s.src = "assets/js/games.js";
        s.async = true;
        document.body.appendChild(s);
      }
      if (!play || !("IntersectionObserver" in window)) {
        load();
        return;
      }
      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            io.disconnect();
            load();
          }
        },
        { rootMargin: "1200px 0px" },
      );
      io.observe(play);
      // safety net for very fast scrolling / slow networks: load once the page is idle
      window.addEventListener("load", () => {
        setTimeout(() => {
          if ("requestIdleCallback" in window) requestIdleCallback(load);
          else load();
        }, 4000);
      });
    })();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

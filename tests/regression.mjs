// Regression suite for the portfolio.
//
//   node regression.mjs                      # test the repo (parent dir of tests/)
//   node regression.mjs --root <dir>         # test another copy (e.g. a pre-change baseline)
//   node regression.mjs --baseline           # treat "fix" tests as expected-to-fail
//   node regression.mjs --only terminal      # run tests whose name contains the string
//
// Test kinds:
//   regression  existing behaviour that MUST keep working (always required to pass)
//   fix         behaviour introduced by the security/perf/a11y pass
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { serve, openPage, waitReady, scrollThrough } from "./lib.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : undefined);
const ROOT = path.resolve(opt("--root") || path.join(here, ".."));
const BASELINE = flag("--baseline");
const ONLY = opt("--only");

const tests = [];
const T = (name, fn) => tests.push({ kind: "regression", name, fn });
const FIX = (name, fn) => tests.push({ kind: "fix", name, fn });

function eq(a, b, msg) {
  const A = JSON.stringify(a);
  const B = JSON.stringify(b);
  if (A !== B) throw new Error(`${msg || "not equal"}\n    got:      ${A}\n    expected: ${B}`);
}
function ok(cond, msg) {
  if (!cond) throw new Error(msg || "assertion failed");
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let browser, site;
const open = (o) => openPage(browser, site, o);
async function withPage(o, fn) {
  const h = await open(o);
  try {
    return await fn(h);
  } finally {
    await h.context.close();
  }
}
async function ready(o, fn) {
  return withPage(o, async (h) => {
    await waitReady(h.page);
    return fn(h);
  });
}
const lines = (page) =>
  page.$$eval("#termBody .term-line", (els) => els.map((e) => e.textContent));
async function run(page, cmd) {
  await page.fill("#termInput", cmd);
  await page.press("#termInput", "Enter");
}
const center = (page, sel) =>
  page.evaluate(
    (s) => document.querySelector(s).scrollIntoView({ block: "center", behavior: "instant" }),
    sel,
  );
// (exact text match below: games.js sets it unpadded, the raw HTML is padded)
// games.js is loaded lazily once #play is near the viewport: scroll there and wait until it has initialised
async function gotoGames(page) {
  await center(page, ".game-tab");
  await page.waitForFunction(
    () => document.getElementById("snake-overlay-title")?.textContent === "pipeline.run()",
    null,
    { timeout: 8000 },
  );
}
const scrollTop = (page, y = 0) =>
  page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), y);

/* ───────────────────────── page structure ───────────────────────── */

T("loads with no page errors, console errors or 4xx/5xx", async () => {
  await ready({}, async ({ page, log }) => {
    await scrollThrough(page);
    eq(log.pageErrors, [], "page errors");
    eq(log.consoleErrors, [], "console errors");
    eq(log.badResponses, [], "bad responses");
  });
});

T("all sections render in the original order", async () => {
  await ready({}, async ({ page }) => {
    const ids = await page.$$eval("#sections-container > *, body > footer", (els) =>
      els.map((e) => e.id || e.tagName.toLowerCase()),
    );
    // nav, hero, ticker, about, skills, projects, experience, fyp, homelab, gallery(+lightbox), play, contact, footer
    const secIds = await page.$$eval("section[id]", (els) => els.map((e) => e.id));
    eq(secIds, ["hero", "about", "skills", "projects", "experience", "fyp", "homelab", "gallery", "play", "contact"]);
    ok(await page.$("nav#nav"), "nav missing");
    ok(await page.$(".ticker-wrap"), "ticker missing");
    ok(await page.$("footer"), "footer missing");
    ok(await page.$("#lightbox"), "lightbox missing");
    ok(ids.length > 0);
  });
});

T("section text content is intact (word counts)", async () => {
  await ready({}, async ({ page }) => {
    const words = await page.$$eval("section[id]", (els) =>
      Object.fromEntries(els.map((e) => [e.id, e.textContent.split(/\s+/).filter(Boolean).length])),
    );
    // sanity floors from the original content
    ok(words.about > 60, "about too short: " + words.about);
    ok(words.projects > 200, "projects too short: " + words.projects);
    ok(words.fyp > 150, "fyp too short: " + words.fyp);
    ok(words.experience > 100, "experience too short: " + words.experience);
    ok(words.play > 40, "play too short: " + words.play);
  });
});

T("every in-page #link resolves to an element", async () => {
  await ready({}, async ({ page }) => {
    const bad = await page.$$eval('a[href^="#"]', (as) =>
      as.map((a) => a.getAttribute("href")).filter((h) => h.length > 1 && !document.querySelector(h)),
    );
    eq(bad, []);
  });
});

T("external links use rel=noopener", async () => {
  await ready({}, async ({ page }) => {
    const bad = await page.$$eval('a[target="_blank"]', (as) =>
      as.filter((a) => !/noopener/.test(a.rel)).map((a) => a.href),
    );
    eq(bad, []);
  });
});

T("CV download link serves a PDF", async () => {
  await ready({}, async ({ page }) => {
    const href = await page.$eval('a[download][href$=".pdf"]', (a) => a.href);
    const r = await page.request.get(href);
    eq(r.status(), 200);
    eq((await r.body()).slice(0, 4).toString(), "%PDF");
  });
});

T("all images load (no broken <img>) after scrolling through the page", async () => {
  await ready({}, async ({ page }) => {
    await scrollThrough(page);
    await sleep(800);
    const broken = await page.$$eval("img", (imgs) =>
      imgs
        .filter((i) => i.id !== "lightbox-img")
        .filter((i) => !(i.complete && i.naturalWidth > 0))
        .map((i) => i.currentSrc || i.src),
    );
    eq(broken, []);
  });
});

/* ───────────────────────── theme ───────────────────────── */

T("theme toggle: dark/light, aria, icon, persistence", async () => {
  await ready({}, async ({ page }) => {
    eq(await page.getAttribute("#themeToggle", "aria-checked"), "false");
    await page.click("#themeToggle");
    eq(await page.evaluate(() => document.documentElement.getAttribute("data-theme")), "dark");
    eq(await page.evaluate(() => document.body.getAttribute("data-theme")), "dark");
    eq(await page.getAttribute("#themeToggle", "aria-checked"), "true");
    eq(await page.textContent("#themeIcon"), "☽");
    eq(await page.evaluate(() => localStorage.getItem("theme")), "dark");
    await page.reload();
    await waitReady(page);
    eq(await page.evaluate(() => document.documentElement.getAttribute("data-theme")), "dark");
    eq(await page.getAttribute("#themeToggle", "aria-checked"), "true");
    await page.click("#themeToggle");
    eq(await page.evaluate(() => document.documentElement.getAttribute("data-theme")), null);
    eq(await page.evaluate(() => document.body.getAttribute("data-theme")), null);
    eq(await page.textContent("#themeIcon"), "☀");
    eq(await page.evaluate(() => localStorage.getItem("theme")), "light");
  });
});

T("theme toggle works on the mobile nav", async () => {
  await ready({ viewport: { width: 390, height: 800 } }, async ({ page }) => {
    await page.click("#menuBtn");
    await page.click("#themeToggleMobile");
    eq(await page.evaluate(() => document.documentElement.getAttribute("data-theme")), "dark");
    eq(await page.getAttribute("#themeToggleMobile", "aria-checked"), "true");
    eq(await page.getAttribute("#themeToggle", "aria-checked"), "true");
  });
});

/* ───────────────────────── terminal ───────────────────────── */

const EXPECT = {
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
    "  email    nwshao@connect.ust.hk",
    "  github   github.com/nathanwong052003",
    "  linkedin /in/nathan-wong-shih-hao",
    "",
    "↓ scroll to Contact to send a message",
  ],
  ls: ["about/  work/  skills/  exp/  gallery/  contact/"],
  pwd: ["/home/nathan/nwsh"],
  whoami: ["nathan wong shih hao"],
};

T("terminal: welcome sequence runs whoami then help", async () => {
  await ready({}, async ({ page }) => {
    const l = await lines(page);
    const i = l.indexOf("nathan wong shih hao"); // static "# welcome" hint lines precede it
    ok(i >= 0, "whoami output missing");
    eq(l.slice(i, i + 2), ["nathan wong shih hao", ""]);
    eq(l.slice(i + 2, i + 2 + EXPECT.help.length), EXPECT.help);
  });
});

for (const [cmd, expected] of Object.entries(EXPECT)) {
  T(`terminal: "${cmd}" output is unchanged`, async () => {
    await ready({}, async ({ page }) => {
      await run(page, "clear");
      await run(page, cmd);
      eq((await lines(page)).slice(0, expected.length), expected);
      eq(await page.$$eval("#termBody .t-cmd", (e) => e.map((x) => x.textContent)), [cmd]);
    });
  });
}

T("terminal: date, unknown command, case-insensitivity, clear", async () => {
  await ready({}, async ({ page }) => {
    await run(page, "clear");
    eq(await page.$$eval("#termBody > *", (e) => e.length), 0);
    await run(page, "date");
    ok(/^\d{4}-\d{2}-\d{2}$/.test((await lines(page))[0]));
    await run(page, "  HELP ");
    ok((await lines(page)).includes("// available commands"));
    await run(page, "foobar");
    ok((await lines(page)).includes('command not found: foobar — try "help"'));
    await run(page, "");
    await run(page, "clear");
    eq(await page.$$eval("#termBody > *", (e) => e.length), 0);
  });
});

T("terminal: hint buttons run their command", async () => {
  await ready({}, async ({ page }) => {
    await page.click('.term-key[data-cmd="clear"]');
    await page.click('.term-key[data-cmd="skills"]');
    eq((await lines(page)).slice(0, 2), EXPECT.skills.slice(0, 2));
    await page.click('.term-key[data-cmd="work"]');
    ok((await lines(page)).includes("// selected projects"));
  });
});

T("terminal: 'cv' triggers the CV download", async () => {
  await ready({}, async ({ page }) => {
    const [dl] = await Promise.all([page.waitForEvent("download"), run(page, "cv")]);
    eq(dl.suggestedFilename(), "Nathan_Wong_CV.pdf");
  });
});

T("terminal: 'contact' scrolls to the contact section", async () => {
  await ready({}, async ({ page }) => {
    await run(page, "contact");
    await page.waitForFunction(
      () => document.getElementById("contact").getBoundingClientRect().top < 400,
      null,
      { timeout: 4000 },
    );
  });
});

FIX("terminal: HTML typed into the prompt is rendered as text, not executed", async () => {
  await ready({}, async ({ page }) => {
    await run(page, "clear");
    await run(page, '<img src=x onerror="window.__xss=1">');
    await sleep(300);
    eq(await page.evaluate(() => window.__xss), undefined, "XSS executed");
    eq(await page.$$eval("#termBody img", (e) => e.length), 0, "injected <img> exists");
    const cmdText = await page.$eval("#termBody .t-cmd", (e) => e.textContent);
    eq(cmdText, '<img src=x onerror="window.__xss=1">');
  });
});

/* ───────────────────────── nav / scroll behaviours ───────────────────────── */

T("mobile menu opens/closes and closes on link click", async () => {
  await ready({ viewport: { width: 390, height: 800 } }, async ({ page }) => {
    const open = () => page.$eval("#mobileNav", (e) => e.classList.contains("open"));
    eq(await open(), false);
    await page.click("#menuBtn");
    eq(await open(), true);
    await page.click('#mobileNav a[href="#about"]');
    eq(await open(), false);
    await page.click("#menuBtn");
    await page.click("#menuBtn");
    eq(await open(), false);
  });
});

T("scroll reveal marks .reveal elements visible", async () => {
  await ready({}, async ({ page }) => {
    await scrollThrough(page);
    await sleep(300);
    const hidden = await page.$$eval(".reveal:not(.visible)", (e) => e.length);
    eq(hidden, 0);
    ok((await page.$$eval(".reveal", (e) => e.length)) > 10);
  });
});

T("stat counters count up to their targets", async () => {
  await ready({}, async ({ page }) => {
    const n = await page.$$eval(".stat-num", (e) => e.length);
    if (n === 0) return; // counters are not in the current markup; JS must simply not error
    await center(page, ".stat-num");
    await sleep(1800);
    const bad = await page.$$eval(".stat-num", (els) =>
      els
        .filter((e) => e.textContent !== e.dataset.target + (e.dataset.suffix || ""))
        .map((e) => `${e.textContent} != ${e.dataset.target}${e.dataset.suffix || ""}`),
    );
    // only those scrolled into view are asserted: the first one must be done
    const first = await page.$eval(".stat-num", (e) => e.textContent === e.dataset.target + (e.dataset.suffix || ""));
    ok(first, "first counter did not finish; mismatches: " + bad.join(", "));
  });
});

T("scroll progress bar tracks scroll position", async () => {
  await ready({}, async ({ page }) => {
    eq(await page.$eval("#scrollBar", (e) => parseFloat(e.style.width) || 0), 0);
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
    await sleep(200);
    ok((await page.$eval("#scrollBar", (e) => parseFloat(e.style.width))) > 95);
  });
});

T("active nav link follows the section in view", async () => {
  await ready({}, async ({ page }) => {
    await page.evaluate(() => document.getElementById("skills").scrollIntoView({ behavior: "instant" }));
    await page.waitForFunction(
      () => document.querySelector('.nav-links a[href="#skills"]')?.classList.contains("active"),
      null,
      { timeout: 4000 },
    );
    eq(await page.$$eval(".nav-links a.active", (e) => e.length), 1);
  });
});

T("experience columns switch with viewport width", async () => {
  await ready({ viewport: { width: 1280, height: 800 } }, async ({ page }) => {
    eq(await page.$eval("#expCols", (e) => e.style.gridTemplateColumns), "1fr 1fr");
    await page.setViewportSize({ width: 700, height: 800 });
    await sleep(300);
    eq(await page.$eval("#expCols", (e) => e.style.gridTemplateColumns), "1fr");
  });
});

T("particle canvas draws dots; cursor glow follows the mouse", async () => {
  await ready({}, async ({ page }) => {
    await sleep(400);
    const drawn = await page.$eval("#particles", (c) => {
      const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
      let n = 0;
      for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++;
      return n;
    });
    ok(drawn > 500, "canvas looks empty: " + drawn);
    await page.mouse.move(500, 300);
    await page.mouse.move(520, 310);
    eq(await page.$eval("#cursorGlow", (e) => e.style.opacity), "1");
    const size = await page.$eval("#particles", (c) => [c.getBoundingClientRect().width, c.getBoundingClientRect().height]);
    eq(size, [1280, 800]);
  });
});

T("3D tilt applies on project hover", async () => {
  await ready({}, async ({ page }) => {
    await center(page, ".project-item");
    await sleep(500);
    const box = await (await page.$(".project-item")).boundingBox();
    await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.3);
    await page.mouse.move(box.x + box.width * 0.82, box.y + box.height * 0.32);
    const t = await page.$eval(".project-item", (e) => e.children[1].style.transform);
    ok(/perspective\(900px\)/.test(t), "no tilt transform: " + t);
  });
});

/* ───────────────────────── contact form ───────────────────────── */

T("contact form: action, fields and required attributes", async () => {
  await ready({}, async ({ page }) => {
    eq(await page.$eval(".contact-form", (f) => [f.getAttribute("action"), f.method]), [
      "https://formspree.io/f/mrelvaqq",
      "post",
    ]);
    const names = await page.$$eval(".contact-form [name]", (e) => e.map((x) => x.name));
    for (const n of ["name", "email", "message", "_subject"]) ok(names.includes(n), "missing field " + n);
    eq(await page.$eval("#c-email", (e) => e.type), "email");
    eq(await page.$eval("#c-name", (e) => e.required), true);
    eq(await page.$eval("#c-msg", (e) => e.required), true);
  });
});

T("contact form: submits to formspree with the entered data", async () => {
  await ready({}, async ({ page, log }) => {
    await page.fill("#c-name", "Test User");
    await page.fill("#c-email", "t@example.com");
    await page.fill("#c-msg", "hello");
    const posted = page.waitForRequest((r) => r.url().includes("formspree.io"), { timeout: 4000 });
    await page.click(".form-submit");
    const req = await posted;
    eq(req.method(), "POST");
    const body = req.postData() || "";
    const dec = decodeURIComponent(body.replace(/\+/g, " "));
    ok(dec.includes("name=Test User") && dec.includes("message=hello") && dec.includes("email=t@example.com"), "form body missing data: " + dec);
  });
});

FIX("contact form: honeypot field is present, hidden and not tabbable", async () => {
  await ready({}, async ({ page }) => {
    const hp = await page.$eval('.contact-form input[name="_gotcha"]', (e) => ({
      tab: e.tabIndex,
      hidden: getComputedStyle(e.closest(".hp-field") || e).display === "none" ||
        e.getBoundingClientRect().width === 0 ||
        getComputedStyle(e).position === "absolute",
      auto: e.autocomplete,
    }));
    eq(hp.tab, -1);
    ok(hp.hidden, "honeypot is visible");
    eq(hp.auto, "off");
  });
});

/* ───────────────────────── lightbox ───────────────────────── */

T("lightbox: open, next/prev (wraps), keys, escape, backdrop", async () => {
  await ready({}, async ({ page }) => {
    const n = await page.$$eval(".gallery-item", (e) => e.length);
    ok(n >= 9, "gallery items: " + n);
    const caps = await page.$$eval(".gallery-item", (e) => e.map((x) => x.dataset.cap));
    const isOpen = () => page.$eval("#lightbox", (e) => e.classList.contains("open"));
    const cap = () => page.textContent("#lightbox-cap");
    await center(page, ".gallery-item");
    await page.click(".gallery-item >> nth=0");
    eq(await isOpen(), true);
    eq(await cap(), caps[0]);
    eq(await page.evaluate(() => document.body.style.overflow), "hidden");
    await page.click("#lightbox-next");
    eq(await cap(), caps[1]);
    await page.click("#lightbox-prev");
    await page.click("#lightbox-prev");
    eq(await cap(), caps[n - 1], "prev should wrap to last");
    await page.click("#lightbox-next");
    eq(await cap(), caps[0], "next should wrap to first");
    await page.keyboard.press("ArrowRight");
    eq(await cap(), caps[1]);
    await page.keyboard.press("ArrowLeft");
    eq(await cap(), caps[0]);
    await page.keyboard.press("Escape");
    eq(await isOpen(), false);
    eq(await page.evaluate(() => document.body.style.overflow), "");
    await page.click(".gallery-item >> nth=2");
    eq(await isOpen(), true);
    await page.mouse.click(5, 400); // backdrop
    eq(await isOpen(), false);
    await page.click(".gallery-item >> nth=3");
    await page.click("#lightbox-close");
    eq(await isOpen(), false);
  });
});

T("lightbox: loads the full-size image for the opened item", async () => {
  await ready({}, async ({ page }) => {
    await center(page, ".gallery-item");
    const want = await page.$eval(".gallery-item", (e) => new URL(e.dataset.full, location.href).href);
    await page.click(".gallery-item >> nth=0");
    await page.waitForFunction(
      (w) => document.getElementById("lightbox-img").src === w && document.getElementById("lightbox-img").complete,
      want,
      { timeout: 6000 },
    );
  });
});

T("lightbox: FYP poster opens without nav arrows", async () => {
  await ready({}, async ({ page }) => {
    await center(page, "#fypPoster");
    await page.click("#fypPoster");
    ok(await page.$eval("#lightbox", (e) => e.classList.contains("open")));
    eq(await page.textContent("#lightbox-cap"), "Project NAIA — FYP Poster");
    eq(await page.$eval("#lightbox-prev", (e) => e.style.display), "none");
    eq(await page.$eval("#lightbox-next", (e) => e.style.display), "none");
    await page.keyboard.press("Escape");
    ok(!(await page.$eval("#lightbox", (e) => e.classList.contains("open"))));
  });
});

T("lightbox: NAIA diagram opens as SVG and resets on close", async () => {
  await ready({}, async ({ page }) => {
    await center(page, "#naiaDiagram");
    await page.click("#naiaDiagram");
    ok(await page.$eval("#lightbox", (e) => e.classList.contains("open")));
    eq(await page.textContent("#lightbox-cap"), "NAIA — System Architecture");
    eq(await page.$eval("#lightbox-img", (e) => e.style.display), "none");
    eq(await page.$eval("#lightbox-svg", (e) => e.style.display), "block");
    ok((await page.$$eval("#lightbox-svg svg", (e) => e.length)) === 1, "svg clone missing");
    await page.keyboard.press("Escape");
    eq(await page.$eval("#lightbox-svg", (e) => e.innerHTML), "");
    eq(await page.$eval("#lightbox-img", (e) => e.style.display), "");
    // gallery still works afterwards
    await center(page, ".gallery-item");
    await page.click(".gallery-item >> nth=0");
    eq(await page.$eval("#lightbox-prev", (e) => e.style.display), "");
  });
});

FIX("lightbox: the cloned diagram has no duplicate element ids", async () => {
  await ready({}, async ({ page }) => {
    await center(page, "#naiaDiagram");
    await page.click("#naiaDiagram");
    const dups = await page.evaluate(() => {
      const seen = {};
      document.querySelectorAll("[id]").forEach((e) => (seen[e.id] = (seen[e.id] || 0) + 1));
      return Object.entries(seen).filter(([, n]) => n > 1).map(([k]) => k);
    });
    eq(dups, []);
  });
});

FIX("lightbox/gallery: keyboard accessible, dialog semantics, focus trap + restore", async () => {
  await ready({}, async ({ page }) => {
    eq(await page.$eval("#lightbox", (e) => [e.getAttribute("role"), e.getAttribute("aria-modal")]), ["dialog", "true"]);
    const items = await page.$$eval(".gallery-item", (e) =>
      e.map((x) => [x.getAttribute("role"), x.tabIndex, !!x.getAttribute("aria-label")]),
    );
    for (const it of items) eq(it, ["button", 0, true]);
    for (const sel of ["#fypPoster", "#naiaDiagram"]) {
      eq(await page.$eval(sel, (e) => [e.getAttribute("role"), e.tabIndex]), ["button", 0], sel);
    }
    await center(page, ".gallery-item");
    await page.focus(".gallery-item >> nth=1");
    await page.keyboard.press("Enter");
    ok(await page.$eval("#lightbox", (e) => e.classList.contains("open")), "Enter did not open");
    ok(await page.evaluate(() => document.getElementById("lightbox").contains(document.activeElement)), "focus not moved in");
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press("Tab");
      ok(
        await page.evaluate(() => document.getElementById("lightbox").contains(document.activeElement)),
        "focus escaped the lightbox on Tab #" + i,
      );
    }
    await page.keyboard.press("Shift+Tab");
    ok(await page.evaluate(() => document.getElementById("lightbox").contains(document.activeElement)));
    await page.keyboard.press("Escape");
    eq(
      await page.evaluate(() => document.activeElement === document.querySelectorAll(".gallery-item")[1]),
      true,
      "focus not restored to the opener",
    );
    await page.focus("#fypPoster");
    await page.keyboard.press("Space");
    ok(await page.$eval("#lightbox", (e) => e.classList.contains("open")), "Space did not open poster");
  });
});

/* ───────────────────────── games ───────────────────────── */

T("game tabs switch panels", async () => {
  await ready({}, async ({ page }) => {
    await gotoGames(page);
    await center(page, ".game-tab");
    const tabs = await page.$$eval(".game-tab", (e) => e.map((x) => x.dataset.tab));
    eq(tabs.sort(), ["life", "snake", "type"]);
    for (const t of ["life", "type", "snake"]) {
      await page.click(`.game-tab[data-tab="${t}"]`);
      eq(await page.$$eval(".game-panel.active", (e) => e.map((x) => x.id)), ["panel-" + t]);
      eq(await page.getAttribute(`.game-tab[data-tab="${t}"]`, "aria-selected"), "true");
      eq(await page.$$eval('.game-tab[aria-selected="true"]', (e) => e.length), 1);
    }
  });
});

T("snake: idle overlay, start, HUD, pause/resume, crash, restart", async () => {
  await ready({}, async ({ page }) => {
    await gotoGames(page);
    await page.click('.game-tab[data-tab="snake"]');
    await center(page, "#snake-canvas");
    eq(await page.textContent("#snake-overlay-title"), "pipeline.run()");
    eq(await page.$eval("#snake-overlay", (e) => e.style.display), "flex");
    await page.click("#snake-start");
    eq(await page.$eval("#snake-overlay", (e) => e.style.display), "none");
    eq(await page.textContent("#snake-score"), "0 MB/s");
    eq(await page.textContent("#snake-length"), "3");
    eq(await page.$eval("#snake-start", (e) => e.disabled), true);
    await page.click("#snake-pause");
    eq(await page.textContent("#snake-pause"), "resume()");
    await page.click("#snake-pause");
    eq(await page.textContent("#snake-pause"), "pause()");
    await page.waitForFunction(
      () => document.getElementById("snake-overlay-title").textContent === "Pipeline crashed!",
      null,
      { timeout: 8000 },
    );
    eq(await page.$eval("#snake-overlay", (e) => e.style.display), "flex");
    eq(await page.$eval("#snake-start", (e) => e.disabled), false);
    eq(await page.$eval("#snake-pause", (e) => e.disabled), true);
    ok((await page.textContent("#snake-overlay-sub")).startsWith("Throughput: "));
    await page.click("#snake-restart");
    eq(await page.$eval("#snake-overlay", (e) => e.style.display), "none");
    eq(await page.textContent("#snake-length"), "3");
  });
});

T("snake: arrow keys steer the snake and are consumed", async () => {
  await ready({}, async ({ page }) => {
    await gotoGames(page);
    await page.click('.game-tab[data-tab="snake"]');
    await center(page, "#snake-canvas");
    await page.click("#snake-start");
    const prevented = await page.evaluate(() => {
      const e = new KeyboardEvent("keydown", { key: "ArrowUp", cancelable: true, bubbles: true });
      document.dispatchEvent(e);
      return e.defaultPrevented;
    });
    eq(prevented, true, "arrow key should be consumed while a game is running on-screen");
    // Heading up from y=9 hits the north wall after ~10 ticks (~1.3s); unsteered it would
    // hit the east wall after ~15 ticks (~1.95s). So at 1.7s it must already have crashed.
    await sleep(1700);
    eq(await page.textContent("#snake-overlay-title"), "Pipeline crashed!", "ArrowUp did not steer the snake");
  });
});

T("snake: d-pad buttons are wired", async () => {
  await ready({ viewport: { width: 390, height: 800 } }, async ({ page }) => {
    await gotoGames(page);
    await page.click('.game-tab[data-tab="snake"]');
    await center(page, "#snake-canvas");
    await page.click("#snake-start");
    ok((await page.$$eval(".dpad-btn", (e) => e.length)) >= 4);
    await page.click('.dpad-btn[data-dir="UP"]');
    await page.click('.dpad-btn[data-dir="LEFT"]');
    // heading up then left wraps around nothing -> eventually crashes into a wall
    await page.waitForFunction(
      () => document.getElementById("snake-overlay-title").textContent === "Pipeline crashed!",
      null,
      { timeout: 9000 },
    );
  });
});

T("life: presets, step, random, clear, click-to-toggle, play/pause, speed", async () => {
  await ready({}, async ({ page }) => {
    await gotoGames(page);
    await page.click('.game-tab[data-tab="life"]');
    await center(page, "#life-canvas");
    const cells = async () => +(await page.textContent("#life-cells"));
    const gen = async () => +(await page.textContent("#life-gen"));
    eq([await cells(), await gen()], [0, 0]);
    for (const [p, n] of [["glider", 5], ["blinker", 3], ["pulsar", 48], ["gun", 36]]) {
      await page.click(`[data-preset="${p}"]`);
      eq(await cells(), n, p + " cell count");
      eq(await gen(), 0);
    }
    await page.click('[data-preset="blinker"]');
    await page.click("#life-step");
    eq([await cells(), await gen()], [3, 1]);
    await page.click("#life-random");
    ok((await cells()) > 100, "random too sparse");
    await page.click("#life-clear");
    eq(await cells(), 0);
    const box = await (await page.$("#life-canvas")).boundingBox();
    await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.5);
    eq(await cells(), 1);
    await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.5);
    eq(await cells(), 0);
    // drag paints
    await page.mouse.move(box.x + 30, box.y + 30);
    await page.mouse.down();
    await page.mouse.move(box.x + 130, box.y + 30, { steps: 10 });
    await page.mouse.up();
    ok((await cells()) >= 5, "drag should paint several cells");
    await page.click('[data-preset="glider"]');
    await page.click("#life-play");
    eq(await page.textContent("#life-play"), "pause()");
    await sleep(700);
    const g1 = await gen();
    ok(g1 >= 3, "should be running fast: gen=" + g1);
    await page.click("#life-play");
    eq(await page.textContent("#life-play"), "play()");
    const g2 = await gen();
    await sleep(400);
    eq(await gen(), g2, "paused but still stepping");
    eq(await page.textContent("#life-speed"), "fast");
    await page.click("#life-speed");
    eq(await page.textContent("#life-speed"), "slow");
  });
});

T("typing test: render, live stats, finish on exact match, reset, timer", async () => {
  await ready({}, async ({ page }) => {
    await gotoGames(page);
    await page.click('.game-tab[data-tab="type"]');
    await center(page, "#type-input");
    const snippet = await page.textContent("#type-snippet");
    ok(snippet.length > 100);
    eq(await page.textContent("#type-timer"), "60s");
    eq(await page.$eval("#type-result", (e) => e.classList.contains("hidden")), true);
    await page.click("#type-input");
    await page.keyboard.type(snippet.slice(0, 20));
    eq(await page.$$eval("#type-snippet .t-correct", (e) => e.length), 20);
    eq(await page.textContent("#type-acc"), "100%");
    await sleep(2200);
    const t = parseInt(await page.textContent("#type-timer"), 10);
    ok(t <= 58 && t >= 55, "timer should have counted down: " + t);
    ok(+(await page.textContent("#type-wpm")) > 0, "wpm should be > 0");
    await page.keyboard.type("Z");
    eq(await page.$$eval("#type-snippet .t-wrong", (e) => e.length), 1);
    await page.keyboard.press("Backspace");
    await page.keyboard.type(snippet.slice(20));
    eq(await page.$eval("#type-result", (e) => e.classList.contains("hidden")), false);
    ok((await page.textContent("#type-result-stats")).includes("wpm"));
    eq(await page.$eval("#type-input", (e) => e.disabled), true);
    await page.click("#type-reset");
    eq(await page.$eval("#type-result", (e) => e.classList.contains("hidden")), true);
    eq(await page.$eval("#type-input", (e) => e.disabled), false);
    eq(await page.textContent("#type-timer"), "60s");
    eq(await page.textContent("#type-wpm"), "0");
  });
});

FIX("typing test: timer follows wall-clock time (not tick count)", async () => {
  await ready({}, async ({ page }) => {
    await gotoGames(page);
    await page.click('.game-tab[data-tab="type"]');
    await center(page, "#type-input");
    await page.click("#type-input");
    await page.keyboard.type("T");
    // simulate a throttled background tab: stall the event loop for 3.2s
    await page.evaluate(() => {
      const end = performance.now() + 3200;
      while (performance.now() < end);
    });
    await sleep(1300);
    const t = parseInt(await page.textContent("#type-timer"), 10);
    ok(t <= 56, "timer drifted behind wall clock: " + t);
  });
});

FIX("games pause when scrolled off-screen / arrows are not hijacked then", async () => {
  await ready({}, async ({ page }) => {
    await gotoGames(page);
    await page.click('.game-tab[data-tab="snake"]');
    await center(page, "#snake-canvas");
    await page.click("#snake-start");
    await scrollTop(page);
    await sleep(500);
    eq(await page.textContent("#snake-pause"), "resume()", "snake should auto-pause off-screen");
    const prevented = await page.evaluate(() => {
      const e = new KeyboardEvent("keydown", { key: "ArrowDown", cancelable: true, bubbles: true });
      document.dispatchEvent(e);
      return e.defaultPrevented;
    });
    eq(prevented, false, "arrow keys hijacked while game is off-screen");
    // life stops stepping off-screen
    await page.click('.game-tab[data-tab="life"]').catch(() => {});
    await center(page, "#life-canvas");
    await page.click('[data-preset="glider"]');
    await page.click("#life-play");
    await sleep(400);
    await scrollTop(page);
    await sleep(500);
    const g1 = await page.textContent("#life-gen");
    await sleep(700);
    eq(await page.textContent("#life-gen"), g1, "life still stepping off-screen");
  });
});

FIX("typing in the textarea is not interrupted by snake key handling", async () => {
  await ready({}, async ({ page }) => {
    await gotoGames(page);
    await page.click('.game-tab[data-tab="snake"]');
    await center(page, "#snake-canvas");
    await page.click("#snake-start");
    await page.click('.game-tab[data-tab="type"]');
    await center(page, "#type-input");
    await page.focus("#type-input");
    const prevented = await page.evaluate(() => {
      const e = new KeyboardEvent("keydown", { key: "ArrowLeft", cancelable: true, bubbles: true });
      document.getElementById("type-input").dispatchEvent(e);
      return e.defaultPrevented;
    });
    eq(prevented, false);
  });
});

/* ───────────────────────── robustness fixes ───────────────────────── */

FIX("site still initialises when localStorage throws (private mode / blocked)", async () => {
  await ready(
    {
      init: () => {
        Object.defineProperty(window, "localStorage", {
          get() {
            throw new DOMException("blocked", "SecurityError");
          },
        });
      },
    },
    async ({ page, log }) => {
      await run(page, "pwd");
      ok((await lines(page)).includes("/home/nathan/nwsh"));
      await page.click("#themeToggle"); // must not throw
      eq(await page.evaluate(() => document.documentElement.getAttribute("data-theme")), "dark");
      eq(log.pageErrors, []);
    },
  );
});

FIX("theme is applied before first paint (no light flash) and follows OS preference", async () => {
  // stored dark, main.js stubbed out -> head script alone must set the theme
  await withPage(
    {
      blockScripts: ["assets/js/main.js"],
      init: () => localStorage.setItem("theme", "dark"),
    },
    async ({ page }) => {
      eq(await page.evaluate(() => document.documentElement.getAttribute("data-theme")), "dark");
    },
  );
  // no stored choice + OS dark -> dark
  await withPage({ colorScheme: "dark", blockScripts: ["assets/js/main.js"] }, async ({ page }) => {
    eq(await page.evaluate(() => document.documentElement.getAttribute("data-theme")), "dark");
  });
  // explicit stored light wins over OS dark
  await withPage(
    { colorScheme: "dark", blockScripts: ["assets/js/main.js"], init: () => localStorage.setItem("theme", "light") },
    async ({ page }) => {
      eq(await page.evaluate(() => document.documentElement.getAttribute("data-theme")), null);
    },
  );
  // and with the full site: toggle still flips from the OS-derived state
  await ready({ colorScheme: "dark" }, async ({ page }) => {
    eq(await page.getAttribute("#themeToggle", "aria-checked"), "true");
    await page.click("#themeToggle");
    eq(await page.evaluate(() => document.documentElement.getAttribute("data-theme")), null);
    eq(await page.evaluate(() => localStorage.getItem("theme")), "light");
  });
});

FIX("main.js initialises even when it executes before/after sections (no load race)", async () => {
  // The original raced on a one-shot 'sections-loaded' event; now sections are in the HTML.
  const html = await (await fetch(site.url + "/")).text();
  ok(!/sections-loaded/.test(html), "index.html still uses the one-shot event");
  const js = fs.readFileSync(path.join(ROOT, "assets/js/main.js"), "utf8");
  ok(!/sections-loaded/.test(js), "main.js still waits for sections-loaded");
});

/* ───────────────────────── static / SEO / security fixes ───────────────────────── */

FIX("index.html contains the full content without JavaScript", async () => {
  const html = await (await fetch(site.url + "/")).text();
  for (const id of ["hero", "about", "skills", "projects", "experience", "fyp", "homelab", "gallery", "play", "contact"]) {
    ok(new RegExp(`<section[^>]*id="${id}"`).test(html), "missing static section #" + id);
  }
  ok(html.includes("Intelligent SLM/LLM Router"), "project copy missing from static HTML");
});

FIX("index.html build output is in sync with sections/", async () => {
  const { spawnSync } = await import("node:child_process");
  const r = spawnSync("node", [path.join(ROOT, "tools/build.mjs"), "--check"], { encoding: "utf8" });
  ok(r.status === 0 && /in sync/i.test(r.stdout), "build --check failed: " + (r.stdout || "") + (r.stderr || "").split("\n")[0]);
});

FIX("CSP meta tag present; no inline scripts or inline event handlers", async () => {
  const html = await (await fetch(site.url + "/")).text();
  ok(/http-equiv="Content-Security-Policy"/i.test(html), "no CSP meta");
  const csp = html.match(/http-equiv="Content-Security-Policy"\s+content="([^"]+)"/i)?.[1] || "";
  ok(/script-src 'self'(?!.*unsafe-inline)/.test(csp.split(";").find((d) => d.trim().startsWith("script-src")) || ""), "script-src not locked to self: " + csp);
  ok(/object-src 'none'/.test(csp) && /base-uri 'self'/.test(csp) && /form-action 'self' https:\/\/formspree\.io/.test(csp), "csp missing directives: " + csp);
  ok(!/<script(?![^>]*\bsrc=)[^>]*>[^<]/i.test(html.replace(/<script[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/gi, "")), "inline <script> present");
  ok(!/\son[a-z]+\s*=\s*["']/i.test(html), "inline event handler attribute present");
});

FIX("no hot-linking to raw.githubusercontent.com", async () => {
  const files = ["index.html", ...fs.readdirSync(path.join(ROOT, "sections")).map((f) => "sections/" + f), "assets/js/main.js", "assets/css/style.css"];
  const hits = files.filter((f) => fs.readFileSync(path.join(ROOT, f), "utf8").includes("raw.githubusercontent.com"));
  eq(hits, []);
});

FIX("SEO: title, canonical, Open Graph, Twitter, theme-color, sitemap, robots", async () => {
  const html = await (await fetch(site.url + "/")).text();
  ok(/<title>[^<]{15,}<\/title>/.test(html), "weak <title>");
  ok(/<link rel="canonical" href="https:\/\/nathanwongsh\.dev\/"/.test(html), "canonical");
  for (const p of ["og:title", "og:description", "og:image", "og:url", "og:type"]) ok(html.includes(`property="${p}"`), "missing " + p);
  ok(/name="twitter:card"/.test(html), "twitter:card");
  ok(/name="theme-color"/.test(html), "theme-color");
  const ogImg = html.match(/property="og:image"\s+content="https:\/\/nathanwongsh\.dev\/([^"]+)"/)?.[1];
  ok(ogImg && fs.existsSync(path.join(ROOT, ogImg)), "og:image file missing: " + ogImg);
  const sm = fs.readFileSync(path.join(ROOT, "sitemap.xml"), "utf8");
  ok(!sm.includes("#") && sm.includes("https://nathanwongsh.dev/"), "sitemap should list canonical URL without fragments");
  const rb = fs.readFileSync(path.join(ROOT, "robots.txt"), "utf8");
  ok(!/unused/.test(rb) && rb.includes("https://nathanwongsh.dev/sitemap.xml"), "robots.txt");
});

FIX("image payload: gallery thumbs small; initial load light; no unused image files", async () => {
  await withPage({}, async ({ page, log }) => {
    await sleep(500);
    const initialImg = [...log.bytes].filter(([u]) => /\.(jpe?g|png|webp|avif)/.test(u)).reduce((a, [, b]) => a + b, 0);
    ok(initialImg < 700 * 1024, `initial image bytes ${Math.round(initialImg / 1024)}KB (>700KB)`);
  });
  const thumbs = fs.readdirSync(path.join(ROOT, "images/gallery/thumbs"));
  for (const f of thumbs) {
    const s = fs.statSync(path.join(ROOT, "images/gallery/thumbs", f)).size;
    ok(s < 150 * 1024, `thumb ${f} is ${Math.round(s / 1024)}KB`);
  }
  const imgDir = path.join(ROOT, "images");
  const text = ["index.html", ...fs.readdirSync(path.join(ROOT, "sections")).map((f) => "sections/" + f), "assets/css/style.css", "assets/js/main.js", "assets/js/games.js"]
    .filter((f) => fs.existsSync(path.join(ROOT, f)))
    .map((f) => fs.readFileSync(path.join(ROOT, f), "utf8"))
    .join("\n");
  const unused = fs
    .readdirSync(imgDir)
    .filter((f) => fs.statSync(path.join(imgDir, f)).isFile())
    .filter((f) => !text.includes("images/" + f) && !/^favicon/.test(f));
  eq(unused, []);
  const total = fs.readdirSync(imgDir).reduce((a, f) => a + fs.statSync(path.join(imgDir, f)).size, 0);
  ok(total < 2.5 * 1024 * 1024, "top-level images still " + Math.round(total / 1024) + "KB");
});

FIX("every <img> declares width/height; below-the-fold images are lazy+async", async () => {
  await ready({}, async ({ page }) => {
    const bad = await page.$$eval("img", (imgs) =>
      imgs
        .filter((i) => i.id !== "lightbox-img")
        .filter((i) => !i.getAttribute("width") || !i.getAttribute("height") || i.loading !== "lazy" || i.decoding !== "async")
        .map((i) => i.getAttribute("src")),
    );
    eq(bad, []);
  });
});

FIX("games live in a separate lazily-loaded script", async () => {
  const js = fs.readFileSync(path.join(ROOT, "assets/js/main.js"), "utf8");
  ok(!js.includes("SnakePipeline") && !js.includes("TypingTest"), "games still bundled in main.js");
  ok(fs.existsSync(path.join(ROOT, "assets/js/games.js")), "games.js missing");
  await withPage({}, async ({ page, log }) => {
    await sleep(600);
    ok(![...log.bytes.keys()].some((u) => u.endsWith("games.js")), "games.js loaded eagerly at the top of the page");
    await center(page, "#play");
    await sleep(800);
    ok([...log.bytes.keys()].some((u) => u.endsWith("games.js")), "games.js never loaded after scrolling to #play");
  });
});

FIX("games still work when #play is deep-linked (#play in URL)", async () => {
  await withPage({ path: "/#play" }, async ({ page }) => {
    await page.waitForFunction(() => document.querySelectorAll(".game-panel.active").length === 1);
    await page.click('.game-tab[data-tab="life"]');
    eq(await page.$$eval(".game-panel.active", (e) => e.map((x) => x.id)), ["panel-life"]);
  });
});

FIX("no leftover dev files (Guidelines template, backups)", async () => {
  ok(!fs.existsSync(path.join(ROOT, "guidelines")), "guidelines/ still present");
});

/* ───────────────────────── runner ───────────────────────── */

(async () => {
  site = { ...(await serve(ROOT)), root: ROOT };
  browser = await chromium.launch();
  let failed = 0;
  let expectedFail = 0;
  const results = [];
  for (const t of tests) {
    if (ONLY && !t.name.includes(ONLY)) continue;
    const t0 = Date.now();
    try {
      await Promise.race([
        t.fn(),
        new Promise((_, rej) => setTimeout(() => rej(new Error("test timeout (45s)")), 45000)),
      ]);
      results.push({ ...t, pass: true });
      console.log(`  \x1b[32m✓\x1b[0m [${t.kind}] ${t.name} (${Date.now() - t0}ms)`);
    } catch (e) {
      const expected = BASELINE && t.kind === "fix";
      results.push({ ...t, pass: false, err: e.message });
      if (expected) {
        expectedFail++;
        console.log(`  \x1b[33m~\x1b[0m [${t.kind}] ${t.name}  (expected to fail on baseline)`);
      } else {
        failed++;
        console.log(`  \x1b[31m✗\x1b[0m [${t.kind}] ${t.name}\n    ${e.message.split("\n").join("\n    ")}`);
      }
    }
  }
  await browser.close();
  site.srv.close();
  const p = results.filter((r) => r.pass).length;
  console.log(
    `\n${ROOT}\n${p}/${results.length} passed, ${failed} failed${BASELINE ? `, ${expectedFail} fix-tests fail on baseline (expected)` : ""}`,
  );
  process.exit(failed ? 1 : 0);
})();

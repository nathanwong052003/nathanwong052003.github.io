// Visual regression: screenshot every section of a baseline copy and the current repo
// (desktop + mobile, light + dark, reduced-motion for determinism) and pixel-diff them.
//
//   node visual.mjs --baseline /path/to/old/copy [--root /path/to/new] [--max 1.5]
//
// Exit code 1 if any section differs by more than --max percent of its pixels.
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import { serve, openPage, scrollThrough } from "./lib.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d);
const OLD = path.resolve(opt("--baseline"));
const NEW = path.resolve(opt("--root", path.join(here, "..")));
const MAX = parseFloat(opt("--max", "1.5"));
const OUT = path.join(here, ".out");
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const SECTIONS = ["nav", "hero", "about", "skills", "projects", "experience", "fyp", "gallery", "play", "contact", "footer"];
const MODES = [
  { name: "desktop-light", viewport: { width: 1280, height: 900 }, dark: false },
  { name: "desktop-dark", viewport: { width: 1280, height: 900 }, dark: true },
  { name: "mobile-light", viewport: { width: 390, height: 844 }, dark: false },
  { name: "mobile-dark", viewport: { width: 390, height: 844 }, dark: true },
];

async function shoot(browser, root, label) {
  const site = { ...(await serve(root)), root };
  const shots = {};
  for (const m of MODES) {
    const { page, context } = await openPage(browser, site, {
      viewport: m.viewport,
      reducedMotion: "reduce",
      colorScheme: m.dark ? "dark" : "light",
      init: m.dark ? () => localStorage.setItem("theme", "dark") : () => localStorage.setItem("theme", "light"),
    });
    await page.waitForFunction(
      () => document.getElementById("termBody")?.textContent.includes("available commands"),
      null,
      { timeout: 8000 },
    );
    await scrollThrough(page);
    await page.waitForFunction(() => [...document.images].every((i) => i.complete), null, { timeout: 10000 });
    await page.evaluate(async () => {
      await Promise.all([...document.images].map((i) => i.decode().catch(() => {})));
      document.querySelectorAll("*").forEach((e) => {
        // freeze anything that animates for stable pixels
        const s = getComputedStyle(e);
        if (s.animationName !== "none") e.style.animation = "none";
      });
    });
    await new Promise((r) => setTimeout(r, 500));
    for (const id of SECTIONS) {
      const sel = id === "nav" ? "nav#nav" : id === "footer" ? "footer" : "#" + id;
      const el = await page.$(sel);
      if (!el) {
        shots[`${m.name}/${id}`] = null;
        continue;
      }
      // hide the fixed particle canvas + fixed nav so element screenshots are not polluted by them
      await page.addStyleTag({ content: "#particles,#cursorGlow,#scrollBar{display:none!important}" });
      const buf = await el.screenshot({ animations: "disabled" });
      fs.mkdirSync(path.join(OUT, label, m.name), { recursive: true });
      fs.writeFileSync(path.join(OUT, label, m.name, id + ".png"), buf);
      shots[`${m.name}/${id}`] = buf;
    }
    await context.close();
  }
  site.srv.close();
  return shots;
}

(async () => {
  const browser = await chromium.launch();
  const a = await shoot(browser, OLD, "old");
  const b = await shoot(browser, NEW, "new");
  await browser.close();
  let bad = 0;
  console.log(`threshold: ${MAX}% differing pixels per section\n`);
  for (const key of Object.keys(a)) {
    if (!a[key] || !b[key]) {
      console.log(`  ${a[key] ? "✗" : "~"} ${key}: missing in ${a[key] ? "new" : "old"} render`);
      if (a[key]) bad++;
      continue;
    }
    const A = PNG.sync.read(a[key]);
    const B = PNG.sync.read(b[key]);
    if (A.width !== B.width || A.height !== B.height) {
      const dh = B.height - A.height;
      const dw = B.width - A.width;
      console.log(`  ✗ ${key}: size changed ${A.width}x${A.height} -> ${B.width}x${B.height} (Δw ${dw}, Δh ${dh})`);
      bad++;
      continue;
    }
    const diff = new PNG({ width: A.width, height: A.height });
    const n = pixelmatch(A.data, B.data, diff.data, A.width, A.height, { threshold: 0.12 });
    const pct = (n / (A.width * A.height)) * 100;
    const flag = pct > MAX;
    if (flag) {
      bad++;
      fs.mkdirSync(path.join(OUT, "diff", path.dirname(key)), { recursive: true });
      fs.writeFileSync(path.join(OUT, "diff", key + ".png"), PNG.sync.write(diff));
    }
    console.log(`  ${flag ? "✗" : "✓"} ${key}: ${pct.toFixed(3)}%`);
  }
  console.log(`\n${bad ? bad + " section(s) differ" : "all sections visually match"} — screenshots in tests/.out/`);
  process.exit(bad ? 1 : 0);
})();

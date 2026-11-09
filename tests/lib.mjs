// Shared helpers: static server + Playwright page factory with network stubbing.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
  ".xml": "application/xml",
  ".txt": "text/plain",
};

export function serve(root) {
  return new Promise((resolve) => {
    const srv = http.createServer((req, rsp) => {
      let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
      if (p.endsWith("/")) p += "index.html";
      const f = path.join(root, p);
      if (!f.startsWith(root)) {
        rsp.writeHead(403);
        return rsp.end();
      }
      fs.readFile(f, (e, buf) => {
        if (e) {
          rsp.writeHead(404);
          return rsp.end("not found");
        }
        rsp.writeHead(200, {
          "content-type": MIME[path.extname(f).toLowerCase()] || "application/octet-stream",
          "cache-control": "no-store",
        });
        rsp.end(buf);
      });
    });
    srv.listen(0, "127.0.0.1", () =>
      resolve({ srv, url: `http://127.0.0.1:${srv.address().port}` }),
    );
  });
}

const RAW_RE =
  /^https:\/\/raw\.githubusercontent\.com\/nathanwong052003\/nathanwong052003\.github\.io\/main\/(.+)$/;

/**
 * Open a page. External network is stubbed so runs are deterministic/offline:
 *  - raw.githubusercontent.com/<repo>/main/<p>  -> served from the local root
 *  - Google Fonts                               -> empty 200
 *  - formspree.io                               -> recorded, 200
 *  - anything else                              -> aborted (and recorded)
 */
export async function openPage(browser, site, opts = {}) {
  const {
    viewport = { width: 1280, height: 800 },
    reducedMotion = "no-preference",
    colorScheme = "light",
    init, // function or string run before any page script
    path: urlPath = "/",
    blockScripts = [], // substrings of script URLs to stub out as empty
    bypassCSP = false,
  } = opts;
  const context = await browser.newContext({
    viewport,
    reducedMotion,
    colorScheme,
    acceptDownloads: true,
    bypassCSP,
  });
  const log = {
    pageErrors: [],
    consoleErrors: [],
    badResponses: [],
    external: [],
    formPosts: [],
    bytes: new Map(), // url -> bytes (local responses)
  };
  await context.route(
    (u) => !u.href.startsWith(site.url),
    async (route) => {
      const url = route.request().url();
      const m = url.match(RAW_RE);
      if (m) {
        const f = path.join(site.root, decodeURIComponent(m[1].split("?")[0]));
        if (fs.existsSync(f)) {
          return route.fulfill({
            status: 200,
            contentType: MIME[path.extname(f).toLowerCase()] || "application/octet-stream",
            body: fs.readFileSync(f),
          });
        }
        return route.fulfill({ status: 404, body: "nf" });
      }
      if (/fonts\.(googleapis|gstatic)\.com/.test(url)) {
        return route.fulfill({ status: 200, contentType: "text/css", body: "" });
      }
      if (/formspree\.io/.test(url)) {
        log.formPosts.push(url);
        return route.fulfill({ status: 200, contentType: "text/html", body: "ok" });
      }
      log.external.push(url);
      return route.abort();
    },
  );
  for (const sub of blockScripts) {
    await context.route(
      (u) => u.href.includes(sub),
      (route) => route.fulfill({ status: 200, contentType: "text/javascript", body: "" }),
    );
  }
  const page = await context.newPage();
  if (init) await page.addInitScript(init);
  page.on("pageerror", (e) => log.pageErrors.push(String(e)));
  page.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning") {
      const u = m.location()?.url || "";
      // ignore resource errors for stubbed externals
      if (u && !u.startsWith(site.url) && !m.text().includes("Content Security Policy"))
        return;
      log.consoleErrors.push(`[${m.type()}] ${m.text()} ${u}`);
    }
  });
  page.on("response", async (r) => {
    const u = r.url();
    if (!u.startsWith(site.url)) return;
    if (r.status() >= 400) log.badResponses.push(`${r.status()} ${u}`);
    try {
      const b = await r.body();
      log.bytes.set(u, b.length);
    } catch {}
  });
  await page.goto(site.url + urlPath, { waitUntil: "load" });
  return { page, context, log };
}

/** Wait until main.js has initialised (terminal welcome sequence has finished). */
export async function waitReady(page) {
  await page.waitForFunction(
    () => document.getElementById("termBody")?.textContent.includes("available commands"),
    null,
    { timeout: 8000 },
  );
}

export async function scrollThrough(page) {
  await page.evaluate(async () => {
    const h = document.documentElement.scrollHeight;
    for (let y = 0; y <= h; y += 400) {
      window.scrollTo({ top: y, behavior: "instant" });
      await new Promise((r) => setTimeout(r, 90));
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  });
}

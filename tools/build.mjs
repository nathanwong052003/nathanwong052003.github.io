// Inlines sections/NN-*.html into index.html (between the BUILD:SECTIONS markers).
//
//   node tools/build.mjs          write index.html
//   node tools/build.mjs --check  exit 1 if index.html is out of date (used by the tests)
//
// Why: the page used to fetch the 12 sections one after another at runtime, which delayed
// first paint, hid all content from crawlers / link previews / no-JS visitors, and raced
// with main.js. sections/ stays the place you edit; this just bakes them into index.html.
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const indexPath = path.join(root, "index.html");
const check = process.argv.includes("--check");

const files = fs
  .readdirSync(path.join(root, "sections"))
  .filter((f) => /^\d{2}-.+\.html$/.test(f))
  .sort();
if (!files.length) throw new Error("no sections found in sections/");

const sections = files
  .map((f) =>
    fs.readFileSync(path.join(root, "sections", f), "utf8").replace(/\s+$/, ""),
  )
  .join("\n\n");

const START = /<!-- BUILD:SECTIONS:START[^>]*-->/;
const END = "<!-- BUILD:SECTIONS:END -->";
const html = fs.readFileSync(indexPath, "utf8");
const m = html.match(START);
const endAt = html.indexOf(END);
if (!m || endAt < 0)
  throw new Error("BUILD:SECTIONS markers not found in index.html");

let next =
  html.slice(0, m.index + m[0].length) +
  '\n    <div id="sections-container">\n' +
  sections +
  "\n    </div>\n    " +
  html.slice(endAt);

// Stamp every local stylesheet/script reference with a hash of its contents
// (assets/js/main.js -> assets/js/main.js?v=1a2b3c4d). GitHub Pages lets browsers cache
// files for 10 minutes, so without this a visitor can get a new index.html with an old
// main.js/style.css from cache and see a broken page right after a deploy.
next = next.replace(
  /((?:href|src)=")(assets\/(?:css|js)\/[\w.-]+\.(?:css|js))(?:\?v=[0-9a-f]+)?(")/g,
  (_, pre, file, post) => {
    const hash = crypto
      .createHash("sha1")
      .update(fs.readFileSync(path.join(root, file)))
      .digest("hex")
      .slice(0, 8);
    return pre + file + "?v=" + hash + post;
  },
);

if (check) {
  if (next === html) {
    console.log(
      "index.html is in sync with sections/ (" + files.length + " sections)",
    );
  } else {
    console.error("index.html is out of date — run: node tools/build.mjs");
    process.exit(1);
  }
} else if (next === html) {
  console.log("index.html already up to date (" + files.length + " sections)");
} else {
  fs.writeFileSync(indexPath, next);
  console.log("index.html rebuilt from " + files.length + " sections");
}

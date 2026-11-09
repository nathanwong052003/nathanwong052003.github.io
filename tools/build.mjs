// Inlines sections/NN-*.html into index.html (between the BUILD:SECTIONS markers).
//
//   node tools/build.mjs          write index.html
//   node tools/build.mjs --check  exit 1 if index.html is out of date (used by the tests)
//
// Why: the page used to fetch the 12 sections one after another at runtime, which delayed
// first paint, hid all content from crawlers / link previews / no-JS visitors, and raced
// with main.js. sections/ stays the place you edit; this just bakes them into index.html.
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

const next =
  html.slice(0, m.index + m[0].length) +
  '\n    <div id="sections-container">\n' +
  sections +
  "\n    </div>\n    " +
  html.slice(endAt);

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

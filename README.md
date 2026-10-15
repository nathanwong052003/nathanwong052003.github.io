# Nathan Wong — personal site

Static personal site for [nathanwongsh.dev](https://nathanwongsh.dev), served by GitHub Pages. Plain HTML, CSS and JavaScript: no framework, no build step, no dependencies.

## Structure

```
.
├── index.html            # the whole page (nav, hero, work, NAIA, experience, toolkit, contact)
├── assets/css/style.css  # Dusk design; colours are OKLCH custom properties in :root
├── documents/Nathan_Wong_CV.pdf
├── images/               # favicon, OG image, and the older photo/gallery assets
├── CNAME  robots.txt  sitemap.xml
```

## Develop

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Updating content

- Copy and facts live in `index.html`; the CV in `documents/` is the source of truth.
- Design tokens (colour, type, easing) are at the top of `assets/css/style.css`.
- Fonts (Outfit, Geist) load from Google Fonts with `display=swap`; metric-matched fallbacks in the CSS keep layout from shifting.

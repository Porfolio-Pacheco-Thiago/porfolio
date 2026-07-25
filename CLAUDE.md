# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Vite dev server (default http://localhost:5173)
npm run build        # Production build to dist/
npm run preview      # Serve the built dist/ locally
npm run lint         # ESLint (flat config, JS/JSX only) — currently clean
npm run deploy       # Builds, then publishes dist/ to gh-pages
```

Docker alternative for the dev server: `docker-compose up` (mounts the repo, hot-reload, same port 5173). Use the standalone `docker-compose` binary — the `docker compose` plugin subcommand is not installed on this machine. Note it creates a root-owned empty `node_modules/` on the host as a volume mount point, which makes a later host-side `npm install` fail with EACCES; `rmdir node_modules` first.

There are no tests in this project.

## Architecture

Single-page React 19 portfolio built with Vite. No router, no backend, no state library — the whole page is one scrollable stack of sections rendered by `App.jsx`: `Hero` → `Journey` → `Projects` → `Skills`, plus `Navbar`, `Footer`, `Loader`.

`vite.config.js` sets `base: '/porfolio/'` because the site is served from a GitHub Pages project subpath, so the dev URL is `http://localhost:5173/porfolio/` — the bare root 302s. Any absolute asset URL must account for that; prefer importing assets so Vite rewrites the path, or put them in `public/` (which is served at the base root).

### Layout of `src/`

```
components/      one .jsx + matching .css per section
components/ui/   small shared pieces (Logo, SocialLinks, GalleryPlaceholder)
context/         *-context.js = context + hook · *Provider.jsx = the provider
data/            non-translatable metadata, keyed by the same ids as i18n
i18n/            en.json / es.json — translatable strings only
lib/             framework-agnostic helpers
styles/ui.css    cross-section CSS primitives
```

The context split (`theme-context.js` + `ThemeProvider.jsx`) exists to satisfy `react-refresh/only-export-components`, which errors when one file exports both a component and something else. Keep new context code in that shape, and keep constants out of component files for the same reason.

### The two contexts (`main.jsx` wraps everything)

- **Theme** — `dark` / `light`. Initial value: stored preference, else `prefers-color-scheme`, else dark. Persists to `localStorage` under `portfolio-theme` and sets `data-theme` on `<html>`. All colors come from CSS variables in `src/index.css` (`:root` for dark, `[data-theme="light"]` for the overrides). Never hardcode a brand color in component CSS — add a variable to both blocks, or use `color-mix(in srgb, var(--accent) N%, transparent)` for tints.
- **Lang** — `en` / `es`. Initial value: stored preference, else the browser's language, else English. Persists under `portfolio-lang` and keeps `<html lang>` in sync. Exposes `t(path)` for strings and `getList(path)` for arrays — both are the same dot-path lookup, differing only in their fallback (the path itself vs `[]`).

### Content: translatable strings vs structural metadata

This split is the thing to understand before adding content.

- `src/i18n/en.json` and `es.json` hold **only translatable text** and must stay structurally identical: same keys, same array lengths, same item `id`s. Tags *are* translated, so they live here.
- `src/data/*.js` holds everything **not** translatable, keyed by the same `id`, so it is never duplicated across locales:
  - `journey.js` — `sort` (`YYYYMM`, higher = more recent = higher on the page) and `category` (`academic` | `work`, which axis it renders on). Entries with no metadata fall to the bottom of the academic axis.
  - `projects.js` — the react-icons component and the repo URL per project. `repo: '#'` means no public repo yet, and the "View Repository" link is hidden rather than rendered dead.
  - `skills.js`, `socials.js` — proper nouns and profile URLs.

Adding a timeline entry = one object in `journey.items` in **both** JSON files, plus one line in `src/data/journey.js`.

### Journey timeline

`Journey.jsx` reads the single `journey.items` array, merges in `journeyMeta` by `id`, and sorts descending. Every item has the same shape (`title`, `subtitle`, `period`, `desc`, optional `body`/`tags`/`location`), so there is no per-source field mapping.

Three mutually exclusive render modes for the expanded body, in priority order: `clients` → per-client accordions (Lovelytics), `nodes` → static nested list (teaching), otherwise `body` + gallery. `body` is only present in the JSON when it differs from `desc`.

Each axis label toggles its whole track's visibility. Inner buttons must `stopPropagation()` — the outer card `div` has its own click-to-expand handler.

### Reveal animations

`App.jsx` owns a single `IntersectionObserver` that sets `data-revealed="true"` on every `.reveal` / `.reveal-fade` element once loading finishes. It's an attribute rather than a class so React re-renders don't wipe it. Adding a section means adding those classes to its elements — no per-component observer. Stagger is done with inline `transitionDelay`. `prefers-reduced-motion` disables the whole effect in `index.css`.

`Loader` renders until `window.load` fires (plus 500 ms) or a 4 s cap, whichever comes first.

### CSS conventions

One CSS file per component, imported by that component, **except** `src/styles/ui.css` (loaded once from `main.jsx`), which owns the primitives used across sections: `.section-header` / `.section-title` / `.section-subtitle`, `.tag`, `.btn*`, `.social-link`. Put anything shared by two sections there — a section's CSS file must never be the only definition of a class another section uses.

`Projects.jsx` expansion uses the View Transitions API with `flushSync` plus CSS `order` swapping to keep the expanded card and its grid neighbour in the right row. Changing the grid column count means revisiting the `expandedIsRight` index math.

### Media galleries

`GalleryPlaceholder` renders `FiImage` boxes and derives each child's class from its parent (`className` + `-item`), so the CSS for `.timeline-gallery-item` etc. still applies. `src/assets/media/` has a folder per card `id` (`projects/<id>/`, `timeline/<id>/`) documented in `src/assets/media/README.md`; the intended wiring is Vite's `import.meta.glob` over those folders.

## Notes

- Inline code comments are in Spanish; match that when editing existing files.
- `README.md` is still the stock Vite template and describes nothing about this project.
- Placeholder content still to fill in: profile URLs in `src/data/socials.js` (`https://github.com/`, `mailto:thiago@example.com`) and every `repo` in `src/data/projects.js`.
- Remaining page weight is almost entirely the hero: `hero-video-vp8.webm` (1.7 MB, the fallback is heavier than the VP9 it backs up), `hero-video.webm` (1.2 MB) and `hero-poster.png` (711 KB).
- When verifying animations through browser automation, note that a backgrounded tab freezes CSS transitions at `currentTime: 0`, so `getComputedStyle` reports the pre-transition value and expanded content measures as height 0. Call `el.getAnimations().forEach(a => a.finish())` before measuring.

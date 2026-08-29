# Vibe Coded ⚡

> A joyful collection of experiments with AI

**Vibe Coded** is a static, zero-build-step showcase site for small browser
tools, web components, and "stories" — made almost exclusively with AI, guided
by [Pelle Wessman](https://kodfabrik.se/). It's an experiment in *understanding*
the tool — its strengths and its limits — not blindly adopting it.

The site is not shy about it – the tagline says as much.

It is published at **<https://yikesable.github.io/vibe/>** and lives in
this repo as a collection of self-contained HTML pages that share a common
design system, written in vanilla JavaScript, modern CSS, and semantic HTML.

---

## ✨ What's inside

The site is organized into a few sections, each a folder of standalone HTML
pages:

| Section | Folder | What it is |
| --- | --- | --- |
| **Component Explorations** | [`component-explorations/`](./component-explorations) | Deep dives into a single web component, e.g. [`<vp-pie-menu>`](./component-explorations/vp-pie-menu.html) — a radial context menu. |
| **Tools & Utilities** | [`codepen-converter/`](./codepen-converter) | Useful little browser tools, e.g. the [CodePen Converter](./codepen-converter/index.html) — split a single HTML file into its parts for CodePen, with a rich editor. |
| **Reusable Components** | [`components/`](./components) | Drop-in Web Components shared across pages: [`<kinetic-background>`](./components/kinetic-background.js) and [`<code-block>`](./components/code-block.js). |
| **Stories & Slides** | [`stories/`](./stories) · [`slides/`](./slides) | Long-form, narrative pages: [JSDoc Type Safety](./stories/jsdoc-types.html), [Beyond the Word List](./stories/beyond-the-word-list.html), and the [Manifesto for Digital Liberation](./stories/manifesto.html). |

The entry point is [`index.html`](./index.html), a bento-box landing page that
links out to each of the above.

---

## 🎨 Design system

The visual identity is a Y2K-inspired, dark-mode neon aesthetic, defined once in
[`styles/vibe.css`](./styles/vibe.css) and reused across every page. That file
also serves as an **AI design brief** — the single source of truth for the look
and feel of any new page.

CSS methodology — **zero build step, hand-written only**:

- **ITCSS** ordering enforced via CSS `@layer` (Baseline 2024): Settings → Tools
  → Generic → Elements → Objects → Components → Utilities.
- **BEM** naming convention (`.block__element--modifier`) with Harry Roberts
  **namespace prefixes**: `o-` (objects), `c-` (components), `u-` (utilities),
  `t-` (themes), `is-`/`has-` (state), `js-` (JS hooks).
- **CUBE CSS** philosophy — composition via layout objects (`o-stack`,
  `o-cluster`, `o-grid`) and a lean utility surface.
- **No Tailwind, no PostCSS, no bundler** — every selector is written out
  in full. CSS Nesting is used within blocks, but BEM concatenation
  (`&__child`) is [not supported by native nesting](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_nesting/Using_CSS_nesting#nesting_and_compound_selectors)
  so each BEM child is a full selector.

Core visual conventions:

- **Fonts:** All fonts are self-hosted in `assets/fonts/` and loaded via
  `@font-face` — no external font CDN requests. *Inter* (variable, 100–900)
  is used for body text, *Chakra Petch* for headlines, *Special Elite* for
  accents, *Roboto Mono* for code, *Oswald* + *Roboto Condensed* for the
  manifesto page. License compliance is handled via
  [`LICENSE-fonts.md`](./assets/fonts/LICENSE-fonts.md) with full OFL 1.1 and
  Apache 2.0 license texts alongside. The files are downloaded from their
  canonical upstream sources and subsetted to Latin by
  [`scripts/download-fonts.mjs`](./scripts/download-fonts.mjs) (`npm run
  fonts`) — fully reproducible.
- **Color:** dark background (`--dark-bg`) with a vibrant `--pop-pink` accent and
  `--glow-color` for neon effects.
- **Layout:** `o-wrapper` / `o-grid` for structure; `c-bento` components for the
  landing page grid; `o-stack` for vertical rhythm.
- **Components:** `<kinetic-background>` for floating particle backgrounds,
  `<code-block>` for syntax-highlighted snippets.
- **Accessibility:** `@media (prefers-reduced-motion: reduce)` globally disables
  CSS animations and transitions across all pages.

See the full token set, namespace contract, and component API in the
[`@layer` declaration block](https://github.com/yikesable/vibe/blob/main/styles/vibe.css).

---

## 🧩 Reusable components

Both are dependency-free Web Components. Their third-party runtime
dependencies (Three.js, highlight.js) are self-hosted as vendored bundles
in `vendor/` – no CDN requests, no bundler required for the site itself.

### `<kinetic-background>`

A self-contained Web Component that renders a mouse-interactive particle
background using a self-hosted Three.js bundle from `vendor/`. It encapsulates
all logic in a Shadow DOM, manages its own animation lifecycle, and honours
the user's motion preferences. Drop the script in and add the tag:

```html
<script type="module" src="./components/kinetic-background.js"></script>
<kinetic-background></kinetic-background>
```

### `<code-block>`

A Web Component that renders a syntax-highlighted code block (via highlight.js)
with a copy-to-clipboard button, re-indents the source, and styles itself within
its Shadow DOM. Feed it a `<pre>` or a `<script type="text/template">`:

```html
<script type="module" src="./components/code-block.js"></script>
<code-block language="javascript">
  <script type="text/template">
    const greeting = 'hello';
  </script>
</code-block>
```

> ⚠️ These components are marked **EXPERIMENTAL — USE WITH CAUTION** on the site.

---

## 🚀 Getting started

The site is entirely static. You can open any HTML file directly in a browser,
or run the included dev server for live-reload:

```bash
npm install          # installs dependencies + vendor build tooling
npm run build:vendor # bundles third-party libraries into vendor/ (esbuild)
npm run fonts        # (re)downloads + subsets the self-hosted fonts
npm run dev          # starts browser-sync and opens the site
```

Requirements: **Node.js ≥ 22** (see `engines` in `package.json` — a deliberate
floor with no upper bound: `engines` is advisory for npm, CI pins an exact
Node version, and the toolchain is vendored, so future Node majors need no
pre-emptive cap).

The `build:vendor` step runs [esbuild](https://esbuild.github.io/) to bundle
CDN-free copies of highlight.js, Prism.js, and Three.js from their npm packages,
tree-shaken to only the languages and features each page needs. This is the
**only** build step — the project's own HTML, CSS, and JS are served as authored
without any compilation, transpilation, or bundling.

---

## 🛠️ Project conventions

This repo follows the **HUG Principle** — **Humane, Usable, Guided** — borrowed
from the wider [@voxpelli](https://github.com/voxpelli) project conventions
(documented in [`.github/copilot-instructions.md`](./.github/copilot-instructions.md)):

- **Humane:** prioritize accessibility, semantic HTML, and developer
  experience. Code is commented to explain *why*.
- **Usable:** prefer the platform — vanilla JS and modern CSS over frameworks.
  A few lines of clear, standard code beat a "magic" dependency.
- **Guided:** avoid dependencies that require a build step unless absolutely
  necessary; if one is added, explain the trade-off.

Supporting tooling:

- **ESLint** ([`eslint.config.js`](./eslint.config.js)) via
  `@voxpelli/eslint-config`, configured for the browser environment.
- **Stylelint** ([`stylelint.config.mjs`](./stylelint.config.mjs)) for CSS
  consistency, run via `npm run lint:css`.
- **html-validate** ([`.htmlvalidate.json`](./.htmlvalidate.json)) for semantic,
  accessible HTML against `html-validate:recommended`, run via `npm run lint:html`.
- **dprint** ([`dprint.json`](./dprint.json)) with Malva (CSS) and markup_fmt
  (HTML) plugins for automated formatting, run via `npm run fmt`.
- **TypeScript** ([`tsconfig.json`](./tsconfig.json)) via `@voxpelli/tsconfig`
  (`node20` base, with DOM libs), used only for type-checking the
  `components/**` — no emitted build.
- **Knip** ([`.knip.jsonc`](./.knip.jsonc)) for unused-code detection.
- **Playwright** ([`playwright.config.js`](./playwright.config.js)) for e2e
  checks of the zero-build site, run via `npm run test:e2e`.

- **Renovate** ([`renovate.json`](./renovate.json)) for dependency updates,
  extending `github>voxpelli/renovate-config`.

One command validates everything that can be validated offline:
`npm run check` — vendor-sync rebuild + guard first, then format, CSS, JS,
HTML, unit tests and type-checking (`tsc --noEmit`) in parallel. Network-
dependent audits (font reproducibility, external links) live in the weekly
[`maintenance.yml`](./.github/workflows/maintenance.yml) workflow instead.

## 📚 Project docs

- **[VISION.md](./VISION.md)** — why the project exists: the experiment in
  understanding AI tooling, and the principles it is built on.
- **[ROADMAP.md](./ROADMAP.md)** — deferred work and growth triggers.
- **[`.rpiv/plans/`](./.rpiv/plans/)** — the active work packages, with owner
  decisions recorded.

---

## 📄 License

[MIT](./LICENSE) © Pelle Wessman
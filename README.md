# Vibe Coded ⚡

> A joyful collection of open-source tools and digital experiments, crafted with code for fun.

**Vibe Coded** is a static, zero-build-step showcase site for small browser
tools, web components, and "stories" — all written in vanilla JavaScript, modern
CSS, and semantic HTML. It is published at
**<https://yikesable.github.io/vibe/>** and lives in this repo as a collection of
self-contained HTML pages that share a common design system.

The projects here are almost exclusively developed in collaboration with AI
assistants, guided by [Pelle Wessman](https://kodfabrik.se/). The AI handles the
bulk of the boilerplate and implementation, which allows for rapid prototyping
and exploration of ideas that would otherwise take too long to build from
scratch. It's an experiment in *understanding* the tool — its strengths and its
limits — not blindly adopting it.

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
  Apache 2.0 license texts alongside.
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

Both are dependency-free Web Components that load their own dependencies from a
CDN inside their module — no bundler required.

### `<kinetic-background>`

A self-contained Web Component that renders a mouse-interactive particle
background using Three.js (loaded from a CDN). It encapsulates all logic in a
Shadow DOM, manages its own animation lifecycle, and honours the user's motion
preferences. Drop the script in and add the tag:

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
npm run dev          # starts browser-sync and opens the site
```

Requirements: **Node.js ≥ 22** (see `engines` in `package.json`).

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
- **TypeScript** ([`tsconfig.json`](./tsconfig.json)) via `@voxpelli/tsconfig`
  (`node20` base, with DOM libs), used only for type-checking the
  `components/**` — no emitted build.
- **Knip** ([`.knip.jsonc`](./.knip.jsonc)) for unused-code detection.
- **Renovate** ([`renovate.json`](./renovate.json)) for dependency updates,
  extending `github>voxpelli/renovate-config`.

---

## 📄 License

[MIT](./LICENSE) © Pelle Wessman
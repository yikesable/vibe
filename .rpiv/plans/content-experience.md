# Plan: Content & Experience

Scope: accessibility and performance quick wins, global navigation, the
colophon, AI-crediting, and the first new content. Produced by research +
planning agents (2026-08-28). Deferred items (three.js, monaco→CM6) live in
`ROADMAP.md`; the SEO plumbing (`404.html`, `sitemap.xml`, `robots.txt`, OG
image) is owned by the engineering plan.

## Decisions (owner, 2026-08-28)

- **slides/ intent**: decks in the **existing StoryViewer format** — the
  custom `story-slide`/`story-viewer` components from `stories/jsdoc-types.html`.
  Zero new dependencies; jsdoc-types stays in `stories/`. Reveal.js remains a
  documented option in `ROADMAP.md` if talks are ever needed.
- **AI credits**: ship a **generic "Built with Gemini, directed and
  reviewed by me."** line for entries
  without recorded provenance (codepen-converter, the 3 stories, the
  components). `vp-pie-menu.html` keeps its specific credits (Gemini 3.6
  Flash · GLM-5.2 · impeccable.style).
- **Nav**: home anchors (`./index.html#component-explorations` etc.) until
  section index pages exist (trigger: ~15 authored pages → `ROADMAP.md`).

## Phase 1 — A11y & perf quick wins

1. **`stories/jsdoc-types.html`** — add `prefers-reduced-motion` handling:
   guard the `<particle-field>` THREE.js loop, render the first slide
   statically and skip auto-advance in `story-viewer`, set `dos-typewriter`
   text immediately; add the page-level reduce block (mirror
   beyond-word-list).
2. **`stories/manifesto.html`** — `scrollIntoView({ behavior: 'smooth' })`
   falls back to `'auto'` under reduce; skip the floating-symbol generator;
   page-level reduce block for the keyframes.
3. **`components/kinetic-background.js`** — one work package (mechanics
   verified 2026-08-28: 2000 square points, additive pink, ~5 min/turn
   rotation, camera parallax; the depth layer's honest name is stardust,
   not galaxy):
   - `aria-hidden="true"` on host and canvas (decorative; currently absent)
   - `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))` +
     `powerPreference: 'low-power'` — two one-liners; the missing pixelRatio
     renders the canvas at CSS-pixel resolution (soft on Retina, arguably
     on-brand for a glow, unstated)
   - drift fix: read `--pop-pink` via
     `getComputedStyle(document.documentElement)` with the hardcoded
     `0xFF00A9` demoted to fallback, honor a `data-color` attribute (the
     source's own note) — matches the `particle-field` convention in
     jsdoc-types.html (~20 min); ties out the One Source Rule in DESIGN.md
   - hidden-tab pause (`visibilitychange`) is hygiene, not a win — browsers
     already throttle rAF in background tabs (MDN)
   - reduced-motion: currently renders nothing (blank canvas, violet-black
     shows through) — documented and defensible; optional upgrade: render
     one static frame to keep the depth layer (~30–60 min, owner decision)

   ✅ **IMPLEMENTED (2026-08-28, `fix(component): harden kinetic-background
   lifecycle and accessibility`)** — all of the above landed, plus the
   lifecycle hardening that wasn't yet scoped: idempotent
   connect/disconnect, a generation token guarding the async lazy Three.js
   load (the ~600 KB bundle is only fetched on connect, not eagerly — the
   reduced-motion static frame renders through WebGL too), RAF
   cancellation, listener removal, geometry/material/renderer disposal, and
   no duplicate canvases on reconnect. Reduced-motion renders one static
   frame (resize re-renders once) instead of a blank canvas. Pure lifecycle
   + math helpers extracted to `components/kinetic-background-state.js`
   with `node --test` coverage; Playwright e2e covers the running loop,
   the static frame, detach/reconnect, context loss, and bundle-load
   failure (`e2e/kinetic-background.spec.js`). The `aria-hidden` host
   attribute is set in `connectedCallback`, not the constructor — the
   custom-elements spec forbids adding attributes during construction, and
   `document.createElement` throws otherwise.
4. **Font swap CLS** — measure PageSpeed first; only if CLS shows, add
   `size-adjust`/`ascent-override` to the headline `@font-face` rules.

Verify: reduced-motion emulation per page, axe scan, background-tab CPU,
PageSpeed before/after. Effort: ~0.5–1 day.

## Phase 2 — Global nav, footer, metadata, infra fix

1. **Nav** — new `.c-site-header` block in `styles/vibe.css` (sticky,
   `o-cluster` layout, `--active` state with `aria-current="page"`), skip
   link as first element in `<body>` on every page, inserted into all 6
   pages with relative paths. Nav items: Home, Explorations, Tools,
   Components, Stories, Slides (→ home anchors per decision).
2. **Footers** — standardize a `c-footer` on the standard-layout pages (home
   · section · colophon · © Pelle Wessman · yikesable.dev); extend the pie-menu footer with
   back links; add a discreet site-links row to the manifesto's Armory
   footer.
3. **🐛 Fix the absolute-path bug** — 4 pages load `/styles/vibe.css`
   (absolute) which 404s under the `/vibe/` Pages subpath; only `index.html`
   uses `./styles/vibe.css`. Fix all to relative (`../styles/vibe.css`).
4. **Metadata pass** — add `og:*`, canonical, favicon, `view-transition` to
   the 5 subpages (shared brand og:image from the engineering plan).
5. **`llms.txt`** — site summary + section links (owner tracks the standard);
   sitemap/robots/404 are the engineering plan's Phase 4.

Verify: crawl every page, zero 404s in Network, keyboard-tab through nav +
skip link, OG debugger preview. Effort: ~0.5–1 day. (Colophon links land in
Phase 3 — build it in the same batch.)

## Phase 3 — Colophon (`colophon/index.html`)

Sections: what the site is / who makes it (Pelle Wessman, via his
freelance company yikesable.dev) · how it's built (zero-build,
design system, vendored deps, self-hosted fonts) · the design brief ·
**AI collaboration policy** (first-person, drafted in Phase 4a) · colophon
credits (tools/versions) · license. Reuse `c-section`/`o-stack`.
Effort: ~0.5 day.

Stored copy — **AI collaboration policy** (first-person centerpiece; open
with the provocation-beat epigraph):

> *That is a bit of a provocation. It's meant to be.*
>
> Everything here is made with AI, and that is not the part I want to hide. The part that matters is the division of labour.
>
> The AI drafts the bulk of the work: the code, the CSS, the first pass of the prose. I direct, review, and edit – and I decide what ships. Nothing on this site is unedited AI output. Made with AI is not the same as abandoned to it.
>
> Why say so, so plainly? Two reasons, and neither is a lecture. First, honesty is the point: the division of labour is what makes an entry a contribution rather than a demo, and hiding it would cheapen the work. Second, this site is an experiment in understanding the tool – its strengths and its limits – and an experiment that hides its method is not much of an experiment.
>
> I am aware of the valid concerns around AI: its impact on the planet, on creative fields, on developer jobs. I do not claim to have resolved them. What I claim is narrower: one cannot critique a tool, or use it well, without knowing its limits. This collection is my way of finding them out.
>
> Each page carries a short credits line naming what was used to make it. Where I kept notes on what the AI got wrong and what I fixed, there is a process note as well. That is the part of the site I am most curious to see grow.

Colophon skeleton: title **Colophon** + tagline beat "A joyful collection of
experiments with AI – and the small print that isn't small." · "What this
is" (collection, not product, + one "what this is not" line) · "How it's
built" (reuse VISION's hobby-horse line) · "The design brief" (vibe.css as
AI design brief) · policy above · "Colophon credits" (praise-by-citation:
font provenance, vendored libs, Zach Leat's taxonomy of web components,
The Sims) · license.

## Phase 4 — AI-crediting rollout (three-layer model)

1. **Global policy** (lives in the colophon): first-person statement —
   opinions and narrative are mine; AI produced most implementation code,
   under my direction and review. Optional: dweekly's `ai-assisted` tier
   label.
2. **Per-entry credits** — new muted `.c-credits` block in `vibe.css`
   (visually quiet, not a badge): "Built with Gemini, directed and
   reviewed by me." for
   codepen-converter, the 3 stories, and the components; vp-pie-menu keeps
   its specific credits. Fixes the current inconsistency (index.html credits
   its entries, vp-pie-menu.html does not).
   **Landing cards** (ships with the credits rollout) — the vp-pie-menu
   card desc stops at *what it is*; the inline AI credit moves down into a
   compact card credit line (one size down, card bottom): desc →
   "A radial pie menu, inspired by The Sims' retro vibes, built as a vanilla
   HTML web component – spatial interaction without a single dependency." ·
   credit line → "Gemini 3.6 Flash · GLM-5.2 on Ollama Cloud ·
   impeccable.style skillset". Placeholder cards → "This space is waiting
   for the next experiment." (drops the hype "great", swaps toward the
   tagline's vocabulary).
3. **Process notes** — optional 2–4 sentence "what I changed after the AI's
   output"; dogfood on the CodePen Converter story (Phase 6.2).
4. **New-page checklist convention** — every new page ships with nav,
   credits, og metadata, reduced-motion handling; record in
   `.github/copilot-instructions.md`.

Effort: ~0.5 day + provenance lines.

## Phase 5 — Per-section index pages

**Deferred** — trigger ~15 authored pages (tracked in `ROADMAP.md`). When
built: `explorations/index.html`, `tools/index.html`, `stories/index.html`,
`slides/index.html` as bento card grids; landing bento becomes a curated
featured grid; nav switches from anchors to the indexes.

## Phase 6 — First content builds

1. **`component-explorations/vp-popover.html`** (build first, 1–2 days) —
   Popover API / anchor positioning exploration: thesis → live demo zone →
   interactive config matrix → API/code via `<code-block>` → a11y notes →
   browser support (Baseline) → `.c-credits`.
2. **`stories/codepen-converter-story.html`** (second, 0.5–1 day) — "How the
   CodePen Converter was made": the brief, the first AI output, the real
   diff after editing, lessons about the tool's limits, process note.
   Opening (diff-first): "The brief was one sentence. The first draft was a
   working converter. The gap between them – what the AI got wrong, and what
   I had to take back – is what this story is about." Time-anchor the first
   line (eg. "In August 2026, I wanted a tool that…"); keep scope to this
   one tool; close with the process-note forward-projection.
3. **`regex-playground/index.html`** (third, 0.5–1 day) — regex tool:
   pattern + flags, test string, live match highlighting, replace preview,
   error messaging, URL-hash sharing.

## Phase 7 — Slides

Per decision: the existing StoryViewer format. `slides/` holds deck-format
pages using the custom `story-slide`/`story-viewer` components; no new
dependencies. First candidate: a talk version of the JSDoc-types story.

## Critical files

`styles/vibe.css` (`.c-site-header`, `.c-credits`) · `index.html` ·
`components/kinetic-background.js` · `stories/jsdoc-types.html` ·
`stories/manifesto.html` · `assets/fonts/fonts.css` ·
`.github/copilot-instructions.md`

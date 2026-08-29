# Vibe Coded — Roadmap

Deferred work and growth triggers, tracked here so nothing is lost when the
active work packages (see `.rpiv/plans/`) land. Items are added when they are
explicitly deferred or sized as their own work package; they are removed when
picked up.

## Deferred engineering

### og:image asset (deferred 2026-08-29, decision pending)

- The `og:image` meta was removed from index.html because it pointed at
  placehold.co — an external CDN, violating the no-CDN rule. The ASSET is
  deferred: the generation approach is undecided (satori+resvg devDeps /
  Playwright screenshot / one-off hand-made PNG).
- **When it lands:** add `assets/og-image-v1.png` + `og:image`,
  `og:image:width/height`, `og:image:alt`, `twitter:image` on index.html, and
  flip `twitter:card` back from `summary` to `summary_large_image` (the
  downgrade exists because a large card with no image renders blank tiles).

### three.js upgrade (0.128.0 → current) — own work package

- `three` has been pinned at `^0.128.0` (2021) since the kinetic-background
  component was written. Research (2026-08-28): no API break for the
  `Scene`/`PerspectiveCamera`/`WebGLRenderer`/`Points`/`BufferGeometry`
  usage — the only relevant changes are WebGL 1 removal (r163, irrelevant)
  and ColorManagement-on-by-default (r152, may shift the neon-pink a hair —
  needs visual QA). Upgrade executed 2026-08-29 (`8e40b01`) — visual QA
  done deterministically: seeded `Math.random` (identical particle
  positions), frozen rotation, screenshots under r128 and r185 decode to
  SHA-identical PNGs — pixel-for-pixel identical renders, no color drift.
- **modulepreload: measured, REJECTED** (2026-08-29). A throttled A/B
  benchmark (both variants through one identical route handler, AB/BA
  alternation, 5 fresh contexts per arm, Slow-4G + 4× CPU) found only a
  ~21 ms median time-to-stardust gain (noise — runs overlap) and a
  ~136 ms LCP REGRESSION (944 → 1080 ms: the low-priority fetch still
  occupies a throttled connection slot). The waterfall-saving hypothesis
  from the 2026-08-28 research round did not survive measurement. If
  revisited: re-benchmark after the CodeMirror 6 switch (different
  bandwidth competition).
- **Bundle:** r185 tree-shaken module bundle ~509 KB (full r128 module was ~584 KB); the global IIFE for jsdoc-types is ~697 KB. The real win was switching
  `components/kinetic-background.js` to **named imports**
  (`import { Scene, WebGLRenderer, … }`) — `three` is `sideEffects: false`,
  so esbuild tree-shakes the vendor bundle substantially.
- **Component hardening** (setPixelRatio cap, `powerPreference: 'low-power'`,
  the `--pop-pink` drift fix) **landed 2026-08-28** (the hardening commit);
  what remains here is the version bump, the named-import tree-shake, and
  the color-management visual QA. OffscreenCanvas+Worker stays deferred —
  the per-frame JS is tiny, the
  dominant cost is GPU compositing, and r128 + Safari make the worker path
  friction-heavy for a marginal win.
- **Sequence:** do the named-import refactor and the version bump together,
  rebuild via `npm run build:vendor`, visual QA on all pages using the
  component.
- **Renovate:** `^0.128.0` caret-semver means renovate treats 0.185 as a
  major. Either accept the bump when the work package runs, or
  `ignoreDeps: ["three"]` until then to stop the churn noise.

### Extract and showcase more of the project's web components

The codebase already contains several hand-rolled components living inline
in page-specific `<script>` blocks — candidates for extraction into
`components/*.js` files and showcase entries in index.html's "Reusable
Components" section (which today documents only `<code-block>` and
`<kinetic-background>`):

- `<dos-typewriter>` — the char-by-char DOS-style typewriter with Prism
  highlighting (stories/jsdoc-types.html); already reduced-motion-aware.
- `<story-viewer>` / `<story-slide>` — the auto-advancing slide-deck
  framework with progress bars and manual nav (stories/jsdoc-types.html).
- `<particle-field>` — the configurable particle background
  (stories/jsdoc-types.html); a color/size/count-parameterized sibling to
  `<kinetic-background>`.
- `<vp-pie-menu>` — already a standalone exploration
  (component-explorations/vp-pie-menu.html); could graduate to a
  documented, self-contained component entry.

Extraction order should follow reuse value: `dos-typewriter` first (most
self-contained, zero Three.js dependency), then `particle-field`, then
`story-viewer` (largest API surface). Each extraction must keep the
hardening patterns (teardown, live reduced-motion, guarded render) and
come with unit/e2e coverage mirroring the kinetic-background suite.

### CodePen Converter: monaco-editor → CodeMirror 6

- monaco is **not** in `package.json` — it is pinned in
  `codepen-converter/index.html` at `https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.33.0/...`
  (the **last external CDN on the site**; renovate cannot see or update it,
  its pending `monaco-editor-0.x` branch is orphaned).
- Decision (2026-08-28): skip the interim pin bump (0.33.0 → 0.56.0) and go
  **straight to CodeMirror 6** — the 2026 consensus for a small static
  editor (~124 KB vs monaco 2 MB+); the converter only needs basic HTML
  editing, no TS IntelliSense.
- **Scope:** rewrite the `editor.create` init + theme (Monarch →
  `HighlightStyle`) in `codepen-converter/index.html`, swap the cdnjs script
  tags for a vendored CM6 bundle (`scripts/build-vendor.mjs`), remove the
  now-redundant editor CSS. Result: site is 100% CDN-free.
- **Note:** the 0.33.0 pin stays as-is until then (works fine; AMD loader
  is deprecated upstream but stable).

## Content backlog

Picked from the content research brief (2026-08-28), in build order:

1. `component-explorations/vp-popover.html` — Popover API / anchor
   positioning exploration (platform feature, real a11y subtleties; mirrors
   the vp-pie-menu page shape).
2. `stories/codepen-converter-story.html` — "How the CodePen Converter was
   made": the AI-collaboration process note, dogfooding the three-layer
   crediting model.
3. `regex-playground/index.html` — regex browser tool (highest-frequency
   dev-tool niche, small; URL-hash sharing is a nice zero-build touch).

Deferred/optional: "Why these web components are dependency-free" story,
reduced-motion-as-feature exploration, "The Y2K neon aesthetic as an AI
design brief" story.

## Growth triggers

- **Per-section index pages** (`explorations/index.html`, `tools/index.html`,
  `stories/index.html`, `slides/index.html`): build when the site reaches
  ~15 authored pages — the bento landing becomes a curated featured grid,
  nav links switch from home anchors to the indexes.
- **Tools-section structure:** keep flat sibling folders
  (`regex-playground/`) while ≤5 tools; revisit a `tools/` umbrella only if
  the section outgrows that (moving `codepen-converter/` would break URLs).
- **Search:** only at ~100+ pages (NN/g threshold); Pagefind is the
  zero-backend fit if ever needed.
- **CI a11y checks** (pa11y WCAG2AA / @axe-core/cli): add once pages pass
  ~35% automated coverage — do not land red on day one.
- **Slides:** currently decks in the existing StoryViewer format (decision
  2026-08-28). If talks are ever needed, evaluate reveal.js v6 vendored via
  `build:vendor` (stays zero-build at runtime).

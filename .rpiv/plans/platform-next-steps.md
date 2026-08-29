# Platform Next Steps — merged from a 3-researcher + 2-planner round (2026-08-29)

Research: backlog audit, web-platform 2026 survey, dependency/CI health audit.
Planning: site-correctness planner + upgrades/hygiene planner. Status: not started.

**Headline findings**
- `actions/setup-node@v4` is dead after **2026-09-16** (Node 20 runner removal) — hard deadline.
- `og:image` still points at placehold.co — the one live violation of DESIGN.md's no-CDN rule.
- `stories/jsdoc-types.html` + `stories/manifesto.html` animate unconditionally — violates "no animation without consent, ever".
- Three.js is pinned at 0.128.0 (Apr 2021, ~57 releases behind); **r160 removed the UMD build**, so
  `build-vendor.mjs` step 3 (`copyFile three.min.js`) hard-fails on any upgrade — an IIFE global
  entry is mandatory, not polish.
- `modulepreload` kills the 3-step waterfall (HTML → component → dynamic import) before the ~600 KB fetch.
- **Status updates (2026-08-29, A-1 partially executed):** the placehold.co og:image is REMOVED (line 8
  above no longer describes the tree); the og:image ASSET is deferred (see ROADMAP.md); the sitemap
  has 6 URLs (vp-pie-menu included — the “5 URLs” below is stale); the vendored Prism usage calls
  `Prism.tokenize()` + hand-built token DOM, NOT `Prism.highlightElement` (B-WP2 below said
  highlightElement — wrong).

**Two tracks, one conflict**: Track A (site) and Track B (upgrades) are parallel-safe EXCEPT the
three.js upgrade (B-WP3) vs modulepreload/og-image/nav (A-WP1/2/4) — both touch index.html and
stories. Resolve: land B-WP1/B-WP2/B-WP4 immediately (no overlap), run Track A, then do B-WP3
(three.js) after Track A's page-head edits have landed.

---

## Track B first (deadline + zero-overlap quick wins)

### B-WP1 — CI action bumps (P1, S, DEADLINE 2026-09-16)
1. Both workflows, all 4 jobs: `actions/setup-node@v4` → `@v7` (inputs compatible, no `with:` changes).
2. Same commits: `actions/checkout@v6` → `@v7` (hygiene; enforcement already backported to v6).
3. Leave `lycheeverse/lychee-action@v2` (current).
4. Gate: both workflows green on the PR (that IS the test). Commit: `ci: bump setup-node to v7 and checkout to v7`.

### B-WP2 — Prism CVE residual verdict (P1, S, docs-only)
1. Verify lockfile pins prismjs 1.30.0 (CVE-2024-53382 patched); `check:vendor` stays green (no rebuild).
2. Verify usage path: `scripts/prism-entry.mjs` imports core + grammars only — **no plugins**; the
   GHSA dom-clobbering vector requires specific plugins; jsdoc-types.html calls
   `Prism.highlightElement` directly in the shadow root, no autoloader/previewers → not exploitable.
3. Record verdict + date in `scripts/prism-entry.mjs` header. Commit: `docs: record prismjs CVE-2024-53382 assessment`.

### B-WP4 — Renovate vendor-dep config (P2, S)
1. `renovate.json`: `packageRules` matching `["three", "highlight.js", "prismjs", "esbuild"]` —
   `groupName: "vendor bundles"`, label `vendor-rebuild`, `postUpgradeTasks: { commands: ["npm run build:vendor"], fileFilters: ["vendor/**"] }`.
2. Top-level `allowedCommands: ["npm run build:vendor"]` (literal command, ephemeral runner, automerge
   globally off — accepted risk; document it).
3. Validate with `renovate-config-validator`. Commit: `chore: group vendor bundle deps with post-upgrade rebuild`.

### B-WP6 — small closures (P3) — can interleave anytime
1. esbuild 0.28.2 + dprint 0.56.1: bump → `npm run check` → commit regenerated `vendor/` in same commit.
2. subset-font 2.6.0: bump → `npm run fonts` → `npm run audit:fonts` → commit fonts+lockfile atomically
   (bytes drift by design; CI `audit-fonts` confirms reproducibility).
3. engines: document "no upper bound, deliberate" — no cap.
4. code-block: real permission-denied clipboard test — fresh context WITHOUT the clipboard grant,
   assert "Copy failed" → "Copy" recovery + no pageerror (current test only stubs a rejection).

### B-WP5 — lint/TS ladder (P2/P3, after B-WP3 to avoid churn overlap)
1. `@voxpelli/eslint-config` 23→25 + eslint →9.38+ (one commit; eslint 10 blocked on peer range — wait).
2. `@voxpelli/tsconfig` 15→16, switch `node20.json` base → node22 (matches engines + CI node-version).
3. typescript ~5.8.3 → 5.9. TS 7 (tsgo) deferred until @voxpelli/tsconfig declares support.

---

## Track A — site correctness, a11y, platform (after B-WP1/2/4 are in)

Page map (verified): kinetic-background mounts on index, beyond-the-word-list, codepen-converter
(NOT jsdoc-types — has its own particle-field; NOT manifesto). view-transition meta: index + converter
only. Reduced-motion handling exists only on beyond-the-word-list + converter. Footers: three © variants.

### A-WP1 — SEO plumbing + OG image (P1, M) — **ask-first: satori + @resvg/resvg-js devDeps**
1. `scripts/build-og.mjs`: satori 1200×630 PNG from `assets/fonts/Inter-Variable.woff2` → committed
   `assets/og-image-v1.png` (versioned filename; Pages caches ~10 min).
2. index.html: og:image → absolute committed PNG + width/height/alt + twitter:image.
3. Head template for the 5 subpages: canonical (absolute), og:*, twitter:card, favicon link.
4. `404.html`: relative asset paths (Pages `/vibe/` subpath bug), NO kinetic-background mount, stored
   wry copy from engineering-hardening.md.
5. `sitemap.xml` (5 URLs) + `robots.txt` (Allow + Sitemap).
6. Extend `lint:html` glob with `404.html` — new root files silently escape the gate otherwise.
Tests: new `e2e/site-plumbing.spec.js` (404 renders+links home; head tags on all 5 subpages; sitemap
lists exactly 5). Gate: check + e2e.

### A-WP2 — nav, skip link, footers (P1, S–M)
1. vibe.css: `.c-site-header` + `.c-skip-link` (visually-hidden-until-focus) in the correct @layer slot.
2. Skip link first-in-body + nav on all 6 pages, relative paths (`../` on subpages), `aria-current="page"`.
3. Standardize footers on index/stories/converter; vp-pie-menu gets a back-link only (bespoke layout stays).
Tests: skip link is first focusable + moves focus to `#main` (add id where absent); nav + aria-current on
all pages; identical © text. Commit: `feat(a11y): add skip link, global nav, standardized footers`.

### A-WP3 — reduced motion on jsdoc-types + manifesto (P1, S–M)
1. jsdoc-types: guard StoryViewer auto-advance (never start `_slideTimer` under reduce; render first
   slide), dos-typewriter (full text at once), particle-field (one static frame — mirror
   kinetic-background's proven pattern), page-level CSS reduce block copying beyond-the-word-list:119.
2. manifesto: `scrollIntoView` smooth→auto under reduce; skip floating-symbol generator; same CSS block.
3. Honor live preference changes (3-line `change` listener; duplicate inline — pages stay self-contained).
Tests: new `e2e/story-motion.spec.js` — emulateMedia reduce on both pages (no auto-advance, full
typewriter text, no symbols) + no-preference sanity. Commit: `fix(a11y): honor prefers-reduced-motion in stories`.

### A-WP4 — modulepreload (P1, S)
`<link rel="modulepreload" href="./vendor/three.module.bundle.js" fetchpriority="low">` on exactly the
three mounting pages (`../` on subpages). NOT on jsdoc-types/manifesto/404.
Tests: preload link present on the 3 pages, absent elsewhere; verify the existing bundle-failure e2e
still trips (preload + dynamic import share the fetch — the route mock must still reject).
Commit: `perf: modulepreload the three.js vendor bundle on stardust pages`.

### A-WP5 — kinetic-background live-preference + tab pause (P2, S)
1. Store the MQL; `change` listener: →Reduced cancels the loop + renders one static frame; →NoPreference
   restarts loop + pointer listeners (factor loop/listener setup out of initThree so paths share it);
   route through `nextLifecycleState`; remove listener in teardown. Generation-token-guarded throughout.
2. `visibilitychange`: pause via cancelAnimationFrame, resume on visible, removed in teardown.
3. Unit tests for any extracted pure decider in kinetic-background-state.js.
Tests: e2e — emulateMedia flip after connect (running→static→running), visibilitychange pause/resume
(follow the existing loop-detection pattern). Commit: `fix(component): live motion-preference and hidden-tab handling`.

### A-WP6 — view-transition morphs (P2, S)
1. Unique `view-transition-name` per bento card that leads to a subpage; matching name on each target
   page's hero/heading; add the meta to the 3 story pages.
2. vibe.css reduce block: `::view-transition-group/old/new(*) { animation: none; }` (in the existing
   block, not per-page).
3. Leave static/placeholder cards unnamed (default cross-fade; naming statics glitches exits).
Tests: light-touch (navigation + target heading carries the name). Commit: `feat: view-transition morphs from bento cards`.

### A-WP7 — favicon One Source Rule (S, fold into A-WP1)
Committed `assets/favicon.svg` using `#FF00A9` (a static SVG can't read page CSS vars — one source file
replaces two inline data-URI copies; note the token in DESIGN.md), linked from pages lacking a favicon.

---

## Then: B-WP3 — three.js 0.128 → 0.185 (P2, L) — AFTER Track A's page-head edits land
1. package.json `"three": "^0.185.1"`; npm install.
2. build-vendor.mjs step 3 replacement (UMD is gone in r160+): new `scripts/three-global-entry.mjs`
   (`import * as THREE from 'three'; globalThis.THREE = THREE;`) bundled as IIFE → `vendor/three.min.js`
   (keep filename; zero HTML edits — or rename to `three.global.bundle.js` + one script-tag edit; prefer rename for honesty).
3. Tree-shake subset entry (`scripts/three-entry.mjs`, named imports of what kinetic-background uses,
   mirroring highlight-entry.mjs): honest expectation 25–40% off the bundle, not 80% (WebGLRenderer
   drags in core). Update the component's "~600 KB" comment with the measured size (also DESIGN.md and 404.html's no-kinetic-background comment).
4. Color-space audit: r152 sRGB output default may visibly shift the 0xFF00A9 family — QA against an
   r128 reference screenshot; if shifted, set `renderer.outputColorSpace` explicitly and document why.
   e2e lifecycle tests will NOT catch pixel drift — manual visual QA is the real gate.
5. Gates in order: check:vendor → check → unit → e2e → visual QA. One atomic commit:
   package.json + lockfile + build script + entries + rebuilt vendor/ + component adjustments.

## Explicitly out of scope
eslint 10 / TS 7 (blocked upstream); Monaco→CodeMirror 6 (own ROADMAP package — also obsoletes the
deferred Monaco-theme cleanup); glow-literal `--glow-*` token sweep; colophon/credits/llms.txt
(content plan Phases 3–5); content backlog (vp-popover, converter story, regex playground); any push
or GitHub publication without explicit permission.

# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **The owner (Pelle Wessman)** — primary maker and keeper of the record: the site is his collection and experiment log, and the honest record of the making.
- **Potential freelance clients and collaborators** — discovering him via yikesable.dev; the site as quiet proof of what human-directed AI craft looks like.
- **Developers and the indie-web community** — interested in AI-collaborative making, web standards, and the honesty framing.

Confirmed non-audience: general visitors browsing for entertainment are not a target.

## Product Purpose

A joyful collection of experiments with AI: small browser tools, web components, and stories, made almost exclusively with AI under human direction. The site is the container for an experiment in *understanding* the tool — its strengths and its limits — not blindly adopting it, and it doubles as a set of genuinely useful tools. Success means the collection grows with honest, documented entries, and the tools are actually used.

## Positioning

The site is openly, almost provocatively AI-first: the honesty about the making is the differentiator. Where the web hides AI use, admits it in small print, or vouches for it loudly, Vibe Coded states it up front and lets the work stand next to the admission. Made with AI is not the same as abandoned to it — a human directs, reviews, and owns every entry.

## Operating Context

- Zero-build static site published on GitHub Pages at https://yikesable.github.io/vibe/
- Self-contained HTML pages sharing one hand-written design system (`styles/vibe.css` — ITCSS `@layer`, BEM, CUBE CSS), which doubles as the AI design brief: the single source of truth for any new page
- Runtime dependencies vendored via esbuild (`vendor/`) — no external CDN requests; all fonts self-hosted, subsetted, and reproducible via `scripts/download-fonts.mjs` (`npm run fonts`)
- Dev workflow: `npm run dev` (browser-sync); quality gates: stylelint, dprint, eslint, html-validate (CI planned, not yet shipped)
- Entries are built in collaboration with AI assistants (Gemini, GLM-5.2, the impeccable.style skillset among others) and credited per entry

## Capabilities and Constraints

Capabilities — four sections of self-contained pages:
- **Component Explorations**: deep dives into a single web component (eg. `<vp-pie-menu>`)
- **Tools & Utilities**: browser tools (eg. the CodePen Converter, which splits a single HTML file for CodePen)
- **Reusable Components**: shared web components (`<kinetic-background>`, `<code-block>`)
- **Stories & Slides**: long-form narrative pages, plus deck-format slides in the existing StoryViewer format

Constraints — binding:
- Zero build step for the site's own code; no framework
- No external CDN requests; every dependency vendored and justified
- `prefers-reduced-motion` handling is a hard rule across pages
- HUG principle (Humane, Usable, Guided) as the operating manual
- Vanilla JavaScript, modern CSS, semantic HTML only

Undecided: nothing material at this time.

## Brand Commitments

- **Name**: Vibe Coded
- **Tagline** (fixed): "A joyful collection of experiments with AI"
- **Author**: Pelle Wessman, via his freelance company yikesable.dev — both names appear in attribution (eg. footer "© Pelle Wessman · yikesable.dev")
- **Voice**: the owner's established writing voice — calm, hedged where reporting preference, colon-driven evidence, Swedish-substrate; never raised volume
- **Identity**: openly AI-first, almost provocatively honest, framed as an exploration and experiment; the human directs, reviews, and owns the result
- **Aesthetic** (binding): Y2K-inspired dark-mode neon, deliberately joyful — fun is a feature, not a distraction
- HUG principle, MIT license, open standards

## Evidence on Hand

- `index.html` — bento landing; hero: title, tagline, note "Everything here is made with AI. That's the point.", CTAs; FAQ section; JSON-LD
- `component-explorations/vp-pie-menu.html` · `codepen-converter/index.html`
- `stories/`: jsdoc-types, beyond-the-word-list, manifesto
- `components/`: kinetic-background, code-block
- `styles/vibe.css` (the design brief) · `assets/fonts/` with `LICENSE-fonts.md` (provenance trail, incl. the Reserved Font Name verification)
- Binding record: `VISION.md`, `README.md`, `ROADMAP.md`. (`.rpiv/plans/` are ephemeral working artifacts — the owner expects them not to survive; do not treat them as durable product truth.)
- Absences future work must not fabricate: no testimonials, case studies, analytics, or usage data; subpages lack og/metadata yet (planned)

## Product Principles

1. **Honesty is the point** — the division of labour between AI and human is stated openly, per entry and globally; hiding it would cheapen the work.
2. **Platform proximity** — vanilla web standards, zero build step, no CDN requests; every dependency justified or gone.
3. **The design system is the brief** — `vibe.css` is the single source of truth, so new pages belong before a line of CSS is written.
4. **Useful and joyful** — entries are real tools and genuine experiments, not demos; the Y2K neon joy is deliberate.
5. **Accessibility as a hard rule** — reduced-motion, semantic HTML, and structure that survives the collaboration.

## Accessibility & Inclusion

- Global `prefers-reduced-motion` handling (hard rule; `jsdoc-types.html` and `manifesto.html` still need their JS-motion guards — planned)
- Semantic HTML and `lang` attributes throughout; keyboard-operable components
- Automated a11y checks (pa11y/axe) planned for CI once pages pass ~35% coverage — not yet shipped

---
name: Vibe Coded
description: A joyful collection of experiments with AI – Y2K neon on violet-black, glass over stardust
colors:
  neon-pop-pink: "#ff00a9"
  accent-soft: "rgba(255, 0, 169, 0.5)"
  violet-black: "#0a001f"
  code-surface: "#160f29"
  text-bright: "#eae2ff"
  text-muted: "#d1d5db"
  text-dim: "#9ca3af"
  text-faint: "#6b7280"
typography:
  display:
    fontFamily: "Chakra Petch, sans-serif"
    fontSize: "clamp(3.5rem, 12vw, 9rem)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.05em"
  headline:
    fontFamily: "Chakra Petch, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 700
  title:
    fontFamily: "Chakra Petch, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "1rem"
  label:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.875rem"
  mono:
    fontFamily: "Roboto Mono, ui-monospace, monospace"
    fontSize: "1em"
rounded:
  md: "0.375rem"
  lg: "0.5rem"
  xl: "0.75rem"
  2xl: "1rem"
spacing:
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2.5rem"
  section: "4rem"
components:
  button-primary:
    backgroundColor: "{colors.neon-pop-pink}"
    textColor: "{colors.violet-black}"
    rounded: "{rounded.md}"
    padding: "0.75rem 1.5rem"
  button-primary-hover:
    backgroundColor: "{colors.neon-pop-pink}"
    textColor: "{colors.violet-black}"
    rounded: "{rounded.md}"
    padding: "0.75rem 1.5rem"
  card-bento:
    backgroundColor: "{colors.violet-black}"
    textColor: "{colors.text-bright}"
    rounded: "{rounded.2xl}"
    padding: "2rem"
  hero-display:
    typography: "{typography.display}"
    textColor: "{colors.text-bright}"
---

# Design System: Vibe Coded

## Overview

**Creative North Star: "The Neon Lab Notebook"**

A glowing laboratory record of experiments with AI: dark violet-black surfaces, one loud neon pink, honest annotations. The site is a notebook that happens to be built with AI and says so – the visual system is the same calm honesty in another medium. Playful but kept: the Y2K joy is deliberate, and the discipline is that nothing shouts twice.

The depth model is the memorable part: layered glass cards float over a living field of pink stardust – the `<kinetic-background>` component, a sparse, slow-drifting cloud of 2000 tiny points that parallaxes with the cursor, like sitting inside a slow snow-globe of pink dust. The background is the depth; the cards are translucent windows onto it. Neon glow is the accent's own light – the only shadow this system casts.

**Key Characteristics:**
- One loud neon accent (Neon Pop Pink) on a violet-black night
- Glass-over-stardust: translucent cards, blur, subtle gradient, living starfield depth behind
- Geometric sci-fi headlines (Chakra Petch) over a calm humanist body (Inter)
- Calm at rest, loud on hover – motion with discipline
- Honest by design: the AI-first provocation lives in the hero, FAQ, and credits, not in every component

## Colors

One loud accent on a violet-black night, lavender-white text, and gray steps for hierarchy. The pink is the voice; everything else is the room.

### Primary
- **Neon Pop Pink** (#ff00a9): the single accent. CTA buttons, the hero title's highlight, hover borders, and the source of all glow. It appears where action happens – and nowhere else.

### Neutral
- **Violet-Black** (#0a001f): the page background, and the text color on pink (the inversion).
- **Code Surface** (#160f29): code-block backgrounds – a step lighter than the night, clearly a different surface.
- **Text Bright** (#eae2ff): body text and headings, a lavender-tinted white.
- **Text Muted** (#d1d5db): secondary text – taglines, card descriptions, intros.
- **Text Dim** (#9ca3af): tertiary text and notes.
- **Text Faint** (#6b7280): disclaimers and the quietest layer.
- **Accent Soft** (rgba(255, 0, 169, 0.5)): the pink at half strength – hover borders on cards and links.

**The One Voice Rule.** The pink accent is used on a small fraction of any given screen – one CTA, the hero highlight, one hover state. Its rarity is the provocation; a screen where pink is everywhere is a screen where nothing is loud.

**The One Source Rule (drift guard).** The stardust's accent value lives once: `--pop-pink` in `@layer tokens` is canonical, and `<kinetic-background>` reads it via `getComputedStyle`; a `data-color` attribute overrides per use, and the historical hardcoded `0xFF00A9` survives only as the fallback when neither exists. If the pink ever changes, the stardust follows. (Residual hardcodes remain outside the component — the centralized `assets/favicon.svg`, the og:image [deferred], the Monaco cursor/selection theme, the Glow Vocabulary literals — and are documented drift to reconcile. The favicon is centralized, not tokenized: a static SVG cannot read page CSS vars.)

**The Glass-Over-Stardust Rule.** Cards are translucent glass (gradient + blur) floating over the living starfield. The background is the depth – and the cards' backdrop blur is what softens the points into a pink glow behind the glass; never fake that depth with a gray drop shadow.

## Typography

**Display Font:** Chakra Petch (sans-serif), 700 only – geometric, techno, Y2K
**Body Font:** Inter (sans-serif), variable 100–900
**Mono Font:** Roboto Mono (ui-monospace stack), for code
**Accent Faces:** Special Elite (typewriter) for deliberate accents; Oswald + Roboto Condensed for the manifesto page's own world

**Character:** geometric sci-fi headlines over a calm humanist body. The loud type is Chakra Petch's; the reading is Inter's. Two families carry the whole system; a third appears only when a page makes a deliberate point.

### Hierarchy
- **Display** (Chakra Petch 700, clamp(3.5rem, 12vw, 9rem), line-height 1, letter-spacing −0.05em, uppercase): the hero title only. Carries a pink `.highlight` span and a neon text-shadow.
- **Headline** (Chakra Petch 700, 2.25rem): section titles, banner glitch text.
- **Title** (Chakra Petch 700, 1.875rem → 1.5rem): bento card headlines, doc titles.
- **Body** (Inter, 1rem): paragraphs and descriptions; muted/dim steps for hierarchy; intros keep a ~42rem measure.
- **Label** (Inter, 0.875rem): hero note, meta lines, small print.
- **Mono** (Roboto Mono, 1em): code blocks on Code Surface.

**The Two-Type Rule.** Headlines are Chakra Petch, everything else is Inter. A third family only for a deliberate accent (Special Elite) or a page's own world (the manifesto). If a new family is needed for body text, the design brief has drifted.

## Layout

The CUBE composition layer: `o-wrapper` centers content at 80rem max with responsive padding (1rem → 2rem inline); `o-grid` is a single column that opens to responsive columns at 48rem; `o-stack` and `o-cluster` provide vertical rhythm and wrapping clusters. The bento landing grid uses fixed auto-rows (24rem) with container queries, so cards reflow inside their own context. Sections pad 4–6rem on the block axis.

Spacing runs on a 0.25rem base scale up to 6rem (`--space-1`…`--space-24`); rhythm comes from the scale, not from ad-hoc values. Breakpoints: sm 40rem, md 48rem, lg 64rem, xl 80rem, all min-width.

## Elevation & Depth

**Layered glass over living stardust.** Two layers, in order: the `<kinetic-background>` component animates behind everything – the site's living depth, present on the pages that load it (index, beyond-the-word-list, codepen-converter). It is a fixed, full-viewport transparent canvas holding 2000 points in a cubic volume, rendered in Neon Pop Pink with additive blending at 0.8 opacity (at up to 2× device pixels, so specks stay crisp on Retina): the points are tiny square specks, mostly 1–3 px on screen and roughly 35 px apart, so the field reads as a sparse starfield, not a cloud – a slow snow-globe of pink dust. The whole cloud rotates imperceptibly (a full turn every ~5 minutes, reading as ambient drift), and the camera eases toward the cursor (about 325 ms of lag at 60 fps — the easing is per-frame, so 120 Hz halves it and 30 Hz doubles it), so near specks visibly swim against far ones – the parallax is the dominant motion while the pointer moves. Under `prefers-reduced-motion` the stardust renders once as a static frame – the depth layer stays, but nothing animates and the pointer does nothing (a resize re-renders a single fresh frame). Three.js is loaded lazily on connect (a dynamic import, so the ~509 KB tree-shaken bundle fetch starts when the component mounts rather than at script parse — on the pages that use the component that is still during page load; pages that never mount it never pay). Glass cards float above it, letting the stardust show through (backdrop blur 12px, a subtle white gradient at 5% fading to transparent, a 1px translucent border). Neon glow is the accent's own light: the CTA glows pink at rest and harder on hover, the hero title carries a text-shadow glow. There are no drop shadows in the system – a neon lab has nothing that casts gray.

### Glow Vocabulary
- **Accent glow** (box-shadow 0 0 20px rgba(255, 0, 169, 0.5)): the CTA at rest.
- **Accent glow, strong** (box-shadow 0 0 35px rgba(255, 0, 169, 0.5)): the CTA on hover.
- **Title glow** (text-shadow 0 0 15px / 30px rgba(255, 0, 169, 0.5)): the hero display title.
- **Reveal glow** (radial-gradient, scale 0 → 1): the pink wash that blooms across a bento card on hover.

## Shapes

Softly rounded, never pill, never sharp: buttons at 6px, code and small surfaces at 6–8px, cards at 16px – the cards are the roundest thing in the system. Borders are the glass edge: 1px translucent white at rest, tinted pink on hover. No hard clipping outside the manifesto page's own world.

## Components

### Buttons
- **Shape:** gently curved (6px radius).
- **Primary (c-cta):** Neon Pop Pink background, Violet-Black text, padding 0.75rem 1.5rem, accent glow at rest (0 0 20px).
- **Hover / Focus:** lifts (translateY(−3px) scale(1.05)) and the glow strengthens to 35px; 0.3s ease. Focus-visible keeps a visible pink ring.
- **Text links:** calm muted text; the pink underline appears on hover, arrows shift right (0.5rem).

### Cards / Containers (c-bento__item)
- **Corner Style:** 16px radius.
- **Background:** glass gradient (white 5% → transparent), backdrop blur 12px, over the stardust.
- **Border:** 1px translucent white; tinted to Accent Soft on hover.
- **Hover:** lifts 5px and a radial pink glow blooms across the card (scale 0 → 1, 0.5s).
- **Internal Padding:** 2rem.

### Hero (c-hero)
The one statement of the landing: display title in Chakra Petch with the pink highlight and glow, the tagline in muted Inter, the calm honest note beneath it ("Everything here is made with AI. That's the point."), and the action row. Four beats, no more – name, promise, provocation, exit.

### Code Surfaces
Code Surface background (#160f29), mono type, 6px radius, the vendored atom-one-dark theme. A distinct, darker room inside the night.

### Signature: `<kinetic-background>`
The living stardust behind the pages that load it – and the depth model itself, so its rules are the system's rules. Precisely: a fixed, full-viewport transparent canvas (shadow DOM, z-index 0, pointer-events none, decorated `aria-hidden` on host and canvas), 2000 points in a 1000-unit cube, colored Neon Pop Pink, size 1.5 world-units, additive blending at 0.8 opacity. The points are square specks (no round-particle shader), mostly 1–3 px on screen at ~35 px spacing – a sparse starfield, deliberately. Two motions: the cloud rotates rigidly around its Y axis at about 1.15° per second (imperceptible as rotation – ambient drift), and the camera eases toward the cursor (±50 units, ~330 ms lag), giving a strong near/far parallax. The additive blending is the mechanism of "the accent's own light": where points nearly overlap they saturate toward hot magenta-white. The color follows the One Source Rule: `--pop-pink` from the token layer is canonical, a `data-color` attribute overrides per use, and the historical `0xFF00A9` hardcode survives only as the fallback. Under `prefers-reduced-motion` the stardust renders once as a static frame – the depth layer stays, but nothing animates and the pointer does nothing (a resize re-renders a single fresh frame). Three.js is loaded lazily on connect (dynamic import – the ~509 KB tree-shaken bundle fetch starts when the component mounts, not at script parse; pages that never mount the component never pay for it). `setPixelRatio` caps at 2× device pixels so specks stay crisp on Retina.

Known gaps, all planned or documented: it does not pause on hidden tabs (browsers already throttle rAF in background tabs, so this is hygiene more than a win), and the animation loop is paused by the browser rather than the component. Lifecycle hardening landed 2026-08-28: `aria-hidden`, the `setPixelRatio` cap, `powerPreference: 'low-power'`, the One Source Rule drift fix, and full resource disposal on disconnect (idempotent connect/disconnect, generation-guarded async init, context-loss and render-failure degradation to a console note). Tuning values – particle count, rotation rate, parallax factor – live in the code, not here.

## Do's and Don'ts

### Do:
- **Do** use the tokens from `@layer tokens` – never hardcode a color or spacing value.
- **Do** keep the pink rare: one loud moment per screen is the provocation.
- **Do** place glass cards over the stardust and let it show through.
- **Do** honor `prefers-reduced-motion`: no animation without consent, ever.
- **Do** write every selector in full (ITCSS + BEM), hand-written – no Tailwind, no CDN framework.

### Don't:
- **Don't** add drop shadows – the glow is the only shadow in this system.
- **Don't** introduce a second accent color – pink is the one voice.
- **Don't** add a third typeface for body text – the Two-Type Rule holds.
- **Don't** load external fonts or CDNs – everything is self-hosted and vendored.
- **Don't** call the stardust a galaxy – it is a uniform cube of points with no structure, not a disk with a center. The honest word is starfield.
- **Don't** make every element shout – calm surfaces, loud moments; the honesty lives in the hero, the FAQ, and the credits, not in every card.

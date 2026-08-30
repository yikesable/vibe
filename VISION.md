# Vibe Coded — Vision

> A joyful collection of experiments with AI

## What this is

Vibe Coded is a static showcase of small browser tools, web components, and long-form stories. Every entry is a self-contained HTML page, and the whole site shares one hand-written design system. There is no framework, and no build step for the site itself – and since the self-hosting sprints of 2026, there are no external CDN requests either.

That last part is a bit of a hobby horse of mine, I admit. But it's also the most reliable measure of the site's health: every dependency is either justified or gone.

And one more thing – what this page is really about: **the site is made almost exclusively with AI**. The code, the CSS, the copy, these documents – all of it is drafted by AI assistants, under my direction. This is not a detail to disclose reluctantly. It is the point.

Provocatively so, even. The web has settled on a few postures around AI-made work: hiding it, admitting it in small print, vouching for it loudly. This site takes none of them. It says it up front, and lets the work stand next to the admission. That is a bit of a provocation. It's meant to be.

## Why it exists

I wanted to know what happens when you hand nearly all of the making to an AI and keep the direction for yourself. What does the tool carry alone? Where does it stall? And how often does the human have to step in – for capability, or just for taste?

> It's an experiment in *understanding* the tool – its strengths and its limits – not blindly adopting it.

Every entry on the site is a data point in that experiment. The AI produces the bulk of the work: the boilerplate, the implementation, the first draft of the prose. A human – me – directs, reviews, and owns the result. The division of labour is not hidden, because the honesty is the point. It's what makes an entry a contribution rather than a demo.

(This document included, by the way – drafted by an AI, in my voice, under my direction. If it reads like me, that is the collaboration working as intended.)

## Principles

- **Humane** – accessibility and semantic HTML first, code commented to explain *why*, motion preferences honoured. This one is a hard rule, not a nice-to-have; see the reduced-motion audits in `ROADMAP.md`.
- **Usable** – prefer the platform: vanilla JS and modern CSS over frameworks. A few lines of clear, standard code beat a "magic" dependency.
- **Guided** – zero build step for the site's own code, dependencies self-hosted and vendored, every one of them justified. The HUG Principle in `.github/copilot-instructions.md` is the operating manual.
- **AI-first making** – the tool does the heavy lifting, and we say so. No pretending, no "crafted by hand" nostalgia. The craft is in the direction, the review, and the final edit.
- **Self-contained** – each page carries its own meaning; shared concerns live in `styles/vibe.css` and the components folder.
- **Joyful** – the Y2K neon aesthetic is deliberate. Fun is a feature, not a distraction. `styles/vibe.css` doubles as the AI design brief, so the look survives the collaboration.
- **Open** – everything here is MIT-licensed and built on open standards (see the [Manifesto for Digital Liberation](./stories/manifesto.html)).

## What this is not

- Not a framework showcase – if a page needs a framework to exist, it probably doesn't belong here.
- Not a product or a brand – it's a collection and an experiment.
- Not unedited AI output – made with AI is not the same as abandoned to it. The AI drafts; a human directs, reviews, and edits everything before it ships.

## What success looks like

The collection grows with entries that document *how they were made*, not just what they do – which honestly means documenting what the AI carried and what the human had to fix. The design system stays the single source of truth, so new pages look like they belong before a single line of CSS is written. The site stays dependency-free at runtime, fast, and accessible as it grows. And each entry teaches something about working with AI: strengths, limits, and the human editing in between.

## How the docs fit together

- **`README.md`** – what the repo contains and how to work on it.
- **`VISION.md`** (this file) – why the project exists.
- **`ROADMAP.md`** – deferred work and growth triggers.
- **`.rpiv/plans/`** – the active work packages, with decisions recorded.
- **`assets/fonts/LICENSE-fonts.md`** – the font provenance and licensing trail, including the Reserved Font Name verification that keeps coming back.

Made almost exclusively with AI – and, I hope, a joyful collection.

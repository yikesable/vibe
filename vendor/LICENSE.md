# Vendor Assets — Licenses & Attribution

This directory contains third-party software and assets used by the Vibe site,
self-hosted to eliminate CDN dependencies. Each item is used under its
respective open-source license.

---

## JavaScript / CSS Bundles

### highlight.js (BSD 3-Clause)

- **Source**: https://github.com/highlightjs/highlight.js
- **Version**: 11.9.0
- **License**: BSD 3-Clause — Copyright © 2006-2024 Ivan Sagalaev and other contributors
- **Build**: Bundled via esbuild from npm (`highlight.js/lib/core` + `html`/`css`/`javascript` languages)
- **Files**: `highlight.bundle.js`, `atom-one-dark.css`
- **Third-party notices**: See `highlight.bundle.js.LEGAL.txt` (if present)

### Three.js (MIT)

- **Source**: https://github.com/mrdoob/three.js
- **Version**: r128 (0.128.0)
- **License**: MIT — Copyright © 2010-2024 Three.js Authors
- **Files**: `three.module.bundle.js` (ESM, bundled via esbuild), `three.min.js` (UMD, copied directly)
- **Third-party notices**: See `three.module.bundle.js.LEGAL.txt` (if present)

### Prism.js (MIT)

- **Source**: https://github.com/PrismJS/prism
- **Version**: 1.29.0
- **License**: MIT — Copyright © 2012 Lea Verou and other contributors
- **Build**: Bundled via esbuild from npm (`prism-core` + `javascript`/`typescript`/`json`/`bash` languages)
- **Files**: `prism.bundle.js`, `prism-okaidia.css`
- **Third-party notices**: See `prism.bundle.js.LEGAL.txt` (if present)

---

## Fonts

Fonts are served from `assets/fonts/`. Font licensing is documented in
`assets/fonts/LICENSE-fonts.md`.

---

## Build tool

### esbuild (MIT)

- **Source**: https://github.com/evanw/esbuild
- **Version**: 0.28.x
- **License**: MIT — Copyright © 2020 Evan Wallace
- **Use**: Dev dependency — only runs during `npm run build:vendor`, not served to users